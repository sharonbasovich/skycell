import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, Pause, Play } from "lucide-react";
import FieldStory from "./FieldStory";
import "./experience.css";

const AscentScene = lazy(() => import("./AscentScene"));
const chapters = ["Cloud tops", "The climb", "The connection", "The stratosphere"];
const visibilityRanges = [[0, .07, .14], [.24, .30, .40, .46], [.58, .64, .75, .81], [.89, .97, 1]];

class SceneBoundary extends Component<{ children: ReactNode; onFailure: (error?: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error("SkyCell scene module failed:", error); this.props.onFailure(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

function StaticAscent() {
  return <div className="flight-poster" aria-hidden="true">
    <img className="flight-poster-earth" src="/posters/flight-earth.webp" alt="" width="1440" height="900" fetchPriority="high" />
    <img className="flight-poster-rig" src="/posters/flight-rig.webp" alt="" fetchPriority="high" />
  </div>;
}

function FlightChapter({ index, progress, children }: { index: number; progress: MotionValue<number>; children: ReactNode }) {
  const range = visibilityRanges[index];
  const opacity = useTransform(progress, range, index === 0 ? [1, 1, 0] : index === 3 ? [0, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, range, index === 0 ? [0, 0, -28] : index === 3 ? [28, 0, 0] : [28, 0, 0, -28]);
  return <motion.section className={`flight-copy flight-copy-${index}`} style={{ opacity, y }} aria-labelledby={`flight-title-${index}`}>{children}</motion.section>;
}

export default function SkyCellExperience() {
  const journeyRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start start", "end end"] });
  // One shared filter keeps the typography, camera and atmosphere on the same
  // timeline. The renderer does not chase a second independently damped pose.
  const progress = useSpring(scrollYProgress, { stiffness: 145, damping: 25, mass: .7, restDelta: .00005, restSpeed: .00005 });
  // Typography follows the frame that is actually presented, including a
  // paused flight and its bounded resume. This adds no second scroll filter.
  const presentedProgress = useMotionValue(0);
  const reducedMotion = Boolean(useReducedMotion());
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const [interactivePhase, setInteractivePhase] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [capable, setCapable] = useState<boolean | null>(null);
  const [onscreen, setOnscreen] = useState(true);
  const [visible, setVisible] = useState(document.visibilityState === "visible");
  const [failureReason, setFailureReason] = useState("");
  const handleReady = useCallback(() => { setReady(true); setFailureReason(""); }, []);
  const handleFailure = useCallback((error?: Error) => { setFailed(true); setReady(false); setFailureReason(error?.message || "WebGL scene unavailable"); }, []);
  useMotionValueEvent(presentedProgress, "change", (value) => {
    setActive(Math.min(3, Math.max(0, Math.round(value * 3))));
    setInteractivePhase(value < .13 ? 0 : value > .95 ? 3 : -1);
  });
  useEffect(() => { if (reducedMotion) setReady(false); }, [reducedMotion]);
  useEffect(() => {
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2");
      setCapable(Boolean(context));
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { setCapable(false); }
    const visibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting && entry.intersectionRect.height > 100), { threshold: [0, .025, .05, .1, .2], rootMargin: "-80px 0px 0px" });
    if (journeyRef.current) observer.observe(journeyRef.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  const goToChapter = (index: number) => {
    const panel = document.getElementById(`journey-${index}`);
    if (panel) window.scrollTo({ top: panel.getBoundingClientRect().top + window.scrollY, behavior: reducedMotion ? "instant" : "smooth" });
  };
  const showScene = capable === true && !reducedMotion && !failed;
  const staticMode = reducedMotion || capable === false || failed;
  const chapter = (index: number) => {
    if (index === 0) return <>
      <h1 id="flight-title-0">A small radio.<br />A bigger<br className="flight-desktop-break" /> horizon.</h1>
      <p className="flight-intro">An experiment in connection,<br />above the clouds.</p>
      <button className="flight-follow" type="button" tabIndex={staticMode || interactivePhase === 0 ? 0 : -1} style={{ pointerEvents: staticMode || interactivePhase === 0 ? "auto" : "none" }} onClick={() => goToChapter(1)}>Follow the ascent <span><ArrowDown size={18} aria-hidden="true" /></span></button>
      <p className="flight-award"><span aria-hidden="true">✳</span><span>1st place at APEX 2025<small>International research hackathon</small></span></p>
    </>;
    if (index === 1) return <><h2 id="flight-title-1">Let the world<br />fall away.</h2><p>The view changes. The aim stays simple:<br className="flight-desktop-break" /> carry a small radio higher.</p><span className="flight-copy-rule" aria-hidden="true" /></>;
    if (index === 2) return <><h2 id="flight-title-2">A longer reach.</h2><p className="flight-distance">70<span>km</span></p><p>A 915 MHz LoRa / Meshtastic connection,<br className="flight-desktop-break" /> from the airborne experiment to the ground.</p></>;
    return <><h2 id="flight-title-3">A different point of view.</h2><p className="flight-height">30<span>km</span></p><p className="flight-height-caption">Approximate mission altitude.<br />Four students. One high-altitude experiment.</p><a href="#hardware" className="flight-discover" tabIndex={staticMode || interactivePhase === 3 ? 0 : -1} style={{ pointerEvents: staticMode || interactivePhase === 3 ? "auto" : "none" }}>Discover what went into the flight <ArrowDown size={17} aria-hidden="true" /></a></>;
  };

  return <div id="top" data-scene-failure={failureReason || undefined} className={`sky-experience sky-flight${staticMode ? " sky-static-flight" : ""}${reducedMotion ? " sky-reduced-motion" : ""}`}>
    <section className="flight-journey" ref={journeyRef} id="ascent" aria-label="A balloon experiment rising above the clouds">
      {!staticMode && chapters.map((name, index) => <div id={`journey-${index}`} className="flight-anchor" key={name} style={{ top: `${index * 100}svh` }} aria-hidden="true" />)}
      <div className="flight-viewport">
        <div className={`flight-visual${ready && showScene ? " is-ready" : ""}`} aria-hidden="true">
          <StaticAscent />
          {showScene && <div className="flight-canvas"><SceneBoundary onFailure={handleFailure}><Suspense fallback={null}><AscentScene progress={progress} presentedProgress={presentedProgress} reducedMotion={reducedMotion} paused={paused} active={onscreen && visible} onReady={handleReady} onFailure={handleFailure} /></Suspense></SceneBoundary></div>}
        </div>
        <div className="flight-edge-shade" aria-hidden="true" />
        {!staticMode && <div className="flight-copy-stage">{chapters.map((_, index) => <FlightChapter key={index} index={index} progress={presentedProgress}>{chapter(index)}</FlightChapter>)}</div>}
        <div className="flight-controls">
          <p className="flight-caption">Illustrative flight. Historical Earth imagery.</p>
          {showScene ? <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Resume flight movement" : "Pause flight movement"}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}<span>{paused ? "Resume motion" : "Pause motion"}</span></button> : <span className="flight-static-label">{reducedMotion ? "Reduced motion" : staticMode ? "Static view" : "Preparing the flight"}</span>}
          {failed && capable && !reducedMotion && <button type="button" onClick={() => window.location.reload()}>Reload 3D</button>}
        </div>
        {!staticMode && <nav className="flight-chapter-nav" aria-label="Flight chapters">{chapters.map((name, index) => <button type="button" key={name} className={active === index ? "is-current" : ""} aria-current={active === index ? "step" : undefined} aria-label={`Go to ${name.toLowerCase()}`} onClick={() => goToChapter(index)}><span className="flight-chapter-dot" /><span className="flight-chapter-label">{name}</span></button>)}</nav>}
      </div>
      {staticMode && <div className="flight-static-copy">{chapters.map((_, index) => <section key={index} id={`journey-${index}`} aria-labelledby={`flight-title-${index}`}>{chapter(index)}</section>)}</div>}
    </section>
    <div id="hardware"><FieldStory /></div>
  </div>;
}
