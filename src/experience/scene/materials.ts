import { BackSide, Color, ShaderMaterial } from "three";

// Both shaders work in world space. The globe has rotation and uniform scale
// only, so mat3(modelMatrix) transforms its normals without nonuniform distortion.
const globeVertex = `
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec3 vLocalPosition;
void main() {
  vLocalPosition = position;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
}`;

export function createAtmosphereMaterial() {
  return new ShaderMaterial({
    transparent: true,
    side: BackSide,
    depthWrite: false,
    uniforms: { uColor: { value: new Color("#5ea7ed") } },
    vertexShader: globeVertex,
    fragmentShader: `
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      uniform vec3 uColor;
      void main() {
        vec3 n = normalize(vWorldNormal);
        vec3 viewDirection = normalize(cameraPosition-vWorldPosition);
        float rim = pow(clamp(1.0-abs(dot(n,viewDirection)),0.0,1.0),4.0);
        gl_FragColor = vec4(uColor, rim * 0.38);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}
