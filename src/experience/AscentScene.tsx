import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { ACESFilmicToneMapping, Euler, MathUtils, PerspectiveCamera, PMREMGenerator, Vector3 } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import CinematicEarth from "./scene/CinematicEarth";
import CinematicTrain from "./scene/CinematicTrain";
import FlightClouds from "./scene/FlightClouds";
import { sampleCinematicCamera } from "./scene/cinematicCamera";
import type { CinematicFrame } from "./scene/cinematicTypes";

interface Props { progress: MotionValue<number>; presentedProgress: MotionValue<number>; reducedMotion: boolean; paused: boolean; active: boolean; onReady?: () => void; onFailure?: (error?: Error) => void }
class SceneBoundary extends Component<{ children: ReactNode; onFailure: (error?: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error("SkyCell flight scene failed:", error); this.props.onFailure(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

function World({ progress, presentedProgress, paused, active, onReady, onFailure, wrapper }: Props & { wrapper: React.RefObject<HTMLDivElement> }) {
  const { gl, camera, scene, size, invalidate } = useThree();
  const hdr = useLoader(RGBELoader, `${import.meta.env.BASE_URL}textures/cinematic/qwantani_noon_puresky_1k.hdr`);
  const current = useRef(MathUtils.clamp(progress.get(), 0, 1));
  const running = useRef(false);
  const wasPaused = useRef(paused);
  const resume = useRef<{ from: number; elapsed: number } | null>(null);
  const ready = useRef(false);
  const count = useRef(0);
  const timings = useRef({ samples: new Float32Array(120), count: 0 });
  const frame = useRef<CinematicFrame>({ progress: current.current, altitudeKm: 8, elapsedSeconds: 0, sunDirection: new Vector3(-.3801334253, .7631884173, .5225342273).normalize() });
  const vectors = useMemo(() => ({ position: new Vector3(), look: new Vector3() }), []);
  const sample = useMemo(() => ({ fov: 30, altitudeKm: 8, shot: 0, screenX: .72, screenY: .5 }), []);
  const gpuRenderer = useMemo(() => {
    const context = gl.getContext();
    const debug = context.getExtension("WEBGL_debug_renderer_info");
    return debug ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "WebGL2";
  }, [gl]);

  useLayoutEffect(() => {
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromEquirectangular(hdr);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = .45;
    scene.environmentRotation = new Euler(0, -Math.PI / 2, 0);
    generator.dispose();
    // The rig now performs restrained motion, including the suspension loop.
    // Its small contact shadows use one bounded 1K map rather than a stale map.
    gl.shadowMap.autoUpdate = true;
    invalidate();
    return () => { scene.environment = previous; environment.dispose(); };
  }, [gl, scene, hdr, invalidate]);
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onFailure?.(new Error("WebGL context lost")); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useEffect(() => {
    if (paused) {
      current.current = frame.current.progress;
      resume.current = null;
    } else {
      const next = MathUtils.clamp(progress.get(), 0, 1);
      if (wasPaused.current && active && Math.abs(next - frame.current.progress) > .0001) resume.current = { from: frame.current.progress, elapsed: 0 };
      current.current = next;
    }
    wasPaused.current = paused;
    if (!active) resume.current = null;
    running.current = false;
    invalidate();
    return progress.on("change", (value) => {
      if (!paused) {
        current.current = MathUtils.clamp(value, 0, 1);
        if (active) invalidate();
      }
    });
  }, [progress, paused, active, invalidate]);
  useFrame((_, delta) => {
    const playing = active && !paused;
    if (playing && running.current) {
      const timing = timings.current;
      timing.samples[timing.count % timing.samples.length] = delta * 1000;
      timing.count++;
    }
    // After idle/visibility changes, use a normal first timestep. Wall time
    // spent away must never become a large first-frame camera or wind jump.
    const dt = running.current && playing ? Math.min(delta, .04) : 1 / 60;
    running.current = playing;
    if (playing) frame.current.elapsedSeconds += dt;
    let p = current.current;
    if (resume.current && playing) {
      resume.current.elapsed += dt;
      const t = MathUtils.clamp(resume.current.elapsed / .3, 0, 1);
      p = MathUtils.lerp(resume.current.from, current.current, t * t * (3 - 2 * t));
      if (t === 1) resume.current = null;
    }
    sampleCinematicCamera(p, size.width <= 700, vectors.position, vectors.look, sample);
    camera.position.copy(vectors.position);
    camera.lookAt(vectors.look);
    const perspective = camera as PerspectiveCamera;
    perspective.fov = sample.fov;
    const tablet = size.width > 700 && size.width < 1050;
    const screenX = .5 + (sample.screenX - .5) * (tablet ? 1.2 : 1);
    const shortPhoneOffset = size.width <= 700 && size.height < 650 ? .04 * (1 - MathUtils.smoothstep(p, .06, .29)) - .02 * MathUtils.smoothstep(p, .8, .98) : 0;
    const screenY = sample.screenY + shortPhoneOffset;
    perspective.setViewOffset(size.width, size.height, -(screenX - .5) * size.width, -(screenY - .5) * size.height, size.width, size.height);
    perspective.updateProjectionMatrix();
    camera.updateMatrixWorld();
    frame.current.progress = p;
    presentedProgress.set(p);
    frame.current.altitudeKm = sample.altitudeKm;
    count.current++;
    if (wrapper.current) {
      const node = wrapper.current;
      if (!node.dataset.gpuRenderer) node.dataset.gpuRenderer = gpuRenderer;
      node.dataset.renderCount = String(count.current);
      node.dataset.sceneStage = String(sample.shot);
      node.dataset.sceneProgress = p.toFixed(5);
      node.dataset.sceneTime = frame.current.elapsedSeconds.toFixed(5);
      node.dataset.playing = String(playing);
      node.dataset.balloonCount = "1";
      node.dataset.cameraPosition = `${camera.position.x.toFixed(5)},${camera.position.y.toFixed(5)},${camera.position.z.toFixed(5)}`;
      node.dataset.cameraTarget = `${vectors.look.x.toFixed(5)},${vectors.look.y.toFixed(5)},${vectors.look.z.toFixed(5)}`;
      if (count.current === 3 || count.current % 45 === 0) {
        node.dataset.drawCalls = String(gl.info.render.calls);
        node.dataset.triangles = String(gl.info.render.triangles);
        node.dataset.geometries = String(gl.info.memory.geometries);
        node.dataset.textures = String(gl.info.memory.textures);
        const timing = timings.current;
        if (timing.count >= 30) {
          const ordered = Array.from(timing.samples.slice(0, Math.min(timing.count, timing.samples.length))).sort((a, b) => a - b);
          node.dataset.frameMedianMs = ordered[Math.floor(ordered.length * .5)].toFixed(2);
          node.dataset.frameP95Ms = ordered[Math.floor(ordered.length * .95)].toFixed(2);
        }
      }
    }
    if (!ready.current && count.current > 2) { ready.current = true; onReady?.(); }
    if (playing || count.current < 4) invalidate();
  }, -1);
  const lightPosition = frame.current.sunDirection.clone().multiplyScalar(20);
  return <>
    <CinematicEarth frame={frame} />
    <directionalLight position={lightPosition} intensity={3.3} color="#fff8ed" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-.85} shadow-camera-right={.85} shadow-camera-top={.85} shadow-camera-bottom={-.85} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-.0001} shadow-normalBias={.0006} />
    <CinematicTrain frame={frame} />
    <FlightClouds frame={frame} />
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
  return <div ref={wrapper} data-scene-state={state} data-render-backend="webgl2" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
    <SceneBoundary onFailure={failed}>
      <Canvas shadows dpr={[1, 1.25]} frameloop="demand" camera={{ position:[5.8,3.6,13.5], fov:30, near:.05, far:160 }} gl={{ alpha:false, antialias:true, powerPreference:"high-performance", toneMapping:ACESFilmicToneMapping, toneMappingExposure:.9 }} fallback={<span>A single balloon carrying the SkyCell payload above the clouds.</span>} style={{ width:"100%", height:"100%" }}>
        <World {...props} onReady={ready} onFailure={failed} wrapper={wrapper} />
      </Canvas>
    </SceneBoundary>
  </div>;
}
