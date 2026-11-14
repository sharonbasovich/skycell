import {
  BoxGeometry, BufferGeometry, Color, CatmullRomCurve3, CylinderGeometry,
  Euler, Group, Material, Matrix4, Mesh, MeshStandardMaterial, Quaternion,
  TubeGeometry, Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type Point = [number, number, number];
type Role = "sensor" | "compute" | "radio" | "power";
export type PayloadRevealAnchors = Record<Role | "suspension", Vector3>;
interface RevealState { open: number; sensor: number; compute: number; radio: number; power: number }

const BASE: Record<Role, Point> = {
  compute: [-.065, -.022, -.005],
  power: [.155, -.022, -.025],
  radio: [-.205, -.016, .023],
  sensor: [.153, -.018, .060],
};
const LIFT: Record<Role, Point> = {
  sensor: [.014, .170, .016], compute: [0, .170, 0],
  radio: [-.018, .175, 0], power: [.010, .140, -.010],
};
const ROLES: Role[] = ["sensor", "compute", "radio", "power"];
const clamp = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
const ease = (progress: number, start: number, end: number) => {
  const t = clamp((progress - start) / (end - start));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/** An explanatory cutaway: the opening is an inspection, not a flight event. */
export function samplePayloadReveal(progress: number, out: RevealState = { open: 0, sensor: 0, compute: 0, radio: 0, power: 0 }): RevealState {
  const p = clamp(progress);
  const settle = 1 - ease(p, .67, .73);
  out.open = ease(p, .365, .405) * (1 - ease(p, .72, .78));
  out.sensor = ease(p, .400, .423) * settle;
  out.compute = ease(p, .423, .449) * settle;
  out.radio = ease(p, .449, .476) * settle;
  out.power = ease(p, .430, .475) * settle;
  return out;
}

export function createPayloadRevealAnchors(): PayloadRevealAnchors {
  return {
    sensor: new Vector3(), compute: new Vector3(), radio: new Vector3(), power: new Vector3(),
    suspension: new Vector3(-.03, .183, -.018),
  };
}

// These private scratch values are used only by a synchronous pure sampler.
// Each caller owns the returned vectors; no vector is shared between assemblies.
const anchorState: RevealState = { open: 0, sensor: 0, compute: 0, radio: 0, power: 0 };
const lidRotation = new Euler();
const lidQuaternion = new Quaternion();
export function samplePayloadRevealAnchors(progress: number, out: PayloadRevealAnchors): PayloadRevealAnchors {
  const state = samplePayloadReveal(progress, anchorState);
  for (const role of ROLES) {
    const base = BASE[role], lift = LIFT[role], amount = state[role];
    out[role].set(base[0] + lift[0] * amount, base[1] + lift[1] * amount, base[2] + lift[2] * amount);
  }
  lidQuaternion.setFromEuler(lidRotation.set(-.11 * state.open, 0, .025 * state.open));
  out.suspension.set(-.03, .183, -.018).applyQuaternion(lidQuaternion);
  out.suspension.y += .22 * state.open;
  out.suspension.z -= .11 * state.open;
  return out;
}

/** Batches fixed detail by material. No individual chip/pin draw calls. */
class DetailBatch {
  private entries = new Map<Material, BufferGeometry[]>();
  private matrix = new Matrix4();
  private rotation = new Quaternion();
  private scale = new Vector3(1, 1, 1);
  private position = new Vector3();
  private euler = new Euler();
  add(geometry: BufferGeometry, material: Material, point: Point = [0, 0, 0], rotation: Point = [0, 0, 0], uvPitch?: number) {
    this.rotation.setFromEuler(this.euler.set(...rotation));
    geometry.applyMatrix4(this.matrix.compose(this.position.set(...point), this.rotation, this.scale));
    if (uvPitch) {
      const position = geometry.getAttribute("position"), normal = geometry.getAttribute("normal"), uv = geometry.getAttribute("uv");
      // Match the original EPS author's 90 mm repeat in local physical space.
      // Face orientation preserves tangent handedness for the shared normal map.
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
        const nx = normal.getX(i), ny = normal.getY(i), nz = normal.getZ(i);
        if (Math.abs(ny) >= Math.abs(nx) && Math.abs(ny) >= Math.abs(nz)) uv.setXY(i, x / uvPitch, (ny > 0 ? -z : z) / uvPitch);
        else if (Math.abs(nx) >= Math.abs(nz)) uv.setXY(i, (nx > 0 ? -z : z) / uvPitch, y / uvPitch);
        else uv.setXY(i, (nz > 0 ? x : -x) / uvPitch, y / uvPitch);
      }
      uv.needsUpdate = true;
    }
    const prepared = geometry.index ? geometry.toNonIndexed() : geometry;
    if (prepared !== geometry) geometry.dispose();
    const list = this.entries.get(material) ?? [];
    list.push(prepared); this.entries.set(material, list);
  }
  box(material: Material, size: Point, point: Point, radius = .001, rotation?: Point, uvPitch?: number) {
    this.add(radius ? new RoundedBoxGeometry(...size, 1, Math.min(radius, ...size.map(value => value * .22))) : new BoxGeometry(...size), material, point, rotation, uvPitch);
  }
  tube(material: Material, points: Point[], radius = .002) {
    this.add(new TubeGeometry(new CatmullRomCurve3(points.map(point => new Vector3(...point))), 20, radius, 5, false), material);
  }
  finish(parent: Group, owned: BufferGeometry[]) {
    for (const [material, pieces] of this.entries) {
      const geometry = mergeGeometries(pieces, false);
      pieces.forEach(piece => piece.dispose());
      if (!geometry) throw new Error("Payload detail geometry could not be merged");
      owned.push(geometry);
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = true; mesh.receiveShadow = true;
      parent.add(mesh);
    }
  }
}

export interface PayloadRevealAssembly {
  group: Group;
  anchors: PayloadRevealAnchors;
  update: (narrativeProgress: number) => void;
  dispose: () => void;
}

/**
 * Augments a private GLTF clone. Existing geometry/maps and caller-cloned
 * materials remain caller-owned; only the added details are disposed here.
 */
export function createPayloadReveal(hardware: Group): PayloadRevealAssembly {
  const group = new Group(); group.name = "Payload / inspection assembly";
  const lid = new Group(); lid.name = "Payload / lifted cap and suspension";
  const interior = new Group(); interior.name = "Payload / interpreted circuit assembly";
  const shell = new Group(); shell.name = "Payload / hollow EPS cutaway";
  group.add(hardware, lid, shell, interior);
  const ownedGeometry: BufferGeometry[] = [];
  const ownedMaterials: MeshStandardMaterial[] = [];
  const material = (name: string, color: string, roughness: number, metalness = 0) => {
    const created = new MeshStandardMaterial({ name, color, roughness, metalness, envMapIntensity: .75 });
    ownedMaterials.push(created); return created;
  };
  const pcb = material("Inspection / green circuit board", "#184c35", .68);
  const bluePcb = material("Inspection / blue converter board", "#164f82", .58);
  const palePcb = material("Inspection / pale radio board", "#d7d8ce", .75);
  const chip = material("Inspection / matte silicon packages", "#171c1c", .63);
  const ceramic = material("Inspection / ceramic components", "#b8a486", .68);
  const antennaCeramic = material("Inspection / GPS patch ceramic", "#bd9250", .73);
  const aluminium = material("Inspection / brushed metal ports", "#aeb9bd", .32, .83);
  const contacts = material("Inspection / plated contacts", "#b5a067", .36, .75);
  const silkscreen = material("Inspection / circuit marks", "#b6c5ab", .82);
  const redWire = material("Inspection / red power wire", "#9c312a", .72);
  const yellowWire = material("Inspection / signal wire", "#c29b4a", .70);
  const blackWire = material("Inspection / black cable", "#171b1c", .68);
  const led = material("Inspection / powered indicator", "#5b9572", .48);
  led.emissive = new Color("#2b7b4e"); led.emissiveIntensity = .35;
  const meshes: Mesh[] = [];
  hardware.traverse(node => { if (node instanceof Mesh) meshes.push(node); });
  // GLTFLoader sanitizes authoring names; normalize both forms for stable parts.
  const normalized = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const foamSource = meshes.find(node => normalized(node.name).startsWith("epsenclosure"));
  const foamOriginal = foamSource?.material instanceof MeshStandardMaterial ? foamSource.material : undefined;
  const foam = foamOriginal?.clone() ?? new MeshStandardMaterial({ color: "#eeeee8", roughness: .94 });
  foam.name = "Inspection / exposed EPS wall";
  ownedMaterials.push(foam);
  const fadingBody = foamOriginal?.clone();
  if (fadingBody && foamSource) {
    fadingBody.transparent = true; fadingBody.depthWrite = false;
    foamSource.material = fadingBody; ownedMaterials.push(fadingBody);
  }
  const liftParts = meshes.filter(node => {
    const name = normalized(node.name);
    return name.startsWith("epslid") || name.startsWith("toprecoverysheet")
      || name.includes("suspension") || name.startsWith("braidedrecoveryloop");
  });
  for (const part of liftParts) lid.add(part);
  const tapeParts = meshes.filter(node => normalized(node.name).startsWith("clearpackingtape"));
  const seam = meshes.find(node => normalized(node.name).startsWith("recessedlidseam"));
  const housing = new DetailBatch();
  // An actual cavity replaces the previously solid exterior during inspection.
  housing.box(foam, [.548, .018, .218], [0, -.087, 0], .006, undefined, .09);
  housing.box(foam, [.018, .148, .218], [-.265, -.004, 0], .005, undefined, .09);
  housing.box(foam, [.018, .148, .218], [.265, -.004, 0], .005, undefined, .09);
  housing.box(foam, [.512, .148, .018], [0, -.004, -.100], .005, undefined, .09);
  housing.box(foam, [.512, .148, .018], [0, -.004, .100], .005, undefined, .09);
  housing.finish(shell, ownedGeometry);
  const modules = { sensor: new Group(), compute: new Group(), radio: new Group(), power: new Group() };
  for (const role of ROLES) { modules[role].name = `Payload / ${role}`; interior.add(modules[role]); }

  const board = (batch: DetailBatch, boardMaterial: Material, width: number, depth: number) => {
    batch.box(boardMaterial, [width, .004, depth], [0, 0, 0], .0013);
    for (const x of [-width * .41, width * .41]) for (const z of [-depth * .38, depth * .38]) {
      batch.add(new CylinderGeometry(.0033, .0033, .001, 8), contacts, [x, .0025, z]);
    }
    for (let i = 0; i < 12; i++) {
      const x = -width * .42 + width * .84 * i / 11;
      batch.box(contacts, [.0022, .0012, .006], [x, .0028, -depth * .43], 0);
      if (i % 2 === 0) batch.box(silkscreen, [.0012, .0002, depth * .42], [x, .0023, depth * .1], 0);
    }
  };
  const compute = new DetailBatch(); board(compute, pcb, .164, .102);
  compute.box(chip, [.035, .006, .032], [-.006, .005, -.008], .0015);
  compute.box(chip, [.019, .004, .025], [.045, .004, .018]);
  compute.box(aluminium, [.035, .027, .027], [-.064, .015, -.034], .0015);
  compute.box(chip, [.001, .019, .021], [-.082, .016, -.034], .0004);
  for (let pin = 0; pin < 8; pin++) {
    compute.box(contacts, [.001, .006, .0012], [-.0826, .020, -.040 + pin * .00175], 0);
  }
  for (const z of [-.010, .028]) {
    compute.box(aluminium, [.030, .025, .025], [-.067, .014, z], .0015);
    for (const y of [.0085, .019]) {
      compute.box(chip, [.001, .007, .020], [-.0825, y, z], .0003);
      compute.box(bluePcb, [.0004, .0017, .016], [-.0832, y - .0015, z], 0);
    }
  }
  for (const [x, width] of [[-.024, .016], [.005, .016], [.054, .012]]) {
    compute.box(aluminium, [width, .008, .013], [x, .006, .047], .0011);
    compute.box(chip, [width - .003, .004, .001], [x, .006, .054], .0003);
  }
  for (let i = 0; i < 10; i++) compute.box(aluminium, [.002, .011, .032], [-.018 + i * .004, .009, -.006], .0004);
  for (let i = 0; i < 12; i++) {
    compute.box(chip, [.007, .003, .004], [-.038 + i * .007, .004, .037], .0006);
  }
  compute.box(chip, [.112, .004, .012], [.010, .004, -.041], .0007);
  for (let pin = 0; pin < 20; pin++) {
    for (const z of [-.044, -.038]) {
      compute.box(contacts, [.0013, .009, .0013], [-.042 + pin * .0055, .010, z], 0);
    }
  }
  compute.box(led, [.003, .002, .003], [.068, .004, .035], .0004);
  compute.finish(modules.compute, ownedGeometry);

  const power = new DetailBatch(); board(power, bluePcb, .082, .061);
  power.box(chip, [.019, .011, .019], [0, .007, -.011], .0015);
  power.add(new CylinderGeometry(.008, .008, .003, 12), aluminium, [0, .013, -.011]);
  for (const x of [-.016, .016]) {
    power.add(new CylinderGeometry(.006, .006, .016, 12), chip, [x, .010, -.013]);
    power.add(new CylinderGeometry(.0056, .0056, .001, 12), aluminium, [x, .0185, -.013]);
  }
  for (const x of [-.033, .033]) {
    power.box(bluePcb, [.014, .014, .021], [x, .009, -.008], .001);
    for (const z of [-.013, -.003]) {
      power.add(new CylinderGeometry(.003, .003, .0015, 10), aluminium, [x, .0165, z]);
      power.box(chip, [.0038, .0003, .0007], [x, .01735, z], 0);
    }
  }
  // The display's pale, inactive segments reproduce the photographed hardware.
  power.box(chip, [.047, .010, .023], [0, .007, .014], .0015);
  for (const x of [-.014, 0, .014]) {
    for (const z of [.007, .014, .021]) {
      power.box(ceramic, [.0055, .0007, .0012], [x, .0123, z], 0);
    }
    for (const side of [-1, 1]) for (const z of [.0105, .0175]) {
      power.box(ceramic, [.0012, .0007, .0045], [x + side * .0038, .0123, z], 0);
    }
  }
  power.finish(modules.power, ownedGeometry);

  const radio = new DetailBatch(); board(radio, palePcb, .065, .086);
  radio.box(chip, [.043, .006, .038], [0, .006, -.010], .0015);
  radio.box(contacts, [.002, .001, .032], [.024, .003, -.009], 0);
  radio.box(aluminium, [.018, .010, .014], [.012, .007, .034], .001);
  for (let i = 0; i < 6; i++) radio.box(ceramic, [.006, .003, .003], [-.023 + i * .009, .004, .018], .0005);
  radio.finish(modules.radio, ownedGeometry);

  const sensor = new DetailBatch(); board(sensor, pcb, .045, .035);
  sensor.box(aluminium, [.016, .007, .014], [0, .005, 0], .001);
  sensor.box(chip, [.005, .001, .005], [0, .009, .002], .0005);
  for (let i = 0; i < 4; i++) sensor.box(contacts, [.001, .008, .001], [-.013 + i * .008, .007, -.013], 0);
  // Square ceramic GPS patch and short coax pigtail, as photographed on the bench.
  sensor.box(antennaCeramic, [.038, .009, .038], [-.079, .005, -.009], .002);
  sensor.box(aluminium, [.027, .001, .027], [-.079, .010, -.009], .0015);
  sensor.add(new CylinderGeometry(.0027, .0027, .0007, 10), contacts, [-.076, .0108, -.011]);
  sensor.tube(blackWire, [[-.098, .004, -.007], [-.109, .004, -.012], [-.113, .003, -.028], [-.106, .003, -.038]], .00125);
  sensor.box(contacts, [.004, .002, .0035], [-.104, .003, -.039], .0005);
  // The narrow daughterboard stacks above its carrier on two rows of headers.
  const daughterboardX = -.090;
  sensor.box(pcb, [.066, .0035, .043], [daughterboardX, 0, -.093], .0014);
  sensor.box(pcb, [.050, .0028, .026], [daughterboardX, .008, -.092], .001);
  for (const z of [-.102, -.082]) {
    sensor.box(chip, [.046, .0055, .0036], [daughterboardX, .0047, z], .0004);
    for (let pin = 0; pin < 12; pin++) {
      const x = daughterboardX + (pin - 5.5) * .0036;
      sensor.add(new CylinderGeometry(.0012, .0012, .001, 6), contacts, [x, .0096, z]);
    }
  }
  sensor.box(chip, [.011, .0027, .011], [daughterboardX, .0106, -.092], .0006, [0, Math.PI / 4, 0]);
  sensor.box(aluminium, [.009, .0055, .011], [daughterboardX + .025, .012, -.092], .0008);
  sensor.box(chip, [.0007, .0026, .007], [daughterboardX + .0298, .012, -.092], .0003);
  sensor.box(ceramic, [.005, .002, .003], [daughterboardX - .015, .0104, -.093], .0004);
  sensor.finish(modules.sensor, ownedGeometry);

  const wiring = new DetailBatch();
  wiring.tube(redWire, [[.16, -.017, -.008], [.13, .004, .060], [.04, .020, .065], [-.01, -.011, .035]], .0018);
  wiring.tube(blackWire, [[.17, -.017, -.008], [.14, -.007, -.065], [.02, -.004, -.065], [-.03, -.016, -.025]], .0020);
  wiring.tube(blackWire, [[-.21, -.009, .042], [-.17, .012, .068], [-.10, .018, .052], [-.07, -.01, .020]], .0022);
  wiring.tube(yellowWire, [[.15, -.011, .050], [.12, .013, .060], [.06, .015, .065], [.01, -.011, .030]], .0013);
  const wireGroup = new Group(); interior.add(wireGroup); wiring.finish(wireGroup, ownedGeometry);
  const anchors = createPayloadRevealAnchors();
  const state: RevealState = { open: 0, sensor: 0, compute: 0, radio: 0, power: 0 };
  let lastProgress = NaN;
  const update = (progress: number) => {
    const p = clamp(progress);
    if (p === lastProgress) return;
    lastProgress = p;
    samplePayloadReveal(p, state); samplePayloadRevealAnchors(p, anchors);
    lid.position.set(0, .22 * state.open, -.11 * state.open);
    lid.rotation.set(-.11 * state.open, 0, .025 * state.open);
    interior.visible = state.open > .001; shell.visible = state.open > .001;
    if (foamSource) {
      const visibility = 1 - ease(state.open, 0, .22);
      foamSource.visible = visibility > .001;
      foamSource.castShadow = state.open < .01;
      if (fadingBody) fadingBody.opacity = visibility;
    }
    for (const part of tapeParts) part.visible = state.open < .08;
    if (seam) seam.visible = state.open < .08;
    for (const role of ROLES) modules[role].position.copy(anchors[role]);
    // The short harness stays parked in the case as the board groups are
    // separated. The cutaway does not stretch a cable between detached parts.
    wireGroup.visible = state.open > .001;
  };
  update(0);
  return {
    group, anchors, update,
    dispose: () => { ownedGeometry.forEach(geometry => geometry.dispose()); ownedMaterials.forEach(value => value.dispose()); },
  };
}
