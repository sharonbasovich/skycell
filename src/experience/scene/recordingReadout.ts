import type { ProcessedTrajectoryData } from "../../utils/csvDataUtils";

export const RECORDING_SCROLL_START = .815;
export const RECORDING_SCROLL_END = .95;
const RECEPTION_GAP_MS = 60_000;

export interface RecordingReadoutSample {
  timestamp: number;
  altitude: number;
  /** True only between fixes on opposite sides of a long reception gap. */
  estimated: boolean;
  interpolated: boolean;
  observationIndex: number;
  segmentIndex: number;
  segmentRatio: number;
  phase: number;
}

export function recordingPhase(scrollProgress: number): number {
  if (!Number.isFinite(scrollProgress)) return 0;
  return Math.max(0, Math.min(1, (scrollProgress - RECORDING_SCROLL_START) / (RECORDING_SCROLL_END - RECORDING_SCROLL_START)));
}

export function createRecordingReadout(): RecordingReadoutSample {
  return { timestamp: 0, altitude: 0, estimated: false, interpolated: false, observationIndex: 0, segmentIndex: 0, segmentRatio: 0, phase: 0 };
}

/** Pure time interpolation shared by HTML and the lazy-loaded Three scene. */
export function readRecordingAt(data: ProcessedTrajectoryData, phase: number, out: RecordingReadoutSample = createRecordingReadout()): RecordingReadoutSample {
  const normalized = Number.isFinite(phase) ? Math.max(0, Math.min(1, phase)) : 0;
  const points = data.points, count = points.length;
  out.phase = normalized;
  out.estimated = out.interpolated = false;
  out.observationIndex = out.segmentIndex = 0;
  out.segmentRatio = 0;
  if (!count) { out.timestamp = out.altitude = 0; return out; }
  const timestamp = points[0].timestamp + (points[count - 1].timestamp - points[0].timestamp) * normalized;
  let low = 0, high = count - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (points[middle].timestamp <= timestamp) low = middle;
    else high = middle - 1;
  }
  const from = low, to = Math.min(from + 1, count - 1);
  const duration = points[to].timestamp - points[from].timestamp;
  const ratio = duration > 0 ? (timestamp - points[from].timestamp) / duration : 0;
  out.timestamp = timestamp;
  out.altitude = points[from].altitude + (points[to].altitude - points[from].altitude) * ratio;
  out.interpolated = ratio > 1e-9 && ratio < 1 - 1e-9;
  out.estimated = duration > RECEPTION_GAP_MS && out.interpolated;
  out.observationIndex = ratio < .5 ? from : to;
  out.segmentIndex = from;
  out.segmentRatio = ratio;
  return out;
}
