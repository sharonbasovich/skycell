import { useEffect, useLayoutEffect, useMemo, type MutableRefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { ClampToEdgeWrapping, MathUtils, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, SRGBColorSpace, TextureLoader, Vector3 } from "three";
import type { CinematicFrame } from "./cinematicTypes";

interface Props { frame: MutableRefObject<CinematicFrame> }

// Fixed placements are finite passages, not a respawning particle field.
// Distance is metres behind the subject; lateral position is a fraction of the
// current camera half-width, so the wisps remain peripheral on narrow phones.
const PASSAGES = [
  { start: -.13, end: .18, lateral: -.69, depth: 3.2, width: 8.8, opacity: .23, phase: .4, roll: -.055 },
  { start: -.035, end: .285, lateral: .72, depth: 5.0, width: 10.4, opacity: .18, phase: 2.1, roll: .075 },
  { start: .065, end: .35, lateral: -.78, depth: 7.2, width: 11.8, opacity: .135, phase: 4.6, roll: -.025 },
] as const;

/** Three photographic alpha wisps beside/behind the complete balloon rig. */
export default function FlightClouds({ frame }: Props) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const texture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}textures/flight/cirrus-wisp.webp`);
  const resources = useMemo(() => {
    const geometry = new PlaneGeometry(1, 1);
    const materials = PASSAGES.map(() => new MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      alphaTest: .004,
      depthTest: true,
      depthWrite: false,
      toneMapped: true,
    }));
    const meshes = materials.map((material, index) => {
      const mesh = new Mesh(geometry, material);
      mesh.name = `Illustrative cirrus passage ${index + 1}`;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      return mesh;
    });
    return { geometry, materials, meshes };
  }, [texture]);
  const vectors = useMemo(() => ({
    right: new Vector3(), up: new Vector3(), forward: new Vector3(),
    anchor: new Vector3(0, 2, 0), toAnchor: new Vector3(), ndc: new Vector3(),
  }), []);

  useLayoutEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;
    texture.anisotropy = Math.min(2, gl.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    invalidate();
  }, [texture, gl, invalidate]);

  useEffect(() => () => {
    resources.geometry.dispose();
    for (const material of resources.materials) material.dispose();
    // useLoader owns the shared texture cache; route teardown must not dispose it.
  }, [resources]);

  useFrame(({ camera, size }) => {
    const state = frame.current;
    const progress = MathUtils.clamp(state.progress, 0, 1);
    const time = Math.max(0, state.elapsedSeconds);
    // At 8 km the vehicle is already above a 6 km deck. Near cirrus accompanies
    // only the first part of the climb and is completely absent above 14 km.
    const altitudeFade = 1 - MathUtils.smoothstep(state.altitudeKm, 10.4, 14);
    vectors.right.setFromMatrixColumn(camera.matrixWorld, 0);
    vectors.up.setFromMatrixColumn(camera.matrixWorld, 1);
    vectors.forward.setFromMatrixColumn(camera.matrixWorld, 2).negate();
    vectors.toAnchor.copy(vectors.anchor).sub(camera.position);
    const subjectDepth = Math.max(1, vectors.toAnchor.dot(vectors.forward));
    const fov = (camera as PerspectiveCamera).fov;
    const tangent = Math.tan(MathUtils.degToRad(fov * .5));
    const aspect = size.width / Math.max(size.height, 1);

    for (let i = 0; i < PASSAGES.length; i++) {
      const seed = PASSAGES[i];
      const mesh = resources.meshes[i];
      const material = resources.materials[i];
      const passage = (progress - seed.start) / (seed.end - seed.start);
      mesh.visible = altitudeFade > .001 && passage > 0 && passage < 1;
      if (!mesh.visible) { material.opacity = 0; continue; }

      const halfHeight = tangent * (subjectDepth + seed.depth);
      const halfWidth = halfHeight * aspect;
      // Bounded idle drift uses the parent's pause/visibility-aware scene clock.
      // There is no raw wall time, modulo, hard wrap, spawn or per-frame allocation.
      const wind = Math.sin(time * .105 + seed.phase) * .15;
      const settle = Math.tanh(time / 32) * .45;
      const horizontal = seed.lateral * halfWidth + wind;
      const vertical = 4.6 - passage * 9.4 - settle + Math.sin(time * .07 + seed.phase) * .10;
      const width = Math.min(seed.width, halfWidth * 2.35);
      mesh.position.copy(vectors.anchor)
        .addScaledVector(vectors.forward, seed.depth)
        .addScaledVector(vectors.right, horizontal)
        .addScaledVector(vectors.up, vertical);
      mesh.quaternion.copy(camera.quaternion);
      mesh.rotateZ(seed.roll);
      mesh.scale.set(width, width * (439 / 1024), 1);

      const enter = MathUtils.smoothstep(passage, 0, .12);
      const exit = 1 - MathUtils.smoothstep(passage, .78, 1);
      // Actual projected position includes the story's asymmetric view offsets.
      vectors.ndc.copy(mesh.position).project(camera);
      const windowFade = (1 - MathUtils.smoothstep(Math.abs(vectors.ndc.y), .95, 1.6))
        * (1 - MathUtils.smoothstep(Math.abs(vectors.ndc.x), 1.15, 2.0));
      material.opacity = seed.opacity * enter * exit * altitudeFade * windowFade;
      const daylight = .85 + MathUtils.clamp(state.sunDirection.y, 0, 1) * .15;
      material.color.setRGB(daylight, daylight, daylight);
    }
  }, 0);

  return <group name="Illustrative near-cloud passage" dispose={null}>
    {resources.meshes.map((mesh) => <primitive key={mesh.name} object={mesh} dispose={null} />)}
  </group>;
}
