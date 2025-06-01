
import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedBalloon = ({ position, scale, color, speed = 1 }) => {
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    groupRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    groupRef.current.rotation.y = t * 0.2;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Balloon sphere */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.9} 
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Balloon string */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.8]} />
        <meshStandardMaterial 
          color="#888888" 
          roughness={0.3} 
          metalness={0.7}
        />
      </mesh>
      
      {/* Small payload/basket */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial 
          color="#654321" 
          roughness={0.5} 
          metalness={0.3}
        />
      </mesh>
    </group>
  );
};

const BalloonCloud = ({ count = 20, radius = 20 }) => {
  const points = Array.from({ length: count }, () => [
    (Math.random() - 0.5) * radius,
    (Math.random() - 0.5) * radius * 0.5,
    (Math.random() - 0.5) * radius
  ]);
  
  return (
    <group>
      {points.map((position, i) => (
        <AnimatedBalloon 
          key={i} 
          position={position} 
          scale={[0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.4, 0.3 + Math.random() * 0.4]} 
          color={i % 2 === 0 ? "#0EA5E9" : "#8B5CF6"} 
          speed={0.3 + Math.random() * 0.4}
        />
      ))}
    </group>
  );
};

const BackgroundScene = () => {
  return (
    <div className="canvas-container">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <BalloonCloud />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
