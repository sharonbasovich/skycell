import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { createFlightDynamicsPose, FLIGHT_RISE_METRES, FLIGHT_TETHER_LENGTH, sampleFlightDynamics } from "./flightDynamics";

function finitePose(pose: ReturnType<typeof createFlightDynamicsPose>) {
  return Object.values(pose).every(value => value.toArray().every(Number.isFinite));
}

describe("wind-led balloon and suspended payload", () => {
  it("keeps both physical attachment points joined by an exactly taut tether throughout the climb", () => {
    const pose = createFlightDynamicsPose();
    const neck = new Vector3(), loop = new Vector3();
    for (let progress = 0; progress <= 1.001; progress += .05) {
      for (let time = 0; time < 48; time += .4) {
        sampleFlightDynamics(progress, time, pose);
        neck.set(0, -.97, 0).multiply(pose.balloonScale).applyQuaternion(pose.balloonQuaternion).add(pose.balloonPosition);
        loop.set(-.03, .183, -.018).applyQuaternion(pose.payloadQuaternion).add(pose.payloadPosition);
        expect(neck.distanceTo(pose.neck)).toBeLessThan(1e-12);
        expect(loop.distanceTo(pose.loop)).toBeLessThan(1e-12);
        expect(neck.distanceTo(loop)).toBeCloseTo(FLIGHT_TETHER_LENGTH, 10);
        expect(loop.y).toBeLessThan(neck.y);
        expect(pose.tetherDirection.length()).toBeCloseTo(1, 10);
        expect(finitePose(pose)).toBe(true);
      }
    }
  });

  it("trails the envelope's air movement and swings independently while scroll is held", () => {
    const pose = createFlightDynamicsPose();
    let dragWork = 0, maximumSwing = 0, maximumAttitudeDifference = 0;
    let minimumOffsetX = Infinity, maximumOffsetX = -Infinity;
    let minimumEnvelopeScale = Infinity, maximumEnvelopeScale = -Infinity;
    for (let time = 0; time < 120; time += .05) {
      sampleFlightDynamics(.38, time, pose);
      const dx = pose.loop.x - pose.neck.x, dz = pose.loop.z - pose.neck.z;
      dragWork += dx * pose.travelVelocity.x + dz * pose.travelVelocity.z;
      maximumSwing = Math.max(maximumSwing, Math.hypot(dx, dz));
      maximumAttitudeDifference = Math.max(maximumAttitudeDifference, pose.balloonQuaternion.angleTo(pose.payloadQuaternion));
      minimumOffsetX = Math.min(minimumOffsetX, dx);
      maximumOffsetX = Math.max(maximumOffsetX, dx);
      minimumEnvelopeScale = Math.min(minimumEnvelopeScale, pose.balloonScale.x);
      maximumEnvelopeScale = Math.max(maximumEnvelopeScale, pose.balloonScale.x);
    }
    // Negative mean offset·velocity establishes aerodynamic trailing, rather
    // than just two unrelated wiggles. The rigid-offset baseline fails this.
    expect(dragWork / (120 / .05)).toBeLessThan(-.02);
    expect(maximumSwing).toBeGreaterThan(.45);
    expect(maximumSwing).toBeLessThan(1.35);
    expect(maximumOffsetX - minimumOffsetX).toBeGreaterThan(.8);
    expect(maximumAttitudeDifference).toBeGreaterThan(.15);
    expect(maximumEnvelopeScale - minimumEnvelopeScale).toBeGreaterThan(.01);
  });

  it("ascends through fixed world space on a bounded curved route", () => {
    const pose = createFlightDynamicsPose();
    const start = sampleFlightDynamics(0, 8, createFlightDynamicsPose());
    const end = sampleFlightDynamics(1, 8, createFlightDynamicsPose());
    let previousHeight = -Infinity, minimumX = Infinity, maximumX = -Infinity;
    for (let index = 0; index <= 300; index++) {
      sampleFlightDynamics(index / 300, 8, pose);
      expect(pose.balloonPosition.y).toBeGreaterThanOrEqual(previousHeight);
      expect(Math.abs(pose.balloonPosition.x)).toBeLessThan(4.2);
      expect(Math.abs(pose.balloonPosition.z)).toBeLessThan(3);
      minimumX = Math.min(minimumX, pose.balloonPosition.x);
      maximumX = Math.max(maximumX, pose.balloonPosition.x);
      previousHeight = pose.balloonPosition.y;
    }
    expect(end.balloonPosition.y - start.balloonPosition.y).toBeCloseTo(FLIGHT_RISE_METRES, 0);
    expect(maximumX - minimumX).toBeGreaterThan(2);
  });

  it("freezes exactly for a paused clock, reverses reproducibly, and reuses all output storage", () => {
    const out = createFlightDynamicsPose();
    const storage = { ...out };
    const expected = sampleFlightDynamics(.43, 14, createFlightDynamicsPose());
    for (const progress of [.8, .1, .99, 0, .2, .43]) sampleFlightDynamics(progress, 14, out);
    for (const key of Object.keys(storage) as (keyof typeof out)[]) {
      expect(out[key]).toBe(storage[key]);
      expect(out[key].toArray()).toEqual(expected[key].toArray());
    }
    const once = out.balloonPosition.toArray();
    sampleFlightDynamics(.43, 14, out);
    expect(out.balloonPosition.toArray()).toEqual(once);
  });

  it("sanitizes exceptional scroll/time values without corrupting attachment geometry", () => {
    const pose = createFlightDynamicsPose();
    for (const progress of [NaN, Infinity, -Infinity, -30, 40, .3]) {
      for (const time of [NaN, Infinity, -Infinity, -30, 1e308]) {
        sampleFlightDynamics(progress, time, pose);
        expect(finitePose(pose)).toBe(true);
        expect(pose.neck.distanceTo(pose.loop)).toBeCloseTo(FLIGHT_TETHER_LENGTH, 10);
        expect(pose.balloonQuaternion.length()).toBeCloseTo(1, 10);
        expect(pose.payloadQuaternion.length()).toBeCloseTo(1, 10);
      }
    }
  });
});
