export interface TrajectoryPoint {
  datetime: string;
  latitude: number;
  longitude: number;
  altitude: number;
  ascent_rate: number;
  speed: number;
  temperature: number;
  battery: number;
}

export interface ProcessedTrajectoryData {
  points: TrajectoryPoint[];
  bounds: {
    lat: { min: number; max: number };
    lon: { min: number; max: number };
    alt: { min: number; max: number };
  };
  center: {
    lat: number;
    lon: number;
  };
}

export const parseCSVData = async (): Promise<ProcessedTrajectoryData> => {
  try {
    const response = await fetch("/data.csv");
    const csvText = await response.text();

    // Parse CSV
    const lines = csvText.split("\n");
    const headers = lines[0].split(",");

    const points: TrajectoryPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",");
      if (values.length < headers.length) continue;

      const point: TrajectoryPoint = {
        datetime: values[0],
        latitude: parseFloat(values[2]) || 0,
        longitude: parseFloat(values[3]) || 0,
        altitude: parseFloat(values[4]) || 0,
        ascent_rate: parseFloat(values[5]) || 0,
        speed: parseFloat(values[12]) || 0,
        temperature: parseFloat(values[13]) || 0,
        battery: parseFloat(values[6]) || 0,
      };

      // Only add points with valid coordinates
      if (point.latitude !== 0 && point.longitude !== 0) {
        points.push(point);
      }
    }

    // Calculate bounds
    const lats = points.map((p) => p.latitude);
    const lons = points.map((p) => p.longitude);
    const alts = points.map((p) => p.altitude);

    const bounds = {
      lat: { min: Math.min(...lats), max: Math.max(...lats) },
      lon: { min: Math.min(...lons), max: Math.max(...lons) },
      alt: { min: Math.min(...alts), max: Math.max(...alts) },
    };

    const center = {
      lat: (bounds.lat.min + bounds.lat.max) / 2,
      lon: (bounds.lon.min + bounds.lon.max) / 2,
    };

    return { points, bounds, center };
  } catch (error) {
    console.error("Error parsing CSV data:", error);
    return {
      points: [],
      bounds: {
        lat: { min: 0, max: 0 },
        lon: { min: 0, max: 0 },
        alt: { min: 0, max: 0 },
      },
      center: { lat: 0, lon: 0 },
    };
  }
};

// Convert lat/lon to 3D coordinates (simplified projection)
export const latLonTo3D = (
  lat: number,
  lon: number,
  alt: number,
  centerLat: number,
  centerLon: number,
  scale: number = 1
) => {
  // Convert to relative coordinates from center
  const dLat = (lat - centerLat) * 111000; // meters per degree latitude
  const dLon =
    (lon - centerLon) * 111000 * Math.cos((centerLat * Math.PI) / 180); // meters per degree longitude

  return {
    x: dLon * scale,
    y: alt * scale, // altitude in meters
    z: -dLat * scale, // negative because Three.js Y is up
  };
};
