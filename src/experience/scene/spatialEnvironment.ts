import { MathUtils, Vector3 } from "three";

export const EARTH_RADIUS_KM = 6371;

/** The regional journey is a concept path; the APEX archive remains separate. */
export function sampleGeographicObserver(flightProgress: number, altitudeKm: number, cameraWorld: Vector3, output: Vector3): Vector3 {
  const p = Number.isFinite(flightProgress) ? MathUtils.clamp(flightProgress, 0, 1) : 0;
  const travel = p * p * (3 - 2 * p);
  const radius = EARTH_RADIUS_KM + Math.max(8, Number.isFinite(altitudeKm) ? altitudeKm : 8);
  const east = 66 * travel, north = 18 * travel;
  // Observer translation preserves the same spherical geometry for the
  // coastlines, cloud shell and atmosphere, instead of scrolling a map.
  const up = Math.sqrt(Math.max(radius * radius - east * east - north * north, 1));
  return output.set(east + cameraWorld.x * .001, up + cameraWorld.y * .001, north + cameraWorld.z * .001);
}

export interface CloudBank { center: readonly [number, number, number]; radius: readonly [number, number, number]; density: number; seed: number }

/** Fixed metre-space volumes along the beginning of the ascending route. */
export const CLOUD_BANKS: readonly CloudBank[] = [
  { center: [-13, -2.8, 2], radius: [15, 2.4, 9], density: .80, seed: .16 },
  { center: [13, -2.5, -8], radius: [17, 2.5, 11], density: .88, seed: .61 },
  { center: [-9, -7, -32], radius: [29, 3.8, 17], density: .83, seed: .37 },
  { center: [29, -10, -72], radius: [46, 5, 27], density: .76, seed: .81 },
  { center: [-62, -18, -130], radius: [77, 6, 42], density: .70, seed: .44 },
  { center: [72, -28, -230], radius: [139, 9, 76], density: .62, seed: .92 },
  { center: [-132, -44, -370], radius: [205, 13, 109], density: .59, seed: .08 },
] as const;

export function cloudVisibility(altitudeKm: number): number {
  return 1 - MathUtils.smoothstep(Number.isFinite(altitudeKm) ? altitudeKm : 8, 12.5, 18);
}

function latticeHash(x: number, y: number, z: number, period: number): number {
  const wx = ((x % period) + period) % period, wy = ((y % period) + period) % period, wz = ((z % period) + period) % period;
  let value = Math.imul(wx + 11, 374761393) ^ Math.imul(wy + 29, 668265263) ^ Math.imul(wz + 47, 2147483647);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicNoise(x: number, y: number, z: number, period: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const tx = x - ix, ty = y - iy, tz = z - iz;
  const fx = tx * tx * (3 - 2 * tx), fy = ty * ty * (3 - 2 * ty), fz = tz * tz * (3 - 2 * tz);
  const x00 = MathUtils.lerp(latticeHash(ix, iy, iz, period), latticeHash(ix + 1, iy, iz, period), fx);
  const x10 = MathUtils.lerp(latticeHash(ix, iy + 1, iz, period), latticeHash(ix + 1, iy + 1, iz, period), fx);
  const x01 = MathUtils.lerp(latticeHash(ix, iy, iz + 1, period), latticeHash(ix + 1, iy, iz + 1, period), fx);
  const x11 = MathUtils.lerp(latticeHash(ix, iy + 1, iz + 1, period), latticeHash(ix + 1, iy + 1, iz + 1, period), fx);
  return MathUtils.lerp(MathUtils.lerp(x00, x10, fy), MathUtils.lerp(x01, x11, fy), fz);
}

/** A local, deterministic 32 KiB volume; no new media download is needed. */
export function createCloudDensityVolume(size = 32): Uint8Array {
  const data = new Uint8Array(size * size * size);
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, w = z / size;
    const coarse = periodicNoise(u * 4, v * 4, w * 4, 4);
    const detail = periodicNoise(u * 8 + 2.4, v * 8 + 1.3, w * 8 + 3.1, 8);
    const fine = periodicNoise(u * 16 + 5.7, v * 16 + 2.8, w * 16 + 4.6, 16);
    data[x + size * (y + size * z)] = Math.round(MathUtils.clamp(coarse * .63 + detail * .27 + fine * .10, 0, 1) * 255);
  }
  return data;
}
