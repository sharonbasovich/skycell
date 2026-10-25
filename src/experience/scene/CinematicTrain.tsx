import { useEffect, useMemo, type MutableRefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Color, CylinderGeometry, Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from "three";
import type { CinematicFrame } from "./cinematicTypes";

interface Props { frame: MutableRefObject<CinematicFrame> }

/** Photo-observed hardware in metres. Cached GLTF geometry/textures stay owned by useGLTF. */
export default function CinematicTrain({ frame }: Props) {
  const payload = useGLTF(`${import.meta.env.BASE_URL}models/cinematic/payload-cinematic.glb`);
  const balloon = useGLTF(`${import.meta.env.BASE_URL}models/cinematic/balloon-latex.glb`);
  const resources = useMemo(() => {
    const owned: MeshStandardMaterial[] = [];
    const latex = new MeshPhysicalMaterial({ color: "#eeece1", roughness: .51, metalness: 0, clearcoat: 0, envMapIntensity: 1 });
    latex.onBeforeCompile = (shader) => {
      shader.uniforms.uSunWorld = { value: frame.current.sunDirection };
      shader.fragmentShader = `uniform vec3 uSunWorld;\n${shader.fragmentShader}`.replace("#include <opaque_fragment>", `
        vec3 thinSun = normalize((viewMatrix * vec4(uSunWorld, 0.0)).xyz);
        // A broad thin-wall wrap avoids a hard, opaque terminator. This is a
        // single-scattering approximation, not glass/refraction or a rim glow.
        float throughLight = pow(clamp(0.5 + 0.5 * dot(-normal, thinSun), 0.0, 1.0), 1.25);
        float thinEdge = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.0);
        outgoingLight += vec3(1.0, 0.94, 0.82) * throughLight * (0.28 + 0.025 * thinEdge);
        #include <opaque_fragment>`);
    };
    latex.customProgramCacheKey = () => "skycell-thin-latex-v1";
    owned.push(latex);
    const envelope = balloon.scene.clone(true);
    envelope.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      node.castShadow = false;
      if ((node.material as MeshStandardMaterial).name === "Latex") node.material = latex;
      else { const material = (node.material as MeshStandardMaterial).clone(); owned.push(material); node.material = material; }
    });
    const hardware = payload.scene.clone(true);
    hardware.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      const material = (node.material as MeshStandardMaterial).clone();
      material.envMapIntensity = .65;
      if (material.name === "EPSFoam") { material.color = new Color("#eeeee8"); material.roughness = .92; material.normalScale.setScalar(1.15); }
      if (material.name === "LidJoin") material.color.set("#6d726e");
      node.material = material;
      node.castShadow = !["ClearTape", "TransparentTube", "PaperLabel", "PaperBacking"].includes(material.name);
      node.receiveShadow = true;
      owned.push(material);
    });
    const tetherMaterial = new MeshStandardMaterial({ color: "#dadbd5", roughness: .94, envMapIntensity: .2 });
    owned.push(tetherMaterial);
    const balloonRig = new Group();
    const payloadRig = new Group();
    balloonRig.add(envelope);
    payloadRig.add(hardware);
    balloonRig.position.y = 4.1;
    // A single straight line under tension. Scale/rotate this owned geometry;
    // neither the GLTF geometry nor its shared cached textures are modified.
    const tetherGeometry = new CylinderGeometry(.0045, .0045, 1, 6, 1, false);
    const tether = new Mesh(tetherGeometry, tetherMaterial);
    const neckLocal = new Vector3(0, -.97, 0);
    const loopLocal = new Vector3(-.03, .183, -.018);
    return {
      balloonRig, payloadRig, tether, tetherGeometry, owned,
      neckLocal, loopLocal, neck: new Vector3(), loop: new Vector3(),
      loopOffset: new Vector3(), direction: new Vector3(), up: new Vector3(0, 1, 0),
    };
  }, [payload.scene, balloon.scene, frame]);
  useFrame(() => {
    // The parent owns visible scene time. A frozen clock gives exactly the same
    // pose on pause, tab hide, offscreen suspension and resumed render frames.
    const t = Number.isFinite(frame.current.elapsedSeconds) ? Math.max(0, frame.current.elapsedSeconds) : 0;
    const { balloonRig, payloadRig, neck, loopOffset, loop, direction, tether } = resources;
    balloonRig.position.set(
      .065 * Math.sin(t * .32) + .024 * Math.sin(t * .57 + .6),
      4.1 + .016 * Math.sin(t * .37),
      .04 * Math.sin(t * .26 + .9),
    );
    balloonRig.rotation.set(.009 * Math.sin(t * .26), .018 * Math.sin(t * .12), .012 * Math.sin(t * .32 + .4));
    neck.copy(resources.neckLocal).applyQuaternion(balloonRig.quaternion).add(balloonRig.position);

    // The denser enclosure follows the same air movement with a slight phase
    // lag. Its small pendulum angles do not deform the rigid foam hardware.
    payloadRig.rotation.set(.012 * Math.sin(t * .26 - .8), .025 * Math.sin(t * .14 + .3), -.025 * Math.sin(t * .32 - .7));
    const payloadX = .065 * Math.sin(t * .32 - .8) + .024 * Math.sin(t * .57 - .3);
    const payloadZ = .04 * Math.sin(t * .26 - .05);
    loopOffset.copy(resources.loopLocal).applyQuaternion(payloadRig.quaternion);
    const dx = payloadX + loopOffset.x - neck.x;
    const dz = payloadZ + loopOffset.z - neck.z;
    const tetherLength = 3.13 - .183;
    // Solve the vertical component instead of stretching the tether as it
    // swings. This keeps both attachment points connected at constant length.
    const drop = Math.sqrt(Math.max(tetherLength * tetherLength - dx * dx - dz * dz, 0));
    payloadRig.position.set(payloadX, neck.y - drop - loopOffset.y, payloadZ);
    loop.copy(loopOffset).add(payloadRig.position);
    direction.subVectors(neck, loop);
    tether.position.copy(neck).add(loop).multiplyScalar(.5);
    tether.scale.set(1, direction.length(), 1);
    tether.quaternion.setFromUnitVectors(resources.up, direction.normalize());
  });
  useEffect(() => () => {
    resources.owned.forEach((material) => material.dispose());
    resources.tetherGeometry.dispose();
  }, [resources]);
  return <group dispose={null}>
    <primitive object={resources.balloonRig} />
    <primitive object={resources.payloadRig} />
    <primitive object={resources.tether} />
  </group>;
}
