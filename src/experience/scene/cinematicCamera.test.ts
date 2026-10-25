import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Euler, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { parseCSVText } from "../../utils/csvDataUtils";
import { STORY_STOPS } from "../storyTiming";
import { createPayloadRevealAnchors, samplePayloadReveal, samplePayloadRevealAnchors } from "./PayloadReveal";
import { createFlightDynamicsPose, sampleFlightDynamics, type FlightDynamicsPose } from "./flightDynamics";
import { sampleCinematicCamera, storyFlightProgress, type CinematicCameraSample } from "./cinematicCamera";
import { buildRecordingGeometry } from "./recordingGeometry";

const VIEWPORTS = [[390, 844], [415, 582], [768, 1024], [1440, 900], [1272, 716]] as const;
const WIND_TIMES = [0, 1.7, 4.3, 8, 14, 23, 37];
const TRANSITIONS = [[.055, .125], [.205, .300], [.365, .425], [.505, .570], [.645, .705], [.775, .835], [.905, .965]] as const;

function actor(progress: number, time = 8) {
  return sampleFlightDynamics(storyFlightProgress(progress), time, createFlightDynamicsPose());
}
function portraitCamera(width: number, height: number) {
  return width <= 700 || width / height < .95;
}
function snapshot(progress: number, narrow: boolean, time = 8, pose = actor(progress, time)) {
  const position = new Vector3(), target = new Vector3();
  return { position, target, pose, ...sampleCinematicCamera(progress, narrow, position, target, undefined, pose) };
}
function projectedCamera(progress: number, width: number, height: number, time: number) {
  const pose = actor(progress, time), inspection = progress > .25 && progress < .80;
  // Match the renderer's small following delay, while detail views follow now.
  const sample = snapshot(progress, portraitCamera(width, height), time, actor(progress, Math.max(0, time - (inspection ? 0 : .32))));
  const camera = new PerspectiveCamera(sample.fov, width / height, .05, 160);
  camera.position.copy(sample.position); camera.lookAt(sample.target);
  camera.setViewOffset(width, height, -(sample.screenX - .5) * width, -(sample.screenY - .5) * height, width, height);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  return { camera, pose };
}
function boxPoints(min: [number, number, number], max: [number, number, number]): Vector3[] {
  const points: Vector3[] = [];
  for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) points.push(new Vector3(x, y, z));
  return points;
}
function payloadWorld(points: Vector3[], pose: FlightDynamicsPose) {
  return points.map(point => point.applyQuaternion(pose.payloadQuaternion).add(pose.payloadPosition));
}
function closedPayload(pose: FlightDynamicsPose, antenna = false) {
  const points = boxPoints([-.28, -.10, -.115], [.28, .185, .115]);
  if (antenna) points.push(...boxPoints([-.745, -.04, -.04], [-.28, .04, .04]));
  return payloadWorld(points, pose);
}
function fullTrain(pose: FlightDynamicsPose) {
  const points = closedPayload(pose, true);
  // A 0.94 m radius encloses the authored inflated/deformed envelope. Test its
  // silhouette, not merely whether the look-at point happens to be visible.
  for (let latitude = 0; latitude <= 12; latitude++) {
    const phi = Math.PI * latitude / 12;
    for (let longitude = 0; longitude < 24; longitude++) {
      const theta = 2 * Math.PI * longitude / 24;
      points.push(new Vector3(.94 * Math.sin(phi) * Math.cos(theta), .94 * Math.cos(phi), .94 * Math.sin(phi) * Math.sin(theta)).add(pose.balloonPosition));
    }
  }
  points.push(pose.neck.clone(), pose.loop.clone());
  return points;
}
function inspectionAssembly(progress: number, pose: FlightDynamicsPose) {
  const state = samplePayloadReveal(progress), anchors = samplePayloadRevealAnchors(progress, createPayloadRevealAnchors());
  const points = boxPoints([-.28, -.10, -.115], [.28, .07, .115]);
  const capRotation = new Quaternion().setFromEuler(new Euler(-.11 * state.open, 0, .025 * state.open));
  for (const point of boxPoints([-.278, .068, -.112], [.278, .097, .112])) {
    points.push(point.applyQuaternion(capRotation).add(new Vector3(0, .22 * state.open, -.11 * state.open)));
  }
  points.push(anchors.suspension.clone());
  for (const [role, width, depth, top] of [["compute", .164, .102, .026], ["radio", .065, .086, .015], ["power", .082, .061, .037], ["sensor", .045, .035, .013]] as const) {
    for (const point of boxPoints([-width / 2, -.003, -depth / 2], [width / 2, top, depth / 2])) points.push(point.add(anchors[role]));
  }
  return payloadWorld(points, pose);
}
function powerAssembly(progress: number, pose: FlightDynamicsPose) {
  const anchors = samplePayloadRevealAnchors(progress, createPayloadRevealAnchors());
  const points = boxPoints([-.041, -.003, -.031], [.041, .037, .031]).map(point => point.add(anchors.power));
  points.push(anchors.power.clone());
  return payloadWorld(points, pose);
}
function frameBounds(points: Vector3[], camera: PerspectiveCamera, width: number, height: number) {
  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity, near = Infinity, far = -Infinity;
  const projected = new Vector3();
  for (const point of points) {
    projected.copy(point).project(camera);
    const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    near = Math.min(near, projected.z); far = Math.max(far, projected.z);
  }
  return { left, right, top, bottom, near, far };
}

describe.each([false, true])("flight-to-payload camera (narrow=%s)", narrow => {
  it("keeps the full journey finite and clamps exceptional input to an endpoint", () => {
    const invalid = [];
    for (let i = 0; i <= 800; i++) {
      const sample = snapshot(i / 800, narrow, 13);
      if (![...sample.position.toArray(), ...sample.target.toArray(), sample.fov, sample.altitudeKm, sample.screenX, sample.screenY].every(Number.isFinite)
        || sample.position.distanceTo(sample.target) <= .6 || sample.fov <= 20 || sample.fov >= 55
        || sample.screenX <= .05 || sample.screenX >= .95 || sample.screenY <= .05 || sample.screenY >= .95
        || !(Number.isInteger(sample.shot) && sample.shot >= 0 && sample.shot < 8)) invalid.push({ progress: i / 800, sample });
    }
    expect(invalid).toEqual([]);
    for (const [exceptional, expected] of [[NaN, 0], [-Infinity, 0], [Infinity, 1], [-12, 0], [12, 1]]) {
      const sample = snapshot(exceptional, narrow), endpoint = snapshot(expected, narrow);
      expect(sample.position.toArray()).toEqual(endpoint.position.toArray()); expect(sample.target.toArray()).toEqual(endpoint.target.toArray());
      expect([sample.fov, sample.altitudeKm, sample.shot]).toEqual([endpoint.fov, endpoint.altitudeKm, endpoint.shot]);
    }
  });

  it("ascends 8–30 km and holds altitude through the hardware inspection", () => {
    let previous = 8, largestDrop = 0, minimum = Infinity, maximum = -Infinity;
    for (let i = 0; i <= 1000; i++) {
      const altitude = snapshot(i / 1000, narrow).altitudeKm;
      largestDrop = Math.max(largestDrop, previous - altitude);
      minimum = Math.min(minimum, altitude); maximum = Math.max(maximum, altitude);
      previous = altitude;
    }
    expect(largestDrop).toBeLessThanOrEqual(1e-10); expect(minimum).toBe(8); expect(maximum).toBe(30);
    expect(snapshot(0, narrow).altitudeKm).toBe(8); expect(snapshot(1, narrow).altitudeKm).toBe(30);
    const heldAltitude = snapshot(.27, narrow).altitudeKm;
    for (const progress of [.30, .335, .40, .465, .53]) expect(snapshot(progress, narrow).altitudeKm).toBe(heldAltitude);
  });

  it("follows the moving payload including its independent rotation", () => {
    for (const progress of [.335, .465, .605, .740]) {
      const before = snapshot(progress, narrow, 1), after = snapshot(progress, narrow, 11);
      expect(before.pose.payloadPosition.distanceTo(after.pose.payloadPosition)).toBeGreaterThan(.1);
      expect(before.target.distanceTo(after.target)).toBeGreaterThan(.1); expect(before.position.distanceTo(after.position)).toBeGreaterThan(.1);
      const localBefore = before.target.clone().sub(before.pose.payloadPosition).applyQuaternion(before.pose.payloadQuaternion.clone().invert());
      const localAfter = after.target.clone().sub(after.pose.payloadPosition).applyQuaternion(after.pose.payloadQuaternion.clone().invert());
      expect(localBefore.distanceTo(localAfter)).toBeLessThan(1e-12);
      expect(before.position.distanceTo(before.target)).toBeCloseTo(after.position.distanceTo(after.target), 10);
    }
    for (const progress of [0, .165, 1]) {
      const sample = snapshot(progress, narrow, 9);
      expect(sample.target.distanceTo(sample.pose.midpoint)).toBeLessThan(1e-12);
    }
  });

  it("enters the payload, follows radio and power, then returns to the flight", () => {
    const distances = STORY_STOPS.map(progress => { const sample = snapshot(progress, narrow); return sample.position.distanceTo(sample.target); });
    expect(distances[2]).toBeLessThan(distances[0] * .20); expect(distances[3]).toBeLessThan(3);
    expect(distances[4]).toBeGreaterThan(distances[2] * 2); expect(distances[4]).toBeLessThan(distances[0] * .60);
    expect(distances[5]).toBeLessThan(distances[4] * .50);
    expect(distances[6]).toBeGreaterThan(distances[0] * 1.8); expect(distances[7]).toBeLessThan(distances[6] * .70);
    expect(distances[7]).toBeGreaterThan(distances[2] * 5);
    STORY_STOPS.forEach((progress, index) => expect(snapshot(progress, narrow).shot).toBe(index));
  });

  it("joins reading holds with zero camera endpoint velocity and acceleration", () => {
    // Keep the actor fixed to isolate choreography from actual wind motion.
    const pose = actor(.465, 8);
    for (const [start, end] of TRANSITIONS) for (const [boundary, direction] of [[start, 1], [end, -1]]) {
      const center = snapshot(boundary, narrow, 8, pose);
      const before = snapshot(boundary - 1e-6, narrow, 8, pose), after = snapshot(boundary + 1e-6, narrow, 8, pose);
      expect(before.position.distanceTo(after.position)).toBeLessThan(1e-7); expect(before.target.distanceTo(after.target)).toBeLessThan(1e-7);
      for (const field of ["fov", "screenX", "screenY"] as const) expect(Math.abs(before[field] - after[field])).toBeLessThan(1e-8);
      const fine = center.position.distanceTo(snapshot(boundary + direction * .00005, narrow, 8, pose).position);
      const coarse = center.position.distanceTo(snapshot(boundary + direction * .00010, narrow, 8, pose).position);
      expect(fine / coarse).toBeCloseTo(.125, 2);
    }
  });

  it("reverses identical poses and reuses caller storage", () => {
    const forward = Array.from({ length: 161 }, (_, index) => snapshot(index / 160, narrow, 17));
    for (let i = forward.length - 1; i >= 0; i--) {
      snapshot((i * .379) % 1, !narrow, 3);
      const reverse = snapshot(i / 160, narrow, 17);
      expect(reverse.position.toArray()).toEqual(forward[i].position.toArray()); expect(reverse.target.toArray()).toEqual(forward[i].target.toArray());
      for (const field of ["fov", "altitudeKm", "screenX", "screenY", "shot"] as const) expect(reverse[field]).toBe(forward[i][field]);
    }
    const position = new Vector3(), target = new Vector3(), scratch = new Vector3();
    const state: CinematicCameraSample = { fov: 0, altitudeKm: 0, shot: -1, screenX: 0, screenY: 0 };
    expect(sampleCinematicCamera(.465, narrow, position, target, state, actor(.465), scratch)).toBe(state);
    expect([position, target, scratch].every(vector => vector.toArray().every(Number.isFinite))).toBe(true);
  });
});

describe.each(VIEWPORTS)("subject framing at %ix%i", (width, height) => {
  // Camera composition follows aspect ratio; the page header remains governed
  // by its CSS width breakpoint, so a portrait tablet still reserves 75 px.
  const header = width <= 700 ? 67 : 75;
  function frameFailures(progress: number, points: (pose: FlightDynamicsPose) => Vector3[]) {
    const failures = [];
    for (const time of WIND_TIMES) {
      const { camera, pose } = projectedCamera(progress, width, height, time), bounds = frameBounds(points(pose), camera, width, height);
      if (!(bounds.left > 8 && bounds.right < width - 8 && bounds.top > header + 8 && bounds.bottom < height - 8 && bounds.near > -1 && bounds.far < 1)) {
        failures.push({ progress, time, bounds, required: { left: 8, right: width - 8, top: header + 8, bottom: height - 8, near: -1, far: 1 } });
      }
    }
    return failures;
  }
  it("shows the entire wind-led train and antenna at flight reading stops", () => {
    expect([0, .165, 1].flatMap(progress => frameFailures(progress, fullTrain))).toEqual([]);
  });
  it("frames the full enclosure and cutaway, then the selected power component", () => {
    const closed = frameFailures(.335, pose => closedPayload(pose));
    const opened = frameFailures(.465, pose => inspectionAssembly(.465, pose));
    // Case/lid crop is intentional here: the preceding two chapters already
    // establish them, and this shot moves into the power assembly itself.
    const power = frameFailures(.740, pose => powerAssembly(.740, pose));
    expect([...closed, ...opened, ...power]).toEqual([]);
  });
});

describe("recording stays between the heading and its native controls", () => {
  const archive = parseCSVText(readFileSync(new URL("../../../public/data.csv", import.meta.url), "utf8"));
  const recording = buildRecordingGeometry(archive);
  const paddedPoints: Vector3[] = [];
  // Include every real fix and each connected ground-trace endpoint. An
  // axis-aligned ±0.35 envelope also covers marker/halo thickness in any view.
  for (const positions of [recording.positions, recording.groundPositions]) {
    for (let index = 0; index < positions.length; index += 3) {
      for (const x of [-.35, .35]) for (const y of [-.35, .35]) for (const z of [-.35, .35]) {
        paddedPoints.push(new Vector3(positions[index] + x, positions[index + 1] + y, positions[index + 2] + z));
      }
    }
  }
  it.each([[390, 844], [415, 582], [360, 780], [1440, 900], [1272, 716]])("keeps all 125 fixes and the ground trace clear at %ix%i", (width, height) => {
    expect(recording.pointCount).toBe(125);
    const narrow = width <= 700, header = narrow ? 67 : 75, sample = snapshot(.87, portraitCamera(width, height));
    const required = {
      left: narrow ? 16 : width * .49,
      right: width - 16,
      top: narrow ? height < 650 ? 170 : 200 : header + 28,
      bottom: narrow ? height < 650 ? 375 : height - 224 : height * .68,
    };
    const failures = [];
    for (const orbitX of [-2, 0, 2]) {
      const camera = new PerspectiveCamera(sample.fov, width / height, .05, 160);
      camera.position.copy(sample.position); camera.position.x += orbitX; camera.lookAt(sample.target);
      camera.setViewOffset(width, height, -(sample.screenX - .5) * width, -(sample.screenY - .5) * height, width, height);
      camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      const bounds = frameBounds(paddedPoints, camera, width, height);
      if (!(bounds.left >= required.left && bounds.right <= required.right && bounds.top >= required.top && bounds.bottom <= required.bottom && bounds.near > -1 && bounds.far < 1)) {
        failures.push({ orbitX, bounds, required });
      }
    }
    expect(failures).toEqual([]);
  });
});
