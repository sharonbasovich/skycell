import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCSVText, type ProcessedTrajectoryData, type TrajectoryPoint } from "../../utils/csvDataUtils";
import { buildRecordingGeometry, projectRecordedObservation, RECORDING_ORIGIN } from "./recordingGeometry";
import { createRecordingPlaybackSample, sampleRecordingPlayback } from "./recordingPlayback";
import { createRecordingReadout, readRecordingAt, recordingPhase, RECORDING_SCROLL_END, RECORDING_SCROLL_START } from "./recordingReadout";

const actual = parseCSVText(readFileSync(new URL("../../../public/data.csv", import.meta.url), "utf8"));
function point(timestamp: number, latitude: number, longitude: number, altitude: number): TrajectoryPoint {
  return { timestamp, latitude, longitude, altitude, datetime: new Date(timestamp).toISOString(), ascent_rate: null, speed: null, temperature: null, battery: null };
}
function recording(points: TrajectoryPoint[]): ProcessedTrajectoryData {
  return { ...actual, points, center: { lat: 40, lon: -70 } };
}

describe("scroll-driven estimated recording", () => {
  it("uses scroll to traverse the recorded time interval and clamps its ends", () => {
    expect(recordingPhase(RECORDING_SCROLL_START)).toBe(0);
    expect(recordingPhase(RECORDING_SCROLL_END)).toBe(1);
    expect(recordingPhase((RECORDING_SCROLL_START + RECORDING_SCROLL_END) / 2)).toBeCloseTo(.5, 10);
    expect(recordingPhase(0)).toBe(0);
    expect(recordingPhase(1)).toBe(1);
    const sample = createRecordingPlaybackSample();
    sampleRecordingPlayback(actual, -4, sample);
    expect(sample.timestamp).toBe(actual.points[0].timestamp);
    expect(sample.position.toArray()).toEqual(projectRecordedObservation(actual.points[0], actual.center));
    sampleRecordingPlayback(actual, 8, sample);
    expect(sample.timestamp).toBe(actual.points[124].timestamp);
    expect(sample.position.toArray()).toEqual(projectRecordedObservation(actual.points[124], actual.center));
    expect(sample.estimated).toBe(false);
  });

  it("linearly fills a long internal gap and labels it without mutating or inventing recorded rows", () => {
    const data = recording([point(0, 40, -70, 1000), point(30_000, 40.01, -70.01, 2000), point(150_000, 40.03, -70.03, 6000)]);
    const original = JSON.stringify(data.points), sample = createRecordingPlaybackSample();
    sampleRecordingPlayback(data, .6, sample); // 90s: halfway through the 120s gap.
    const expected = projectRecordedObservation(point(90_000, 40.02, -70.02, 4000), data.center);
    expect(sample.timestamp).toBe(90_000);
    expect(sample.altitude).toBe(4000);
    for (let axis = 0; axis < 3; axis++) expect(sample.position.getComponent(axis)).toBeCloseTo(expected[axis], 10);
    expect(sample.estimated).toBe(true);
    expect(sample.interpolated).toBe(true);
    expect(sample.segmentIndex).toBe(1);
    expect(sample.segmentRatio).toBe(.5);
    expect(sample.tangent.length()).toBeCloseTo(1, 10);
    sampleRecordingPlayback(data, .2, sample); // Exactly the received observation.
    expect(sample.estimated).toBe(false);
    expect(sample.interpolated).toBe(false);
    expect(sample.observationIndex).toBe(1);
    expect(JSON.stringify(data.points)).toBe(original);
  });

  it("passes through every real fix, preserving native altitude and the recorded peak", () => {
    const sample = createRecordingPlaybackSample(), readout = createRecordingReadout();
    const first = actual.points[0].timestamp, duration = actual.points[124].timestamp - first;
    for (let index = 0; index < actual.points.length; index++) {
      const native = actual.points[index], phase = (native.timestamp - first) / duration;
      sampleRecordingPlayback(actual, phase, sample);
      readRecordingAt(actual, phase, readout);
      const expected = projectRecordedObservation(native, actual.center);
      for (let axis = 0; axis < 3; axis++) expect(sample.position.getComponent(axis)).toBeCloseTo(expected[axis], 8);
      expect(sample.altitude).toBeCloseTo(native.altitude, 6);
      expect(sample.estimated).toBe(false);
      expect(sample.observationIndex).toBe(index);
      expect(readout.timestamp).toBe(sample.timestamp);
      expect(readout.altitude).toBe(sample.altitude);
    }
    const peak = actual.points.reduce((best, item) => item.altitude > best.altitude ? item : best);
    expect(readRecordingAt(actual, (peak.timestamp - first) / duration).altitude).toBe(29_510);
  });

  it("is reversible and bounded while reusing vectors, with no overshoot across estimated joins", () => {
    const geometry = buildRecordingGeometry(actual), sample = createRecordingPlaybackSample();
    const position = sample.position, tangent = sample.tangent;
    for (let index = 0; index <= 800; index++) {
      sampleRecordingPlayback(actual, index / 800, sample);
      for (let axis = 0; axis < 3; axis++) {
        expect(sample.position.getComponent(axis)).toBeGreaterThanOrEqual(geometry.bounds.min[axis] - 1e-8);
        expect(sample.position.getComponent(axis)).toBeLessThanOrEqual(geometry.bounds.max[axis] + 1e-8);
      }
    }
    sampleRecordingPlayback(actual, .43, sample);
    const expected = sample.position.toArray(), timestamp = sample.timestamp;
    sampleRecordingPlayback(actual, .9, sample);
    sampleRecordingPlayback(actual, .43, sample);
    expect(sample.position).toBe(position);
    expect(sample.tangent).toBe(tangent);
    expect(sample.position.toArray()).toEqual(expected);
    expect(sample.timestamp).toBe(timestamp);
  });

  it("handles an empty or single-fix recording without NaNs or fictitious movement", () => {
    const sample = createRecordingPlaybackSample();
    sampleRecordingPlayback(recording([]), .5, sample);
    expect(sample.position.toArray()).toEqual([...RECORDING_ORIGIN]);
    expect(sample.timestamp).toBe(0);
    const single = recording([point(5000, 40, -70, 1000)]);
    sampleRecordingPlayback(single, 1, sample);
    expect(sample.timestamp).toBe(5000);
    expect(sample.altitude).toBe(1000);
    expect(sample.estimated).toBe(false);
    expect(sample.tangent.length()).toBe(1);
    expect(sample.position.toArray()).toEqual(projectRecordedObservation(single.points[0], single.center));
  });
});
