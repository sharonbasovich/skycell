import { Vector3 } from "three";
import type { ProcessedTrajectoryData } from "../../utils/csvDataUtils";
import { projectRecordedObservation, RECORDING_ORIGIN } from "./recordingGeometry";
import { createRecordingReadout, readRecordingAt, type RecordingReadoutSample } from "./recordingReadout";
export { recordingPhase, RECORDING_SCROLL_START, RECORDING_SCROLL_END } from "./recordingReadout";

export interface RecordingPlaybackSample extends RecordingReadoutSample {
  position: Vector3;
  /** Unit direction along the current linear join, in the same world axes. */
  tangent: Vector3;
}

type PlaybackCache = { positions: Float64Array };
const caches = new WeakMap<ProcessedTrajectoryData, PlaybackCache>();

function cachedRecording(data: ProcessedTrajectoryData): PlaybackCache {
  let cache = caches.get(data);
  if (!cache) {
    cache = { positions: new Float64Array(data.points.length * 3) };
    data.points.forEach((point, index) => {
      cache!.positions.set(projectRecordedObservation(point, data.center), index * 3);
    });
    caches.set(data, cache);
  }
  return cache;
}

export function createRecordingPlaybackSample(): RecordingPlaybackSample {
  return { ...createRecordingReadout(), position: new Vector3(...RECORDING_ORIGIN), tangent: new Vector3(0, 1, 0) };
}

/**
 * Allocation-free after the archive's first projection. Time-linear position
 * estimates fill internal reception gaps without adding fake source rows or
 * extrapolating launch/landing. A matching actual timestamp remains measured.
 */
export function sampleRecordingPlayback(data: ProcessedTrajectoryData, phase: number, out: RecordingPlaybackSample): RecordingPlaybackSample {
  readRecordingAt(data, phase, out);
  const cache = cachedRecording(data), count = data.points.length;
  if (!count) {
    out.position.set(...RECORDING_ORIGIN); out.tangent.set(0, 1, 0);
    return out;
  }
  const from = out.segmentIndex, to = Math.min(from + 1, count - 1), ratio = out.segmentRatio;
  const a = from * 3, b = to * 3;
  out.position.set(
    cache.positions[a] + (cache.positions[b] - cache.positions[a]) * ratio,
    cache.positions[a + 1] + (cache.positions[b + 1] - cache.positions[a + 1]) * ratio,
    cache.positions[a + 2] + (cache.positions[b + 2] - cache.positions[a + 2]) * ratio,
  );
  // At the last observation preserve the final segment's direction so the
  // vehicle does not snap upright merely because scroll reaches the end.
  const tangentFrom = from === count - 1 ? Math.max(0, from - 1) : from;
  const tangentTo = Math.min(tangentFrom + 1, count - 1);
  out.tangent.set(
    cache.positions[tangentTo * 3] - cache.positions[tangentFrom * 3],
    cache.positions[tangentTo * 3 + 1] - cache.positions[tangentFrom * 3 + 1],
    cache.positions[tangentTo * 3 + 2] - cache.positions[tangentFrom * 3 + 2],
  );
  if (out.tangent.lengthSq() > 1e-12) out.tangent.normalize();
  else out.tangent.set(0, 1, 0);
  return out;
}
