import { useEffect, useMemo, type MutableRefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Color, CylinderGeometry, Group, MathUtils, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, ShaderChunk, Vector3 } from "three";
import type { CinematicFrame } from "./cinematicTypes";
import { createFlightDynamicsPose, sampleFlightDynamics } from "./flightDynamics";
import { createPayloadReveal } from "./PayloadReveal";

interface Props { frame: MutableRefObject<CinematicFrame>; onReady?: () => void }

/** Photo-observed hardware in metres. Cached GLTF geometry/textures stay owned by useGLTF. */
export default function CinematicTrain({ frame, onReady }: Props) {
  const [payload, balloon] = useGLTF([
    `${import.meta.env.BASE_URL}models/cinematic/payload-cinematic.glb`,
    `${import.meta.env.BASE_URL}models/cinematic/balloon-latex.glb`,
  ]);
  const resources = useMemo(() => {
    const owned: MeshStandardMaterial[] = [];
    const latex = new MeshPhysicalMaterial({ color: "#f4f0e6", roughness: .46, metalness: 0, clearcoat: 0, envMapIntensity: .85, specularIntensity: .35 });
    latex.onBeforeCompile = (shader) => {
      shader.uniforms.uSunWorld = { value: frame.current.sunDirection };
      shader.vertexShader = `varying vec3 vLatexPosition;\n${shader.vertexShader}`.replace("#include <begin_vertex>", "#include <begin_vertex>\nvLatexPosition = position;");
      const wrappedLighting = ShaderChunk.lights_physical_pars_fragment.replace(
        "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );",
        `// Thin latex scatters the same incident sunlight around its wall.
        // Keep specular lighting physical; broaden only the diffuse response.
        float latexIncidence = dot( geometryNormal, directLight.direction );
        float latexWrap = .30 + .70 * smoothstep( -.65, 1.0, latexIncidence );
        reflectedLight.directDiffuse += latexWrap * directLight.color * BRDF_Lambert( material.diffuseColor );`,
      );
      shader.fragmentShader = `
        uniform vec3 uSunWorld;
        varying vec3 vLatexPosition;
        float latexHash(vec3 point) {
          point = fract(point * .3183099 + vec3(.13, .27, .43));
          point *= 17.0;
          return fract(point.x * point.y * point.z * (point.x + point.y + point.z));
        }
        float latexNoise(vec3 point) {
          vec3 cell = floor(point), blend = fract(point);
          blend = blend * blend * (3.0 - 2.0 * blend);
          return mix(mix(mix(latexHash(cell), latexHash(cell + vec3(1,0,0)), blend.x),
                         mix(latexHash(cell + vec3(0,1,0)), latexHash(cell + vec3(1,1,0)), blend.x), blend.y),
                     mix(mix(latexHash(cell + vec3(0,0,1)), latexHash(cell + vec3(1,0,1)), blend.x),
                         mix(latexHash(cell + vec3(0,1,1)), latexHash(cell + vec3(1,1,1)), blend.x), blend.y), blend.z);
        }
        ${shader.fragmentShader}`
        .replace("#include <lights_physical_pars_fragment>", wrappedLighting)
        .replace("#include <roughnessmap_fragment>", `
          #include <roughnessmap_fragment>
          float latexGrainVisibility = 1.0 - smoothstep(.003, .018, length(fwidth(vLatexPosition)));
          roughnessFactor += (latexNoise(vLatexPosition * 145.0) - .5) * .035 * latexGrainVisibility;
        `)
        .replace("#include <opaque_fragment>", `
        vec3 thinSun = normalize((viewMatrix * vec4(uSunWorld, 0.0)).xyz);
        // A warm, broad transmission term fills the back of a stretched wall.
        // No refractive framebuffer, opacity trick or independent rim glow.
        float throughLight = pow(clamp(0.5 + 0.5 * dot(-normal, thinSun), 0.0, 1.0), 1.15);
        float thinEdge = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.0);
        outgoingLight += diffuseColor.rgb * vec3(1.0, .955, .86) * throughLight * (.28 + .035 * thinEdge);
        #include <opaque_fragment>`);
    };
    latex.customProgramCacheKey = () => "skycell-wrapped-thin-latex-r176-v2";
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
    const tetherMaterial = new MeshStandardMaterial({ color: "#dadbd5", roughness: .94, envMapIntensity: .2, transparent: true, depthWrite: false });
    owned.push(tetherMaterial);
    const balloonRig = new Group();
    const payloadRig = new Group();
    balloonRig.add(envelope);
    const reveal = createPayloadReveal(hardware);
    payloadRig.add(reveal.group);
    balloonRig.position.y = 4.1;
    // A single straight line under tension. Scale/rotate this owned geometry;
    // neither the GLTF geometry nor its shared cached textures are modified.
    const tetherGeometry = new CylinderGeometry(.0045, .0045, 1, 6, 1, false);
    const tether = new Mesh(tetherGeometry, tetherMaterial);
    return {
      balloonRig, payloadRig, tether, tetherGeometry, owned, reveal,
      pose: createFlightDynamicsPose(), loop: new Vector3(),
      direction: new Vector3(), up: new Vector3(0, 1, 0),
    };
  }, [payload.scene, balloon.scene, frame]);
  useEffect(() => { onReady?.(); }, [resources, onReady]);
  useFrame(() => {
    // The parent owns visible scene time. A frozen clock gives exactly the same
    // pose on pause, tab hide, offscreen suspension and resumed render frames.
    const { balloonRig, payloadRig, pose, loop, direction, tether, reveal } = resources;
    sampleFlightDynamics(frame.current.flightProgress ?? frame.current.progress, frame.current.elapsedSeconds, pose, frame.current.scrollSuspensionVector3);
    // During the technical cutaway, reduce the out-of-frame suspension's
    // visual weight so it does not cross the explanatory typography.
    const inspection = MathUtils.smoothstep(frame.current.progress, .25, .29) * (1 - MathUtils.smoothstep(frame.current.progress, .79, .82));
    (tether.material as MeshStandardMaterial).opacity = 1 - .93 * inspection;
    balloonRig.position.copy(pose.balloonPosition);
    balloonRig.quaternion.copy(pose.balloonQuaternion);
    balloonRig.scale.copy(pose.balloonScale);
    payloadRig.position.copy(pose.payloadPosition);
    payloadRig.quaternion.copy(pose.payloadQuaternion);
    reveal.update(frame.current.progress);
    // Closed flight uses the exact constrained suspension pose. During the
    // technical cutaway the actual lid/loop rises, and the visible line must
    // meet that raised hardware rather than terminate in empty air.
    loop.copy(reveal.anchors.suspension).applyQuaternion(payloadRig.quaternion).add(payloadRig.position);
    direction.subVectors(pose.neck, loop);
    tether.position.copy(pose.neck).add(loop).multiplyScalar(.5);
    tether.scale.set(1, direction.length(), 1);
    tether.quaternion.setFromUnitVectors(resources.up, direction.normalize());
    const recordingOffset = frame.current.recordingTranslationVector3;
    if (recordingOffset) {
      balloonRig.position.add(recordingOffset);
      payloadRig.position.add(recordingOffset);
      tether.position.add(recordingOffset);
    }
  });
  useEffect(() => () => {
    resources.owned.forEach((material) => material.dispose());
    resources.tetherGeometry.dispose();
    resources.reveal.dispose();
  }, [resources]);
  return <group dispose={null}>
    <primitive object={resources.balloonRig} />
    <primitive object={resources.payloadRig} />
    <primitive object={resources.tether} />
  </group>;
}
