import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { ClampToEdgeWrapping, HalfFloatType, LinearFilter, LinearSRGBColorSpace, Matrix3, Matrix4, Mesh, NoColorSpace, OrthographicCamera, PlaneGeometry, RepeatWrapping, Scene, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector3, Vector4, WebGLRenderTarget } from "three";
import type { CinematicFrame } from "./cinematicTypes";

const EARTH_RADIUS_KM = 6371;

const vertexShader = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  // Independent of the metre-scale scene and its near/far clipping planes.
  gl_Position = vec4(position.xy, 1.0, 1.0);
}`;

const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 vNdc;
uniform mat4 uProjectionInverse;
uniform mat3 uCameraRotation;
uniform mat3 uLocalToEarth;
uniform vec3 uEyeKm;
uniform vec3 uSunDirection;
uniform sampler2D uSurface;
uniform sampler2D uClouds;
uniform sampler2D uRegional;

const float PI = 3.141592653589793;
const float R = 6371.0;
const float CLOUD_HEIGHT = 6.0;
const vec3 BETA_R = vec3(0.0058, 0.0135, 0.0331);
const vec3 BETA_M = vec3(0.0020);

// Camera, ray, sun and spherical normals all use the local east/up/north basis.
// Distances in this shader are kilometres. Only the texture lookup uses ECEF.
vec2 earthUv(vec3 localNormal) {
  vec3 earth = uLocalToEarth * localNormal;
  return vec2(atan(earth.z, earth.x) / (2.0 * PI) + 0.5,
              asin(clamp(earth.y, -1.0, 1.0)) / PI + 0.5);
}

float regionalWeight(vec2 lonLat) {
  vec2 edge = min(lonLat - vec2(-78.0, 34.0), vec2(-64.0, 48.0) - lonLat);
  return smoothstep(0.0, 0.5, min(edge.x, edge.y));
}

// Returns the near shell intersection. Camera is above both shells.
float shellDistance(vec3 eye, vec3 ray, float radius) {
  float b = dot(eye, ray);
  // Factored c preserves precision at only 20--30 km above a 6371 km sphere.
  float eyeRadius = length(eye);
  float c = (eyeRadius - radius) * (eyeRadius + radius);
  float discriminant = b * b - c;
  if (discriminant < 0.0 || b >= 0.0) return -1.0;
  return c / max(-b + sqrt(max(discriminant, 0.0)), 0.0001);
}

float scaledErfc(float z) {
  float t = 1.0 / (1.0 + 0.3275911 * z);
  return (((((1.061405429 * t - 1.453152027) * t)
             + 1.421413741) * t - 0.284496736) * t
             + 0.254829592) * t;
}

// Analytic Chapman-style air column for an exponential spherical atmosphere.
// A parabolic tangent path gives a Gaussian density integral. The erfcx
// approximation avoids cancellation/overflow for upward-facing rays. Blend
// to the plane-parallel column above 7 degrees, where it is already accurate.
// No ray-march loop or atmosphere textures are needed.
float skyColumn(float eyeRadius, float mu, float scaleHeight) {
  float height = max(eyeRadius - R, 0.0);
  float density = exp(-height / scaleHeight);
  float a = max((1.0 - mu * mu) / (2.0 * eyeRadius * scaleHeight), 0.00000001);
  float rootA = sqrt(a);
  float z = clamp(mu / (2.0 * scaleHeight * rootA), -7.5, 7.5);
  float erfcx = scaledErfc(abs(z));
  if (z < 0.0) erfcx = 2.0 * exp(z * z) - erfcx;
  float tangent = density * 0.886226925 * erfcx / rootA;
  float vertical = density * scaleHeight / max(mu, 0.02);
  return min(mix(tangent, vertical, smoothstep(0.08, 0.16, mu)), 2000.0);
}

float surfaceColumn(float eyeRadius, float surfaceHeight, float mu, float distance, float scaleHeight) {
  float eyeHeight = max(eyeRadius - R, 0.05);
  float density = exp(-eyeHeight / scaleHeight);
  float vertical = scaleHeight * max(exp(-surfaceHeight / scaleHeight) - density, 0.0)
                   / max(-mu, 0.045);
  if (mu < -0.28) return vertical;
  float a = max((1.0 - mu * mu) / (2.0 * eyeRadius * scaleHeight), 0.00000001);
  float rootA = sqrt(a);
  float z0 = mu / (2.0 * scaleHeight * rootA);
  float z1 = min(z0 + rootA * distance, 0.0);
  // Both integration limits are on the approaching side of the tangent.
  // Factoring erfcx avoids subtracting two nearly equal erf(-large) values.
  float endDensity = exp(min(-eyeHeight / scaleHeight + z0 * z0 - z1 * z1, 0.0));
  float tangent = 0.886226925 / rootA
                  * (endDensity * scaledErfc(-z1) - density * scaledErfc(-z0));
  return max(mix(tangent, vertical, smoothstep(0.16, 0.28, -mu)), 0.0);
}

void main() {
  // Inverting the actual projection retains asymmetric/off-axis view offsets.
  vec4 view = uProjectionInverse * vec4(vNdc, 1.0, 1.0);
  vec3 ray = normalize(uCameraRotation * (view.xyz / view.w));
  vec3 sun = normalize(uSunDirection);
  float eyeRadius = length(uEyeKm);
  float eyeHeight = max(eyeRadius - R, 0.05);
  float mu = dot(uEyeKm / eyeRadius, ray);
  float groundDistance = shellDistance(uEyeKm, ray, R);
  float cloudDistance = shellDistance(uEyeKm, ray, R + CLOUD_HEIGHT);
  bool groundHit = groundDistance > 0.0;
  bool cloudHit = cloudDistance > 0.0;

  float airR;
  float airM;
  float regionalComposite = 0.0;
  vec3 radiance = vec3(0.0);
  if (groundHit) {
    vec3 normal = normalize(uEyeKm + ray * groundDistance);
    vec2 globalUv = earthUv(normal);
    vec2 lonLat = (globalUv - 0.5) * vec2(360.0, 180.0);
    // NASA GIBS MODIS Terra true colour, 2024-06-21. This is geographic
    // context, not imagery from the 2025 flight. The source's top is north;
    // TextureLoader's flipY gives the usual south=0 / north=1 sampler V.
    vec2 regionalUv = (lonLat - vec2(-78.0, 34.0)) / vec2(14.0);
    regionalComposite = regionalWeight(lonLat);
    vec3 albedo = vec3(0.0);
    if (regionalComposite < 1.0) {
      albedo = min(texture2D(uSurface, globalUv).rgb * 1.8, vec3(0.85));
    }
    if (regionalComposite > 0.0) {
      // Regional true colour already contains clouds and historical lighting.
      // Preserve its contrast rather than boosting/clipping the cloud whites.
      albedo = mix(albedo, texture2D(uRegional, regionalUv).rgb, regionalComposite);
    }
    // Dark New England forest is not ocean. Preserve the actual atlas colour;
    // a luminance-based water replacement erases this whole regional texture.
    // The water heuristic gates only the global atlas glint, never its colour.
    float water = 1.0 - smoothstep(0.0015, 0.008, albedo.r + albedo.g * 0.35);
    float daylight = max(dot(normal, sun), 0.0);
    radiance = albedo * (0.035 + daylight * 1.18);
    vec3 halfway = (sun - ray) / max(length(sun - ray), 0.0001);
    float glint = pow(max(dot(normal, halfway), 0.0), 240.0);
    radiance += vec3(0.17, 0.18, 0.17) * glint * water * daylight * (1.0 - regionalComposite);
    airR = surfaceColumn(eyeRadius, 0.0, mu, groundDistance, 8.0);
    airM = surfaceColumn(eyeRadius, 0.0, mu, groundDistance, 1.2);
  } else {
    airR = skyColumn(eyeRadius, mu, 8.0);
    airM = skyColumn(eyeRadius, mu, 1.2);
  }

  if (cloudHit && regionalComposite < 1.0) {
    vec3 normal = normalize(uEyeKm + ray * cloudDistance);
    vec2 cloudUv = earthUv(normal);
    // Rays can hit the higher cloud shell while missing the ground. Suppress
    // the global layer geographically here too, avoiding an unmatched ring
    // between the cloud-shell and ground horizons around the regional patch.
    float cloudRegional = regionalWeight((cloudUv - 0.5) * vec2(360.0, 180.0));
    float globalWeight = 1.0 - max(regionalComposite, cloudRegional);
    if (globalWeight > 0.0) {
      float mask = texture2D(uClouds, cloudUv).r;
      // The regional mask contains real thin-cloud values around 1--41/255.
      // Convert optical density to coverage instead of thresholding them away.
      // Feather out the independent cloud shell with the geographic composite;
      // overlaying it inside the patch would duplicate a different day's clouds.
      float coverage = min(1.0 - exp(-mask * 3.2), 0.96) * globalWeight;
      float daylight = max(dot(normal, sun), 0.0);
      // A real 6 km shell gives cloud/ground parallax and a higher cloud horizon.
      // Image opacity carries the cloud structure: no procedural noise overlay.
      vec3 cloud = vec3(0.94, 0.965, 0.99) * (0.045 + daylight * 1.10);
      radiance = mix(radiance, cloud, coverage);
      airR = mix(airR, surfaceColumn(eyeRadius, CLOUD_HEIGHT, mu, cloudDistance, 8.0), coverage);
      airM = mix(airM, surfaceColumn(eyeRadius, CLOUD_HEIGHT, mu, cloudDistance, 1.2), coverage);
    }
  }

  vec3 tauR = BETA_R * airR;
  vec3 tauM = BETA_M * airM;
  vec3 tau = tauR + tauM;
  vec3 transmittance = exp(-tau);
  // Representative sunlight attenuation at the densest visible section.
  float closest = max(-dot(uEyeKm, ray), 0.0);
  vec3 closestPosition = uEyeKm + ray * (groundHit ? groundDistance * 0.75 : closest);
  float minimumHeight = max(length(closestPosition) - R, 0.0);
  if (groundHit) minimumHeight = min(eyeHeight, 7.0);
  vec3 scatterNormal = normalize(closestPosition);
  float solarMu = dot(scatterNormal, sun);
  float sunColumnR = 8.0 * exp(-minimumHeight / 8.0) / max(solarMu, 0.08);
  float sunColumnM = 1.2 * exp(-minimumHeight / 1.2) / max(solarMu, 0.08);
  vec3 solarTransmission = exp(-(BETA_R * sunColumnR + BETA_M * sunColumnM));
  float sunVisibility = smoothstep(-0.10, 0.04, solarMu);
  float cosine = clamp(dot(ray, sun), -1.0, 1.0);
  // Surface illumination above is expressed as irradiance / PI. Therefore
  // normalized single-scatter phase functions carry a PI factor, giving
  // 3/16 (Rayleigh) and (1-g*g)/4 (HG), rather than a 4x-brighter sky wash.
  float rayleighPhase = 0.1875 * (1.0 + cosine * cosine);
  // Restrained physical forward scattering, without a sun sprite or bloom.
  float miePhase = 0.144375 / pow(max(1.4225 - 1.30 * cosine, 0.12), 1.5);
  vec3 phase = (tauR * rayleighPhase + tauM * miePhase) / max(tau, vec3(0.00001));
  vec3 scatter = vec3(1.12, 1.16, 1.22) * phase * solarTransmission
               * sunVisibility * (1.0 - transmittance);
  radiance = radiance * transmittance + scatter;

  gl_FragColor = vec4(max(radiance, vec3(0.0)), 1.0);
  // Linear HDR radiance only. The main-scene display quad applies tone mapping
  // and output conversion once, after sampling the half-float render target.
}`;

const displayFragmentShader = /* glsl */ `
varying vec2 vNdc;
uniform sampler2D uBackdrop;
void main() {
  gl_FragColor = vec4(texture2D(uBackdrop, vNdc * 0.5 + 0.5).rgb, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

interface Props {
  frame: MutableRefObject<CinematicFrame>;
}

/** Depthless kilometre environment behind the metre-scale floating-origin rig. */
export default function CinematicEarth({ frame }: Props) {
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);
  // Select once per Canvas mount. A resize must not download/cache both the
  // 2k and 4k regional variants on memory-constrained devices.
  const [regionalFile] = useState(() => width < 900 || gl.capabilities.maxTextureSize <= 2048
    ? "regional-earth-2048.webp" : "regional-earth.webp");
  const [surface, clouds, regional] = useLoader(TextureLoader, [
    `${import.meta.env.BASE_URL}textures/cinematic/nasa-bmng-june-4096.webp`,
    `${import.meta.env.BASE_URL}textures/cinematic/nasa-clouds-2048.webp`,
    `${import.meta.env.BASE_URL}textures/cinematic/${regionalFile}`,
  ]);
  const resources = useMemo(() => {
    const latitude = 42 * Math.PI / 180;
    const longitude = -71 * Math.PI / 180;
    const east = new Vector3(-Math.sin(longitude), 0, Math.cos(longitude));
    const up = new Vector3(Math.cos(latitude) * Math.cos(longitude), Math.sin(latitude), Math.cos(latitude) * Math.sin(longitude));
    const north = new Vector3(-Math.sin(latitude) * Math.cos(longitude), Math.cos(latitude), -Math.sin(latitude) * Math.sin(longitude));
    const localToEarth = new Matrix3().set(
      east.x, up.x, north.x,
      east.y, up.y, north.y,
      east.z, up.z, north.z,
    );
    const earthMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uProjectionInverse: { value: new Matrix4() },
        uCameraRotation: { value: new Matrix3() },
        uLocalToEarth: { value: localToEarth },
        uEyeKm: { value: new Vector3(0, EARTH_RADIUS_KM + 30, 0) },
        uSunDirection: { value: new Vector3(-0.6, 0.65, 0.35).normalize() },
        uSurface: { value: surface },
        uClouds: { value: clouds },
        uRegional: { value: regional },
      },
    });
    const displayMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader: displayFragmentShader,
      depthTest: false,
      depthWrite: false,
      toneMapped: true,
      uniforms: { uBackdrop: { value: null } },
    });
    const geometry = new PlaneGeometry(2, 2);
    const earthScene = new Scene();
    const quad = new Mesh(geometry, earthMaterial);
    quad.frustumCulled = false;
    earthScene.add(quad);
    return { earthMaterial, displayMaterial, geometry, earthScene, camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, [surface, clouds, regional]);

  // Shade the background at bounded CSS resolution, independently of the
  // foreground Canvas DPR. Preserve the full viewport aspect ratio.
  const bufferWidth = Math.max(1, Math.round(Math.min(width, width < 900 ? 640 : 1024)));
  const bufferHeight = Math.max(1, Math.round(bufferWidth * height / Math.max(width, 1)));
  const target = useMemo(() => {
    const buffer = new WebGLRenderTarget(bufferWidth, bufferHeight, {
      type: HalfFloatType,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
    buffer.texture.colorSpace = LinearSRGBColorSpace;
    buffer.texture.name = "SkyCell linear Earth backdrop";
    return buffer;
  }, [bufferWidth, bufferHeight]);
  const cache = useRef({
    target: null as WebGLRenderTarget | null,
    projection: new Matrix4(),
    world: new Matrix4(),
    altitudeKm: NaN,
    sun: new Vector3(),
    viewport: new Vector4(),
    scissor: new Vector4(),
  });

  useLayoutEffect(() => {
    surface.colorSpace = SRGBColorSpace;
    clouds.colorSpace = NoColorSpace;
    regional.colorSpace = SRGBColorSpace;
    for (const texture of [surface, clouds, regional]) {
      texture.wrapS = texture === regional ? ClampToEdgeWrapping : RepeatWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    }
  }, [surface, clouds, regional, gl]);

  useLayoutEffect(() => {
    resources.displayMaterial.uniforms.uBackdrop.value = target.texture;
    invalidate();
  }, [resources, target, invalidate]);

  useEffect(() => () => { target.dispose(); }, [target]);

  useEffect(() => () => {
    cache.current.target = null;
    resources.geometry.dispose();
    resources.earthMaterial.dispose();
    resources.displayMaterial.dispose();
    // The scene/mesh are ordinary GC-owned objects. Keep the quad attached so
    // React StrictMode's simulated effect teardown can re-upload the resources.
    // useLoader owns shared texture cache entries; do not dispose them here.
  }, [resources]);

  useFrame(({ camera }) => {
    const previous = cache.current;
    const state = frame.current;
    if (previous.target === target
      && previous.altitudeKm === state.altitudeKm
      && previous.sun.equals(state.sunDirection)
      && previous.projection.equals(camera.projectionMatrix)
      && previous.world.equals(camera.matrixWorld)) return;

    const uniforms = resources.earthMaterial.uniforms;
    uniforms.uProjectionInverse.value.copy(camera.projectionMatrixInverse);
    uniforms.uCameraRotation.value.setFromMatrix4(camera.matrixWorld);
    uniforms.uEyeKm.value.setFromMatrixPosition(camera.matrixWorld).multiplyScalar(0.001);
    uniforms.uEyeKm.value.y += EARTH_RADIUS_KM + Math.max(0.05, state.altitudeKm);
    uniforms.uSunDirection.value.copy(state.sunDirection);
    if (uniforms.uSunDirection.value.lengthSq() < 0.000001) uniforms.uSunDirection.value.set(0, 1, 0);
    uniforms.uSunDirection.value.normalize();

    const previousTarget = gl.getRenderTarget();
    const previousScissorTest = gl.getScissorTest();
    const previousXr = gl.xr.enabled;
    gl.getViewport(previous.viewport);
    gl.getScissor(previous.scissor);
    try {
      gl.xr.enabled = false;
      gl.setRenderTarget(target);
      gl.setScissorTest(false);
      gl.render(resources.earthScene, resources.camera);
    } finally {
      gl.setRenderTarget(previousTarget);
      gl.setViewport(previous.viewport);
      gl.setScissor(previous.scissor);
      gl.setScissorTest(previousScissorTest);
      gl.xr.enabled = previousXr;
    }
    previous.target = target;
    previous.projection.copy(camera.projectionMatrix);
    previous.world.copy(camera.matrixWorld);
    previous.altitudeKm = state.altitudeKm;
    previous.sun.copy(state.sunDirection);
  }, 0);

  return <mesh
    geometry={resources.geometry}
    material={resources.displayMaterial}
    dispose={null}
    frustumCulled={false}
    renderOrder={-1000}
  />;
}
