import type { ProcessedTrajectoryData } from "@/utils/csvDataUtils";

/** The same observations remain available without a GPU or animated camera. */
export default function StaticRecording({ data, selected }: { data: ProcessedTrajectoryData; selected: number }) {
  const points = data.points, start = points[0].timestamp, duration = points[points.length - 1].timestamp - start || 1;
  const x = (time: number) => 18 + (time - start) / duration * 664, y = (alt: number) => 204 - alt / 32000 * 188;
  const segments: string[] = [];
  let current = "";
  points.forEach((point, index) => {
    if (index && point.timestamp - points[index - 1].timestamp > 60000) { segments.push(current); current = ""; }
    current += `${x(point.timestamp)},${y(point.altitude)} `;
  });
  if (current) segments.push(current);
  const point = points[Math.min(selected, points.length - 1)];
  return <svg className="story-static-recording" viewBox="0 0 700 220" role="img" aria-label="Altitude in the partial APEX-2-T recording. Reception gaps remain unconnected.">
    <line x1="18" y1="204" x2="682" y2="204" stroke="#ffffff35" />
    {segments.map((segment, index) => <polyline key={index} points={segment} fill="none" stroke="#a0eaff" strokeWidth="2" />)}
    <circle cx={x(point.timestamp)} cy={y(point.altitude)} r="5" fill="#fff" />
  </svg>;
}
