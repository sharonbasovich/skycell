import { useEffect, useMemo, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Matrix3, Matrix4, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import type { CinematicFrame } from "./cinematicTypes";
import { EARTH_RADIUS_KM, sampleGeographicObserver } from "./spatialEnvironment";

interface Props { frame: MutableRefObject<CinematicFrame> }

const vertexShader = /* glsl */ `
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}`;

// A texture-free spherical Earth/air approximation for progressive loading.
// Eye/ray/sun use the same kilometre east/up/north frame as CinematicEarth.
// There is no fixed horizon line or camera-facing photograph to drag around.
const fragmentShader = /* glsl */ `
varying vec2 vNdc;
uniform mat4 uProjectionInverse;
uniform mat3 uCameraRotation;
uniform vec3 uEyeKm;
uniform vec3 uSunDirection;
const float R = 6371.0;
const vec3 BETA_R = vec3(.0058, .0135, .0331);

void main() {
  vec4 view = uProjectionInverse * vec4(vNdc, 1.0, 1.0);
  vec3 ray = normalize(uCameraRotation * (view.xyz / max(view.w, .000001)));
  float eyeRadius = length(uEyeKm);
  float altitude = max(eyeRadius - R, .05);
  vec3 up = uEyeKm / eyeRadius;
  vec3 sun = normalize(uSunDirection);
  float mu = dot(up, ray);
  float horizonMu = -sqrt(max(1.0 - (R / eyeRadius) * (R / eyeRadius), 0.0));
  float b = dot(uEyeKm, ray);
  float c = (eyeRadius - R) * (eyeRadius + R);
  float discriminant = b * b - c;
  bool groundHit = b < 0.0 && discriminant >= 0.0;
  float density = exp(-altitude / 8.0);
  // Tangent-path regularization preserves a finite atmospheric limb while
  // converging to the vertical exponential air column for upward views.
  float air = min(16.0 * density / max(mu + sqrt(mu * mu + 16.0 / R), .001), 900.0);
  vec3 base = vec3(.0015, .0035, .008);
  if (groundHit) {
    float distance = c / max(-b + sqrt(max(discriminant, 0.0)), .0001);
    vec3 normal = normalize(uEyeKm + ray * distance);
    float daylight = max(dot(normal, sun), 0.0);
    base = vec3(.058, .094, .109) * (.045 + daylight * 1.10);
    float downwardAir = min(8.0 * (1.0 - density) / max(-mu, .035), 900.0);
    // Meet the tangent sky column smoothly at the true spherical limb.
    air = mix(downwardAir, air, smoothstep(horizonMu - .025, horizonMu, mu));
  }
  vec3 transmission = exp(-BETA_R * air);
  float cosine = clamp(dot(ray, sun), -1.0, 1.0);
  float phase = .1875 * (1.0 + cosine * cosine);
  float daylight = smoothstep(-.10, .08, dot(up, sun));
  vec3 scattering = vec3(1.08, 1.13, 1.20) * phase * (1.0 - transmission) * daylight;
  float forward = max(cosine, 0.0);
  forward *= forward; forward *= forward; forward *= forward;
  scattering += vec3(.035, .028, .019) * forward * (1.0 - transmission) * daylight;
  gl_FragColor = vec4(max(base * transmission + scattering, vec3(0.0)), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

/** Immediate physical sky/ground, independent of every image/HDR/model loader. */
export default function ProgressiveSky({ frame }: Props) {
  const resources = useMemo(() => ({
    geometry: new PlaneGeometry(2, 2),
    worldEye: new Vector3(),
    material: new ShaderMaterial({
      vertexShader, fragmentShader,
      depthTest: false, depthWrite: false, transparent: false, toneMapped: true,
      uniforms: {
        uProjectionInverse: { value: new Matrix4() },
        uCameraRotation: { value: new Matrix3() },
        uEyeKm: { value: new Vector3(0, EARTH_RADIUS_KM + 8, 0) },
        uSunDirection: { value: new Vector3(0, 1, 0) },
      },
    }),
  }), []);

  useFrame(({ camera }) => {
    const state = frame.current, uniforms = resources.material.uniforms;
    resources.worldEye.setFromMatrixPosition(camera.matrixWorld);
    sampleGeographicObserver(state.flightProgress ?? state.progress, state.altitudeKm, resources.worldEye, uniforms.uEyeKm.value);
    uniforms.uProjectionInverse.value.copy(camera.projectionMatrixInverse);
    uniforms.uCameraRotation.value.setFromMatrix4(camera.matrixWorld);
    uniforms.uSunDirection.value.copy(state.sunDirection);
    if (uniforms.uSunDirection.value.lengthSq() < .000001) uniforms.uSunDirection.value.set(0, 1, 0);
    uniforms.uSunDirection.value.normalize();
  }, 0);

  useEffect(() => () => {
    resources.geometry.dispose(); resources.material.dispose();
  }, [resources]);

  return <mesh geometry={resources.geometry} material={resources.material} dispose={null} frustumCulled={false} renderOrder={-1001} />;
}
