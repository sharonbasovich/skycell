import { Component, Suspense, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping, Euler, PerspectiveCamera, PMREMGenerator, Vector3 } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import CinematicEarth from "../../src/experience/scene/CinematicEarth";
import CinematicTrain from "../../src/experience/scene/CinematicTrain";
import type { CinematicFrame } from "../../src/experience/scene/cinematicTypes";

const mode = new URLSearchParams(window.location.search).get("mode") === "earth" ? "earth" : "rig";
const SUN = new Vector3(-.3801334253, .7631884173, .5225342273).normalize();

function fail(error: unknown) {
  document.documentElement.dataset.posterError = error instanceof Error ? error.message : String(error);
  console.error("Poster fixture failed", error);
}

class FixtureBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { fail(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function FixtureWorld() {
  const { gl, camera, scene, invalidate } = useThree();
  const hdr = useLoader(RGBELoader, "/textures/cinematic/qwantani_noon_puresky_1k.hdr");
  const frame = useRef<CinematicFrame>({ progress: 0, altitudeKm: 8, elapsedSeconds: 0, sunDirection: SUN });
  const count = useRef(0);

  useLayoutEffect(() => {
    // Match AscentScene: HDR orientation/intensity, sunlight, exposure and pose.
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromEquirectangular(hdr);
    const previous = scene.environment;
    scene.environment = environment.texture;
    scene.environmentIntensity = .45;
    scene.environmentRotation = new Euler(0, -Math.PI / 2, 0);
    scene.background = null;
    gl.setClearColor(0x000000, 0);
    gl.shadowMap.autoUpdate = true;
    generator.dispose();
    const context = gl.getContext();
    const debug = context.getExtension("WEBGL_debug_renderer_info");
    document.documentElement.dataset.posterGpu = debug ? String(context.getParameter(debug.UNMASKED_RENDERER_WEBGL)) : "WebGL2";
    document.documentElement.dataset.posterMode = mode;
    invalidate();
    return () => { scene.environment = previous; environment.dispose(); };
  }, [gl, scene, hdr, invalidate]);

  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); fail(new Error("WebGL context lost")); };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [gl]);

  useFrame(() => {
    camera.position.set(5.8, 3.6, 13.5);
    camera.lookAt(0, 2.05, 0);
    const perspective = camera as PerspectiveCamera;
    perspective.fov = 30;
    perspective.clearViewOffset();
    perspective.updateProjectionMatrix();
    camera.updateMatrixWorld();
    frame.current.progress = 0;
    frame.current.altitudeKm = 8;
    frame.current.elapsedSeconds = 0;
    count.current++;
    document.documentElement.dataset.posterFrames = String(count.current);
    if (count.current === 3) {
      // This RAF runs after at least two completed scene renders; the capture
      // script then waits for two compositor frames before reading the canvas.
      requestAnimationFrame(() => { document.documentElement.dataset.posterReady = "true"; });
    }
    if (count.current < 4) invalidate();
  }, -1);

  const lightPosition = SUN.clone().multiplyScalar(20);
  return <>
    <directionalLight position={lightPosition} intensity={3.3} color="#fff8ed" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-.85} shadow-camera-right={.85} shadow-camera-top={.85} shadow-camera-bottom={-.85} shadow-camera-near={1} shadow-camera-far={40} shadow-bias={-.0001} shadow-normalBias={.0006} />
    {mode === "rig" ? <CinematicTrain frame={frame} /> : <CinematicEarth frame={frame} fadeIn={false} />}
  </>;
}

window.addEventListener("error", (event) => fail(event.error ?? event.message));
window.addEventListener("unhandledrejection", (event) => fail(event.reason));

createRoot(document.getElementById("root")!).render(
  <FixtureBoundary>
    <Canvas shadows dpr={1} frameloop="demand"
      camera={{ position: [5.8, 3.6, 13.5], fov: 30, near: .05, far: 160 }}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance", toneMapping: ACESFilmicToneMapping, toneMappingExposure: .9 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}>
      <Suspense fallback={null}><FixtureWorld /></Suspense>
    </Canvas>
  </FixtureBoundary>,
);
