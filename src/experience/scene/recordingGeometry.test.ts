import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCSVText, type ProcessedTrajectoryData, type TrajectoryPoint } from "../../utils/csvDataUtils";
import { buildRecordingGeometry, projectRecordedObservation, RECORDING_ORIGIN } from "./recordingGeometry";

function observation(timestamp: number, latitude = 60, longitude = 10, altitude = 1000): TrajectoryPoint {
  return { timestamp, datetime: new Date(timestamp).toISOString(), latitude, longitude, altitude, ascent_rate: null, speed: null, temperature: null, battery: null };
}
function recording(points: TrajectoryPoint[]): ProcessedTrajectoryData {
  return { points, center: { lat: 60, lon: 10 }, bounds: { lat: { min: 60, max: 61 }, lon: { min: 10, max: 11 }, alt: { min: 1000, max: 30000 } }, source: { rows: points.length, rejected: 0, duplicates: 0, callsigns: ["test"] } };
}

describe("recorded flight geometry", () => {
  it("uses the same kilometre scale for east, north and absolute altitude", () => {
    const center = { lat: 60, lon: 10 };
    const origin = projectRecordedObservation(observation(0, 60, 10, 0), center);
    expect(origin).toEqual([...RECORDING_ORIGIN]);
    const east = projectRecordedObservation(observation(0, 60, 11, 0), center);
    const north = projectRecordedObservation(observation(0, 61, 10, 0), center);
    const up = projectRecordedObservation(observation(0, 60, 10, 1000), center);
    expect(east[0] - origin[0]).toBeCloseTo(27.83, 8);
    expect(north[2] - origin[2]).toBeCloseTo(-55.66, 8);
    expect(up[1] - origin[1]).toBe(.5);
    expect(up[0]).toBe(origin[0]);
    expect(up[2]).toBe(origin[2]);
  });

  it("breaks both elevated and ground traces at reception gaps without dropping observations", () => {
    const data = recording([observation(0), observation(60_000, 60.01), observation(120_001, 60.02), observation(125_001, 60.03)]);
    const geometry = buildRecordingGeometry(data);
    expect(geometry.pointCount).toBe(4);
    expect(geometry.positions.length).toBe(12);
    expect(geometry.pairs).toEqual([[0, 1], [2, 3]]);
    expect(geometry.segmentPositions.length).toBe(12);
    expect(geometry.groundPositions.length).toBe(12);
    expect(geometry.gapCount).toBe(1);
    expect([geometry.groundPositions[1], geometry.groundPositions[4], geometry.groundPositions[7], geometry.groundPositions[10]]).toEqual([20, 20, 20, 20]);
    expect(geometry.segmentPositions[6]).toBe(geometry.positions[6]);
    expect(geometry.segmentPositions[8]).toBe(geometry.positions[8]);
  });

  it("keeps the real archive's 125 native selections, recorded peak and gap boundaries", () => {
    const data = parseCSVText(readFileSync(new URL("../../../public/data.csv", import.meta.url), "utf8"));
    const geometry = buildRecordingGeometry(data);
    expect(geometry.pointCount).toBe(125);
    expect(geometry.bounds.max[1]).toBeCloseTo(20 + 29.51 / 2, 8);
    const final = projectRecordedObservation(data.points[124], data.center);
    for (let axis = 0; axis < 3; axis++) expect(geometry.positions[124 * 3 + axis]).toBeCloseTo(final[axis], 5);
    const connected = new Set(geometry.pairs.map(pair => pair[1]));
    for (let index = 1; index < data.points.length; index++) {
      const elapsed = data.points[index].timestamp - data.points[index - 1].timestamp;
      if (elapsed > 60_000) expect(connected.has(index)).toBe(false);
    }
    expect(geometry.pairs.length + geometry.gapCount).toBe(124);
    expect(geometry.gapCount).toBeGreaterThan(0);
    expect(geometry.positions.length).toBe(375);
  });

  it("does not connect duplicate/reversed timestamps and represents an empty archive without infinities", () => {
    const geometry = buildRecordingGeometry(recording([observation(2000), observation(2000), observation(1000)]));
    expect(geometry.pairs).toEqual([]);
    expect(geometry.pointCount).toBe(3);
    const empty = buildRecordingGeometry(recording([]));
    expect(empty.positions.length).toBe(0);
    expect(empty.bounds.min).toEqual([...RECORDING_ORIGIN]);
    expect(empty.bounds.max).toEqual([...RECORDING_ORIGIN]);
  });
});
