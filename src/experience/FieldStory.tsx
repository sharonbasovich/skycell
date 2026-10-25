import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ArrowDownToLine, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatDuration, parseCSVData, type ProcessedTrajectoryData } from "@/utils/csvDataUtils";
import HardwareExplorer, { type EvidencePhoto } from "./field/HardwareExplorer";
import SignalSequence from "./field/SignalSequence";
import ArchiveExplorer from "./field/ArchiveExplorer";
import "./field-story.css";

export default function FieldStory() {
  const reducedMotion = Boolean(useReducedMotion());
  const [selectedPhoto, setSelectedPhoto] = useState<EvidencePhoto | null>(null);
  const photoTrigger = useRef<HTMLButtonElement | null>(null);
  const [archive, setArchive] = useState<ProcessedTrajectoryData | null>(null);
  const [archiveError, setArchiveError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setArchiveError(false);
    parseCSVData(controller.signal).then(data => {
      if (!data.points.length) throw new Error("No recorded observations.");
      if (!controller.signal.aborted) setArchive(data);
    }).catch(() => { if (!controller.signal.aborted) setArchiveError(true); });
    return () => controller.abort();
  }, [attempt]);
  const openPhoto = (photo: EvidencePhoto, trigger: HTMLButtonElement) => { photoTrigger.current = trigger; setSelectedPhoto(photo); };
  const restorePhotoFocus = (event: Event) => {
    event.preventDefault();
    if (photoTrigger.current?.isConnected && !photoTrigger.current.disabled && !photoTrigger.current.closest('[aria-hidden="true"]')) photoTrigger.current.focus();
    else document.querySelector<HTMLButtonElement>(".field-hardware-tabs [aria-selected='true']")?.focus();
  };
  return <div className="field-story">
    <HardwareExplorer reducedMotion={reducedMotion} onOpenPhoto={openPhoto} />
    <SignalSequence reducedMotion={reducedMotion} />
    <section className="field-archive" id="flight-archive" aria-labelledby="field-archive-title">
      <div className="field-container">
        <div className="field-archive-opening"><h2 id="field-archive-title">A flight, in<br />{archive ? `${archive.points.length} observations.` : "recorded observations."}</h2><p>This is a partial recording from the event balloon’s APEX / SondeHub tracker. It is separate from SkyCell’s 915 MHz mesh payload telemetry.</p></div>
        <div className="field-archive-provenance"><span>APEX-2-T tracker archive</span><span>June 21, 2025 · Recorded, not live</span></div>
        {archive ? <ArchiveExplorer data={archive} /> : archiveError ? <div className="field-profile-state" role="status"><p>The archive could not be loaded.</p><button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button><Link to="/dashboard">Open the replay</Link></div> : <div className="field-profile-state" role="status">Loading the recorded observations…</div>}
        <div className="field-archive-bottom">
          {archive && <dl className="field-archive-facts"><div><dt>Peak in this archive</dt><dd>{(archive.bounds.alt.max / 1000).toFixed(2)} <span>km</span></dd></div><div><dt>Recorded observations</dt><dd>{archive.points.length}</dd></div><div><dt>Tracker callsign</dt><dd className="field-callsign">{archive.source.callsigns.join(", ") || "Not provided"}</dd></div></dl>}
          <div className="field-archive-actions"><Link to="/dashboard" className="field-replay-link">Open flight replay <ArrowUpRight size={19} strokeWidth={1.5} aria-hidden="true" /></Link><a href={`${import.meta.env.BASE_URL}data.csv`} download><ArrowDownToLine size={15} strokeWidth={1.5} aria-hidden="true" /> Download source CSV</a>{archive && <p>{formatDuration(archive.points[archive.points.length - 1].timestamp - archive.points[0].timestamp)} in this partial recording</p>}</div>
        </div>
      </div>
    </section>
    <section className="field-outcomes" aria-labelledby="field-outcomes-title">
      <div className="field-container">
        <div className="field-outcome-opening"><h2 id="field-outcomes-title">The link worked.<br />The power needed work.</h2><p>The mission established a 70 km LoRa / Meshtastic connection, but only a few payload packets were received. Range was one result. Reliable telemetry remained the next challenge.</p></div>
        <div className="field-outcome-detail"><div><h3>A short operating window.</h3><p>Startup brownouts in the buck-converter setup required a power-bank workaround. That shortened the payload’s operating time and made power continuity a central lesson.</p><a className="field-source-link" href="https://github.com/knivier/SkyCell#readme" target="_blank" rel="noopener noreferrer">Read the team’s post-flight notes <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" /></a></div><div className="field-next-flight"><h3>What changes next</h3><p><strong>Power delivery.</strong> Test startup and sustained operation as one system.</p><p><strong>Antenna arrangement.</strong> Revisit the physical radio setup.</p><p><strong>Packet timing.</strong> Improve how readings reach the ground.</p></div></div>
      </div>
    </section>
    <footer className="field-footer"><div className="field-container field-footer-inner"><a href="#top" className="field-wordmark">SkyCell</a><p>A student experiment in high-altitude communication.<br /><a href="https://www.earthdata.nasa.gov/data/tools/gibs" target="_blank" rel="noopener noreferrer">Earth imagery: NASA / GIBS</a></p><nav aria-label="Project resources"><a href="https://github.com/knivier/SkyCell" target="_blank" rel="noopener noreferrer">Flight & ground source <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" /></a><a href="https://github.com/sharonbasovich/skycell" target="_blank" rel="noopener noreferrer">Website source <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" /></a></nav></div></footer>
    <Dialog open={selectedPhoto !== null} onOpenChange={open => { if (!open) setSelectedPhoto(null); }}><DialogContent className="field-story field-lightbox" onCloseAutoFocus={restorePhotoFocus}><DialogTitle className="field-lightbox-title">{selectedPhoto?.caption}</DialogTitle><DialogDescription className="field-lightbox-description">Original photograph from the SkyCell project archive.</DialogDescription>{selectedPhoto && <img src={selectedPhoto.fullSrc ?? selectedPhoto.src} alt={selectedPhoto.alt} className="field-lightbox-image" />}</DialogContent></Dialog>
  </div>;
}
