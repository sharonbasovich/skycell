import { MathUtils, Vector3 } from "three";

export interface CinematicCameraSample {
  fov: number;
  altitudeKm: number;
  /** Nearest narrative composition; the followed vehicle remains the subject. */
  shot: number;
  /** Subject target position in the viewport, measured from its top-left. */
  screenX: number;
  screenY: number;
}

interface Composition {
  position: Vector3;
  fov: number;
  altitudeKm: number;
  screenX: number;
  screenY: number;
}

const TARGET = new Vector3(0, 2.05, 0);
const TRAVEL = [[.06, .29], [.40, .62], [.75, .96]] as const;
const ALTITUDES = [8, 14, 23, 30] as const;

function composition(position: [number, number, number], fov: number, index: number, screenX: number, screenY = .5): Composition {
  return { position: new Vector3(...position), fov, altitudeKm: ALTITUDES[index], screenX, screenY };
}

// A modest following arc keeps the same complete balloon/payload in view.
// Layout shifts make room for each piece of the story, without inspecting the
// upper balloon, diving down the line, or retreating to an unrelated wide shot.
const DESKTOP = [
  composition([5.8, 3.6, 13.5], 30, 0, .72),
  composition([5.2, 3, 13.2], 30, 1, .32, .525),
  composition([4.5, 2.8, 13.5], 31, 2, .70),
  composition([6.5, 3.4, 16], 32, 3, .70, .43),
] as const;
const MOBILE = [
  composition([4, 2.8, 13], 38, 0, .62, .57),
  composition([3.8, 2.8, 13], 39, 1, .40, .42),
  composition([4.1, 2.8, 13.2], 39, 2, .65, .58),
  composition([4, 2.8, 13.5], 40, 3, .73, .42),
] as const;

/** Zero endpoint velocity/acceleration, with no overshoot at reading holds. */
function easeTravel(t: number): number {
  return MathUtils.clamp(t * t * t * (t * (t * 6 - 15) + 10), 0, 1);
}

/**
 * Pure and reversible composition sampler. Hardware/camera positions are in
 * local metres; illustrative environment altitude is independently in km.
 * Pass reusable vectors and sampleOut to avoid allocations during live scroll.
 * The parent owns input filtering, projection offsets and the visible clock.
 */
export function sampleCinematicCamera(
  progress: number,
  narrow: boolean,
  positionOut: Vector3,
  targetOut: Vector3,
  sampleOut: CinematicCameraSample = { fov: 30, altitudeKm: 8, shot: 0, screenX: .72, screenY: .5 },
): CinematicCameraSample {
  const p = Number.isNaN(progress) ? 0 : MathUtils.clamp(progress, 0, 1);
  const compositions = narrow ? MOBILE : DESKTOP;
  targetOut.copy(TARGET);
  for (let index = 0; index < TRAVEL.length; index++) {
    const [start, end] = TRAVEL[index];
    const from = compositions[index];
    if (p <= start) {
      positionOut.copy(from.position);
      sampleOut.fov = from.fov;
      sampleOut.altitudeKm = from.altitudeKm;
      sampleOut.shot = index;
      sampleOut.screenX = from.screenX;
      sampleOut.screenY = from.screenY;
      return sampleOut;
    }
    if (p < end) {
      const to = compositions[index + 1];
      const eased = easeTravel((p - start) / (end - start));
      positionOut.lerpVectors(from.position, to.position, eased);
      sampleOut.fov = MathUtils.lerp(from.fov, to.fov, eased);
      sampleOut.altitudeKm = MathUtils.lerp(from.altitudeKm, to.altitudeKm, eased);
      sampleOut.screenX = MathUtils.lerp(from.screenX, to.screenX, eased);
      sampleOut.screenY = MathUtils.lerp(from.screenY, to.screenY, eased);
      sampleOut.shot = eased < .5 ? index : index + 1;
      return sampleOut;
    }
  }
  const last = compositions[3];
  positionOut.copy(last.position);
  sampleOut.fov = last.fov;
  sampleOut.altitudeKm = last.altitudeKm;
  sampleOut.shot = 3;
  sampleOut.screenX = last.screenX;
  sampleOut.screenY = last.screenY;
  return sampleOut;
}
