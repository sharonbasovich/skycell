import { MathUtils, Quaternion, Vector3 } from "three";

export const FLIGHT_TETHER_LENGTH = 2.947;
export const FLIGHT_RISE_METRES = 28;
const NECK_LOCAL = new Vector3(0, -.97, 0);
const LOOP_LOCAL = new Vector3(-.03, .183, -.018);
const GRAVITY = 9.81;
const NATURAL_FREQUENCY = Math.sqrt(GRAVITY / FLIGHT_TETHER_LENGTH);
const DAMPING_RATIO = .23;
const AIR_DRAG = .92;
const MAX_HORIZONTAL_OFFSET = 1.35;
const MAX_SCROLL_OFFSET = .90;
const SCROLL_RESPONSE_FREQUENCY = 3.4;
const SCROLL_RESPONSE_DAMPING = .62;

// Independent wind components, in metres/radians per second. Their frequencies
// straddle the slower envelope response and the suspension's ~3.45 s period.
// The payload response below is solved from this SAME forcing, not a second
// arbitrary animation curve that happens to have a different phase.
const WIND_X = [[.72, .78, .2], [.25, 1.28, 1.3], [.13, 1.87, 2.7]] as const;
const WIND_Z = [[.50, .62, .9], [.19, 1.12, 2.1], [.10, 1.64, .4]] as const;

export interface FlightDynamicsPose {
  balloonPosition: Vector3;
  payloadPosition: Vector3;
  balloonQuaternion: Quaternion;
  payloadQuaternion: Quaternion;
  balloonScale: Vector3;
  /** Actual balloon neck and closed payload suspension attachment in metres. */
  neck: Vector3;
  loop: Vector3;
  tetherDirection: Vector3;
  midpoint: Vector3;
  /** Wind plus nominal along-route velocity, not recorded flight telemetry. */
  travelVelocity: Vector3;
  /** Scratch storage owned by this output, never shared between scene instances. */
  scratch: Vector3;
}

export function createFlightDynamicsPose(): FlightDynamicsPose {
  return {
    balloonPosition: new Vector3(), payloadPosition: new Vector3(),
    balloonQuaternion: new Quaternion(), payloadQuaternion: new Quaternion(),
    balloonScale: new Vector3(1, 1, 1), neck: new Vector3(), loop: new Vector3(),
    tetherDirection: new Vector3(0, 1, 0), midpoint: new Vector3(),
    travelVelocity: new Vector3(), scratch: new Vector3(),
  };
}

/** A small, instance-owned suspension response to the operated camera crossing.
 * `screenX` is the balloon's intended composition coordinate, not raw wheel
 * input. It therefore responds equally to touch, keyboard and reverse scroll.
 */
export interface ScrollSuspension {
  offset: Vector3;
  offsetVelocity: Vector3;
  target: Vector3;
  acceleration: Vector3;
  right: Vector3;
  previousScreenX: number;
  screenVelocity: number;
  initialized: boolean;
}

export function createScrollSuspension(): ScrollSuspension {
  return {
    offset: new Vector3(), offsetVelocity: new Vector3(), target: new Vector3(), acceleration: new Vector3(), right: new Vector3(1, 0, 0),
    previousScreenX: .5, screenVelocity: 0, initialized: false,
  };
}

/**
 * A damped, bounded payload follow-through driven by the envelope's visible
 * lateral travel. The envelope remains the leader; this relative offset is
 * projected onto the exact tether by sampleFlightDynamics. Pass dt=0 when
 * paused/hidden so both the displacement and its stored velocity freeze.
 * Reuse one state per scene. No scene-global clock, objects or allocations.
 */
export function stepScrollSuspension(state: ScrollSuspension, screenX: number, worldRight: Vector3, seconds: number, enabled = true): Vector3 {
  const coordinate = Number.isFinite(screenX) ? MathUtils.clamp(screenX, 0, 1) : state.previousScreenX;
  if (!state.initialized) {
    state.previousScreenX = coordinate;
    state.initialized = true;
  }
  if (!(seconds > 0) || !Number.isFinite(seconds)) return state.offset;
  const dt = Math.min(seconds, .04);
  // A resumed tab or a direct anchor seek cannot inject an unbounded force.
  const velocity = enabled ? MathUtils.clamp((coordinate - state.previousScreenX) / dt, -2.4, 2.4) : 0;
  state.previousScreenX = coordinate;
  state.screenVelocity = MathUtils.damp(state.screenVelocity, velocity, 12, dt);
  if (Number.isFinite(worldRight.x) && Number.isFinite(worldRight.z) && Math.hypot(worldRight.x, worldRight.z) > 1e-8) {
    state.right.set(worldRight.x, 0, worldRight.z).normalize();
  }
  state.target.copy(state.right).multiplyScalar(-MAX_SCROLL_OFFSET * Math.tanh(state.screenVelocity * 6.0));
  // Substeps keep a dropped frame and an abrupt reversed gesture stable. This
  // is a suspension state only: the camera itself receives no second filter.
  const steps = Math.ceil(dt / (1 / 120)), h = dt / steps;
  const stiffness = SCROLL_RESPONSE_FREQUENCY * SCROLL_RESPONSE_FREQUENCY;
  const damping = 2 * SCROLL_RESPONSE_DAMPING * SCROLL_RESPONSE_FREQUENCY;
  for (let step = 0; step < steps; step++) {
    state.acceleration.copy(state.target).sub(state.offset).multiplyScalar(stiffness).addScaledVector(state.offsetVelocity, -damping);
    state.offsetVelocity.addScaledVector(state.acceleration, h);
    state.offset.addScaledVector(state.offsetVelocity, h);
    const length = state.offset.length();
    if (length > MAX_SCROLL_OFFSET) {
      state.offset.multiplyScalar(MAX_SCROLL_OFFSET / length);
      // Remove only outward velocity at the stop, preserving the tangent.
      const outwardSpeed = state.offsetVelocity.dot(state.offset) / MAX_SCROLL_OFFSET;
      if (outwardSpeed > 0) state.offsetVelocity.addScaledVector(state.offset, -outwardSpeed / MAX_SCROLL_OFFSET);
    }
  }
  return state.offset;
}

function setEulerXYZ(quaternion: Quaternion, x: number, y: number, z: number) {
  const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
  quaternion.set(s1 * c2 * c3 + c1 * s2 * s3,
    c1 * s2 * c3 - s1 * c2 * s3,
    c1 * c2 * s3 + s1 * s2 * c3,
    c1 * c2 * c3 - s1 * s2 * s3);
}

function routeX(progress: number) { return 2.2 * Math.sin(progress * Math.PI * 1.6) + 1.4 * progress; }
function routeZ(progress: number) { return 1.2 * Math.sin(progress * Math.PI * 2) + .8 * progress; }

/**
 * Exact steady harmonic solution of the linear damped suspension equation:
 * r'' + 2 ζω r' + ω² r = -b'' - k_air b'.
 * b is the envelope's wind displacement and r is the payload's relative
 * displacement. The velocity term produces aerodynamic trailing; the natural
 * frequency produces a distinct pendular follow-through around a turn.
 * Geometry then projects this approximation onto an exact taut 3D tether.
 */
function relativeResponse(amplitude: number, frequency: number, phase: number) {
  const a = NATURAL_FREQUENCY * NATURAL_FREQUENCY - frequency * frequency;
  const b = 2 * DAMPING_RATIO * NATURAL_FREQUENCY * frequency;
  const denominator = a * a + b * b;
  const sine = amplitude * (a * frequency * frequency - b * AIR_DRAG * frequency) / denominator;
  const cosine = -amplitude * (b * frequency * frequency + a * AIR_DRAG * frequency) / denominator;
  return sine * Math.sin(phase) + cosine * Math.cos(phase);
}

/**
 * Deterministic local flight performance, in metres. `progress` is the physical
 * ascent coordinate, separate from narrative/inspection progress. No wall clock
 * or stateful integrator means pause, reverse, camera and rig share one pose.
 * This is an illustrative reduced-order wind/suspension model, not telemetry.
 * Reuse `out` during live rendering to avoid per-frame object allocation.
 */
export function sampleFlightDynamics(progress: number, elapsedSeconds: number, out: FlightDynamicsPose = createFlightDynamicsPose(), scrollOffset?: Vector3): FlightDynamicsPose {
  const p = Number.isFinite(progress) ? MathUtils.clamp(progress, 0, 1) : progress === Infinity ? 1 : 0;
  const time = Number.isFinite(elapsedSeconds) ? MathUtils.clamp(elapsedSeconds, 0, 1e6) : 0;
  const scrollX = scrollOffset && Number.isFinite(scrollOffset.x) ? MathUtils.clamp(scrollOffset.x, -MAX_SCROLL_OFFSET, MAX_SCROLL_OFFSET) : 0;
  const scrollZ = scrollOffset && Number.isFinite(scrollOffset.z) ? MathUtils.clamp(scrollOffset.z, -MAX_SCROLL_OFFSET, MAX_SCROLL_OFFSET) : 0;
  const routePhase = p * Math.PI * 1.4;
  let windX = 0, windZ = 0, velocityX = 0, velocityZ = 0, relativeX = 0, relativeZ = 0;
  for (const [amplitude, frequency, phase] of WIND_X) {
    const angle = frequency * time + phase + routePhase;
    windX += amplitude * Math.sin(angle);
    velocityX += amplitude * frequency * Math.cos(angle);
    relativeX += relativeResponse(amplitude, frequency, angle);
  }
  for (const [amplitude, frequency, phase] of WIND_Z) {
    const angle = frequency * time + phase + routePhase * .72;
    windZ += amplitude * Math.sin(angle);
    velocityZ += amplitude * frequency * Math.cos(angle);
    relativeZ += relativeResponse(amplitude, frequency, angle);
  }
  const rise = FLIGHT_RISE_METRES * p;
  const heave = .13 * Math.sin(.80 * time + routePhase) + .055 * Math.sin(.39 * time + 1.1);
  out.balloonPosition.set(routeX(p) + windX, 4.1 + rise + heave, routeZ(p) + windZ);

  // The large, light envelope banks into the air first. The denser enclosure's
  // slower yaw and hanging attitude below remain visibly independent of it.
  setEulerXYZ(out.balloonQuaternion,
    .09 * velocityZ + .018 * Math.sin(.47 * time),
    .20 * Math.sin(.19 * time + routePhase * .6) + .08 * Math.sin(routePhase),
    -.12 * velocityX + .035 * Math.sin(.31 * time + routePhase));
  const growth = 1 + .08 * MathUtils.smoothstep(p, 0, 1);
  const breath = .0055 * Math.sin(.91 * time + routePhase * .8);
  out.balloonScale.set(growth * (1 + breath), growth / ((1 + breath) * (1 + breath)), growth * (1 + breath));
  out.neck.copy(NECK_LOCAL).multiply(out.balloonScale).applyQuaternion(out.balloonQuaternion).add(out.balloonPosition);

  // Along the curved route the suspended mass occupies an earlier point. This
  // path-history term carries its lag around bends, rather than translating the
  // entire train as a flat cutout. Harmonic suspension response adds wind-driven
  // overshoot even when the reader holds scroll progress still.
  const laggedProgress = Math.max(0, p - .043);
  relativeX += routeX(laggedProgress) - routeX(p);
  relativeZ += routeZ(laggedProgress) - routeZ(p);
  relativeX += scrollX;
  relativeZ += scrollZ;
  const horizontalLength = Math.hypot(relativeX, relativeZ);
  const maximumOffset = MAX_HORIZONTAL_OFFSET + Math.min(.35, Math.hypot(scrollX, scrollZ) * .4);
  const saturation = horizontalLength > 1e-8 ? maximumOffset * Math.tanh(horizontalLength / maximumOffset) / horizontalLength : 1;
  relativeX *= saturation;
  relativeZ *= saturation;
  const drop = Math.sqrt(FLIGHT_TETHER_LENGTH * FLIGHT_TETHER_LENGTH - relativeX * relativeX - relativeZ * relativeZ);
  out.loop.copy(out.neck).add(out.scratch.set(relativeX, -drop, relativeZ));
  setEulerXYZ(out.payloadQuaternion,
    -.35 * Math.atan2(relativeZ, drop) + .025 * Math.sin(1.11 * time + routePhase - .8),
    .17 * Math.sin(.27 * time + routePhase * .6 - .85) + .035 * Math.sin(.83 * time),
    .35 * Math.atan2(relativeX, drop) + .035 * Math.sin(1.05 * time + routePhase - 1.1));
  out.payloadPosition.copy(out.loop).sub(out.scratch.copy(LOOP_LOCAL).applyQuaternion(out.payloadQuaternion));
  out.tetherDirection.subVectors(out.neck, out.loop).normalize();
  out.midpoint.addVectors(out.balloonPosition, out.payloadPosition).multiplyScalar(.5);
  out.travelVelocity.set(velocityX + (2.2 * Math.PI * 1.6 * Math.cos(p * Math.PI * 1.6) + 1.4) / 48,
    FLIGHT_RISE_METRES / 48 + .104 * Math.cos(.8 * time + routePhase) + .02145 * Math.cos(.39 * time + 1.1),
    velocityZ + (1.2 * Math.PI * 2 * Math.cos(p * Math.PI * 2) + .8) / 48);
  return out;
}
