import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { ACESFilmicToneMapping, Euler, MathUtils, PerspectiveCamera, PMREMGenerator, Vector3 } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import CinematicEarth from "./scene/CinematicEarth";
import CinematicTrain from "./scene/CinematicTrain";
import { sampleCinematicCamera } from "./scene/cinematicCamera";
import type { CinematicFrame } from "./scene/cinematicTypes";

interface Props { progress: MotionValue<number>; reducedMotion: boolean; paused: boolean; onReady?: () => void; onFailure?: (error?: Error) => void }
class SceneBoundary extends Component<{ children: ReactNode; onFailure: (error?: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error("SkyCell ascent scene failed:", error); this.props.onFailure(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

function World({ progress, paused, reducedMotion, onReady, onFailure, wrapper }: Props & { wrapper: React.RefObject<HTMLDivElement> }) {
  const { gl, camera, scene, size, invalidate } = useThree();
  const hdr = useLoader(RGBELoader, `${import.meta.env.BASE_URL}textures/cinematic/qwantani_noon_puresky_1k.hdr`);
  const current = useRef(MathUtils.clamp(progress.get(), 0, 1));
  const target = useRef(current.current);
  const initialized = useRef(false);
  const ready = useRef(false);
  const count = useRef(0);
  const frame = useRef<CinematicFrame>({ progress: current.current, altitudeKm: 18, sunDirection: new Vector3(-.3801334253, .7631884173, .5225342273).normalize() });
  const vectors = useMemo(() => ({ position: new Vector3(), look: new Vector3(), settledPosition: new Vector3(), settledLook: new Vector3() }), []);
  const cameraState = useMemo(() => ({ fov: 30, altitudeKm: 18, shot: 0 }), []);
  const settledLens = useRef({ fov: 30, altitudeKm: 18 });

  useLayoutEffect(() => {
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromEquirectangular(hdr);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = .45;
    scene.environmentRotation = new Euler(0, -Math.PI / 2, 0);
    generator.dispose();
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    invalidate();
    return () => { scene.environment = previous; environment.dispose(); };
  }, [gl, scene, hdr, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure?.(new Error("WebGL context lost")); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useEffect(() => {
    if (!paused) target.current = MathUtils.clamp(progress.get(), 0, 1);
    invalidate();
    return progress.on("change", (value) => { if (!paused && !reducedMotion) { target.current = MathUtils.clamp(value, 0, 1); invalidate(); } });
  }, [progress, paused, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    const alpha = 1 - Math.exp(-12 * Math.min(delta, .1));
    if (!paused) {
      const difference = target.current - current.current;
      current.current = !initialized.current || Math.abs(difference) < .00001 ? target.current : current.current + difference * alpha;
    }
    const p = current.current;
    const narrow = size.width / Math.max(size.height, 1) < 1.3;
    // Filter the desired pose once, rather than replaying every intervening
    // waypoint after a large scroll jump. Fast reverse never dives through the
    // payload close-up while the reader is already back at the hero.
    const sample = sampleCinematicCamera(target.current, narrow, vectors.position, vectors.look, cameraState);
    if (!initialized.current) {
      vectors.settledPosition.copy(vectors.position);
      vectors.settledLook.copy(vectors.look);
      settledLens.current = { fov: sample.fov, altitudeKm: sample.altitudeKm };
    } else if (!paused) {
      vectors.settledPosition.lerp(vectors.position, alpha);
      vectors.settledLook.lerp(vectors.look, alpha);
      settledLens.current.fov = MathUtils.lerp(settledLens.current.fov, sample.fov, alpha);
      settledLens.current.altitudeKm = MathUtils.lerp(settledLens.current.altitudeKm, sample.altitudeKm, alpha);
    }
    initialized.current = true;
    camera.position.copy(vectors.settledPosition);
    camera.lookAt(vectors.settledLook);
    const perspective = camera as PerspectiveCamera;
    perspective.fov = settledLens.current.fov;
    perspective.setViewOffset(size.width, size.height, narrow ? 0 : -size.width * .22, 0, size.width, size.height);
    perspective.updateProjectionMatrix();
    camera.updateMatrixWorld();
    frame.current.progress = p;
    frame.current.altitudeKm = settledLens.current.altitudeKm;
    count.current++;
    if (wrapper.current) {
      const node = wrapper.current;
      node.dataset.renderCount = String(count.current);
      node.dataset.sceneStage = String(sample.shot);
      node.dataset.sceneProgress = p.toFixed(5);
      node.dataset.cameraPosition = `${camera.position.x.toFixed(5)},${camera.position.y.toFixed(5)},${camera.position.z.toFixed(5)}`;
      node.dataset.cameraTarget = `${vectors.settledLook.x.toFixed(5)},${vectors.settledLook.y.toFixed(5)},${vectors.settledLook.z.toFixed(5)}`;
      if (count.current === 3 || count.current % 30 === 0) {
        node.dataset.drawCalls = String(gl.info.render.calls);
        node.dataset.triangles = String(gl.info.render.triangles);
        node.dataset.geometries = String(gl.info.memory.geometries);
        node.dataset.textures = String(gl.info.memory.textures);
      }
    }
    if (!ready.current && count.current > 2) { ready.current = true; onReady?.(); }
    const unsettled = Math.abs(target.current - p) > .00001 || vectors.settledPosition.distanceToSquared(vectors.position) > 1e-8 || vectors.settledLook.distanceToSquared(vectors.look) > 1e-8 || Math.abs(settledLens.current.fov - sample.fov) > .0001;
    if ((!paused && unsettled) || count.current < 4) invalidate();
  }, -1);
  const lightPosition = frame.current.sunDirection.clone().multiplyScalar(20);
  return <>
    <CinematicEarth frame={frame} />
    <directionalLight position={lightPosition} intensity={3.3} color="#fff8ed" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-1.2} shadow-camera-right={1.2} shadow-camera-top={1.2} shadow-camera-bottom={-1.2} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-.0001} shadow-normalBias={.0006} />
    <CinematicTrain frame={frame} />
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
    setState("error"); onFailure?.(failure);
  }, [onFailure]);
  return <div ref={wrapper} data-scene-state={state} data-render-backend="webgl2" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
    <SceneBoundary onFailure={failed}>
      <Canvas shadows dpr={[1, 1.5]} frameloop="demand" camera={{ position: [5.2, 22.3, 7], fov: 30, near: .035, far: 160 }} gl={{ alpha: false, antialias: true, powerPreference: "high-performance", toneMapping: ACESFilmicToneMapping, toneMappingExposure: .9 }} fallback={<span>A twin-balloon train above Earth.</span>} style={{ width: "100%", height: "100%" }}>
        <World {...props} onReady={ready} onFailure={failed} wrapper={wrapper} />
      </Canvas>
    </SceneBoundary>
  </div>;
}
