import { describe, expect, it, vi } from "vitest";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { createPayloadReveal, createPayloadRevealAnchors, samplePayloadReveal, samplePayloadRevealAnchors } from "./PayloadReveal";

describe("payload inspection", () => {
  it("stages the hardware, isolates power, and closes for the archive and flight", () => {
    expect(samplePayloadReveal(.33)).toEqual({ open: 0, sensor: 0, compute: 0, radio: 0, power: 0 });
    expect(samplePayloadReveal(.51)).toEqual({ open: 1, sensor: 1, compute: 1, radio: 1, power: 1 });
    expect(samplePayloadReveal(.735)).toEqual({ open: 1, sensor: 0, compute: 0, radio: 0, power: 1 });
    for (const progress of [.835, .865, .965, 1]) expect(samplePayloadReveal(progress).open).toBe(0);
    const invalid = [];
    for (let i = 0; i <= 1000; i++) for (const value of Object.values(samplePayloadReveal(i / 1000))) {
      if (!Number.isFinite(value) || value < 0 || value > 1) invalid.push({ progress: i / 1000, value });
    }
    expect(invalid).toEqual([]);
  });

  it("keeps the tether anchor on the raised recovery loop and preserves caller resources", () => {
    const hardware = new Group();
    const foam = new MeshStandardMaterial({ color: "white" });
    const sharedGeometry = new BoxGeometry(.55, .163, .22);
    const body = new Mesh(sharedGeometry, foam); body.name = "EPS_enclosure__irregular_fused-bead_body";
    const cap = new Mesh(sharedGeometry, foam); cap.name = "EPS_lid__shallow_fitted_cap";
    const loop = new Mesh(sharedGeometry, foam); loop.name = "Braided_recovery_loop__strand_1";
    hardware.add(body, cap, loop);
    const geometryDisposal = vi.spyOn(sharedGeometry, "dispose");
    const materialDisposal = vi.spyOn(foam, "dispose");
    const originalUvs = Array.from(sharedGeometry.getAttribute("uv").array);
    const inspection = createPayloadReveal(hardware);
    const shell = inspection.group.getObjectByName("Payload / hollow EPS cutaway")!;
    let checkedPhysicalUvs = 0, largestUvError = 0;
    shell.traverse(node => {
      if (!(node instanceof Mesh)) return;
      const positions = node.geometry.getAttribute("position"), normals = node.geometry.getAttribute("normal"), uvs = node.geometry.getAttribute("uv");
      for (let i = 0; i < positions.count; i++) if (normals.getZ(i) > .999) {
        largestUvError = Math.max(largestUvError, Math.abs(uvs.getX(i) * .09 - positions.getX(i)), Math.abs(uvs.getY(i) * .09 - positions.getY(i)));
        checkedPhysicalUvs++;
      }
    });
    expect(checkedPhysicalUvs).toBeGreaterThan(20);
    expect(largestUvError).toBeLessThan(1e-6);
    expect(Array.from(sharedGeometry.getAttribute("uv").array)).toEqual(originalUvs);
    const world = new Vector3();
    for (const progress of [.33, .385, .46, .60, .735, .79, .865, .965]) {
      inspection.update(progress); inspection.group.updateMatrixWorld(true);
      world.set(-.03, .183, -.018).applyMatrix4(loop.matrixWorld);
      expect(world.distanceTo(inspection.anchors.suspension)).toBeLessThan(1e-12);
      expect(cap.parent).toBe(loop.parent);
    }
    inspection.dispose();
    expect(geometryDisposal).not.toHaveBeenCalled();
    expect(materialDisposal).not.toHaveBeenCalled();
    geometryDisposal.mockRestore(); materialDisposal.mockRestore();
    sharedGeometry.dispose(); foam.dispose();
  });

  it("gives independent callers identical anchors through reverse inspection", () => {
    const first = createPayloadRevealAnchors(), second = createPayloadRevealAnchors();
    samplePayloadRevealAnchors(.735, first);
    const saved = first.power.clone();
    for (const progress of [.1, .4, .62, .8, .94, .735]) samplePayloadRevealAnchors(progress, second);
    expect(first.power.toArray()).toEqual(saved.toArray());
    for (const role of ["sensor", "compute", "radio", "power", "suspension"] as const) {
      expect(first[role].toArray()).toEqual(second[role].toArray());
      expect(first[role]).not.toBe(second[role]);
    }
  });
});
