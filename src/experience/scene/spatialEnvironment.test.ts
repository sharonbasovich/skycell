import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { cloudVisibility, createCloudDensityVolume, EARTH_RADIUS_KM, sampleGeographicObserver } from "./spatialEnvironment";

describe("spherical observer and spatial atmosphere", () => {
  it("moves the observer over a sphere while preserving radial altitude", () => {
    const camera = new Vector3(), output = new Vector3();
    let previousEast = -Infinity;
    for (let step = 0; step <= 100; step++) {
      const f = step / 100, altitude = 8 + 22 * f;
      expect(sampleGeographicObserver(f, altitude, camera, output)).toBe(output);
      expect(output.length() - EARTH_RADIUS_KM).toBeCloseTo(altitude, 8);
      expect(output.x).toBeGreaterThanOrEqual(previousEast);
      previousEast = output.x;
    }
    expect([output.x, output.z]).toEqual([66, 18]);
    // A flat Y=radius translation would accidentally add ~355 m of altitude.
    expect(output.y).toBeLessThan(EARTH_RADIUS_KM + 30);
  });

  it("retains the camera's actual metre-space translation in the shared kilometre frame", () => {
    const origin = sampleGeographicObserver(.5, 19, new Vector3(), new Vector3());
    const moved = sampleGeographicObserver(.5, 19, new Vector3(5, 2, -3), new Vector3());
    moved.sub(origin);
    expect(moved.x).toBeCloseTo(.005, 10);
    expect(moved.y).toBeCloseTo(.002, 10);
    expect(moved.z).toBeCloseTo(-.003, 10);
    expect(sampleGeographicObserver(NaN, NaN, new Vector3(), new Vector3()).length()).toBeCloseTo(EARTH_RADIUS_KM + 8);
  });

  it("clears nearby vapour before the high-altitude hardware inspection", () => {
    let previous = Infinity;
    for (let altitude = 8; altitude <= 30; altitude += .1) {
      const visibility = cloudVisibility(altitude);
      expect(visibility).toBeGreaterThanOrEqual(0);
      expect(visibility).toBeLessThanOrEqual(1);
      expect(visibility).toBeLessThanOrEqual(previous);
      previous = visibility;
    }
    expect(cloudVisibility(8)).toBe(1);
    expect(cloudVisibility(18)).toBe(0);
    expect(cloudVisibility(23.4)).toBe(0);
  });

  it("provides a deterministic, varied density field within the 32 KiB volume budget", () => {
    const first = createCloudDensityVolume(), second = createCloudDensityVolume();
    expect(first.byteLength).toBe(32768);
    expect(second).toEqual(first);
    expect(Math.min(...first)).toBeLessThan(75);
    expect(Math.max(...first)).toBeGreaterThan(180);
    expect(new Set(first).size).toBeGreaterThan(150);
  });
});
