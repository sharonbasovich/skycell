import type { ProcessedTrajectoryData, TrajectoryPoint } from "../../utils/csvDataUtils";

export const RECORDING_ORIGIN = [0, 20, -25] as const;
export const RECORDING_CAMERA_TARGET = [0, 27.5, -25] as const;
export const RECORDING_KM_SCALE = .5;
export const RECORDING_GAP_MS = 60_000;

export interface RecordingGeometryData {
  /** One XYZ position per actual observation, preserving its native index. */
  positions: Float32Array;
  /** Six coordinates per connected pair. No pair spans a reception gap. */
  segmentPositions: Float32Array;
  groundPositions: Float32Array;
  pairs: [number, number][];
  /** Every chronologically adjacent pair, including explicitly estimated gaps. */
  completeSegmentPositions: Float32Array;
  completeGroundPositions: Float32Array;
  completePairs: [number, number][];
  /** Linear joins across reception gaps; never represented as measurements. */
  estimatedSegmentPositions: Float32Array;
  estimatedPairs: [number, number][];
  gapCount: number;
  pointCount: number;
  bounds: { min: [number, number, number]; max: [number, number, number] };
}

/**
 * A local ENU presentation of the partial recording. All three axes share the
 * same .5 scene units/km; altitude is absolute, not relative to the first fix.
 * The explanatory replay preserves every received fix. Complete joins between
 * them are estimates; positions outside the recorded interval are not inferred.
 */
export function projectRecordedObservation(point: Pick<TrajectoryPoint, "latitude" | "longitude" | "altitude">, center: ProcessedTrajectoryData["center"]): [number, number, number] {
  const eastKm = (point.longitude - center.lon) * Math.cos(center.lat * Math.PI / 180) * 111.32;
  const northKm = (point.latitude - center.lat) * 111.32;
  return [
    RECORDING_ORIGIN[0] + eastKm * RECORDING_KM_SCALE,
    RECORDING_ORIGIN[1] + point.altitude / 1000 * RECORDING_KM_SCALE,
    RECORDING_ORIGIN[2] - northKm * RECORDING_KM_SCALE,
  ];
}

export function buildRecordingGeometry(data: ProcessedTrajectoryData): RecordingGeometryData {
  const positions = new Float32Array(data.points.length * 3);
  const segments: number[] = [], ground: number[] = [];
  const complete: number[] = [], completeGround: number[] = [], estimated: number[] = [];
  const pairs: [number, number][] = [];
  const completePairs: [number, number][] = [], estimatedPairs: [number, number][] = [];
  const minimum: [number, number, number] = [Infinity, Infinity, Infinity];
  const maximum: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  let gapCount = 0;
  for (let index = 0; index < data.points.length; index++) {
    const point = data.points[index];
    const coordinates = projectRecordedObservation(point, data.center);
    positions.set(coordinates, index * 3);
    for (let axis = 0; axis < 3; axis++) {
      minimum[axis] = Math.min(minimum[axis], coordinates[axis]);
      maximum[axis] = Math.max(maximum[axis], coordinates[axis]);
    }
    if (index === 0) continue;
    const delta = point.timestamp - data.points[index - 1].timestamp;
    const previous = index * 3 - 3;
    if (!Number.isFinite(delta) || delta <= 0) { gapCount++; continue; }
    complete.push(positions[previous], positions[previous + 1], positions[previous + 2], ...coordinates);
    completeGround.push(positions[previous], RECORDING_ORIGIN[1], positions[previous + 2], coordinates[0], RECORDING_ORIGIN[1], coordinates[2]);
    completePairs.push([index - 1, index]);
    if (delta > RECORDING_GAP_MS) {
      gapCount++;
      estimated.push(positions[previous], positions[previous + 1], positions[previous + 2], ...coordinates);
      estimatedPairs.push([index - 1, index]);
      continue;
    }
    segments.push(positions[previous], positions[previous + 1], positions[previous + 2], ...coordinates);
    ground.push(positions[previous], RECORDING_ORIGIN[1], positions[previous + 2], coordinates[0], RECORDING_ORIGIN[1], coordinates[2]);
    pairs.push([index - 1, index]);
  }
  if (!data.points.length) {
    for (let axis = 0; axis < 3; axis++) minimum[axis] = maximum[axis] = RECORDING_ORIGIN[axis];
  }
  return {
    positions, segmentPositions: new Float32Array(segments), groundPositions: new Float32Array(ground),
    completeSegmentPositions: new Float32Array(complete), completeGroundPositions: new Float32Array(completeGround),
    estimatedSegmentPositions: new Float32Array(estimated), completePairs, estimatedPairs,
    pairs, gapCount, pointCount: data.points.length, bounds: { min: minimum, max: maximum },
  };
}
