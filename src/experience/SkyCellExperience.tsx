import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatUTC, parseCSVData, type ProcessedTrajectoryData } from "@/utils/csvDataUtils";
import { STORY_STOPS } from "./storyTiming";
import StaticRecording from "./StaticRecording";
import "./experience.css";

const AscentScene = lazy(() => import("./AscentScene"));
const IDS = ["ascent", "climb", "hardware", "inside", "connection", "power", "flight-archive", "story-end"];
const RANGES = [[0, .045, .085], [.117, .13, .19, .215], [.282, .304, .356, .375], [.408, .434, .496, .515], [.553, .578, .635, .655], [.688, .713, .765, .79], [.819, .842, .896, .923], [.948, .976, 1]];
const PHOTOS = [
  { src: "/gallery/1000004204.jpg", alt: "The actual taped foam enclosure with its black side antenna and blue suspension fitting.", caption: "The flight enclosure and antenna." },
  { src: "/gallery/1000004195.jpg", alt: "Flight electronics, radio hardware, converter and power connections assembled on the workbench.", caption: "The actual electronics before packaging." },
  { src: "/gallery/PXL_20250621_172905846.MP.jpg", alt: "The actual two-balloon APEX train rising over Massachusetts.", caption: "APEX launch. Massachusetts, June 21, 2025." },
];
class SceneBoundary extends Component<{ children: ReactNode; onFailure: (error?: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { this.props.onFailure(error); }
  render() { return this.state.failed ? null : this.props.children; }
}
function Poster({ showRig }: { showRig: boolean }) { return <div className="story-poster" aria-hidden="true"><img src="/posters/flight-earth.webp" className="story-poster-earth" alt="" />{showRig && <img src="/posters/flight-rig.webp" className="story-poster-rig" alt="" />}</div>; }
function Chapter({ index, progress, active, children }: { index: number; progress: MotionValue<number>; active: boolean; children: ReactNode }) {
  const range = RANGES[index];
  const opacity = useTransform(progress, range, index === 0 ? [1, 1, 0] : index === 7 ? [0, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, range, index === 0 ? [0, 0, -18] : index === 7 ? [18, 0, 0] : [18, 0, 0, -18]);
  return <motion.section className={`story-chapter story-chapter-${index}`} style={{ opacity, y, pointerEvents: active ? "auto" : "none" }} aria-hidden={!active} aria-labelledby={`story-heading-${index}`}>{children}</motion.section>;
}

export default function SkyCellExperience() {
  const journey = useRef<HTMLElement>(null), viewport = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll({ target: journey, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 25, mass: .75, restDelta: .00003, restSpeed: .00003 });
  const presented = useMotionValue(0), shade = useTransform(presented, [0, .25, .30, .78, .82, .93, .97, 1], [.08, .08, .20, .20, .36, .36, .12, .12]);
  const reduced = Boolean(useReducedMotion());
  const [paused, setPaused] = useState(false), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [capable, setCapable] = useState<boolean | null>(null), [visible, setVisible] = useState(document.visibilityState === "visible"), [onscreen, setOnscreen] = useState(true);
  const [active, setActive] = useState(0), [archive, setArchive] = useState<ProcessedTrajectoryData | null>(null), [archiveError, setArchiveError] = useState(false), [attempt, setAttempt] = useState(0), [observation, setObservation] = useState(0);
  const [photo, setPhoto] = useState<number | null>(null), [notes, setNotes] = useState(false);
  const photoTrigger = useRef<HTMLButtonElement | null>(null), notesTrigger = useRef<HTMLButtonElement | null>(null);
  const staticMode = reduced || capable === false || failed, showScene = capable === true && !reduced && !failed;
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useMotionValueEvent(presented, "change", value => {
    let nearest = -1;
    RANGES.forEach((range, i) => { if ((i === 0 || value > range[0] + .003) && (i === 7 || value < range[range.length - 1] - .003)) nearest = i; });
    setActive(nearest);
    if (viewport.current) viewport.current.dataset.chapter = String(nearest);
  });
  useEffect(() => {
    try { const canvas = document.createElement("canvas"), context = canvas.getContext("webgl2"); setCapable(Boolean(context)); context?.getExtension("WEBGL_lose_context")?.loseContext(); } catch { setCapable(false); }
    const visibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setOnscreen(entry.isIntersecting && entry.intersectionRect.height > 100), { threshold: [0, .01, .025, .05, .1], rootMargin: "-74px 0px 0px" });
    if (journey.current) observer.observe(journey.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  useEffect(() => {
    const controller = new AbortController(); setArchiveError(false);
    parseCSVData(controller.signal).then(data => { if (!controller.signal.aborted) setArchive(data); }).catch(() => { if (!controller.signal.aborted) setArchiveError(true); });
    return () => controller.abort();
  }, [attempt]);
  const go = (index: number) => {
    const anchor = document.getElementById(index === 0 ? "ascent" : IDS[index]);
    if (anchor) window.scrollTo({ top: anchor.getBoundingClientRect().top + scrollY, behavior: staticMode ? "instant" : "smooth" });
  };
  const tab = (index: number) => staticMode || active === index ? 0 : -1;
  const openPhoto = (index: number, trigger: HTMLButtonElement) => { photoTrigger.current = trigger; setPhoto(index); };
  const openNotes = (trigger: HTMLButtonElement) => { notesTrigger.current = trigger; setNotes(true); };
  const restoreFocus = (event: Event, target: HTMLButtonElement | null) => {
    event.preventDefault();
    if (target?.isConnected && !target.closest('[aria-hidden="true"]')) target.focus();
    else document.querySelector<HTMLAnchorElement>('.sky-header nav a')?.focus();
  };
  const point = archive?.points[Math.min(observation, archive.points.length - 1)];
  const content = (index: number) => {
    switch (index) {
      case 0: return <><h1 id="story-heading-0">A small radio.<br />A bigger horizon.</h1><p className="story-lead">Four students. One experiment<br />above the clouds.</p><button type="button" className="story-link story-begin" tabIndex={tab(0)} onClick={() => go(1)}>Follow the flight <ArrowDown size={17} /></button></>;
      case 1: return <><h2 id="story-heading-1">Lift above.<br />Weight below.</h2><p>Helium lifts the balloon. The suspended<br className="story-desktop-break" /> payload trails changes in the wind.</p><p className="story-altitude">30<span>km</span></p></>;
      case 2: return <><h2 id="story-heading-2">The whole mission.<br />Inside a small box.</h2><p>Foam to keep the flight computer warm.<br className="story-desktop-break" /> An antenna to keep it connected.</p><button type="button" className="story-link" tabIndex={tab(2)} onClick={event => openPhoto(0, event.currentTarget)}>See the actual build <ArrowUpRight size={16} /></button></>;
      case 3: return <><h2 id="story-heading-3"><span>Sense.</span>{" "}<span>Compute.</span>{" "}<span>Transmit.</span></h2><p>GPS and environmental readings.<br />Python to prepare them.<br />A radio to send them home.</p><button type="button" className="story-link" tabIndex={tab(3)} onClick={event => openPhoto(1, event.currentTarget)}>From the workbench <ArrowUpRight size={16} /></button></>;
      case 4: return <><h2 id="story-heading-4">A small signal.<br />A long way home.</h2><p className="story-range">70<span>km</span></p><p>A 915 MHz LoRa / Meshtastic connection<br className="story-desktop-break" /> reached the ground. Only a few payload<br className="story-desktop-break" /> packets made it back.</p></>;
      case 5: return <><h2 id="story-heading-5">The link worked.<br />Power was the limit.</h2><p>Startup brownouts forced a power-bank<br className="story-desktop-break" /> workaround, shortening the operating window.</p></>;
      case 6: return <><h2 id="story-heading-6">A flight, in<br />{archive ? `${archive.points.length} observations.` : "recorded observations."}</h2>{staticMode && archive && <StaticRecording data={archive} selected={observation} />}<div className="story-record-controls" data-observation-index={observation}>
        {archive && point ? <><div className="story-record-reading"><time dateTime={point.datetime}>{formatUTC(point.timestamp)}<small>UTC</small></time><span>{(point.altitude / 1000).toFixed(2)}<small>km</small></span></div><label className="sr-only" htmlFor="story-observation">Inspect a recorded observation</label><input id="story-observation" type="range" min="0" max={archive.points.length - 1} step="1" value={observation} onChange={event => setObservation(Number(event.target.value))} tabIndex={tab(6)} aria-valuetext={`${formatUTC(point.timestamp)} UTC, ${(point.altitude / 1000).toFixed(2)} kilometres, observation ${observation + 1} of ${archive.points.length}`} /><div className="story-record-source"><span>APEX-2-T · event tracker archive</span><Link to="/dashboard" tabIndex={tab(6)}>Open replay <ArrowUpRight size={14} /></Link></div></> : archiveError ? <button type="button" tabIndex={tab(6)} onClick={() => setAttempt(value => value + 1)}>Load the recording again</button> : <p role="status">Loading the flight recording…</p>}
      </div></>;
      default: return <><h2 id="story-heading-7">A bigger horizon<br />starts small.</h2><p>Four students. First place at APEX 2025.</p><div className="story-ending-links"><button type="button" className="story-link" tabIndex={tab(7)} onClick={event => openNotes(event.currentTarget)}>Flight notes & evidence <ArrowUpRight size={16} /></button><a className="story-link" href="https://github.com/knivier/SkyCell" target="_blank" rel="noreferrer" tabIndex={tab(7)}>Explore the project <ArrowUpRight size={16} /></a></div></>;
    }
  };
  return <div id="top" className={`sky-experience sky-story${staticMode ? " sky-story-static" : ""}`}>
    <section ref={journey} className="story-journey" id="ascent" aria-label="The SkyCell flight">
      {!staticMode && IDS.slice(1).map((id, i) => <div key={id} id={id} className="story-anchor" style={{ top: `${STORY_STOPS[i + 1] * 950}svh` }} aria-hidden="true" />)}
      <div ref={viewport} className="story-viewport" onPointerMove={event => { if (event.pointerType === "mouse") { const rect = event.currentTarget.getBoundingClientRect(); pointer.current.x = (event.clientX - rect.left) / rect.width * 2 - 1; pointer.current.y = (event.clientY - rect.top) / rect.height * 2 - 1; } }} onPointerLeave={() => { pointer.current.x = pointer.current.y = 0; }}>
        <div className={`story-visual${ready && showScene ? " is-ready" : ""}`} aria-busy={showScene && !ready}><Poster showRig={staticMode} />{showScene && <div className="story-canvas"><SceneBoundary onFailure={onFailure}><Suspense fallback={null}><AscentScene progress={progress} presentedProgress={presented} paused={paused} active={onscreen && visible && !notes && photo === null} reducedMotion={reduced} archive={archive} selectedObservation={observation} pointer={pointer} onReady={onReady} onFailure={onFailure} /></Suspense></SceneBoundary></div>}</div>
        <motion.div className="story-shade" style={{ opacity: shade }} aria-hidden="true" />
        {!staticMode && <div className="story-copy">{IDS.map((id, index) => <Chapter key={id} index={index} progress={presented} active={active === index}>{content(index)}</Chapter>)}</div>}
        {showScene && <button type="button" className="story-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? "Resume flight movement" : "Pause flight movement"} aria-pressed={paused}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
        {failed && !reduced && <button className="story-retry" type="button" onClick={() => location.reload()}>Reload the 3D journey</button>}
      </div>
      {staticMode && <div className="story-static-copy">{IDS.map((id, index) => <section id={index === 0 ? undefined : id} className={`story-static-chapter story-static-chapter-${index}`} key={id}>{content(index)}{index === 2 && <img src="/gallery/hardware-enclosure-1600.webp" alt={PHOTOS[0].alt} />}{index === 3 && <img src="/gallery/hardware-electronics-1600.webp" alt={PHOTOS[1].alt} />}{index === 7 && <img src="/gallery/hardware-launch.webp" alt={PHOTOS[2].alt} />}</section>)}</div>}
    </section>
    <footer className="story-footer"><a href="#ascent">SkyCell</a><button type="button" onClick={event => openNotes(event.currentTarget)}>Flight notes & credits</button><Link to="/dashboard">Flight replay <ArrowUpRight size={14} /></Link></footer>
    <Dialog open={photo !== null} onOpenChange={open => { if (!open) setPhoto(null); }}><DialogContent className="story-photo-dialog" onCloseAutoFocus={event => restoreFocus(event, photoTrigger.current)}><DialogTitle>{photo !== null ? PHOTOS[photo].caption : "Project photograph"}</DialogTitle><DialogDescription>Original photograph from the SkyCell project archive.</DialogDescription>{photo !== null && <img src={PHOTOS[photo].src} alt={PHOTOS[photo].alt} />}</DialogContent></Dialog>
    <Dialog open={notes} onOpenChange={setNotes}><DialogContent className="story-notes" onCloseAutoFocus={event => { if (photo !== null) event.preventDefault(); else restoreFocus(event, notesTrigger.current); }}><DialogTitle>Flight notes & evidence</DialogTitle><DialogDescription>The project, the recording, and the visual interpretation.</DialogDescription><h3>The experiment</h3><p>SkyCell was a four-student APEX 2025 research-hackathon project. It established a 70 km LoRa / Meshtastic connection at 915 MHz. Only a few payload packets were received. Startup brownouts required a power-bank workaround and shortened the operating window.</p><h3>The recording</h3><p>The 125 observations shown here come from the event’s APEX-2-T / SondeHub tracker, separate from SkyCell’s mesh payload telemetry. This partial archive runs from 18:11:06 to 19:17:21 UTC on June 21, 2025, with a recorded peak of 29,510 m. Gaps remain unconnected.</p><h3>The inspection</h3><p>The single-balloon scene and opening payload explain the system. Interior circuit roles and hidden surfaces are interpreted from project photographs; the technical cutaway does not represent the enclosure opening during flight. The actual launch train had two balloons.</p><button type="button" className="story-link" onClick={event => { setNotes(false); openPhoto(2, event.currentTarget); }}>View the launch photograph <ArrowUpRight size={15} /></button><h3>Sources & imagery</h3><p>Earth: NASA Blue Marble and MODIS / GIBS, with regional imagery from June 21, 2024. Environment lighting: Poly Haven, CC0. Wind, cloud volumes, hardware cutaway, camera and scaled recording visualization are authored for this experience.</p><div className="story-notes-links"><a href="https://github.com/knivier/SkyCell" target="_blank" rel="noreferrer">Team source & post-flight notes</a><a href="/data.csv" download>Download the original CSV</a><Link to="/dashboard" onClick={() => setNotes(false)}>Open the full replay</Link></div></DialogContent></Dialog>
  </div>;
}
