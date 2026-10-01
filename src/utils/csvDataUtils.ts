export interface TrajectoryPoint {
  datetime: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  altitude: number;
  ascent_rate: number | null;
  speed: number | null;
  temperature: number | null;
  battery: number | null;
}

export interface ProcessedTrajectoryData {
  points: TrajectoryPoint[];
  bounds: {
    lat: { min: number; max: number };
    lon: { min: number; max: number };
    alt: { min: number; max: number };
  };
  center: { lat: number; lon: number };
  source: {
    rows: number;
    rejected: number;
    duplicates: number;
    callsigns: string[];
  };
}

// Quoted fields in the Horus export may contain commas (e.g. uploader_position).
export function readCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const character = input[i];
    if (character === '"') {
      if (quoted && input[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

const optionalNumber = (value: string | undefined): number | null => {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function parseCSVText(text: string): ProcessedTrajectoryData {
  const rows = readCSV(text);
  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  for (const required of ["datetime", "lat", "lon", "alt"]) {
    if (!headers.includes(required))
      throw new Error(`The CSV is missing the ${required} column.`);
  }
  const column = (row: string[], name: string) => row[headers.indexOf(name)];
  let rejected = 0;
  const callsigns = new Set<string>();
  const valid: TrajectoryPoint[] = [];
  for (const row of rows) {
    const date = column(row, "datetime")?.trim() ?? "";
    // Keep absolute time: never strip Z or manually shift UTC into local time.
    const timestamp = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(date)
      ? Date.parse(date)
      : NaN;
    const latitude = optionalNumber(column(row, "lat"));
    const longitude = optionalNumber(column(row, "lon"));
    const altitude = optionalNumber(column(row, "alt"));
    if (
      !Number.isFinite(timestamp) ||
      latitude === null ||
      longitude === null ||
      altitude === null ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180 ||
      altitude < -500 ||
      altitude > 100000
    ) {
      rejected++;
      continue;
    }
    const callsign = column(row, "payload_callsign")?.trim();
    if (callsign) callsigns.add(callsign);
    valid.push({
      datetime: new Date(timestamp).toISOString(),
      timestamp,
      latitude,
      longitude,
      altitude,
      ascent_rate: optionalNumber(column(row, "ascent_rate")),
      speed: optionalNumber(column(row, "speed")),
      temperature: optionalNumber(column(row, "temp")),
      battery: optionalNumber(column(row, "batt")),
    });
  }
  if (callsigns.size > 1)
    throw new Error(
      "This replay supports one payload at a time. Filter the CSV to one payload_callsign before loading it.",
    );
  valid.sort((a, b) => a.timestamp - b.timestamp);
  // Receiver exports repeat observations. One position per timestamp keeps the replay monotonic.
  const points = valid.filter(
    (point, index) =>
      index === 0 || point.timestamp !== valid[index - 1].timestamp,
  );
  const bounds = {
    lat: { min: 0, max: 0 },
    lon: { min: 0, max: 0 },
    alt: { min: 0, max: 0 },
  };
  if (points.length) {
    for (const [key, field] of [
      ["lat", "latitude"],
      ["lon", "longitude"],
      ["alt", "altitude"],
    ] as const) {
      bounds[key] = points.reduce(
        (range, point) => ({
          min: Math.min(range.min, point[field]),
          max: Math.max(range.max, point[field]),
        }),
        { min: points[0][field], max: points[0][field] },
      );
    }
  }
  return {
    points,
    bounds,
    center: {
      lat: (bounds.lat.min + bounds.lat.max) / 2,
      lon: (bounds.lon.min + bounds.lon.max) / 2,
    },
    source: {
      rows: rows.length,
      rejected,
      duplicates: valid.length - points.length,
      callsigns: [...callsigns].sort(),
    },
  };
}

export async function parseCSVData(
  signal?: AbortSignal,
): Promise<ProcessedTrajectoryData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data.csv`, {
    signal,
  });
  if (!response.ok)
    throw new Error(
      `Could not load the flight archive (HTTP ${response.status}).`,
    );
  return parseCSVText(await response.text());
}

export function latLonTo3D(
  lat: number,
  lon: number,
  alt: number,
  centerLat: number,
  centerLon: number,
  scale = 1,
) {
  return {
    x:
      (lon - centerLon) *
      111000 *
      Math.cos((centerLat * Math.PI) / 180) *
      scale,
    y: alt * scale,
    z: -(lat - centerLat) * 111000 * scale,
  };
}

export function groundDistance(points: TrajectoryPoint[]): number {
  const radius = 6371000;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  return points.reduce((distance, point, index) => {
    if (!index) return distance;
    const previous = points[index - 1];
    const a =
      Math.sin(radians(point.latitude - previous.latitude) / 2) ** 2 +
      Math.cos(radians(previous.latitude)) *
        Math.cos(radians(point.latitude)) *
        Math.sin(radians(point.longitude - previous.longitude) / 2) ** 2;
    return (
      distance +
      radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))
    );
  }, 0);
}

export function flightDuration(points: TrajectoryPoint[]): number {
  return points.length > 1
    ? points[points.length - 1].timestamp - points[0].timestamp
    : 0;
}

export const OBSERVATION_GAP_MS = 60000;

export function sampleTrajectory(
  points: TrajectoryPoint[],
  elapsed: number,
): { point: TrajectoryPoint | null; index: number; isGap: boolean } {
  if (!points.length) return { point: null, index: 0, isGap: false };
  const timestamp = Math.min(
    points[points.length - 1].timestamp,
    Math.max(points[0].timestamp, points[0].timestamp + elapsed),
  );
  let low = 0,
    high = points.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (points[middle].timestamp <= timestamp) low = middle;
    else high = middle - 1;
  }
  const from = points[low];
  const to = points[Math.min(low + 1, points.length - 1)];
  const isGap =
    to.timestamp - from.timestamp > OBSERVATION_GAP_MS &&
    timestamp > from.timestamp &&
    timestamp < to.timestamp;
  // A long reception gap is not a measured path. Hold the last position until another sample arrives.
  const ratio =
    isGap || to.timestamp === from.timestamp
      ? 0
      : (timestamp - from.timestamp) / (to.timestamp - from.timestamp);
  const interpolate = (first: number, second: number) =>
    first + (second - first) * ratio;
  return {
    index: low,
    isGap,
    point: {
      ...from,
      timestamp,
      datetime: new Date(timestamp).toISOString(),
      latitude: interpolate(from.latitude, to.latitude),
      longitude: interpolate(from.longitude, to.longitude),
      altitude: interpolate(from.altitude, to.altitude),
    },
  };
}

export function splitTrajectory(
  points: TrajectoryPoint[],
): TrajectoryPoint[][] {
  const segments: TrajectoryPoint[][] = [];
  for (const point of points) {
    const segment = segments[segments.length - 1];
    if (
      !segment ||
      point.timestamp - segment[segment.length - 1].timestamp >
        OBSERVATION_GAP_MS
    )
      segments.push([point]);
    else segment.push(point);
  }
  return segments;
}

export const formatUTC = (timestamp: number) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
  }).format(timestamp);

export function formatDuration(milliseconds: number): string {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`;
}
