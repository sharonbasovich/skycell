import { describe, expect, it } from "vitest";
import { ReplayClock } from "./replayClock";

describe("replay clock", () => {
  it("continues from a seek made during playback, rather than restoring the old cursor", () => {
    const clock = new ReplayClock(100000);
    expect(clock.advance(100, 100)).toBe(10000);
    clock.seek(50000);
    expect(clock.advance(100, 100)).toBe(60000);
    clock.seek(1000);
    expect(clock.advance(100, 25)).toBe(3500);
  });
  it("clamps at the end and restarts from a reset cursor", () => {
    const clock = new ReplayClock(10000);
    expect(clock.advance(200, 100)).toBe(10000);
    expect(clock.advance(200, 100)).toBe(10000);
    clock.seek(0);
    expect(clock.advance(200, 25)).toBe(5000);
  });
  it("does not advance on a negative wall-time delta", () => {
    const clock = new ReplayClock(10000);
    clock.seek(5000);
    expect(clock.advance(-10, 100)).toBe(5000);
  });
});
