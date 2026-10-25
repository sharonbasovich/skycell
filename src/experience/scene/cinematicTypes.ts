import type { Vector3 } from "three";

/** Hardware uses metres around a floating origin; the environment uses km. */
export interface CinematicFrame {
  progress: number;
  altitudeKm: number;
  sunDirection: Vector3;
  /** Owned visible-scene time; freezes for pause, hidden tab and offscreen. */
  elapsedSeconds: number;
  /** Physical ascent, independent of hardware inspection/recording chapters. */
  flightProgress?: number;
}
