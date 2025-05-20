
import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = ({ position, scale, color, speed = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.5;
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.2;
    meshRef.current.rotation.z = t * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.8} 
        envMapIntensity={1}
      />
    </mesh>
  );
};

const Cloud = ({ count = 20, radius = 20 }) => {
  const points = Array.from({ length: count }, () => [
    (Math.random() - 0.5) * radius,
    (Math.random() - 0.5) * radius * 0.5,
    (Math.random() - 0.5) * radius
  ]);
  
  return (
    <group>
      {points.map((position, i) => (
        <AnimatedSphere 
          key={i} 
          position={position} 
          scale={[0.2 + Math.random() * 0.3, 0.2 + Math.random() * 0.3, 0.2 + Math.random() * 0.3]} 
          color={i % 2 === 0 ? "#0EA5E9" : "#8B5CF6"} 
          speed={0.5 + Math.random() * 0.5}
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
        <Cloud />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
