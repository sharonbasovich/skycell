import { MathUtils, Vector3 } from "three";
import type { FlightDynamicsPose } from "./flightDynamics";
import { recordingPhase } from "./recordingReadout";

export { STORY_STOPS } from "../storyTiming";
const HOLDS = [[0, .055], [.125, .205], [.300, .365], [.425, .505], [.570, .645], [.705, .775], [.815, .95], [.985, 1]] as const;
const UP = new Vector3(0, 1, 0);
export interface CinematicCameraSample { fov: number; altitudeKm: number; shot: number; screenX: number; screenY: number }
type Anchor = "flight" | "payload" | "inside" | "radio" | "power" | "recording";
interface Shot { anchor: Anchor; offset: [number, number, number]; fov: number; x: number; y: number }
const DESKTOP: Shot[] = [
  { anchor: "flight", offset: [6.7, 3.1, 16.6], fov: 32, x: .72, y: .54 },
  { anchor: "flight", offset: [7.6, 2.5, 15.4], fov: 33, x: .35, y: .50 },
  { anchor: "payload", offset: [.98, .58, 1.38], fov: 34, x: .68, y: .53 },
  { anchor: "inside", offset: [.78, .70, 1.22], fov: 37, x: .66, y: .55 },
  { anchor: "radio", offset: [-2.5, 1.3, 4.2], fov: 35, x: .68, y: .54 },
  { anchor: "power", offset: [.70, .56, 1.04], fov: 37, x: .66, y: .55 },
  { anchor: "recording", offset: [62, 24, 10], fov: 35, x: .65, y: .43 },
  { anchor: "flight", offset: [7.8, 3.2, 18], fov: 34, x: .71, y: .53 },
];
const MOBILE: Shot[] = [
  { anchor: "flight", offset: [5.1, 2.4, 18], fov: 40, x: .60, y: .62 },
  { anchor: "flight", offset: [6.5, 2.2, 17.5], fov: 40, x: .43, y: .43 },
  { anchor: "payload", offset: [1.05, .63, 1.70], fov: 43, x: .52, y: .64 },
  { anchor: "inside", offset: [.98, .90, 1.72], fov: 43, x: .50, y: .64 },
  { anchor: "radio", offset: [-2.8, 1.4, 5.4], fov: 43, x: .56, y: .64 },
  { anchor: "power", offset: [.98, .79, 1.58], fov: 43, x: .52, y: .63 },
  { anchor: "recording", offset: [62, 24, 10], fov: 43, x: .50, y: .465 },
  { anchor: "flight", offset: [5.2, 2.4, 18.3], fov: 41, x: .61, y: .60 },
];
const ease = (value: number) => { const t = MathUtils.clamp(value, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
export function storyFlightProgress(progress: number): number {
  const p = Number.isNaN(progress) ? 0 : MathUtils.clamp(progress, 0, 1);
  return .7 * ease(p / .26) + .3 * ease((p - .54) / .12);
}
function anchorPosition(kind: Anchor, f: number, pose: FlightDynamicsPose | undefined, out: Vector3) {
  if (kind === "recording") return out.set(0, 27.5, -25);
  if (kind === "flight") return pose ? out.copy(pose.midpoint) : out.set(0, 2.05 + 28 * f, 0);
  out.set(kind === "power" ? .155 : kind === "radio" ? -.20 : 0, kind === "inside" ? .13 : kind === "power" ? .10 : .035, kind === "power" ? -.025 : 0);
  if (pose) out.applyQuaternion(pose.payloadQuaternion).add(pose.payloadPosition);
  else out.y += 28 * f;
  return out;
}
/** One reversible camera journey through the same moving vehicle and its evidence. */
export function sampleCinematicCamera(
  progress: number, narrow: boolean, positionOut: Vector3, targetOut: Vector3,
  sampleOut: CinematicCameraSample = { fov: 32, altitudeKm: 8, shot: 0, screenX: .72, screenY: .54 },
  pose?: FlightDynamicsPose, scratch: Vector3 = new Vector3(),
): CinematicCameraSample {
  const p = Number.isNaN(progress) ? 0 : MathUtils.clamp(progress, 0, 1), shots = narrow ? MOBILE : DESKTOP, f = storyFlightProgress(p);
  let fromIndex = shots.length - 1, toIndex = fromIndex, blend = 0;
  for (let i = 0; i < HOLDS.length - 1; i++) {
    if (p <= HOLDS[i][1]) { fromIndex = toIndex = i; break; }
    if (p < HOLDS[i + 1][0]) { fromIndex = i; toIndex = i + 1; blend = ease((p - HOLDS[i][1]) / (HOLDS[i + 1][0] - HOLDS[i][1])); break; }
  }
  const from = shots[fromIndex], to = shots[toIndex];
  anchorPosition(from.anchor, f, pose, targetOut);
  anchorPosition(to.anchor, f, pose, scratch);
  targetOut.lerp(scratch, blend);
  positionOut.set(MathUtils.lerp(from.offset[0], to.offset[0], blend), MathUtils.lerp(from.offset[1], to.offset[1], blend), MathUtils.lerp(from.offset[2], to.offset[2], blend)).add(targetOut);
  const orbitWeight = ease((p - .775) / .04) * (1 - ease((p - .95) / .035));
  const yaw = (ease(recordingPhase(p)) - .5) * .5 * orbitWeight;
  positionOut.sub(targetOut).applyAxisAngle(UP, yaw).add(targetOut);
  sampleOut.fov = MathUtils.lerp(from.fov, to.fov, blend);
  sampleOut.screenX = MathUtils.lerp(from.x, to.x, blend);
  sampleOut.screenY = MathUtils.lerp(from.y, to.y, blend);
  sampleOut.altitudeKm = 8 + f * 22;
  sampleOut.shot = blend < .5 ? fromIndex : toIndex;
  return sampleOut;
}
