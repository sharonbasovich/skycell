import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, useTexture, Environment } from "@react-three/drei";
import * as THREE from "three";

// Seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  random(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  randomInt(min: number, max: number): number {
    return Math.floor(this.random(min, max + 1));
  }
}

const AnimatedBalloon = ({ position, scale, color, speed = 1 }) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    groupRef.current.rotation.y = t * 0.2;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Main balloon envelope - taller ellipsoid shape */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={1.5}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Balloon neck/valve at bottom */}
      <mesh position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.3]} />
        <meshStandardMaterial color="#444444" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Main suspension lines */}
      <mesh position={[0, -1.7, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.8]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Additional suspension lines for realism */}
      <mesh position={[0.1, -1.7, 0.1]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.005, 0.005, 0.75]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-0.1, -1.7, -0.1]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.005, 0.005, 0.75]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Enlarged payload box for better visibility */}
      <mesh position={[0, -2.3, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.3]} />
        <meshStandardMaterial color="#654321" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Solar panels on payload */}
      <mesh position={[0.18, -2.25, 0]} rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.15, 0.18, 0.01]} />
        <meshStandardMaterial color="#1a365d" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.18, -2.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.15, 0.18, 0.01]} />
        <meshStandardMaterial color="#1a365d" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Communication antenna */}
      <mesh position={[0, -2.1, 0.18]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>

      {/* Small parachute attachment point */}
      <mesh position={[0, -2.55, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#ff4444" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
};

// Configurable balloon cloud parameters
interface BalloonCloudConfig {
  seed: number; // Random seed for consistent arrangement
  count: number; // Number of balloons
  radius: number; // Distribution radius
  sizeRange: {
    // Size range for balloons
    min: number;
    max: number;
  };
  heightFactor: number; // How much to flatten the Y distribution (0.6 = 60% of radius)
  speedRange: {
    // Animation speed range
    min: number;
    max: number;
  };
}

const BalloonCloud = ({
  config = {
    seed: 12345,
    count: 35,
    radius: 25,
    sizeRange: { min: 0.3, max: 0.5 },
    heightFactor: 0.6,
    speedRange: { min: 0.2, max: 0.5 },
  },
}: {
  config?: BalloonCloudConfig;
}) => {
  const rng = new SeededRandom(config.seed);

  const points = Array.from({ length: config.count }, () => [
    rng.random(-config.radius, config.radius),
    rng.random(
      -config.radius * config.heightFactor,
      config.radius * config.heightFactor
    ),
    rng.random(-config.radius, config.radius),
  ]);

  const colors = ["#FFFFFF", "#F0F8FF", "#E6F3FF", "#0EA5E9", "#8B5CF6"];

  return (
    <group>
      {points.map((position, i) => {
        const size = rng.random(config.sizeRange.min, config.sizeRange.max);
        const speed = rng.random(config.speedRange.min, config.speedRange.max);
        const color = colors[i % colors.length];

        return (
          <AnimatedBalloon
            key={i}
            position={position}
            scale={[size, size * 1.5, size]} // Keep proportions but use single size value
            color={color}
            speed={speed}
          />
        );
      })}
    </group>
  );
};

const BackgroundScene = () => {
  // Easy to edit configuration - change these values to tune the balloon arrangement
  const balloonConfig: BalloonCloudConfig = {
    seed: 12346, // Change this to get different arrangements
    count: 150, // Number of balloons (try 20-50)
    radius: 25, // Distribution radius (try 15-35)
    sizeRange: { min: 0.3, max: 0.5 }, // Balloon size range (try 0.2-0.8)
    heightFactor: 0.6, // Height flattening (try 0.4-0.8)
    speedRange: { min: 0.2, max: 0.5 }, // Animation speed (try 0.1-0.8)
  };

  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.5}
          color="#8B5CF6"
        />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <BalloonCloud config={balloonConfig} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
