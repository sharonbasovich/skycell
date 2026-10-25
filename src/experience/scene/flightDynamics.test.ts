import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { createFlightDynamicsPose, createScrollSuspension, FLIGHT_RISE_METRES, FLIGHT_TETHER_LENGTH, sampleFlightDynamics, stepScrollSuspension } from "./flightDynamics";

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

describe("scroll-operated suspension", () => {
  const right = new Vector3(1, 0, 0);
  it("leaves the envelope leading a leftward screen crossing, then settles without moving the envelope route", () => {
    const state = createScrollSuspension(), shifted = createFlightDynamicsPose(), baseline = createFlightDynamicsPose();
    const returned = state.offset;
    stepScrollSuspension(state, .72, right, 1 / 60);
    let maximumLag = 0;
    for (let frame = 1; frame <= 60; frame++) {
      stepScrollSuspension(state, .72 - .37 * frame / 60, right, 1 / 60);
      sampleFlightDynamics(.35, 8, shifted, state.offset);
      sampleFlightDynamics(.35, 8, baseline);
      maximumLag = Math.max(maximumLag, shifted.loop.x - baseline.loop.x);
      expect(shifted.balloonPosition.toArray()).toEqual(baseline.balloonPosition.toArray());
      expect(shifted.neck.distanceTo(shifted.loop)).toBeCloseTo(FLIGHT_TETHER_LENGTH, 10);
      expect(state.offset.length()).toBeLessThanOrEqual(.900000001);
    }
    expect(maximumLag).toBeGreaterThan(.40);
    expect(state.offset.x).toBeGreaterThan(.65);
    for (let frame = 0; frame < 480; frame++) stepScrollSuspension(state, .35, right, 1 / 60);
    expect(state.offset.length()).toBeLessThan(.0001);
    expect(state.offsetVelocity.length()).toBeLessThan(.0001);
    expect(state.offset).toBe(returned);
  });

  it("trails the other way after a reversed crossing and follows the current horizontal camera axis", () => {
    const forward = createScrollSuspension(), backward = createScrollSuspension(), depth = createScrollSuspension();
    const depthRight = new Vector3(0, .7, 1);
    for (let frame = 0; frame <= 90; frame++) {
      const phase = frame / 90;
      stepScrollSuspension(forward, .72 - .37 * phase, right, 1 / 60);
      stepScrollSuspension(backward, .35 + .37 * phase, right, 1 / 60);
      stepScrollSuspension(depth, .72 - .37 * phase, depthRight, 1 / 60);
    }
    expect(forward.offset.x).toBeGreaterThan(.65);
    expect(backward.offset.x).toBeLessThan(-.65);
    expect(forward.offset.x + backward.offset.x).toBeCloseTo(0, 12);
    expect(depth.offset.z).toBeCloseTo(forward.offset.x, 12);
    expect(depth.offset.y).toBe(0);
    for (let frame = 1; frame <= 90; frame++) stepScrollSuspension(forward, .35 + .37 * frame / 90, right, 1 / 60);
    expect(forward.offset.x).toBeLessThan(-.5);
  });

  it("freezes both position and stored velocity for pause, and safely handles anchor jumps and bad values", () => {
    const state = createScrollSuspension(), pose = createFlightDynamicsPose();
    for (let frame = 0; frame <= 50; frame++) stepScrollSuspension(state, .72 - frame * .006, right, 1 / 60);
    const snapshot = { offset: state.offset.toArray(), velocity: state.offsetVelocity.toArray(), previous: state.previousScreenX };
    for (const dt of [0, -1, NaN, Infinity]) {
      stepScrollSuspension(state, .9, right, dt);
      expect(state.offset.toArray()).toEqual(snapshot.offset);
      expect(state.offsetVelocity.toArray()).toEqual(snapshot.velocity);
      expect(state.previousScreenX).toBe(snapshot.previous);
    }
    for (const coordinate of [0, 1, 0, 1, NaN, Infinity, -.3, 3]) {
      stepScrollSuspension(state, coordinate, new Vector3(NaN, Infinity, NaN), 1e6);
      sampleFlightDynamics(.4, 5, pose, state.offset);
      expect(state.offset.toArray().every(Number.isFinite)).toBe(true);
      expect(state.offset.length()).toBeLessThanOrEqual(.900000001);
      expect(finitePose(pose)).toBe(true);
      expect(pose.neck.distanceTo(pose.loop)).toBeCloseTo(FLIGHT_TETHER_LENGTH, 10);
    }
    for (const offset of [new Vector3(NaN, 0, Infinity), new Vector3(-1e308, 0, 1e308)]) {
      sampleFlightDynamics(.4, 5, pose, offset);
      expect(finitePose(pose)).toBe(true);
      expect(pose.neck.distanceTo(pose.loop)).toBeCloseTo(FLIGHT_TETHER_LENGTH, 10);
    }
  });

  it("decays inspection forcing instead of retaining a static offset, with independent scene storage", () => {
    const first = createScrollSuspension(), second = createScrollSuspension();
    for (let frame = 0; frame <= 60; frame++) stepScrollSuspension(first, .72 - frame * .006, right, 1 / 60);
    expect(first.offset.length()).toBeGreaterThan(.65);
    expect(second.offset.length()).toBe(0);
    for (let frame = 0; frame < 480; frame++) stepScrollSuspension(first, frame % 2, right, 1 / 60, false);
    expect(first.offset.length()).toBeLessThan(.0001);
    expect(first.offsetVelocity.length()).toBeLessThan(.0001);
  });
});
