import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  flightDuration,
  groundDistance,
  latLonTo3D,
  parseCSVData,
  parseCSVText,
  readCSV,
  sampleTrajectory,
  splitTrajectory,
} from "./csvDataUtils";

const archive = `datetime,payload_callsign,lat,lon,alt,speed,temp,batt,notes
2025-06-21T18:11:20Z,APEX,42,-71,200,40,-6,2.8,"receiver, one"
2025-06-21T18:11:10Z,APEX,41,-70,100,30,-5,2.9,first
2025-06-21T18:11:10Z,APEX,41,-70,100,30,-5,2.9,duplicate`;

describe("archived telemetry parsing", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("preserves UTC, sorts observations, and removes repeated timestamps", () => {
    const data = parseCSVText(archive);
    expect(data.points).toHaveLength(2);
    expect(data.points[0].datetime).toBe("2025-06-21T18:11:10.000Z");
    expect(data.points[0].timestamp).toBe(Date.UTC(2025, 5, 21, 18, 11, 10));
    expect(data.source.duplicates).toBe(1);
    expect(data.bounds.alt).toEqual({ min: 100, max: 200 });
    expect(flightDuration(data.points)).toBe(10000);
  });
  it("uses headers instead of column positions and retains zero coordinates", () => {
    const data = parseCSVText(
      "lon,alt,datetime,lat\r\n0,0,2025-01-01T00:00:00Z,0\r\n",
    );
    expect(data.points[0]).toMatchObject({
      longitude: 0,
      latitude: 0,
      altitude: 0,
      speed: null,
    });
  });
  it("rejects invalid dates, missing values, and out-of-range coordinates", () => {
    const data = parseCSVText(
      `datetime,lat,lon,alt\n2025-01-01 00:00:00,1,1,10\nbad,1,1,10\n2025-01-01T00:00:00Z,91,1,10\n2025-01-01T00:00:00Z,,1,10`,
    );
    expect(data.points).toEqual([]);
    expect(data.source.rejected).toBe(4);
    expect(data.bounds.lat).toEqual({ min: 0, max: 0 });
  });
  it("handles quoted commas, escaped quotes, and CRLF", () => {
    expect(readCSV('one,two\r\n"receiver, one","a ""quote"""\r\n')).toEqual([
      ["one", "two"],
      ["receiver, one", 'a "quote"'],
    ]);
  });
  it("rejects malformed schemas instead of silently showing empty telemetry", () => {
    expect(() => parseCSVText("error page")).toThrow("missing");
    expect(() => readCSV('one\n"unclosed')).toThrow("unclosed");
  });
  it("rejects mixed payloads instead of silently merging flight tracks", () => {
    expect(() => parseCSVText(archive.replace("APEX,42", "OTHER,42"))).toThrow(
      "one payload",
    );
  });
  it("accepts an explicit timezone offset without changing the instant", () => {
    const data = parseCSVText(archive.replace("18:11:10Z", "14:11:10-04:00"));
    expect(data.points[0].datetime).toBe("2025-06-21T18:11:10.000Z");
  });
  it("reports failed HTTP responses instead of parsing an error page as telemetry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    await expect(parseCSVData()).rejects.toThrow("HTTP 404");
  });
  it("loads the bundled APEX archive with its measured span and monotonic timestamps", () => {
    const data = parseCSVText(
      readFileSync(new URL("../../public/data.csv", import.meta.url), "utf8"),
    );
    expect(data.source).toEqual({
      rows: 125,
      rejected: 0,
      duplicates: 0,
      callsigns: ["APEX-2-T"],
    });
    expect(data.bounds.alt.max).toBe(29510);
    expect(data.points[0].datetime).toBe("2025-06-21T18:11:06.000Z");
    expect(data.points.at(-1)?.datetime).toBe("2025-06-21T19:17:21.000Z");
    expect(flightDuration(data.points)).toBe(3975000);
    expect(
      data.points.every(
        (point, index) =>
          !index || point.timestamp > data.points[index - 1].timestamp,
      ),
    ).toBe(true);
    expect(splitTrajectory(data.points).length).toBeGreaterThan(1);
  });
});

describe("time-based replay", () => {
  const points = parseCSVText(archive).points;
  it("interpolates position by timestamp rather than row count", () => {
    const { point, index } = sampleTrajectory(points, 2500);
    expect(index).toBe(0);
    expect(point).toMatchObject({
      latitude: 41.25,
      longitude: -70.25,
      altitude: 125,
    });
    expect(point?.timestamp).toBe(points[0].timestamp + 2500);
  });
  it("clamps seeks at both ends and handles empty or one-point datasets", () => {
    expect(sampleTrajectory(points, -100).point?.altitude).toBe(100);
    expect(sampleTrajectory(points, 100000).point?.altitude).toBe(200);
    expect(sampleTrajectory([], 100).point).toBeNull();
    expect(sampleTrajectory([points[0]], 100).point?.altitude).toBe(100);
  });
  it("holds the last measured position during a long reception gap and segments the path", () => {
    const withGap = [
      points[0],
      { ...points[1], timestamp: points[0].timestamp + 120000 },
    ];
    expect(sampleTrajectory(withGap, 60000)).toMatchObject({
      isGap: true,
      point: { altitude: 100, latitude: 41 },
    });
    expect(sampleTrajectory(withGap, 120000)).toMatchObject({
      isGap: false,
      point: { altitude: 200 },
    });
    expect(splitTrajectory(withGap)).toHaveLength(2);
  });
  it("projects altitude and ground position in consistent units", () => {
    expect(latLonTo3D(42, -71, 20000, 42, -71, 0.001)).toEqual({
      x: 0,
      y: 20,
      z: -0,
    });
    expect(groundDistance([])).toBe(0);
    expect(groundDistance(points)).toBeGreaterThan(100000);
  });
});
