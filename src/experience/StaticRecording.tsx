import type { ProcessedTrajectoryData } from "@/utils/csvDataUtils";

/** Recorded fixes plus marked internal-gap estimates remain available without a GPU. */
export default function StaticRecording({ data, selected }: { data: ProcessedTrajectoryData; selected: number }) {
  const points = data.points, start = points[0].timestamp, duration = points[points.length - 1].timestamp - start || 1;
  const x = (time: number) => 18 + (time - start) / duration * 664, y = (alt: number) => 204 - alt / 32000 * 188;
  const measured: string[] = [], estimated: string[] = [];
  points.forEach((point, index) => {
    if (!index) return;
    const previous = points[index - 1];
    const segment = `${x(previous.timestamp)},${y(previous.altitude)} ${x(point.timestamp)},${y(point.altitude)}`;
    (point.timestamp - previous.timestamp > 60000 ? estimated : measured).push(segment);
  });
  const point = points[Math.min(selected, points.length - 1)];
  return <svg className="story-static-recording" viewBox="0 0 700 220" role="img" aria-label="Altitude in the available APEX-2-T recording. Amber lines estimate missing positions between recorded fixes; the recording ends at 19:17:21 UTC.">
    <line x1="18" y1="204" x2="682" y2="204" stroke="#ffffff35" />
    {measured.map((segment, index) => <polyline key={index} points={segment} fill="none" stroke="#a0eaff" strokeWidth="2" />)}
    {estimated.map((segment, index) => <polyline key={index} points={segment} fill="none" stroke="#efbd75" strokeWidth="2" />)}
    <circle cx={x(point.timestamp)} cy={y(point.altitude)} r="5" fill="#fff" />
  </svg>;
}
