import { useEffect, useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, Quaternion, RepeatWrapping, SRGBColorSpace, Vector3 } from "three";

type Point = [number, number, number];

function Tether({ start, end, radius = 0.008, color = "#e5e5db" }: { start: Point; end: Point; radius?: number; color?: string }) {
  const transform = useMemo(() => {
    const a = new Vector3(...start), b = new Vector3(...end);
    const direction = b.clone().sub(a);
    return { center: a.clone().add(b).multiplyScalar(0.5), length: direction.length(), quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize()) };
  }, [start, end]);
  return <mesh position={transform.center} quaternion={transform.quaternion}><cylinderGeometry args={[radius, radius, transform.length, 6]} /><meshStandardMaterial color={color} roughness={0.75} /></mesh>;
}

function usePayloadTextures() {
  const textures = useMemo(() => {
    const foamCanvas = document.createElement("canvas");
    foamCanvas.width = foamCanvas.height = 128;
    const context = foamCanvas.getContext("2d");
    if (context) {
      const pixels = context.createImageData(128, 128);
      for (let i = 0; i < 128 * 128; i++) {
        const grain = 190 + Math.floor((Math.sin(i * 71.731) * 1449.137 % 1 + 1) * 25);
        pixels.data[i * 4] = grain;
        pixels.data[i * 4 + 1] = grain;
        pixels.data[i * 4 + 2] = grain;
        pixels.data[i * 4 + 3] = 255;
      }
      context.putImageData(pixels, 0, 0);
    }
    const foam = new CanvasTexture(foamCanvas);
    foam.wrapS = foam.wrapT = RepeatWrapping;
    foam.repeat.set(6, 4);
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512; labelCanvas.height = 256;
    const label = labelCanvas.getContext("2d");
    if (label) {
      label.fillStyle = "#f7f7ed"; label.fillRect(0, 0, 512, 256);
      label.fillStyle = "#143d73";
      label.font = "600 57px Arial"; label.fillText("SKYCELL", 27, 83);
      label.fillRect(30, 111, 450, 3);
      label.font = "23px Arial"; label.fillText("915 MHz / MESH PAYLOAD", 30, 160);
      label.fillStyle = "#728497"; label.font = "18px Arial"; label.fillText("CONCEPT MODEL", 30, 207);
    }
    const decal = new CanvasTexture(labelCanvas);
    decal.colorSpace = SRGBColorSpace;
    decal.anisotropy = 4;
    return { foam, decal };
  }, []);
  useEffect(() => () => { textures.foam.dispose(); textures.decal.dispose(); }, [textures]);
  return textures;
}

export function Payload() {
  const { foam, decal } = usePayloadTextures();
  return (
    <group rotation={[0.035, -0.17, -0.035]}>
      <RoundedBox args={[1.6, 0.94, 1.13]} radius={0.065} smoothness={3}>
        <meshStandardMaterial color="#f0f0e4" roughness={0.9} bumpMap={foam} bumpScale={0.018} envMapIntensity={0.3} />
      </RoundedBox>
      <RoundedBox position={[0, 0.46, 0]} args={[1.62, 0.10, 1.15]} radius={0.025} smoothness={2}><meshStandardMaterial color="#faf9ed" roughness={0.76} /></RoundedBox>
      <mesh position={[0.12, 0.59, 0]}><cylinderGeometry args={[0.20, 0.15, 0.17, 32]} /><meshStandardMaterial color="#1f49c5" roughness={0.32} metalness={0.08} /></mesh>
      <mesh position={[0.12, 0.70, 0]}><torusGeometry args={[0.09, 0.018, 8, 20]} /><meshStandardMaterial color="#90a8d7" metalness={0.65} roughness={0.24} /></mesh>
      <mesh position={[0, 0, 0.572]}><planeGeometry args={[1.14, 0.56]} /><meshStandardMaterial map={decal} roughness={0.8} /></mesh>
      <mesh position={[0.82, 0.10, 0.07]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.15, 16]} /><meshStandardMaterial color="#263041" metalness={0.7} roughness={0.3} /></mesh>
      <Tether start={[0.89, 0.10, 0.07]} end={[3.10, 0.58, 0.12]} radius={0.018} color="#111827" />
      <Tether start={[3.10, 0.58, 0.12]} end={[3.43, 0.65, 0.12]} radius={0.011} color="#111827" />
      <mesh position={[-0.64, 0.02, -0.573]}><boxGeometry args={[0.12, 0.82, 0.012]} /><meshStandardMaterial color="#d0d7db" roughness={0.8} /></mesh>
    </group>
  );
}

function HeliumBalloon({ scale = 1, position }: { scale?: number; position: Point }) {
  return (
    <group position={position} scale={scale}>
      <mesh scale={[1, 1.035, 1]}><sphereGeometry args={[2.05, 64, 40]} /><meshPhysicalMaterial color="#fff9ea" roughness={0.33} metalness={0} clearcoat={0.12} clearcoatRoughness={0.36} envMapIntensity={0.72} /></mesh>
      <mesh position={[0, -2.12, 0]}><cylinderGeometry args={[0.085, 0.045, 0.18, 16]} /><meshStandardMaterial color="#eeeadd" roughness={0.55} /></mesh>
      <mesh position={[0, -2.24, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.055, 0.018, 6, 16]} /><meshStandardMaterial color="#cbcbbf" roughness={0.6} /></mesh>
    </group>
  );
}

export default function BalloonTrain() {
  return (
    <group>
      <HeliumBalloon position={[0.06, 12.45, 0]} />
      <HeliumBalloon position={[0.48, 6.75, -0.08]} scale={0.56} />
      <Tether start={[0.06, 10.20, 0]} end={[-0.12, 8.15, 0.06]} />
      <Tether start={[-0.12, 8.15, 0.06]} end={[0.22, 4.73, 0]} />
      <Tether start={[0.48, 5.49, -0.08]} end={[0.22, 4.73, 0]} />
      <Tether start={[0.22, 4.73, 0]} end={[-0.06, 2.8, 0.11]} />
      <Tether start={[-0.06, 2.8, 0.11]} end={[0.12, 0.72, 0]} />
      <group position={[-0.12, 8.15, 0.06]} rotation={[0.02, 0.4, -0.09]}>
        <RoundedBox args={[0.44, 0.37, 0.31]} radius={0.025} smoothness={2}><meshStandardMaterial color="#f5efe0" roughness={0.7} /></RoundedBox>
        <mesh position={[0, 0, 0.159]}><planeGeometry args={[0.23, 0.13]} /><meshStandardMaterial color="#1d4d91" roughness={0.5} /></mesh>
      </group>
      <group position={[0.22, 4.73, 0]} rotation={[0.1, -0.3, 0.08]}>
        <RoundedBox args={[0.52, 0.28, 0.38]} radius={0.03} smoothness={2}><meshStandardMaterial color="#f2f0e4" roughness={0.85} /></RoundedBox>
        <mesh position={[0.15, 0.17, 0]}><cylinderGeometry args={[0.015, 0.015, 0.25, 6]} /><meshStandardMaterial color="#242e39" /></mesh>
      </group>
      <group position={[-0.06, 2.8, 0.11]} rotation={[0.05, 0.2, -0.12]}>
        <RoundedBox args={[0.34, 0.43, 0.29]} radius={0.03} smoothness={2}><meshStandardMaterial color="#e1d9bc" roughness={0.8} /></RoundedBox>
        <mesh position={[0, 0, 0.15]}><planeGeometry args={[0.22, 0.26]} /><meshStandardMaterial color="#eae9df" roughness={0.8} /></mesh>
      </group>
      <Payload />
    </group>
  );
}

export function GroundStation() {
  return (
    <group position={[-6.8, -2.64, 1.6]} rotation={[0, 0.25, 0]}>
      <mesh position={[0, -0.16, 0]}><cylinderGeometry args={[1.3, 1.4, 0.12, 48]} /><meshStandardMaterial color="#648493" roughness={0.9} /></mesh>
      <RoundedBox args={[0.75, 0.44, 0.52]} radius={0.035} smoothness={2}><meshStandardMaterial color="#e4e8e5" roughness={0.67} metalness={0.12} /></RoundedBox>
      <mesh position={[0.19, 0.72, 0]}><cylinderGeometry args={[0.018, 0.018, 1.04, 8]} /><meshStandardMaterial color="#d0dce4" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0.19, 1.23, 0]}><sphereGeometry args={[0.04, 12, 8]} /><meshStandardMaterial color="#1b4dc5" roughness={0.3} /></mesh>
      {[-0.31, 0.0, 0.31].map((height) => <mesh key={height} position={[0.19, 0.73 + height, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 0.63, 6]} /><meshStandardMaterial color="#e3e8ec" metalness={0.55} roughness={0.32} /></mesh>)}
    </group>
  );
}
