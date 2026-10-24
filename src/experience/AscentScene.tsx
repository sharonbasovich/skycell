import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { ACESFilmicToneMapping, BufferAttribute, BufferGeometry, CatmullRomCurve3, Group, Line as ThreeLine, LineDashedMaterial, MathUtils, PerspectiveCamera, PMREMGenerator, Sphere, SRGBColorSpace, TextureLoader, Vector3 } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import BalloonTrain, { GroundStation } from "./scene/BalloonTrain";
import { createAtmosphereMaterial } from "./scene/materials";

interface Props {
  progress: MotionValue<number>;
  reducedMotion: boolean;
  paused: boolean;
  onReady?: () => void;
  onFailure?: (error?: Error) => void;
}

class SceneBoundary extends Component<{ children: ReactNode; onFailure: (error?: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) {
    console.error("SkyCell ascent scene failed:", error);
    this.props.onFailure(error);
  }
  render() { return this.state.failed ? null : this.props.children; }
}

function Globe() {
  const map = useLoader(TextureLoader, `${import.meta.env.BASE_URL}textures/earth-blue-marble-2048.webp`);
  const gl = useThree((state) => state.gl);
  const atmosphereMaterial = useMemo(createAtmosphereMaterial, []);
  useMemo(() => {
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    // Default TextureLoader flipY + SphereGeometry UVs put the image's north
    // at the top of the sphere. This is an albedo map, not an environment map.
    return map;
  }, [map, gl]);
  // useLoader owns a shared cache entry for the NASA texture; each Globe owns
  // only its atmosphere material. Do not dispose a cache texture on unmount.
  useEffect(() => () => { atmosphereMaterial.dispose(); }, [atmosphereMaterial]);
  return (
    <group position={[0, -46.4, -3]} rotation={[0, -0.3, 0.23]}>
      <mesh><sphereGeometry args={[44.3, 96, 64]} /><meshStandardMaterial map={map} color="#ffffff" roughness={1} metalness={0} envMapIntensity={0.12} /></mesh>
      <mesh material={atmosphereMaterial}><sphereGeometry args={[44.75, 72, 48]} /></mesh>
    </group>
  );
}

function World({ progress, paused, reducedMotion, onReady, onFailure, wrapper }: Props & { wrapper: React.RefObject<HTMLDivElement> }) {
  const { gl, camera, scene, size, invalidate } = useThree();
  const train = useRef<Group>(null);
  const current = useRef(reducedMotion ? 0.82 : MathUtils.clamp(progress.get(), 0, 1));
  const target = useRef(current.current);
  const initialized = useRef(false);
  const ready = useRef(false);
  const frameCount = useRef(0);
  const stageAttribute = useRef(-1);
  const vectors = useMemo(() => ({ position: new Vector3(), look: new Vector3() }), []);
  const paths = useMemo(() => ({
    camera: new CatmullRomCurve3([new Vector3(10.7, 9.5, 28.3), new Vector3(5.3, 2.8, 8.1), new Vector3(14.5, 14.4, 34.0), new Vector3(25.0, 23.0, 47.0)], false, "centripetal"),
    look: new CatmullRomCurve3([new Vector3(0, 7.45, 0), new Vector3(0.85, 0.65, 0), new Vector3(0, 10.0, 0), new Vector3(0, 7.2, -1.0)], false, "centripetal"),
  }), []);
  const radio = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(65 * 3), 3));
    geometry.setAttribute("lineDistance", new BufferAttribute(new Float32Array(65), 1));
    geometry.boundingSphere = new Sphere(new Vector3(0, 5, 0), 65);
    const material = new LineDashedMaterial({ color: "#a2d0ff", transparent: true, opacity: 0, dashSize: 0.24, gapSize: 0.18, depthWrite: false });
    return new ThreeLine(geometry, material);
  }, []);

  useEffect(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(room, 0.04, 0.1, 80);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.75;
    generator.dispose(); room.dispose();
    invalidate();
    return () => { scene.environment = previous; environment.dispose(); };
  }, [gl, scene, invalidate]);

  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure?.(new Error("WebGL context lost")); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);

  useEffect(() => () => { radio.geometry.dispose(); radio.material.dispose(); }, [radio]);

  useEffect(() => {
    if (!paused) target.current = reducedMotion ? 0.82 : MathUtils.clamp(progress.get(), 0, 1);
    invalidate();
    return progress.on("change", (value) => {
      if (!paused && !reducedMotion) { target.current = MathUtils.clamp(value, 0, 1); invalidate(); }
    });
  }, [progress, paused, reducedMotion, invalidate]);

  useEffect(() => {
    const perspective = camera as PerspectiveCamera;
    const narrow = size.width / Math.max(size.height, 1) < 1.15;
    perspective.fov = narrow ? 43 : 35;
    perspective.setViewOffset(size.width, size.height, narrow ? 0 : -size.width * 0.22, 0, size.width, size.height);
    perspective.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  useFrame((_, delta) => {
    const difference = target.current - current.current;
    if (!paused) current.current = reducedMotion || !initialized.current ? target.current : current.current + difference * (1 - Math.exp(-7 * Math.min(delta, 0.05)));
    initialized.current = true;
    const p = current.current;
    paths.camera.getPoint(p, vectors.position);
    paths.look.getPoint(p, vectors.look);
    camera.position.copy(vectors.position);
    camera.lookAt(vectors.look);
    const lift = MathUtils.smoothstep(p, 0.37, 1) * 4.6;
    if (train.current) {
      train.current.position.set(0.55 * MathUtils.smoothstep(p, 0.35, 1), lift, 0);
      train.current.rotation.set(0.018 * Math.sin(p * Math.PI), -0.09 + p * 0.13, 0.025 - p * 0.055);
    }
    const positions = radio.geometry.attributes.position.array as Float32Array;
    const distances = radio.geometry.attributes.lineDistance.array as Float32Array;
    const endX = 0.55 * MathUtils.smoothstep(p, 0.35, 1);
    let lastX = -6.61, lastY = -1.41, lastZ = 1.6, distance = 0;
    for (let i = 0; i <= 64; i++) {
      const t = i / 64, u = 1 - t;
      const x = u*u*-6.61 + 2*u*t*-1.8 + t*t*endX;
      const y = u*u*-1.41 + 2*u*t*(lift + 6) + t*t*(lift + 0.2);
      const z = u*u*1.6 + 2*u*t*1.4;
      positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
      distance += Math.hypot(x-lastX, y-lastY, z-lastZ);
      distances[i] = distance; lastX = x; lastY = y; lastZ = z;
    }
    radio.geometry.attributes.position.needsUpdate = true;
    radio.geometry.attributes.lineDistance.needsUpdate = true;
    radio.material.opacity = MathUtils.smoothstep(p, 0.37, 0.56) * 0.45;
    radio.visible = p > 0.37;
    frameCount.current++;
    const node = wrapper.current;
    if (node) {
      node.dataset.renderCount = String(frameCount.current);
      const stage = Math.min(3, Math.max(0, Math.round(p * 3)));
      if (stage !== stageAttribute.current) { node.dataset.sceneStage = String(stage); stageAttribute.current = stage; }
      if (frameCount.current === 3 || frameCount.current % 30 === 0) {
        node.dataset.drawCalls = String(gl.info.render.calls);
        node.dataset.triangles = String(gl.info.render.triangles);
        node.dataset.geometries = String(gl.info.memory.geometries);
        node.dataset.textures = String(gl.info.memory.textures);
      }
    }
    if (!ready.current && frameCount.current > 1) { ready.current = true; onReady?.(); }
    if ((!paused && Math.abs(target.current - current.current) > 0.00008) || frameCount.current < 3) invalidate();
  });

  return <>
    <hemisphereLight args={["#d8eaff", "#3d588a", 2.0]} />
    <directionalLight position={[-8, 18, 12]} color="#fff4d9" intensity={3.0} />
    <directionalLight position={[8, 10, -8]} color="#8fbeff" intensity={2.6} />
    <Globe />
    <GroundStation />
    <primitive object={radio} />
    <group ref={train}><BalloonTrain /></group>
  </>;
}

export default function AscentScene(props: Props) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [state, setState] = useState("loading");
  const { onReady, onFailure } = props;
  const ready = useCallback(() => { setState("ready"); onReady?.(); }, [onReady]);
  const failed = useCallback((error?: Error) => {
    const failure = error ?? new Error("WebGL scene unavailable");
    if (wrapper.current) wrapper.current.dataset.sceneError = failure.message;
    setState("error");
    onFailure?.(failure);
  }, [onFailure]);
  return (
    <div ref={wrapper} data-scene-state={state} data-render-backend="webgl2" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <SceneBoundary onFailure={failed}>
        <Canvas dpr={[1, 1.5]} frameloop="demand" camera={{ position: [10.7, 9.5, 28.3], fov: 35, near: 0.1, far: 180 }} gl={{ alpha: true, antialias: true, powerPreference: "high-performance", toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }} fallback={<span>A conceptual balloon train above a curved horizon.</span>} style={{ width: "100%", height: "100%" }}>
          <World {...props} onReady={ready} onFailure={failed} wrapper={wrapper} />
        </Canvas>
      </SceneBoundary>
    </div>
  );
}
