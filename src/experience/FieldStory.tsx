import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowUpRight, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatDuration,
  formatUTC,
  parseCSVData,
  splitTrajectory,
  type ProcessedTrajectoryData,
} from "@/utils/csvDataUtils";
import "./field-story.css";

type EvidencePhoto = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const photos: EvidencePhoto[] = [
  {
    src: "/gallery/PXL_20250621_172905846.MP.jpg",
    alt: "The actual APEX balloon train and its payloads rising into a clear blue sky.",
    caption: "The APEX balloon train. Massachusetts, June 21, 2025.",
    width: 659,
    height: 880,
  },
  {
    src: "/gallery/1000004195.jpg",
    alt: "SkyCell circuit boards, radio hardware, power connections, and wiring assembled on a workbench.",
    caption: "Electronics, radios, and power connections before final packaging.",
    width: 3024,
    height: 4032,
  },
  {
    src: "/gallery/1000004204.jpg",
    alt: "The insulated SkyCell payload enclosure with its long antenna fitted for flight.",
    caption: "The flight-ready enclosure and radio antenna.",
    width: 4032,
    height: 3024,
  },
];

const specifications = [
  ["Radio link", "915 MHz LoRa / Meshtastic", "An airborne node and receivers on the ground."],
  ["Flight software", "Python", "NMEA GPS parsing, environmental sensor readings, and telemetry preparation."],
  ["Connection handling", "Monitoring & reconnection", "Software to recover the radio connection and continue collecting readings."],
  ["Spectrum study", "30 MHz–1.5 GHz", "RTL-SDR sweeps at a sample rate of 2.4 MS/s."],
];

function ArchiveProfile({ data }: { data: ProcessedTrajectoryData }) {
  const points = data.points;
  const start = points[0].timestamp;
  const end = points[points.length - 1].timestamp;
  const duration = end - start || 1;
  const segments = useMemo(() => splitTrajectory(points), [points]);
  const x = (timestamp: number) => 52 + ((timestamp - start) / duration) * 1008;
  const y = (altitude: number) => 198 - (altitude / 32000) * 168;

  return (
    <figure className="field-profile">
      <svg viewBox="0 0 1120 242" role="img" aria-labelledby="field-profile-title field-profile-description">
        <title id="field-profile-title">Altitude in the APEX tracker archive</title>
        <desc id="field-profile-description">The partial recording starts at {formatUTC(start)} UTC and ends at {formatUTC(end)} UTC. The recorded peak is {(data.bounds.alt.max / 1000).toFixed(2)} kilometres. Breaks in the line preserve reception gaps longer than sixty seconds.</desc>
        {[0, 15000, 30000].map((altitude) => (
          <g key={altitude}>
            <line x1="52" y1={y(altitude)} x2="1060" y2={y(altitude)} className="field-profile-grid" />
            <text x="0" y={y(altitude) + 4} className="field-profile-label">{altitude / 1000} km</text>
          </g>
        ))}
        {segments.map((segment, index) => (
          <polyline
            key={index}
            points={segment.map((point) => `${x(point.timestamp).toFixed(2)},${y(point.altitude).toFixed(2)}`).join(" ")}
            className="field-profile-line"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <circle cx={x(points[0].timestamp)} cy={y(points[0].altitude)} r="3.5" className="field-profile-point" />
        <circle cx={x(end)} cy={y(points[points.length - 1].altitude)} r="3.5" className="field-profile-point" />
        <text x="52" y="231" className="field-profile-label">{formatUTC(start)} UTC</text>
        <text x="1060" y="231" textAnchor="end" className="field-profile-label">{formatUTC(end)} UTC</text>
      </svg>
      <figcaption>Actual recorded altitude. The blank intervals are gaps in reception.</figcaption>
    </figure>
  );
}

export default function FieldStory() {
  const [selectedPhoto, setSelectedPhoto] = useState<EvidencePhoto | null>(null);
  const photoTrigger = useRef<HTMLButtonElement | null>(null);
  const [archive, setArchive] = useState<ProcessedTrajectoryData | null>(null);
  const [archiveError, setArchiveError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setArchiveError(false);
    parseCSVData(controller.signal)
      .then((data) => {
        if (!data.points.length) throw new Error("No recorded observations.");
        setArchive(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setArchiveError(true);
      });
    return () => controller.abort();
  }, [attempt]);

  const photoButton = (photo: EvidencePhoto, className: string) => (
    <button className={`field-photo-button ${className}`} onClick={(event) => { photoTrigger.current = event.currentTarget; setSelectedPhoto(photo); }} aria-label={`View photo: ${photo.caption}`}>
      <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
      <span className="field-photo-expand" aria-hidden="true"><Plus size={19} strokeWidth={1.5} /></span>
    </button>
  );

  return (
    <div className="field-story">
      <section className="field-evidence" id="in-the-field" aria-labelledby="field-title">
        <div className="field-container">
          <div className="field-opening">
            <h2 id="field-title">From the workbench<br />to the sky.</h2>
            <div className="field-opening-copy">
              <p>Four students. Months of building.<br />One launch weekend in Massachusetts.</p>
              <p className="field-award">1st place at APEX 2025<span>International research hackathon</span></p>
            </div>
          </div>

          <div className="field-evidence-grid">
            <figure className="field-launch">
              {photoButton(photos[0], "field-photo-launch")}
              <figcaption>{photos[0].caption}</figcaption>
            </figure>
            <div className="field-workbench-column">
              <figure className="field-workbench">
                {photoButton(photos[1], "field-photo-workbench")}
                <figcaption>{photos[1].caption}</figcaption>
              </figure>
              <div className="field-enclosure">
                <figure>
                  {photoButton(photos[2], "field-photo-enclosure")}
                  <figcaption>{photos[2].caption}</figcaption>
                </figure>
                <p>A small box carried the experiment. Inside: flight software, sensors, power, and a radio link to the ground.</p>
              </div>
            </div>
          </div>

          <div className="field-engineering" id="the-build">
            <div className="field-engineering-intro">
              <h3>Built to collect.<br />Built to connect.</h3>
              <p>The experiment joined sensing, radio, and ground software in one payload. The flight made its limits just as useful as its results.</p>
              <a className="field-source-link" href="https://github.com/knivier/SkyCell" target="_blank" rel="noopener noreferrer">Explore the flight software <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" /></a>
            </div>
            <dl className="field-specifications">
              {specifications.map(([label, value, description]) => (
                <div key={label}><dt>{label}</dt><dd><strong>{value}</strong><p>{description}</p></dd></div>
              ))}
            </dl>
          </div>

          <details className="field-lessons">
            <summary><span>What would change on the next flight?</span><Plus size={22} strokeWidth={1.5} aria-hidden="true" /></summary>
            <div className="field-lessons-content">
              <p>The team established a long-range radio connection but received only a few payload packets. Startup brownouts in the original buck-converter setup required a power-bank workaround, which shortened the payload’s operating time.</p>
              <p>The next iteration starts with reliable power delivery, antenna arrangement, and packet timing. A connection alone does not make a reliable telemetry system.</p>
              <a className="field-source-link" href="https://github.com/knivier/SkyCell#readme" target="_blank" rel="noopener noreferrer">Read the team’s post-flight notes <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" /></a>
            </div>
          </details>
        </div>
      </section>

      <section className="field-archive" id="flight-archive" aria-labelledby="field-archive-title">
        <div className="field-container">
          <div className="field-archive-opening">
            <div><h2 id="field-archive-title">Replay the APEX flight.</h2><p>Move through the recording. Inspect the observations.<br />Follow what the tracker actually received.</p></div>
            <Link to="/dashboard" className="field-replay-link">Open flight replay <ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" /></Link>
          </div>
          <div className="field-archive-provenance"><span>APEX tracker / SondeHub archive</span><p>This partial recording comes from the event balloon’s tracker. It is separate from SkyCell’s 915 MHz mesh payload telemetry and is not a live feed.</p></div>
          {archive ? <ArchiveProfile data={archive} /> : archiveError ? <div className="field-profile-state" role="status"><p>The altitude preview could not be loaded.</p><button onClick={() => setAttempt((value) => value + 1)}>Try again</button><Link to="/dashboard">Open the replay</Link></div> : <div className="field-profile-state" role="status"><p>Loading the recorded altitude profile…</p></div>}
          <div className="field-archive-bottom">
            {archive && <dl className="field-archive-facts"><div><dt>Peak in this archive</dt><dd>{(archive.bounds.alt.max / 1000).toFixed(2)}<span>km</span></dd></div><div><dt>Recorded observations</dt><dd>{archive.points.length}</dd></div><div><dt>Tracker callsign</dt><dd className="field-callsign">{archive.source.callsigns.join(", ") || "Not provided"}</dd></div></dl>}
            <div className="field-archive-download"><p>June 21, 2025{archive ? ` · ${formatDuration(archive.points[archive.points.length - 1].timestamp - archive.points[0].timestamp)} recorded` : ""}</p><a href={`${import.meta.env.BASE_URL}data.csv`} download><ArrowDownToLine size={16} strokeWidth={1.5} aria-hidden="true" /> Download source CSV</a></div>
          </div>
        </div>
      </section>

      <footer className="field-footer">
        <div className="field-container field-footer-inner"><a href="#top" className="field-wordmark">SkyCell</a><p>A student experiment in high-altitude communication.<br /><a href="https://svs.gsfc.nasa.gov/2915/" target="_blank" rel="noopener noreferrer">Earth imagery: NASA / GSFC</a></p><nav aria-label="Project resources"><a href="https://github.com/knivier/SkyCell" target="_blank" rel="noopener noreferrer">Flight & ground source <ArrowUpRight size={14} aria-hidden="true" /></a><a href="https://github.com/sharonbasovich/skycell" target="_blank" rel="noopener noreferrer">Website source <ArrowUpRight size={14} aria-hidden="true" /></a></nav></div>
      </footer>

      <Dialog open={selectedPhoto !== null} onOpenChange={(open) => { if (!open) setSelectedPhoto(null); }}>
        <DialogContent className="field-story field-lightbox" onCloseAutoFocus={(event) => { event.preventDefault(); photoTrigger.current?.focus(); }}>
          <DialogTitle className="field-lightbox-title">{selectedPhoto?.caption}</DialogTitle>
          <DialogDescription className="field-lightbox-description">Photo from the SkyCell project archive.</DialogDescription>
          {selectedPhoto && <img src={selectedPhoto.src} alt={selectedPhoto.alt} className="field-lightbox-image" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
