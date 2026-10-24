import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowUpRight, Pause, Play, Radio, RotateCcw } from "lucide-react";
import { useFlightReplay } from "@/hooks/use-flight-replay";
import { formatDuration, formatUTC, parseCSVData, splitTrajectory, type ProcessedTrajectoryData, type TrajectoryPoint } from "@/utils/csvDataUtils";
import TelemetryGraphs from "@/components/dashboard/TelemetryGraphs";
import "./explorer.css";

const TrajectoryVisualization = lazy(() => import("@/components/dashboard/TrajectoryVisualization"));
const EMPTY_POINTS: TrajectoryPoint[] = [];
const reading = (value: number | null, digits = 1) => value === null ? "—" : value.toFixed(digits);
const coord = (value: number, positive: string, negative: string) => `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

function AltitudeStrip({ points, timestamp }: { points: TrajectoryPoint[]; timestamp: number }) {
  const start = points[0].timestamp;
  const duration = points[points.length - 1].timestamp - start || 1;
  const peak = Math.max(...points.map((point) => point.altitude), 1);
  const segments = useMemo(() => splitTrajectory(points), [points]);
  return (
    <svg className="explorer-altitude-strip" viewBox="0 0 1000 48" preserveAspectRatio="none" role="img" aria-label="Recorded altitude profile. Line breaks indicate reception gaps longer than sixty seconds.">
      <line x1="0" y1="45" x2="1000" y2="45" stroke="currentColor" opacity=".2" />
      {segments.map((segment, index) => <polyline key={index} points={segment.map((point) => `${(point.timestamp - start) / duration * 1000},${44 - point.altitude / peak * 39}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />)}
      <line x1={(timestamp - start) / duration * 1000} y1="0" x2={(timestamp - start) / duration * 1000} y2="48" stroke="#233a50" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function ExplorerDraft() {
  const [data, setData] = useState<ProcessedTrajectoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const points = data?.points ?? EMPTY_POINTS;
  const replay = useFlightReplay(points);
  const current = replay.point;
  const sample = points[replay.index];
  const peak = useMemo(() => points.reduce<TrajectoryPoint | null>((highest, point) => !highest || point.altitude > highest.altitude ? point : highest, null), [points]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    parseCSVData(controller.signal).then((archive) => {
      if (!archive.points.length) throw new Error("The archive contains no valid observations.");
      setData(archive);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "The archive could not be loaded.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="explorer-draft">
      <header className="explorer-header">
        <Link className="explorer-brand" to="/drafts/explorer" aria-label="SkyCell archive explorer"><Radio size={23} strokeWidth={1.7} /><strong>SkyCell</strong><span>Archive explorer</span></Link>
        <nav aria-label="Explorer navigation"><a href="#explorer-project">The project</a><a href="https://github.com/sharonbasovich/skycell" target="_blank" rel="noreferrer">Source <ArrowUpRight size={14} /></a></nav>
      </header>

      <div className="explorer-main" id="explorer-top">
        <div className="explorer-title-row">
          <div><h1>Archived APEX / SondeHub flight</h1><p>June 21, 2025 · A recorded flight, ready to explore. All times UTC.</p></div>
          <a className="explorer-download" href={`${import.meta.env.BASE_URL}data.csv`} download><ArrowDownToLine size={16} /> Download CSV</a>
        </div>
        <p className="explorer-provenance"><strong>Archive replay.</strong> This event tracker recording is separate from SkyCell’s 915 MHz mesh payload telemetry. It is not a live feed.</p>

        {loading && <div className="explorer-load" role="status">Opening the recorded flight…</div>}
        {!loading && error && <div className="explorer-load" role="alert"><h2>Archive unavailable</h2><p>{error}</p><button onClick={() => setAttempt((value) => value + 1)}>Try again</button></div>}

        {!loading && !error && data && current && sample && peak && <>
          <section className="explorer-transport" aria-label="Archive playback">
            <div className="explorer-transport-top">
              <div className="explorer-play-actions">
                <button className="explorer-play" onClick={replay.toggle} disabled={!replay.duration} aria-label={replay.isPlaying ? "Pause archive replay" : "Play archive replay"}>{replay.isPlaying ? <Pause size={17} /> : <Play size={17} />}{replay.isPlaying ? "Pause" : replay.elapsed >= replay.duration ? "Replay" : "Play flight"}</button>
                <button className="explorer-reset" onClick={replay.reset} aria-label="Reset archive replay"><RotateCcw size={16} /></button>
                <label htmlFor="explorer-speed">Speed <select id="explorer-speed" value={replay.speed} onChange={(event) => replay.setSpeed(Number(event.target.value))}>{[1, 25, 100, 250].map((speed) => <option key={speed} value={speed}>{speed}×</option>)}</select></label>
              </div>
              <div className="explorer-clock"><strong>{formatUTC(current.timestamp)} <span>UTC</span></strong><span>{replay.isPlaying ? "Replaying archive" : replay.elapsed >= replay.duration ? "Replay complete" : "Replay paused"}</span></div>
            </div>
            <div className="explorer-timeline"><AltitudeStrip points={points} timestamp={current.timestamp} /><label htmlFor="explorer-timeline" className="sr-only">Archive flight timeline</label><input id="explorer-timeline" type="range" min={0} max={replay.duration || 1} step={1000} value={replay.elapsed} onPointerDown={() => { if (replay.isPlaying) replay.toggle(); }} onChange={(event) => replay.seek(Number(event.target.value))} aria-valuetext={`${formatUTC(current.timestamp)} UTC`} /><div><span>{formatUTC(points[0].timestamp)}</span><span>Altitude profile · {formatDuration(replay.duration)}</span><span>{formatUTC(points[points.length - 1].timestamp)}</span></div></div>
            {replay.isGap && <p className="explorer-gap" role="status">Reception gap: no new observations here. The marker holds the last received position.</p>}
          </section>

          <div className="explorer-workspace">
            <aside className="explorer-readings" aria-label="Current archived tracker readings">
              <div className="explorer-callsign"><span>Tracker callsign</span><strong>{data.source.callsigns.join(", ") || "Not provided"}</strong><span>{points.length} recorded observations</span></div>
              <div className="explorer-position"><span>Current altitude</span><strong>{(current.altitude / 1000).toFixed(2)} <small>km</small></strong><p>{coord(current.latitude, "N", "S")}<br />{coord(current.longitude, "E", "W")}</p></div>
              <dl className="explorer-sensor-list">
                <div><dt>Ground speed</dt><dd>{reading(sample.speed, 0)} <span>km/h</span></dd></div>
                <div><dt>Tracker temperature</dt><dd>{reading(sample.temperature, 0)} <span>°C</span></dd></div>
                <div><dt>Tracker battery</dt><dd>{reading(sample.battery, 2)} <span>V</span></dd></div>
                <div><dt>Vertical speed</dt><dd>{reading(sample.ascent_rate)} <span>m/s</span></dd></div>
              </dl>
              <p className="explorer-sample-time">Sensor sample {formatUTC(sample.timestamp)} UTC.<br />Values hold until the next observation.</p>
            </aside>
            <div className="explorer-trajectory">
              <Suspense fallback={<div className="explorer-view-loading" role="status">Opening the trajectory viewer…</div>}><TrajectoryVisualization data={data} point={current} index={replay.index} /></Suspense>
            </div>
          </div>

          <div className="explorer-record-summary" aria-label="Recorded flight summary"><span>Partial flight recording</span><p>Peak <strong>{(peak.altitude / 1000).toFixed(2)} km</strong> at {formatUTC(peak.timestamp)} UTC</p><p>{formatUTC(points[0].timestamp)}–{formatUTC(points[points.length - 1].timestamp)} UTC</p><a href="#explorer-charts">Inspect telemetry</a></div>

          <section className="explorer-details" id="explorer-charts">
            <div className="explorer-detail-intro"><h2>The recorded profile.</h2><p>The first sample is already airborne. Blank sections preserve gaps in reception; nearby positions interpolate, while sensor readings remain the latest received values.</p><Link to="/dashboard">Open the detailed replay <ArrowUpRight size={15} /></Link></div>
            <TelemetryGraphs points={points} timestamp={current.timestamp} onSeek={replay.seek} />
          </section>
        </>}

        <section className="explorer-project" id="explorer-project">
          <figure><img src="/gallery/PXL_20250621_172905846.MP.jpg" alt="The APEX balloon train and payloads rising into a blue sky on launch day." width="659" height="880" loading="lazy" /><figcaption>The actual APEX balloon train, June 21, 2025.</figcaption></figure>
          <div><h2>A student experiment<br />above the clouds.</h2><p>SkyCell brought together four students to explore high-altitude mesh radio. The team won <strong>1st place at the APEX international research hackathon.</strong></p><dl className="explorer-mission-facts"><div><dt>SkyCell payload radio</dt><dd>915 MHz LoRa / Meshtastic</dd></div><div><dt>Mission altitude / radio link</dt><dd>≈30 km / 70 km</dd></div><div><dt>Flight software</dt><dd>Python, NMEA GPS, environmental sensors, reconnection</dd></div><div><dt>RTL-SDR sweeps</dt><dd>30 MHz–1.5 GHz at 2.4 MS/s</dd></div></dl><p className="explorer-project-note">These are SkyCell project facts. The explorer above displays the separate APEX tracker / SondeHub archive.</p><a className="explorer-project-source" href="https://github.com/knivier/SkyCell" target="_blank" rel="noreferrer">Explore the flight and ground software <ArrowUpRight size={16} /></a></div>
        </section>
        <footer className="explorer-footer"><strong>SkyCell</strong><p>Mission archive and browser replay · APEX 2025</p><a href="#explorer-top">Back to the explorer</a></footer>
      </div>
    </div>
  );
}
