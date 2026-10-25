import { useEffect, useMemo, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Data3DTexture, DoubleSide, GLSL3, InstancedBufferAttribute, InstancedBufferGeometry, LinearFilter, Matrix4, Mesh, RedFormat, RepeatWrapping, ShaderMaterial, Vector3 } from "three";
import type { CinematicFrame } from "./cinematicTypes";
import { CLOUD_BANKS, cloudVisibility, createCloudDensityVolume } from "./spatialEnvironment";

interface Props { frame: MutableRefObject<CinematicFrame> }
// A bounded read-only CPU cache avoids re-baking the same noise on route entry
// or StrictMode remounts. Each mounted pass still owns/disposes its GPU texture.
let densityBytes: Uint8Array | undefined;

// All centres/radii, sun and rays use metre-space. Camera movement changes
// perspective, separation and occlusion; nothing is placed in camera space.
const vertexShader = /* glsl */ `
attribute vec3 aCenter;
attribute vec3 aRadius;
attribute vec2 aCloud;
uniform vec3 uWind;
varying vec3 vLocalPosition;
flat out vec3 vLocalCamera;
flat out vec3 vCenter;
flat out vec3 vRadius;
flat out vec2 vCloud;
void main() {
  vec3 center = aCenter + uWind;
  vec3 world = center + position * aRadius;
  vLocalPosition = position;
  vLocalCamera = (cameraPosition - center) / aRadius;
  vCenter = center;
  vRadius = aRadius;
  vCloud = aCloud;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`;

const fragmentShader = /* glsl */ `
precision highp sampler3D;
uniform sampler3D uDensity;
uniform vec3 uSunDirection;
uniform float uVisibility;
uniform mat4 uViewProjection;
varying vec3 vLocalPosition;
flat in vec3 vLocalCamera;
flat in vec3 vCenter;
flat in vec3 vRadius;
flat in vec2 vCloud;
out vec4 cloudColor;
#define gl_FragColor cloudColor

void main() {
  // Select one box face per ray, including when the observer enters a volume.
  bool insideBox = max(max(abs(vLocalCamera.x), abs(vLocalCamera.y)), abs(vLocalCamera.z)) < 1.0;
  if (gl_FrontFacing == insideBox) discard;
  vec3 ray = normalize(vLocalPosition - vLocalCamera);
  float b = dot(vLocalCamera, ray);
  float c = dot(vLocalCamera, vLocalCamera) - 1.0;
  float discriminant = b * b - c;
  if (discriminant <= 0.0) discard;
  float root = sqrt(discriminant);
  float start = max(-b - root, 0.0);
  float finish = -b + root;
  if (finish <= start) discard;
  float stepLength = (finish - start) / 6.0;
  float alpha = 0.0;
  vec3 radiance = vec3(0.0);
  vec3 firstHit = vLocalCamera + ray * start;
  bool found = false;
  vec3 sun = normalize(uSunDirection);
  // Bounded six-sample volume integrals, not a full-screen atmosphere march.
  for (int i = 0; i < 6; i++) {
    vec3 point = vLocalCamera + ray * (start + (float(i) + 0.5) * stepLength);
    float shape = pow(max(1.0 - dot(point, point), 0.0), 0.7);
    // Keep neighbouring samples correlated along depth so integration preserves
    // clumps rather than averaging the bank into a smooth elliptical wash.
    vec3 lookup = point * vec3(.72, .90, .28) + vec3(vCloud.y, vCloud.y * .37, vCloud.y * .71);
    float noise = texture(uDensity, lookup).r;
    float density = max(noise - .39, 0.0) * 6.3 * shape * vCloud.x;
    float opacity = (1.0 - exp(-density * stepLength * 1.45)) * uVisibility;
    if (!found && opacity > .008) { firstHit = point; found = true; }
    // Shared sun and a shorter light path through the upper cloud surface.
    vec3 normalBase = point / vRadius + vec3(0.0, .0001, 0.0);
    vec3 normal = normalBase * inversesqrt(max(dot(normalBase, normalBase), .00000001));
    float daylight = clamp(dot(normal, sun) * .35 + point.y * .22 + .55, 0.0, 1.0);
    vec3 light = mix(vec3(.24, .35, .49), vec3(1.24, 1.22, 1.16), daylight);
    radiance += (1.0 - alpha) * opacity * light;
    alpha += (1.0 - alpha) * opacity;
  }
  if (alpha < .006) discard;
  vec3 worldHit = vCenter + firstHit * vRadius;
  vec4 clip = uViewProjection * vec4(worldHit, 1.0);
  // First-density depth lets nearby vapour cross in front of the tether while
  // the opaque foam correctly occludes distant vapour.
  gl_FragDepth = clamp(clip.z / max(clip.w, .0001) * .5 + .5, 0.0, 1.0);
  float distanceFog = 1.0 - exp(-length(cameraPosition - worldHit) * .0012);
  vec3 color = radiance / max(alpha, .0001);
  color = mix(color, vec3(.30, .45, .59), distanceFog * .48);
  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** One instanced draw for seven fixed 3D cloud banks along the early ascent. */
export default function FlightClouds({ frame }: Props) {
  const resources = useMemo(() => {
    // Transparent banks are submitted far-to-near along the initial following
    // view. They have vanished before the close camera begins its orbit.
    const banks = [...CLOUD_BANKS].reverse();
    const base = new BoxGeometry(2, 2, 2);
    const geometry = new InstancedBufferGeometry();
    geometry.index = base.index?.clone() ?? null;
    for (const [name, attribute] of Object.entries(base.attributes)) geometry.setAttribute(name, attribute.clone());
    base.dispose();
    geometry.instanceCount = CLOUD_BANKS.length;
    geometry.setAttribute("aCenter", new InstancedBufferAttribute(new Float32Array(banks.flatMap(bank => [...bank.center])), 3));
    geometry.setAttribute("aRadius", new InstancedBufferAttribute(new Float32Array(banks.flatMap(bank => [...bank.radius])), 3));
    geometry.setAttribute("aCloud", new InstancedBufferAttribute(new Float32Array(banks.flatMap(bank => [bank.density, bank.seed])), 2));
    const density = new Data3DTexture(densityBytes ??= createCloudDensityVolume(), 32, 32, 32);
    density.name = "SkyCell procedural spatial cloud density";
    density.format = RedFormat;
    density.minFilter = LinearFilter;
    density.magFilter = LinearFilter;
    density.wrapS = density.wrapT = density.wrapR = RepeatWrapping;
    density.unpackAlignment = 1;
    density.needsUpdate = true;
    const material = new ShaderMaterial({
      glslVersion: GLSL3, vertexShader, fragmentShader,
      side: DoubleSide, transparent: true, depthTest: true, depthWrite: false, toneMapped: true,
      uniforms: {
        uDensity: { value: density }, uWind: { value: new Vector3() },
        uSunDirection: { value: new Vector3() }, uVisibility: { value: 1 },
        uViewProjection: { value: new Matrix4() },
      },
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = "World-space cirrus volumes";
    mesh.frustumCulled = false;
    mesh.renderOrder = 20;
    return { geometry, density, material, mesh };
  }, []);

  useFrame(({ camera }) => {
    const state = frame.current;
    const opacity = cloudVisibility(state.altitudeKm);
    resources.mesh.visible = opacity > .001;
    if (!resources.mesh.visible) return;
    const uniforms = resources.material.uniforms;
    const time = Number.isFinite(state.elapsedSeconds) ? state.elapsedSeconds : 0;
    uniforms.uWind.value.set(Math.sin(time * .028) * .65, 0, Math.sin(time * .021) * .4);
    uniforms.uVisibility.value = opacity;
    uniforms.uSunDirection.value.copy(state.sunDirection);
    if (uniforms.uSunDirection.value.lengthSq() < .000001) uniforms.uSunDirection.value.set(0, 1, 0);
    uniforms.uSunDirection.value.normalize();
    uniforms.uViewProjection.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  }, 0);

  useEffect(() => () => {
    resources.geometry.dispose(); resources.material.dispose(); resources.density.dispose();
  }, [resources]);

  return <primitive object={resources.mesh} dispose={null} />;
}
