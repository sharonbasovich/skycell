import { useEffect, useMemo, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferGeometry, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, LineBasicMaterial, LineSegments, MathUtils, Matrix4, Mesh, MeshBasicMaterial, Quaternion, RingGeometry, SphereGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ProcessedTrajectoryData } from "../../utils/csvDataUtils";
import type { CinematicFrame } from "./cinematicTypes";
import { buildRecordingGeometry, RECORDING_ORIGIN } from "./recordingGeometry";
import { createRecordingPlaybackSample, recordingPhase, sampleRecordingPlayback } from "./recordingPlayback";

interface Props {
  frame: MutableRefObject<CinematicFrame>;
  data: ProcessedTrajectoryData | null;
  /** Kept optional for consumers migrating from the former observation slider. */
  selected?: number;
}

/** Every tube vertex also stores its relative archive time for scroll reveal. */
function buildTimeTubes(positions: Float32Array, pairs: [number, number][], data: ProcessedTrajectoryData, radius: number): BufferGeometry {
  const cylinder = new CylinderGeometry(radius, radius, 1, 6, 1, true);
  const pieces: BufferGeometry[] = [];
  const start = new Vector3(), end = new Vector3(), direction = new Vector3();
  const midpoint = new Vector3(), scale = new Vector3(), up = new Vector3(0, 1, 0);
  const rotation = new Quaternion(), transform = new Matrix4();
  const firstTime = data.points[0].timestamp;
  const duration = data.points[data.points.length - 1].timestamp - firstTime || 1;
  for (let index = 0; index < pairs.length; index++) {
    const offset = index * 6;
    start.fromArray(positions, offset); end.fromArray(positions, offset + 3);
    direction.subVectors(end, start);
    const length = direction.length();
    if (length < 1e-8) continue;
    direction.multiplyScalar(1 / length);
    midpoint.addVectors(start, end).multiplyScalar(.5);
    rotation.setFromUnitVectors(up, direction);
    transform.compose(midpoint, rotation, scale.set(1, length, 1));
    const piece = cylinder.clone(), vertices = piece.getAttribute("position");
    const times = new Float32Array(vertices.count);
    const from = (data.points[pairs[index][0]].timestamp - firstTime) / duration;
    const to = (data.points[pairs[index][1]].timestamp - firstTime) / duration;
    for (let vertex = 0; vertex < times.length; vertex++) times[vertex] = MathUtils.lerp(from, to, vertices.getY(vertex) + .5);
    piece.setAttribute("pathTime", new Float32BufferAttribute(times, 1));
    pieces.push(piece.applyMatrix4(transform));
  }
  cylinder.dispose();
  if (!pieces.length) return new BufferGeometry();
  const merged = mergeGeometries(pieces, false) ?? new BufferGeometry();
  for (const piece of pieces) piece.dispose();
  return merged;
}

/** MeshBasic keeps renderer colour-space handling; only its alpha is scrubbed. */
function replayMaterial(color: string, phase: { value: number }): MeshBasicMaterial {
  const material = new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  material.onBeforeCompile = shader => {
    shader.uniforms.uReplayPhase = phase;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float pathTime;\nvarying float vPathTime;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvPathTime = pathTime;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uReplayPhase;\nvarying float vPathTime;")
      .replace("#include <alphatest_fragment>", "diffuseColor.a *= 1.0 - smoothstep(uReplayPhase - .002, uReplayPhase + .002, vPathTime);\nif (diffuseColor.a < .001) discard;\n#include <alphatest_fragment>");
  };
  material.customProgramCacheKey = () => "skycell-scroll-trajectory-v1";
  return material;
}

/** Continuous estimated replay, with actual fixes and gap joins still distinct. */
export default function RecordedTrajectory({ frame, data }: Props) {
  const invalidate = useThree(state => state.invalidate);
  const resources = useMemo(() => {
    if (!data?.points.length) return null;
    const recording = buildRecordingGeometry(data), phase = { value: 0 };
    const completeGeometry = buildTimeTubes(recording.completeSegmentPositions, recording.completePairs, data, .065);
    const measuredGeometry = buildTimeTubes(recording.segmentPositions, recording.pairs, data, .075);
    const estimatedGeometry = buildTimeTubes(recording.estimatedSegmentPositions, recording.estimatedPairs, data, .065);
    const groundGeometry = new BufferGeometry();
    groundGeometry.setAttribute("position", new Float32BufferAttribute(recording.completeGroundPositions, 3));
    const pointGeometry = new SphereGeometry(.065, 8, 6);
    const stemGeometry = new CylinderGeometry(.013, .013, 1, 6, 1, true);
    const ringGeometry = new RingGeometry(.12, .18, 24);
    const fullMaterial = new MeshBasicMaterial({ color: "#d1edfa", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const measuredMaterial = replayMaterial("#d5fcff", phase);
    const estimateBaseMaterial = new MeshBasicMaterial({ color: "#f5c38c", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const estimatedMaterial = replayMaterial("#ffcf97", phase);
    const pointMaterial = new MeshBasicMaterial({ color: "#d7f7ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const groundMaterial = new LineBasicMaterial({ color: "#92c6df", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const stemMaterial = new MeshBasicMaterial({ color: "#d5f7ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const ringMaterial = new MeshBasicMaterial({ color: "#b9f1ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: DoubleSide });
    const group = new Group();
    group.name = "APEX-2-T scroll replay with estimated reception gaps";
    group.userData = { observations: recording.pointCount, estimatedJoins: recording.estimatedPairs.length, selectedIndex: 0 };
    const full = new Mesh(completeGeometry, fullMaterial);
    const measured = new Mesh(measuredGeometry, measuredMaterial);
    const estimateBase = new Mesh(estimatedGeometry, estimateBaseMaterial);
    const estimated = new Mesh(estimatedGeometry, estimatedMaterial);
    const ground = new LineSegments(groundGeometry, groundMaterial);
    full.visible = ground.visible = recording.completePairs.length > 0;
    measured.visible = recording.pairs.length > 0;
    estimateBase.visible = estimated.visible = recording.estimatedPairs.length > 0;
    const points = new InstancedMesh(pointGeometry, pointMaterial, recording.pointCount), matrix = new Matrix4();
    for (let index = 0; index < recording.pointCount; index++) {
      matrix.makeTranslation(recording.positions[index * 3], recording.positions[index * 3 + 1], recording.positions[index * 3 + 2]);
      points.setMatrixAt(index, matrix);
    }
    points.instanceMatrix.needsUpdate = true;
    const stem = new Mesh(stemGeometry, stemMaterial), ring = new Mesh(ringGeometry, ringMaterial);
    stem.name = "Replay position ground projection";
    ring.rotation.x = -Math.PI / 2;
    ground.renderOrder = 2;
    full.renderOrder = estimateBase.renderOrder = 3;
    measured.renderOrder = estimated.renderOrder = points.renderOrder = 4;
    stem.renderOrder = ring.renderOrder = 5;
    group.add(ground, full, estimateBase, measured, estimated, points, stem, ring);
    group.visible = false;
    return {
      recording, group, points, stem, ring, phase, sample: createRecordingPlaybackSample(), data,
      fullMaterial, measuredMaterial, estimateBaseMaterial, estimatedMaterial, pointMaterial, groundMaterial, stemMaterial, ringMaterial,
      geometries: [completeGeometry, measuredGeometry, estimatedGeometry, groundGeometry, pointGeometry, stemGeometry, ringGeometry],
      materials: [fullMaterial, measuredMaterial, estimateBaseMaterial, estimatedMaterial, pointMaterial, groundMaterial, stemMaterial, ringMaterial],
    };
  }, [data]);

  useEffect(() => { invalidate(); }, [resources, invalidate]);
  useEffect(() => () => {
    if (!resources) return;
    resources.points.dispose();
    for (const geometry of resources.geometries) geometry.dispose();
    for (const material of resources.materials) material.dispose();
  }, [resources]);

  useFrame(() => {
    if (!resources) return;
    const progress = frame.current.progress;
    const opacity = MathUtils.smoothstep(progress, .795, .815) * (1 - MathUtils.smoothstep(progress, .955, .975));
    resources.group.visible = opacity > .001;
    if (!resources.group.visible) return;
    const phase = recordingPhase(progress), sample = sampleRecordingPlayback(resources.data, phase, resources.sample);
    resources.phase.value = phase;
    resources.fullMaterial.opacity = opacity * .50;
    resources.measuredMaterial.opacity = opacity * .95;
    resources.estimateBaseMaterial.opacity = opacity * .65;
    resources.estimatedMaterial.opacity = opacity * .97;
    resources.pointMaterial.opacity = opacity * .50;
    resources.groundMaterial.opacity = opacity * .20;
    resources.stemMaterial.opacity = opacity * .40;
    resources.ringMaterial.opacity = opacity * .60;
    const { x, y, z } = sample.position;
    resources.group.userData.selectedIndex = sample.observationIndex;
    resources.group.userData.replayPhase = phase;
    resources.group.userData.estimated = sample.estimated;
    resources.ring.position.set(x, RECORDING_ORIGIN[1] + .015, z);
    resources.stem.position.set(x, (y + RECORDING_ORIGIN[1]) / 2, z);
    resources.stem.scale.set(1, Math.max(.001, Math.abs(y - RECORDING_ORIGIN[1])), 1);
  });

  return resources ? <primitive object={resources.group} dispose={null} /> : null;
}
