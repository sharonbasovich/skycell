import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { sampleCinematicCamera, type CinematicCameraSample } from "./cinematicCamera";

const TRAVEL = [[0.06, 0.28], [0.43, 0.60], [0.77, 0.94]] as const;
const HOLDS = [[-1, 0, 0.03, 0.06], [0.28, 0.35, 0.43], [0.60, 0.68, 0.77], [0.94, 0.97, 1, 2]];
const ALTITUDES = [18, 22, 27, 30];
const EXPECTED = [
  {
    narrow: false,
    positions: [[5.2, 22.3, 7], [1, 0.55, 1.75], [5, 4, 14], [16, 16, 43]],
    targets: [[0, 21.7, 0], [-0.15, 0.03, 0], [0, 4, 0], [0, 11.5, 0]],
    fovs: [30, 34, 36, 35],
  },
  {
    narrow: true,
    positions: [[3, 22.1, 5], [0.68, 0.4, 1.2], [4, 4, 13], [14, 16, 45]],
    targets: [[0, 21.9, 0], [-0.2, 0.03, 0], [0, 4, 0], [0, 11.5, 0]],
    fovs: [36, 38, 44, 42],
  },
];

function snapshot(progress: number, narrow: boolean) {
  const position = new Vector3();
  const target = new Vector3();
  const state = sampleCinematicCamera(progress, narrow, position, target);
  return { position, target, ...state };
}

// Recover the scroll parameter for a desired fraction of eased travel. This
// checks spatial speed independently of the expected cinematic easing speed.
function progressAtTravelFraction(start: number, end: number, fraction: number): number {
  let low = 0;
  let high = 1;
  for (let i = 0; i < 45; i++) {
    const mid = (low + high) / 2;
    const eased = mid ** 3 * (mid * (mid * 6 - 15) + 10);
    if (eased < fraction) low = mid;
    else high = mid;
  }
  return start + (end - start) * (low + high) / 2;
}

describe.each(EXPECTED)("cinematic camera (narrow=$narrow)", ({ narrow, positions, targets, fovs }) => {
  it("holds the authored photographs exactly throughout their reading ranges", () => {
    for (let shot = 0; shot < HOLDS.length; shot++) {
      for (const progress of HOLDS[shot]) {
        const sample = snapshot(progress, narrow);
        expect(sample.position.toArray()).toEqual(positions[shot]);
        expect(sample.target.toArray()).toEqual(targets[shot]);
        expect(sample.fov).toBe(fovs[shot]);
        expect(sample.altitudeKm).toBe(ALTITUDES[shot]);
        expect(sample.shot).toBe(shot);
      }
    }
  });

  it("stays continuous at every hold/travel join, including the lens and altitude", () => {
    for (const boundary of TRAVEL.flat()) {
      const before = snapshot(boundary - 0.000001, narrow);
      const after = snapshot(boundary + 0.000001, narrow);
      expect(before.position.distanceTo(after.position)).toBeLessThan(0.0000001);
      expect(before.target.distanceTo(after.target)).toBeLessThan(0.0000001);
      expect(Math.abs(before.fov - after.fov)).toBeLessThan(0.0000001);
      expect(Math.abs(before.altitudeKm - after.altitudeKm)).toBeLessThan(0.0000001);
    }
  });

  it("arrives and departs with cubic-order displacement, giving zero endpoint velocity and acceleration", () => {
    for (const [start, end] of TRAVEL) {
      for (const [boundary, direction] of [[start, 1], [end, -1]]) {
        const endpoint = snapshot(boundary, narrow).position;
        const fine = endpoint.distanceTo(snapshot(boundary + direction * 0.0001, narrow).position);
        const coarse = endpoint.distanceTo(snapshot(boundary + direction * 0.0002, narrow).position);
        // Linear motion gives .5; cubic smoothstep gives .25. A C2 quintic
        // departure gives approximately .125 at half the parameter distance.
        expect(fine / coarse).toBeCloseTo(0.125, 2);
      }
    }
  });

  it("travels approximately equal distances for equal eased-distance fractions along each curved path", () => {
    for (const [start, end] of TRAVEL) {
      const distances: number[] = [];
      let previous = snapshot(start, narrow).position;
      for (let i = 1; i <= 20; i++) {
        const progress = progressAtTravelFraction(start, end, i / 20);
        const position = snapshot(progress, narrow).position;
        distances.push(previous.distanceTo(position));
        previous = position;
      }
      expect(Math.max(...distances) / Math.min(...distances)).toBeLessThan(1.03);
    }
  });

  it("keeps every sampled view finite, clear of its target, and at a moderate pitch", () => {
    const position = new Vector3();
    const target = new Vector3();
    const state: CinematicCameraSample = { fov: 0, altitudeKm: 0, shot: 0 };
    let previousAltitude = -Infinity;
    for (let i = 0; i <= 2000; i++) {
      sampleCinematicCamera(i / 2000, narrow, position, target, state);
      expect([...position.toArray(), ...target.toArray(), state.fov, state.altitudeKm].every(Number.isFinite)).toBe(true);
      const distance = position.distanceTo(target);
      expect(distance).toBeGreaterThan(1);
      expect(Math.abs(position.y - target.y) / distance).toBeLessThan(Math.sin(25 * Math.PI / 180));
      expect(position.z).toBeGreaterThanOrEqual(1.2);
      expect(state.fov).toBeGreaterThanOrEqual(30);
      expect(state.fov).toBeLessThanOrEqual(44);
      expect(state.altitudeKm).toBeGreaterThanOrEqual(previousAltitude - 0.0000001);
      previousAltitude = state.altitudeKm;
    }
  });

  it("retraces identical poses when reversing scroll after arbitrary intermediate samples", () => {
    const forward = Array.from({ length: 501 }, (_, index) => snapshot(index / 500, narrow));
    for (let i = forward.length - 1; i >= 0; i--) {
      // Interleave another responsive rig and unrelated progress to detect
      // hidden cursor state, shared mutable outputs, or path-cache mutation.
      snapshot((i * 0.379) % 1, !narrow);
      const reverse = snapshot(i / 500, narrow);
      expect(reverse.position.toArray()).toEqual(forward[i].position.toArray());
      expect(reverse.target.toArray()).toEqual(forward[i].target.toArray());
      expect(reverse.fov).toBe(forward[i].fov);
      expect(reverse.altitudeKm).toBe(forward[i].altitudeKm);
    }
  });
});

it("supports reused result storage and safely clamps exceptional scroll values", () => {
  const position = new Vector3();
  const target = new Vector3();
  const state: CinematicCameraSample = { fov: 0, altitudeKm: 0, shot: -1 };
  expect(sampleCinematicCamera(NaN, false, position, target, state)).toBe(state);
  expect(state.shot).toBe(0);
  sampleCinematicCamera(Infinity, false, position, target, state);
  expect(state.shot).toBe(3);
  sampleCinematicCamera(-Infinity, false, position, target, state);
  expect(state.shot).toBe(0);
});
