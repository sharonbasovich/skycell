import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatUTC, parseCSVData, type ProcessedTrajectoryData } from "@/utils/csvDataUtils";
import { STORY_STOPS } from "./storyTiming";
import StaticRecording from "./StaticRecording";
import StoryHeading, { type HeadingTreatment } from "./StoryHeading";
import StoryPhotoCard, { type StoryPhoto } from "./StoryPhotoCard";
import { readRecordingAt, recordingPhase } from "./scene/recordingReadout";
import "./experience.css";

const AscentScene = lazy(() => import("./AscentScene"));
const IDS = ["ascent", "climb", "hardware", "inside", "connection", "flight-archive", "story-end"];
const RANGES = [[0, .045, .085], [.117, .13, .19, .215], [.282, .304, .356, .375], [.408, .434, .496, .515], [.553, .578, .67, .71], [.795, .815, .95, .965], [.972, .988, 1]];
const ENDING_INDEX = IDS.length - 1;
const HEADING_POINTER_SPRING = { stiffness: 170, damping: 27 };
const PHOTOS: Record<"enclosure" | "electronics" | "launch", StoryPhoto> = {
  enclosure: {
    src: "/gallery/1000004204.jpg", preview: "/gallery/hardware-enclosure-1600.webp", width: 1600, height: 1200,
    alt: "The taped foam enclosure with its black side antenna and blue suspension fitting.", caption: "The flight enclosure and antenna.",
  },
  electronics: {
    src: "/gallery/1000004195.jpg", preview: "/gallery/hardware-electronics-1600.webp", width: 1200, height: 1600,
    alt: "Flight electronics, radio hardware, converter and power connections assembled on the workbench.", caption: "The electronics before packaging.",
  },
  launch: {
    src: "/gallery/PXL_20250621_172905846.MP.jpg", preview: "/gallery/hardware-launch.webp", width: 659, height: 880,
    alt: "Two SkyCell launch balloons and their payload rising over Massachusetts.", caption: "SkyCell’s balloon launch.",
  },
};
class SceneBoundary extends Component<{ children: ReactNode; onFailure: (error?: Error) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { this.props.onFailure(error); }
  render() { return this.state.failed ? null : this.props.children; }
}
function Poster({ showRig }: { showRig: boolean }) { return <div className="story-poster" aria-hidden="true"><img src="/posters/flight-earth.webp" className="story-poster-earth" alt="" />{showRig && <img src="/posters/flight-rig.webp" className="story-poster-rig" alt="" />}</div>; }
function Chapter({ index, progress, active, children }: { index: number; progress: MotionValue<number>; active: boolean; children: ReactNode }) {
  const range = RANGES[index];
  const opacity = useTransform(progress, range, index === 0 ? [1, 1, 0] : index === ENDING_INDEX ? [0, 1, 1] : [0, 1, 1, 0]);
  const y = useTransform(progress, range, index === 0 ? [0, 0, -18] : index === ENDING_INDEX ? [18, 0, 0] : [18, 0, 0, -18]);
  return <motion.section className={`story-chapter story-chapter-${index}`} style={{ opacity, y, pointerEvents: active ? "auto" : "none" }} aria-hidden={!active} aria-labelledby={`story-heading-${index}`}>{children}</motion.section>;
}

export default function SkyCellExperience() {
  const [search] = useSearchParams();
  const headingChoice = Number(search.get("headings"));
  const showHeadingExperiments = headingChoice === 1 || headingChoice === 2 || headingChoice === 3;
  const headingTreatment: HeadingTreatment = showHeadingExperiments ? headingChoice : 2;
  const journey = useRef<HTMLElement>(null), viewport = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const headingPointerX = useSpring(pointerX, HEADING_POINTER_SPRING);
  const headingPointerY = useSpring(pointerY, HEADING_POINTER_SPRING);
  const { scrollYProgress } = useScroll({ target: journey, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 25, mass: .75, restDelta: .00003, restSpeed: .00003 });
  const presented = useMotionValue(0), shade = useTransform(presented, [0, .25, .30, .78, .82, .95, .98, 1], [.08, .08, .35, .35, .42, .42, .12, .12]);
  const reduced = Boolean(useReducedMotion());
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [capable, setCapable] = useState<boolean | null>(null), [visible, setVisible] = useState(document.visibilityState === "visible"), [onscreen, setOnscreen] = useState(true);
  const [active, setActive] = useState(0), [archive, setArchive] = useState<ProcessedTrajectoryData | null>(null), [archiveError, setArchiveError] = useState(false), [attempt, setAttempt] = useState(0), [observation, setObservation] = useState(0);
  const [playbackPhase, setPlaybackPhase] = useState(0);
  const [photo, setPhoto] = useState<StoryPhoto | null>(null);
  const photoTrigger = useRef<HTMLButtonElement | null>(null);
  const staticMode = reduced || capable === false || failed, showScene = capable === true && !reduced && !failed;
  const onReady = useCallback(() => setReady(true), []), onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useMotionValueEvent(presented, "change", value => {
    let nearest = -1;
    RANGES.forEach((range, i) => { if ((i === 0 || value > range[0] + .003) && (i === ENDING_INDEX || value < range[range.length - 1] - .003)) nearest = i; });
    setActive(nearest);
    setPlaybackPhase(recordingPhase(value));
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
  const photoCard = (image: StoryPhoto, index: number) => <StoryPhotoCard photo={image} tabIndex={tab(index)} onOpen={trigger => { photoTrigger.current = trigger; setPhoto(image); }} />;
  const restoreFocus = (event: Event, target: HTMLButtonElement | null) => {
    event.preventDefault();
    if (target?.isConnected && !target.closest('[aria-hidden="true"]')) target.focus();
    else document.querySelector<HTMLAnchorElement>('.sky-header nav a')?.focus();
  };
  const point = staticMode ? archive?.points[Math.min(observation, archive.points.length - 1)] : archive ? readRecordingAt(archive, playbackPhase) : undefined;
  const heading = (index: number, lines: string[]) => <StoryHeading index={index} lines={lines} range={RANGES[index]} progress={presented} treatment={headingTreatment} pointerX={headingPointerX} pointerY={headingPointerY} staticMode={staticMode} />;
  const content = (index: number) => {
    switch (index) {
      case 0: return <>
        {heading(0, ["We launched a", "disaster relief", "prototype into space."])}
        <p className="story-lead">to win 1st at Apex, an international hackathon</p>
        {!staticMode && <button type="button" className="story-scroll-cue" aria-label="Scroll to the next chapter" tabIndex={tab(0)} onClick={() => go(1)}>
          <ChevronDown size={28} strokeWidth={1.7} aria-hidden="true" />
        </button>}
      </>;
      case 1: return <>{heading(1, ["We reached", "98,000 feet"])}<p>to test a communications mesh network</p></>;
      case 2: return <>
        {heading(2, ["We built an alternative", "for when communication", "systems fail"])}
        <p>our payload connected to a base station 230,000 feet away</p>
        {photoCard(PHOTOS.enclosure, index)}
      </>;
      case 3: return <>
        {heading(3, ["The internals"])}
        <p>A Raspberry Pi, GPS receiver, environmental sensors, and a 915 MHz LoRa radio.</p>
        {photoCard(PHOTOS.electronics, index)}
      </>;
      case 4: return <>{heading(4, ["The code"])}<p>Python read GPS and sensor data, sent telemetry over Meshtastic, and handled reconnection.</p></>;
      case 5: return <>{heading(5, ["The flight path."])}{staticMode && archive && <StaticRecording data={archive} selected={observation} />}<div className="story-record-controls" data-observation-index={staticMode ? observation : archive ? readRecordingAt(archive, playbackPhase).observationIndex : 0} data-recording-phase={playbackPhase.toFixed(4)}>
        {archive && point ? <><div className="story-record-reading"><time dateTime={new Date(point.timestamp).toISOString()}>{formatUTC(point.timestamp)}<small>UTC</small></time><span>{(point.altitude / 1000).toFixed(2)}<small>km</small></span></div>{staticMode && <div className="story-record-steps"><button type="button" disabled={observation === 0} onClick={() => setObservation(value => Math.max(0, value - 1))}>Previous fix</button><button type="button" disabled={observation === archive.points.length - 1} onClick={() => setObservation(value => Math.min(archive.points.length - 1, value + 1))}>Next fix</button></div>}<div className="story-record-source"><span>APEX-2-T · Gaps estimated between recorded fixes.</span></div></> : archiveError ? <button type="button" tabIndex={tab(5)} onClick={() => setAttempt(value => value + 1)}>Load the recording again</button> : <p role="status">Loading the flight recording…</p>}
      </div></>;
      default: return <>
        {heading(ENDING_INDEX, ["Skycell"])}
        {photoCard(PHOTOS.launch, index)}
        <a className="story-link" href="https://github.com/knivier/SkyCell" target="_blank" rel="noreferrer" tabIndex={tab(ENDING_INDEX)}>Source code <ArrowUpRight size={16} aria-hidden="true" /></a>
      </>;
    }
  };
  return <div id="top" className={`sky-experience sky-story${staticMode ? " sky-story-static" : ""}`}>
    <section ref={journey} className="story-journey" id="ascent" aria-label="The SkyCell flight">
      {!staticMode && IDS.slice(1).map((id, i) => <div key={id} id={id} className="story-anchor" style={{ top: `${STORY_STOPS[i + 1] * 950}svh` }} aria-hidden="true" />)}
      <div ref={viewport} className="story-viewport" onPointerMove={event => { if (event.pointerType === "mouse") { const rect = event.currentTarget.getBoundingClientRect(); pointer.current.x = (event.clientX - rect.left) / rect.width * 2 - 1; pointer.current.y = (event.clientY - rect.top) / rect.height * 2 - 1; pointerX.set(pointer.current.x); pointerY.set(pointer.current.y); } }} onPointerLeave={() => { pointer.current.x = pointer.current.y = 0; pointerX.set(0); pointerY.set(0); }}>
        <div className={`story-visual${ready && showScene ? " is-ready" : ""}`} aria-busy={showScene && !ready}><Poster showRig={staticMode} />{showScene && <div className="story-canvas"><SceneBoundary onFailure={onFailure}><Suspense fallback={null}><AscentScene progress={progress} presentedProgress={presented} active={onscreen && visible && photo === null} archive={archive} pointer={pointer} onReady={onReady} onFailure={onFailure} /></Suspense></SceneBoundary></div>}</div>
        <motion.div className="story-shade" style={{ opacity: shade }} aria-hidden="true" />
        {showHeadingExperiments && !staticMode && <nav className="story-heading-experiments" aria-label="Heading experiments"><span>Type experiments</span>{([1, 2, 3] as const).map(choice => <Link key={choice} to={`?headings=${choice}#${IDS[Math.max(0, active)]}`} aria-current={headingTreatment === choice ? "page" : undefined}>{choice}<span className="sr-only">: {choice === 1 ? "Lift" : choice === 2 ? "Depth" : "Signal"}</span></Link>)}</nav>}
        {!staticMode && <div className="story-copy">{IDS.map((id, index) => <Chapter key={id} index={index} progress={presented} active={active === index}>{content(index)}</Chapter>)}</div>}
        {failed && !reduced && <button className="story-retry" type="button" onClick={() => location.reload()}>Reload the 3D journey</button>}
      </div>
      {staticMode && <div className="story-static-copy">{IDS.map((id, index) => <section id={index === 0 ? undefined : id} className={`story-static-chapter story-static-chapter-${index}`} key={id}>{content(index)}</section>)}</div>}
    </section>
    <Dialog open={photo !== null} onOpenChange={open => { if (!open) setPhoto(null); }}>
      <DialogContent className="story-photo-dialog" onCloseAutoFocus={event => restoreFocus(event, photoTrigger.current)}>
        <DialogTitle>{photo?.caption ?? "Project photograph"}</DialogTitle>
        <DialogDescription className="sr-only">Original photograph from the SkyCell project archive.</DialogDescription>
        {photo && <img src={photo.src} alt={photo.alt} />}
      </DialogContent>
    </Dialog>
  </div>;
}
