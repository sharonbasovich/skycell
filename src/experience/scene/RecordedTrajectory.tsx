import { useEffect, useMemo, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, InstancedMesh, LineBasicMaterial, LineSegments, MathUtils, Matrix4, Mesh, MeshBasicMaterial, Quaternion, RingGeometry, SphereGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ProcessedTrajectoryData } from "../../utils/csvDataUtils";
import type { CinematicFrame } from "./cinematicTypes";
import { buildRecordingGeometry, RECORDING_ORIGIN } from "./recordingGeometry";

interface Props {
  frame: MutableRefObject<CinematicFrame>;
  data: ProcessedTrajectoryData | null;
  selected: number;
}

/** Straight cylinders join only adjacent received fixes; never spline a gap. */
function buildConnectedTubes(positions: Float32Array, radius: number): BufferGeometry {
  const cylinder = new CylinderGeometry(radius, radius, 1, 6, 1, true);
  const pieces: BufferGeometry[] = [];
  const start = new Vector3(), end = new Vector3(), direction = new Vector3();
  const midpoint = new Vector3(), scale = new Vector3(), up = new Vector3(0, 1, 0);
  const rotation = new Quaternion(), transform = new Matrix4();
  for (let index = 0; index < positions.length; index += 6) {
    start.fromArray(positions, index);
    end.fromArray(positions, index + 3);
    direction.subVectors(end, start);
    const length = direction.length();
    if (length < 1e-8) continue;
    direction.multiplyScalar(1 / length);
    midpoint.addVectors(start, end).multiplyScalar(.5);
    rotation.setFromUnitVectors(up, direction);
    transform.compose(midpoint, rotation, scale.set(1, length, 1));
    pieces.push(cylinder.clone().applyMatrix4(transform));
  }
  cylinder.dispose();
  if (!pieces.length) return new BufferGeometry();
  const merged = mergeGeometries(pieces, false) ?? new BufferGeometry();
  for (const piece of pieces) piece.dispose();
  return merged;
}

/** An explanatory 3D view of actual archive coordinates, uniformly scaled. */
export default function RecordedTrajectory({ frame, data, selected }: Props) {
  const invalidate = useThree(state => state.invalidate);
  const resources = useMemo(() => {
    if (!data?.points.length) return null;
    const recording = buildRecordingGeometry(data);
    const coreGeometry = buildConnectedTubes(recording.segmentPositions, .075);
    const haloGeometry = buildConnectedTubes(recording.segmentPositions, .12);
    const groundGeometry = new BufferGeometry();
    groundGeometry.setAttribute("position", new Float32BufferAttribute(recording.groundPositions, 3));
    const pointGeometry = new SphereGeometry(.09, 8, 6);
    const markerGeometry = new SphereGeometry(.20, 16, 12);
    const auraGeometry = new SphereGeometry(.30, 16, 12);
    const stemGeometry = new CylinderGeometry(.018, .018, 1, 6, 1, true);
    const ringGeometry = new RingGeometry(.13, .20, 24);
    const coreMaterial = new MeshBasicMaterial({ color: "#d5fcff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const haloMaterial = new MeshBasicMaterial({ color: "#43dff2", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: AdditiveBlending });
    const pointMaterial = new MeshBasicMaterial({ color: "#b4f6ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const groundMaterial = new LineBasicMaterial({ color: "#92d9ec", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const markerMaterial = new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const auraMaterial = new MeshBasicMaterial({ color: "#4be7ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: AdditiveBlending });
    const stemMaterial = new MeshBasicMaterial({ color: "#d5f7ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const ringMaterial = new MeshBasicMaterial({ color: "#a9f2ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: DoubleSide });
    const group = new Group();
    group.name = "Actual partial APEX-2-T recording";
    group.userData = { observations: recording.pointCount, receptionGaps: recording.gapCount, selectedIndex: 0 };
    const core = new Mesh(coreGeometry, coreMaterial);
    const halo = new Mesh(haloGeometry, haloMaterial);
    const ground = new LineSegments(groundGeometry, groundMaterial);
    core.visible = halo.visible = ground.visible = recording.pairs.length > 0;
    const points = new InstancedMesh(pointGeometry, pointMaterial, recording.pointCount);
    const matrix = new Matrix4();
    for (let index = 0; index < recording.pointCount; index++) {
      matrix.makeTranslation(recording.positions[index * 3], recording.positions[index * 3 + 1], recording.positions[index * 3 + 2]);
      points.setMatrixAt(index, matrix);
    }
    points.instanceMatrix.needsUpdate = true;
    const marker = new Mesh(markerGeometry, markerMaterial);
    const aura = new Mesh(auraGeometry, auraMaterial);
    const stem = new Mesh(stemGeometry, stemMaterial);
    const ring = new Mesh(ringGeometry, ringMaterial);
    marker.name = "Selected recorded observation";
    stem.name = "Selected observation ground projection";
    ring.rotation.x = -Math.PI / 2;
    ground.renderOrder = 2;
    halo.renderOrder = 3;
    core.renderOrder = points.renderOrder = 4;
    stem.renderOrder = ring.renderOrder = 5;
    marker.renderOrder = aura.renderOrder = 6;
    group.add(ground, halo, core, points, stem, ring, aura, marker);
    group.visible = false;
    return {
      recording, group, points, marker, aura, stem, ring,
      coreMaterial, haloMaterial, pointMaterial, groundMaterial, markerMaterial, auraMaterial, stemMaterial, ringMaterial,
      geometries: [coreGeometry, haloGeometry, groundGeometry, pointGeometry, markerGeometry, auraGeometry, stemGeometry, ringGeometry],
      materials: [coreMaterial, haloMaterial, pointMaterial, groundMaterial, markerMaterial, auraMaterial, stemMaterial, ringMaterial],
    };
  }, [data]);

  useEffect(() => () => {
    if (!resources) return;
    resources.points.dispose();
    for (const geometry of resources.geometries) geometry.dispose();
    for (const material of resources.materials) material.dispose();
  }, [resources]);
  // The observation control stays responsive even when flight movement is
  // paused and the demand renderer has stopped its ambient loop.
  useEffect(() => { invalidate(); }, [selected, resources, invalidate]);

  useFrame(() => {
    if (!resources) return;
    const progress = frame.current.progress;
    const opacity = MathUtils.smoothstep(progress, .80, .825) * (1 - MathUtils.smoothstep(progress, .922, .935));
    resources.group.visible = opacity > .001;
    if (!resources.group.visible) return;
    resources.coreMaterial.opacity = opacity * .95;
    resources.haloMaterial.opacity = opacity * .16;
    resources.pointMaterial.opacity = opacity * .66;
    resources.groundMaterial.opacity = opacity * .23;
    resources.markerMaterial.opacity = opacity;
    resources.auraMaterial.opacity = opacity * .23;
    resources.stemMaterial.opacity = opacity * .32;
    resources.ringMaterial.opacity = opacity * .72;
    const index = Number.isFinite(selected) ? MathUtils.clamp(Math.trunc(selected), 0, resources.recording.pointCount - 1) : 0;
    const positions = resources.recording.positions;
    const x = positions[index * 3], y = positions[index * 3 + 1], z = positions[index * 3 + 2];
    resources.group.userData.selectedIndex = index;
    resources.marker.position.set(x, y, z);
    resources.aura.position.set(x, y, z);
    resources.ring.position.set(x, RECORDING_ORIGIN[1] + .015, z);
    resources.stem.position.set(x, (y + RECORDING_ORIGIN[1]) / 2, z);
    resources.stem.scale.set(1, Math.max(.001, Math.abs(y - RECORDING_ORIGIN[1])), 1);
  });

  return resources ? <primitive object={resources.group} dispose={null} /> : null;
}
