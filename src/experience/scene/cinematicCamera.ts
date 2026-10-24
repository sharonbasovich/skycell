import { CubicBezierCurve3, MathUtils, Vector3 } from "three";

export interface CinematicCameraSample {
  fov: number;
  altitudeKm: number;
  /** Nearest narrative shot (0 hero, 1 payload, 2 connection, 3 wide). */
  shot: number;
}

interface Shot {
  position: Vector3;
  target: Vector3;
  fov: number;
  altitudeKm: number;
}

interface CameraRig {
  shots: readonly Shot[];
  paths: readonly CubicBezierCurve3[];
}

const ALTITUDES = [18, 22, 27, 30] as const;
const TRAVEL = [[0.06, 0.28], [0.43, 0.60], [0.77, 0.94]] as const;

function shot(position: [number, number, number], target: [number, number, number], fov: number, index: number): Shot {
  return { position: new Vector3(...position), target: new Vector3(...target), fov, altitudeKm: ALTITUDES[index] };
}

function createRig(shots: readonly Shot[], controls: readonly [Vector3, Vector3][]): CameraRig {
  const paths = controls.map(([departure, arrival], index) => {
    const path = new CubicBezierCurve3(shots[index].position, departure, arrival, shots[index + 1].position);
    // Build the cumulative length tables once, not during scroll sampling.
    // getPointAt then converts eased travel distance into the cubic parameter.
    path.arcLengthDivisions = 512;
    path.updateArcLengths();
    return path;
  });
  return { shots, paths };
}

// Gentle front/right arcs retain clearance from the vertical flight train.
// Each shot ends at rest; no orbit, automatic roll, or ambient camera drift.
const DESKTOP = createRig([
  shot([5.2, 22.3, 7], [0, 21.7, 0], 30, 0),
  shot([1, 0.55, 1.75], [-0.15, 0.03, 0], 34, 1),
  shot([5, 4, 14], [0, 4, 0], 36, 2),
  shot([16, 16, 43], [0, 11.5, 0], 35, 3),
], [
  [new Vector3(5.8, 17, 8), new Vector3(2, 3, 4.1)],
  [new Vector3(1.7, 1.2, 4.4), new Vector3(4.6, 3.6, 10)],
  [new Vector3(7.6, 5.5, 22.6), new Vector3(12.8, 12.9, 36.5)],
]);

const MOBILE = createRig([
  shot([3, 22.1, 5], [0, 21.9, 0], 36, 0),
  shot([0.68, 0.4, 1.2], [-0.2, 0.03, 0], 38, 1),
  shot([4, 4, 13], [0, 4, 0], 44, 2),
  shot([14, 16, 45], [0, 11.5, 0], 42, 3),
], [
  [new Vector3(3.4, 17, 5.6), new Vector3(1.15, 2.6, 2.7)],
  [new Vector3(1.2, 1, 3.3), new Vector3(3.4, 3.4, 9.7)],
  [new Vector3(6.5, 6, 21.2), new Vector3(11.3, 12.9, 37)],
]);

/** Zero velocity and acceleration at both ends, without overshoot. */
function easeTravel(t: number): number {
  // Roundoff immediately below t=1 can exceed 1 by a few ulps. Three's
  // arc-length lookup requires an inclusive [0, 1] distance fraction.
  return MathUtils.clamp(t * t * t * (t * (t * 6 - 15) + 10), 0, 1);
}

/**
 * Pure, reversible scroll sampler. Positions/targets are in local metres;
 * altitude is the independent kilometre environment altitude.
 *
 * Mutates the supplied vectors. Pass a reusable sampleOut for allocation-free
 * frames. The default return object is convenient for setup and inspection.
 * Camera orientation/up vector and responsive projection offset stay with the
 * caller. This function adds no smoothing or time-dependent state.
 */
export function sampleCinematicCamera(
  progress: number,
  narrow: boolean,
  positionOut: Vector3,
  targetOut: Vector3,
  sampleOut: CinematicCameraSample = { fov: 30, altitudeKm: 18, shot: 0 },
): CinematicCameraSample {
  const p = Number.isNaN(progress) ? 0 : MathUtils.clamp(progress, 0, 1);
  const rig = narrow ? MOBILE : DESKTOP;

  for (let index = 0; index < TRAVEL.length; index++) {
    const [start, end] = TRAVEL[index];
    const from = rig.shots[index];
    if (p <= start) {
      positionOut.copy(from.position);
      targetOut.copy(from.target);
      sampleOut.fov = from.fov;
      sampleOut.altitudeKm = from.altitudeKm;
      sampleOut.shot = index;
      return sampleOut;
    }
    if (p < end) {
      const to = rig.shots[index + 1];
      const eased = easeTravel((p - start) / (end - start));
      rig.paths[index].getPointAt(eased, positionOut);
      targetOut.lerpVectors(from.target, to.target, eased);
      sampleOut.fov = MathUtils.lerp(from.fov, to.fov, eased);
      sampleOut.altitudeKm = MathUtils.lerp(from.altitudeKm, to.altitudeKm, eased);
      sampleOut.shot = eased < 0.5 ? index : index + 1;
      return sampleOut;
    }
  }

  const last = rig.shots[3];
  positionOut.copy(last.position);
  targetOut.copy(last.target);
  sampleOut.fov = last.fov;
  sampleOut.altitudeKm = last.altitudeKm;
  sampleOut.shot = 3;
  return sampleOut;
}
