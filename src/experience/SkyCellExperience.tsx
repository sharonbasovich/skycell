import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Pause, Play } from "lucide-react";
import FieldStory from "./FieldStory";
import "./experience.css";

const AscentScene = lazy(() => import("./AscentScene"));
const chapters = ["The idea", "The payload", "The connection", "The stratosphere"];

class SceneBoundary extends Component<{ children: ReactNode; onFailure: (error?: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error("SkyCell scene module failed:", error); this.props.onFailure(error); }
  render() { return this.state.failed ? null : this.props.children; }
}

function StaticAscent() {
  return (
    <svg className="sky-static-scene" viewBox="0 0 800 850" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="static-earth"><stop stopColor="#65a8e6" /><stop offset=".65" stopColor="#20639b" /><stop offset="1" stopColor="#10365c" /></radialGradient>
        <radialGradient id="static-balloon" cx=".32" cy=".25"><stop stopColor="#fff" /><stop offset=".65" stopColor="#f0f5fc" /><stop offset="1" stopColor="#b1c9e5" /></radialGradient>
        <linearGradient id="static-foam"><stop stopColor="#fffef7" /><stop offset="1" stopColor="#b6c5db" /></linearGradient>
      </defs>
      <ellipse cx="450" cy="1000" rx="620" ry="370" fill="url(#static-earth)" />
      <path d="M-120 850C110 610 575 545 920 780" stroke="#a2d7ff" strokeWidth="3" opacity=".6" />
      <g transform="translate(450 20) rotate(-7)">
        <ellipse cx="0" cy="135" rx="93" ry="105" fill="url(#static-balloon)" />
        <path d="M0 239v65" stroke="#e5effe" strokeWidth="1" />
        <ellipse cx="0" cy="350" rx="63" ry="68" fill="url(#static-balloon)" />
        <path d="M0 417v125m0-80 8 10-8 40-8-40 8-10" stroke="#e4edfa" />
        <rect x="-8" y="477" width="16" height="22" rx="2" fill="#edf3fb" />
        <path d="M0 543v32" stroke="#d5e3f7" />
        <path d="m-27 577 48-8 12 24-48 9-12-25Z" fill="url(#static-foam)" />
        <path d="m21 569 12 24 0 16-12-24v-16Z" fill="#9facbd" />
        <path d="m-27 577 48-8v16l-48 8v-16Z" fill="#f6f5ec" />
        <path d="m26 591 64 22" stroke="#142c4c" strokeWidth="3" />
        <circle cx="-2" cy="570" r="5" fill="#3465c1" />
      </g>
    </svg>
  );
}

export default function SkyCellExperience() {
  const journeyRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start start", "end end"] });
  const reducedMotion = Boolean(useReducedMotion());
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failureReason, setFailureReason] = useState("");
  const [capable, setCapable] = useState(false);
  const background = useTransform(scrollYProgress, [0, .34, .68, 1], ["#1647d1", "#1245ad", "#0b326f", "#07162e"]);
  const handleReady = useCallback(() => { setReady(true); setFailureReason(""); }, []);
  const handleFailure = useCallback((error?: Error) => { setFailed(true); setReady(false); setFailureReason(error?.message || "WebGL scene unavailable"); }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => setActive(Math.min(3, Math.max(0, Math.round(value * 3)))));
  useEffect(() => { if (reducedMotion) setReady(false); }, [reducedMotion]);
  useEffect(() => {
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2");
      setCapable(Boolean(context));
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { setCapable(false); }
  }, []);

  const goToChapter = (index: number) => document.getElementById(`journey-${index}`)?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
  const showScene = capable && !reducedMotion && !failed;

  return (
    <div id="top" data-scene-failure={failureReason || undefined} className={`sky-experience${reducedMotion ? " sky-reduced-motion" : ""}`}>
      <section className="sky-journey" ref={journeyRef} id="ascent" aria-label="From the ground to the stratosphere">
        <motion.div className="sky-journey-sticky" style={{ backgroundColor: background }}>
          <div className={`sky-visual${ready && showScene ? " is-ready" : ""}`} aria-hidden="true">
            <StaticAscent />
            {showScene && <div className="sky-canvas"><SceneBoundary onFailure={handleFailure}><Suspense fallback={null}><AscentScene progress={scrollYProgress} reducedMotion={reducedMotion} paused={paused} onReady={handleReady} onFailure={handleFailure} /></Suspense></SceneBoundary></div>}
          </div>
          <div className="sky-scene-shade" aria-hidden="true" />
          <div className="sky-journey-tools">
            <p>Conceptual illustration<span>Not to scale or flight data</span></p>
            {showScene ? <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Resume 3D scene movement" : "Pause 3D scene movement"}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{paused ? "Resume scene" : "Pause scene"}</span></button> : <span className="sky-static-label">{reducedMotion ? "Reduced motion" : failed ? "Static view" : "Illustrated view"}</span>}
            {failed && capable && !reducedMotion && <button type="button" onClick={() => window.location.reload()}>Reload 3D</button>}
          </div>
          <nav className="sky-chapter-rail" aria-label="Ascent chapters">
            {chapters.map((chapter, index) => <button key={chapter} type="button" className={active === index ? "is-current" : ""} aria-current={active === index ? "step" : undefined} aria-label={`Go to ${chapter.toLowerCase()}`} onClick={() => goToChapter(index)}><span className="sky-rail-tick" /><span className="sky-rail-label">{chapter}</span></button>)}
          </nav>
        </motion.div>

        <div className="sky-journey-copy">
          <section className="sky-journey-panel sky-hero" id="journey-0">
            <div className="sky-panel-copy">
              <motion.h1 initial={reducedMotion ? false : { y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .65, ease: [.2, .8, .2, 1] }}>A small radio.<br />A much bigger<br />horizon.</motion.h1>
              <p className="sky-hero-description">An experiment in connecting the ground to the stratosphere.</p>
              <button className="sky-follow" type="button" onClick={() => goToChapter(1)}>Follow the ascent <span><ArrowDown size={18} aria-hidden="true" /></span></button>
              <div className="sky-award"><span className="sky-award-star" aria-hidden="true">✳</span><div><strong>1st place at APEX 2025</strong><span>International research hackathon</span></div></div>
            </div>
            <p className="sky-hero-baseline">Four students. One high-altitude mission.</p>
          </section>

          <section className="sky-journey-panel" id="journey-1" aria-labelledby="sky-payload-title">
            <div className="sky-panel-copy"><p className="sky-stage-name">The payload</p><h2 id="sky-payload-title">Small hardware.<br />Serious distance.</h2><p>Could an affordable radio extend a mesh network from a balloon? We built a payload to find out, bringing the hardware and software into one flight-ready enclosure.</p><dl className="sky-panel-spec"><div><dt>Radio frequency</dt><dd>915 <span>MHz</span></dd></div><div><dt>Radio system</dt><dd className="sky-spec-words">LoRa /<br />Meshtastic</dd></div></dl></div>
          </section>

          <section className="sky-journey-panel" id="journey-2" aria-labelledby="sky-link-title">
            <div className="sky-panel-copy"><p className="sky-stage-name">The connection</p><h2 id="sky-link-title">From a reading<br />to the ground.</h2><p>Python parsed GPS and environmental readings, prepared telemetry, and handled reconnection. On the ground, packet logging and spectrum sweeps helped us inspect the radio environment.</p><div className="sky-signal-flow" aria-label="Data flows from sensors through flight software and radio to the ground"><span>Sensors</span><i aria-hidden="true" /><span>Python</span><i aria-hidden="true" /><span>Radio</span><i aria-hidden="true" /><span>Ground</span></div><p className="sky-stage-footnote">RTL-SDR sweeps from 30 MHz to 1.5 GHz at 2.4 MS/s.</p></div>
          </section>

          <section className="sky-journey-panel" id="journey-3" aria-labelledby="sky-horizon-title">
            <div className="sky-panel-copy"><p className="sky-stage-name">The stratosphere</p><h2 id="sky-horizon-title">A different<br />point of view.</h2><p>The mission reached the stratosphere and established a long-range LoRa / Meshtastic connection. The flight gave us a result—and a clear set of questions for the next iteration.</p><dl className="sky-panel-spec"><div><dt>Mission altitude</dt><dd>≈30 <span>km</span></dd></div><div><dt>Radio link</dt><dd>70 <span>km</span></dd></div></dl></div>
          </section>
        </div>
      </section>
      <div id="hardware"><FieldStory /></div>
    </div>
  );
}
