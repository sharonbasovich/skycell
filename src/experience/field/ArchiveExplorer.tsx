import { useEffect, useMemo, useState, type PointerEvent } from "react";
import { formatDuration, formatUTC, splitTrajectory, type ProcessedTrajectoryData } from "@/utils/csvDataUtils";

export default function ArchiveExplorer({ data }: { data: ProcessedTrajectoryData }) {
  const [selected, setSelected] = useState(0);
  const [compact, setCompact] = useState(() => window.matchMedia("(max-width: 700px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const changed = () => setCompact(query.matches);
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);
  const points = data.points;
  const start = points[0].timestamp;
  const end = points[points.length - 1].timestamp;
  const duration = end - start || 1;
  const current = points[Math.min(selected, points.length - 1)];
  const viewWidth = compact ? 680 : 1120;
  const viewHeight = compact ? 340 : 276;
  const plotLeft = compact ? 70 : 52;
  const plotRight = compact ? 660 : 1060;
  const plotBottom = compact ? 270 : 220;
  const plotHeight = compact ? 230 : 184;
  const x = (timestamp: number) => plotLeft + ((timestamp - start) / duration) * (plotRight - plotLeft);
  const y = (altitude: number) => plotBottom - (altitude / 32000) * plotHeight;
  const profile = useMemo(() => {
    const segments = splitTrajectory(points).map(segment => segment.map(point => `${(plotLeft + ((point.timestamp - start) / duration) * (plotRight - plotLeft)).toFixed(2)},${(plotBottom - (point.altitude / 32000) * plotHeight).toFixed(2)}`).join(" "));
    const gaps = points.flatMap((point, index) => index > 0 && point.timestamp - points[index - 1].timestamp > 60000 ? [{ from: points[index - 1].timestamp, to: point.timestamp }] : []);
    return { segments, gaps };
  }, [points, start, duration, plotLeft, plotRight, plotBottom, plotHeight]);
  const inspectAt = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const plotX = (event.clientX - rect.left) / rect.width * viewWidth;
    const timestamp = start + Math.min(1, Math.max(0, (plotX - plotLeft) / (plotRight - plotLeft))) * duration;
    let low = 0, high = points.length - 1;
    while (low < high) { const middle = Math.floor((low + high) / 2); if (points[middle].timestamp < timestamp) low = middle + 1; else high = middle; }
    const nearest = low > 0 && timestamp - points[low - 1].timestamp < points[low].timestamp - timestamp ? low - 1 : low;
    setSelected(nearest);
  };
  const previous = points[selected - 1];
  const receivedAfterGap = previous && current.timestamp - previous.timestamp > 60000;
  return <div className="field-archive-explorer" data-observation-index={selected}>
    <div className="field-archive-reading" aria-live="off">
      <div><span>Observation {selected + 1} of {points.length}</span><time dateTime={current.datetime}>{formatUTC(current.timestamp)} <small>UTC</small></time></div>
      <div className="field-current-altitude"><span>Recorded altitude</span><p>{(current.altitude / 1000).toFixed(2)} <small>km</small></p></div>
    </div>
    <figure className="field-profile">
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} role="img" aria-labelledby="field-profile-title field-profile-description" onPointerDown={inspectAt} onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons === 1) inspectAt(event); }}>
        <title id="field-profile-title">Altitude in the partial APEX tracker archive</title>
        <desc id="field-profile-description">The recording has {points.length} observations between {formatUTC(start)} and {formatUTC(end)} UTC. Its recorded peak is {(data.bounds.alt.max / 1000).toFixed(2)} kilometres. Shaded breaks preserve reception gaps longer than sixty seconds. Use the observation slider to inspect the recorded points with a keyboard.</desc>
        {profile.gaps.map(gap => <rect key={gap.from} x={x(gap.from)} y="24" width={Math.max(1, x(gap.to) - x(gap.from))} height={plotBottom - 24} className="field-profile-gap" />)}
        {[0, 15000, 30000].map(altitude => <g key={altitude}><line x1={plotLeft} y1={y(altitude)} x2={plotRight} y2={y(altitude)} className="field-profile-grid" /><text x={plotLeft - 12} y={y(altitude) + 4} textAnchor="end" className="field-profile-label">{altitude / 1000} km</text></g>)}
        {profile.segments.map((segment, index) => <polyline key={index} points={segment} className="field-profile-line" vectorEffect="non-scaling-stroke" />)}
        <line x1={x(current.timestamp)} y1="24" x2={x(current.timestamp)} y2={plotBottom} className="field-profile-cursor" vectorEffect="non-scaling-stroke" />
        <circle cx={x(current.timestamp)} cy={y(current.altitude)} r="6" className="field-profile-point" />
        <text x={plotLeft} y={viewHeight - 13} className="field-profile-label">{formatUTC(start)} UTC</text><text x={plotRight} y={viewHeight - 13} textAnchor="end" className="field-profile-label">{formatUTC(end)} UTC</text>
      </svg>
      <figcaption><span><i aria-hidden="true" /> Recorded observations</span><span><i className="field-gap-key" aria-hidden="true" /> Reception gaps</span></figcaption>
    </figure>
    <div className="field-archive-scrub">
      <label htmlFor="field-observation">Inspect a recorded observation</label>
      <input id="field-observation" type="range" min="0" max={points.length - 1} step="1" value={selected} onChange={event => setSelected(Number(event.target.value))} aria-valuetext={`Observation ${selected + 1} of ${points.length}, ${formatUTC(current.timestamp)} UTC, ${(current.altitude / 1000).toFixed(2)} kilometres`} aria-describedby="field-observation-help" />
      <p id="field-observation-help">Drag the slider, use the arrow keys, or move across the chart. Each position selects an actual observation.</p>
      <p className="field-reception-note" role="status">{receivedAfterGap ? `This observation follows a ${formatDuration(current.timestamp - previous.timestamp)} reception gap.` : "Blank and shaded intervals preserve gaps in reception. No readings are filled in."}</p>
    </div>
  </div>;
}
