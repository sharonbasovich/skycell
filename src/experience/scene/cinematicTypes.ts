import type { Vector3 } from "three";

/** Hardware uses metres around a floating origin; the environment uses km. */
export interface CinematicFrame {
  progress: number;
  altitudeKm: number;
  sunDirection: Vector3;
}
