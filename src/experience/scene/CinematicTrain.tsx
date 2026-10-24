import { useEffect, useMemo, type MutableRefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { CatmullRomCurve3, Color, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, TubeGeometry, Vector3 } from "three";
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
    const makeBalloon = () => {
      const object = balloon.scene.clone(true);
      object.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        node.castShadow = false;
        if ((node.material as MeshStandardMaterial).name === "Latex") node.material = latex;
        else { const material = (node.material as MeshStandardMaterial).clone(); owned.push(material); node.material = material; }
      });
      return object;
    };
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
    const points = [
      // The upper line passes behind the lower envelope to its neck, rather
      // than terminating on (or piercing) the balloon's inflated crown.
      [new Vector3(0, 21.03, 0), new Vector3(-.12, 16, .04), new Vector3(.05, 11, -.4), new Vector3(0, 8.5, -.8), new Vector3(0, 7.5, -.8), new Vector3(0, 6.67, 0)],
      // Match the actual off-centre braided loop in the authored GLB.
      [new Vector3(0, 6.67, 0), new Vector3(.07, 4.6, .02), new Vector3(-.035, 2.2, 0), new Vector3(-.03, .183, -.018)],
    ];
    const tethers = points.map((points) => new TubeGeometry(new CatmullRomCurve3(points), 80, .003, 5, false));
    return { hardware, upper: makeBalloon(), lower: makeBalloon(), owned, tethers, tetherMaterial };
  }, [payload.scene, balloon.scene, frame]);
  useEffect(() => () => {
    resources.owned.forEach((material) => material.dispose());
    resources.tethers.forEach((geometry) => geometry.dispose());
  }, [resources]);
  return <group dispose={null}>
    <primitive object={resources.hardware} />
    <primitive object={resources.upper} position={[0, 22, 0]} />
    <primitive object={resources.lower} position={[0, 7.5, 0]} scale={.85} />
    {resources.tethers.map((geometry, index) => <mesh key={index} geometry={geometry} material={resources.tetherMaterial} />)}
  </group>;
}
