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
  /** Scroll-driven relative payload displacement shared with camera sampling. */
  scrollSuspensionVector3?: Vector3;
  /** Uniform translation of the same rig onto the recorded route. */
  recordingTranslationVector3?: Vector3;
}
