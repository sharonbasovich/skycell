import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { sampleCinematicCamera, type CinematicCameraSample } from "./cinematicCamera";

const TRAVEL = [[.06, .29], [.40, .62], [.75, .96]] as const;
const HOLDS = [[0, .06], [.29, .40], [.62, .75], [.96, 1]] as const;
const TARGET = [0, 2.05, 0];

function snapshot(progress: number, narrow: boolean) {
  const position = new Vector3();
  const target = new Vector3();
  return { position, target, ...sampleCinematicCamera(progress, narrow, position, target) };
}

// Independent envelope/payload silhouette samples in physical local metres,
// expanded for the bounded wind/pendulum excursion. These check the complete
// moving vehicle, not just whether its look-at point is visible.
function vehicleSilhouette(): Vector3[] {
  const points: Vector3[] = [];
  for (let latitude = 0; latitude <= 12; latitude++) {
    const phi = Math.PI * latitude / 12;
    for (let longitude = 0; longitude < 24; longitude++) {
      const theta = 2 * Math.PI * longitude / 24;
      for (const dx of [-.095, .095]) for (const dy of [-.02, .02]) for (const dz of [-.05, .05]) {
        points.push(new Vector3(.86 * Math.sin(phi) * Math.cos(theta) + dx, 4.1 + .86 * Math.cos(phi) + dy, .86 * Math.sin(phi) * Math.sin(theta) + dz));
      }
    }
  }
  for (const x of [-.83, .39]) for (const y of [-.17, .26]) for (const z of [-.20, .20]) points.push(new Vector3(x, y, z));
  return points;
}

describe.each([false, true])("following camera (narrow=%s)", (narrow) => {
  it("keeps one target and rises monotonically from cloud tops to the stratosphere", () => {
    let previousAltitude = -Infinity;
    for (let i = 0; i <= 1000; i++) {
      const sample = snapshot(i / 1000, narrow);
      expect([...sample.position.toArray(), ...sample.target.toArray(), sample.fov, sample.altitudeKm, sample.screenX, sample.screenY].every(Number.isFinite)).toBe(true);
      expect(sample.target.toArray()).toEqual(TARGET);
      expect(sample.altitudeKm).toBeGreaterThanOrEqual(previousAltitude - 1e-10);
      expect(sample.altitudeKm).toBeGreaterThanOrEqual(8);
      expect(sample.altitudeKm).toBeLessThanOrEqual(30);
      previousAltitude = sample.altitudeKm;
    }
    expect([0, 1 / 3, 2 / 3, 1].map((p) => snapshot(p, narrow).altitudeKm)).toEqual([8, 14, 23, 30]);
  });

  it("follows at a modest distance without a vertical inventory tour or macro dive", () => {
    let distanceTravelled = 0;
    let previous = snapshot(0, narrow).position;
    for (let i = 0; i <= 1000; i++) {
      const sample = snapshot(i / 1000, narrow);
      const distance = sample.position.distanceTo(sample.target);
      expect(distance).toBeGreaterThan(13);
      expect(distance).toBeLessThan(18);
      expect(sample.position.y).toBeGreaterThanOrEqual(2.79);
      expect(sample.position.y).toBeLessThanOrEqual(3.61);
      expect(sample.fov).toBeGreaterThanOrEqual((narrow ? 38 : 30) - 1e-10);
      expect(sample.fov).toBeLessThanOrEqual((narrow ? 40 : 32) + 1e-10);
      distanceTravelled += previous.distanceTo(sample.position);
      previous = sample.position;
    }
    expect(distanceTravelled).toBeLessThan(narrow ? 2 : 5.1);
  });

  it("keeps the complete balloon and antenna-bearing payload inside the responsive projection", () => {
    const viewports = narrow ? [[390, 844], [375, 667]] : [[1440, 900], [1272, 716]];
    const silhouette = vehicleSilhouette();
    const projected = new Vector3();
    let largestAbsoluteX = 0;
    let largestAbsoluteY = 0;
    let smallestHeight = Infinity;
    let smallestDepth = Infinity;
    let largestDepth = -Infinity;
    for (const [width, height] of viewports) {
      const camera = new PerspectiveCamera(30, width / height, .035, 160);
      for (let i = 0; i <= 120; i++) {
        const sample = snapshot(i / 120, narrow);
        camera.position.copy(sample.position);
        camera.lookAt(sample.target);
        camera.fov = sample.fov;
        camera.setViewOffset(width, height, -(sample.screenX - .5) * width, -(sample.screenY - .5) * height, width, height);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        projected.copy(sample.target).project(camera);
        expect((projected.x + 1) / 2).toBeCloseTo(sample.screenX, 10);
        expect((1 - projected.y) / 2).toBeCloseTo(sample.screenY, 10);
        let top = -Infinity;
        let bottom = Infinity;
        for (const point of silhouette) {
          projected.copy(point).project(camera);
          largestAbsoluteX = Math.max(largestAbsoluteX, Math.abs(projected.x));
          largestAbsoluteY = Math.max(largestAbsoluteY, Math.abs(projected.y));
          top = Math.max(top, projected.y);
          bottom = Math.min(bottom, projected.y);
          smallestDepth = Math.min(smallestDepth, projected.z);
          largestDepth = Math.max(largestDepth, projected.z);
        }
        // The fixed navigation occupies 74 px. A canvas-only bounds check
        // misses a balloon crown hidden behind that real page obstruction.
        if (!narrow) expect((1 - top) * height / 2, `${width}x${height}, progress ${i / 120}`).toBeGreaterThan(82);
        smallestHeight = Math.min(smallestHeight, (top - bottom) / 2);
      }
    }
    expect(largestAbsoluteX).toBeLessThan(.90);
    expect(largestAbsoluteY).toBeLessThan(.90);
    expect(smallestHeight).toBeGreaterThan(narrow ? .45 : .48);
    expect(smallestDepth).toBeGreaterThan(-1);
    expect(largestDepth).toBeLessThan(1);
  });

  it("holds every reading composition while the independent wind clock can continue", () => {
    for (const [start, end] of HOLDS) {
      const baseline = snapshot((start + end) / 2, narrow);
      for (const progress of [start, start + (end - start) * .2, end]) {
        const sample = snapshot(progress, narrow);
        expect(sample.position.toArray()).toEqual(baseline.position.toArray());
        expect(sample.target.toArray()).toEqual(baseline.target.toArray());
        expect([sample.fov, sample.altitudeKm, sample.screenX, sample.screenY, sample.shot]).toEqual([baseline.fov, baseline.altitudeKm, baseline.screenX, baseline.screenY, baseline.shot]);
      }
    }
  });

  it("joins the holds continuously with zero departure/arrival velocity and acceleration", () => {
    for (const [start, end] of TRAVEL) {
      for (const [boundary, direction] of [[start, 1], [end, -1]]) {
        const before = snapshot(boundary - 1e-6, narrow);
        const after = snapshot(boundary + 1e-6, narrow);
        expect(before.position.distanceTo(after.position)).toBeLessThan(1e-8);
        for (const field of ["fov", "altitudeKm", "screenX", "screenY"] as const) expect(Math.abs(before[field] - after[field])).toBeLessThan(1e-8);
        const endpoint = snapshot(boundary, narrow).position;
        const fine = endpoint.distanceTo(snapshot(boundary + direction * .0001, narrow).position);
        const coarse = endpoint.distanceTo(snapshot(boundary + direction * .0002, narrow).position);
        expect(fine / coarse).toBeCloseTo(.125, 2);
      }
    }
  });

  it("retraces identical following poses and layout positions after arbitrary reverse input", () => {
    const forward = Array.from({ length: 301 }, (_, index) => snapshot(index / 300, narrow));
    for (let i = forward.length - 1; i >= 0; i--) {
      snapshot((i * .379) % 1, !narrow);
      const reverse = snapshot(i / 300, narrow);
      expect(reverse.position.toArray()).toEqual(forward[i].position.toArray());
      expect(reverse.target.toArray()).toEqual(forward[i].target.toArray());
      for (const field of ["fov", "altitudeKm", "screenX", "screenY", "shot"] as const) expect(reverse[field]).toBe(forward[i][field]);
    }
  });
});

it("reuses output storage and clamps exceptional scroll input to complete compositions", () => {
  const position = new Vector3();
  const target = new Vector3();
  const state: CinematicCameraSample = { fov: 0, altitudeKm: 0, shot: -1, screenX: 0, screenY: 0 };
  expect(sampleCinematicCamera(NaN, false, position, target, state)).toBe(state);
  expect(state.shot).toBe(0);
  sampleCinematicCamera(Infinity, false, position, target, state);
  expect(state.shot).toBe(3);
  expect(state.altitudeKm).toBe(30);
  sampleCinematicCamera(-Infinity, false, position, target, state);
  expect(state.shot).toBe(0);
  expect(state.altitudeKm).toBe(8);
  expect(state.screenX).toBe(.72);
});
