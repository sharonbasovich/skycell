
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, useTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';

// PhysicsSphere component that reacts to cursor
const PhysicsSphere = ({ position, scale, color, speed = 1 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const velocity = useRef(new THREE.Vector3(
    Math.random() * 0.01 - 0.005,
    Math.random() * 0.01 - 0.005,
    Math.random() * 0.01 - 0.005
  ));
  const target = useRef(new THREE.Vector3(...position));
  
  // Use cursor position
  useFrame(({ mouse, viewport }) => {
    if (!meshRef.current) return;

    // Convert mouse coordinates to world space
    const x = (mouse.x * viewport.width) / 2;
    const y = (mouse.y * viewport.height) / 2;

    // Basic physics simulation
    const mesh = meshRef.current;
    
    // Apply force if cursor is close (cursor attraction/repulsion)
    const cursorPosition = new THREE.Vector3(x, y, 0);
    const distance = mesh.position.distanceTo(cursorPosition);
    
    if (distance < 3) {
      // Calculate direction from cursor to sphere
      const direction = new THREE.Vector3().subVectors(mesh.position, cursorPosition);
      direction.normalize();
      
      // Apply "hit" force - inversely proportional to distance
      const force = 0.01 / Math.max(0.2, distance * 0.5);
      velocity.current.add(direction.multiplyScalar(force));
    }

    // Update position based on velocity
    mesh.position.add(velocity.current);
    
    // Apply damping (slow down over time)
    velocity.current.multiplyScalar(0.98);
    
    // Soft boundary forces to keep spheres in view
    const boundaryForce = 0.001;
    const bounds = 10;
    
    if (Math.abs(mesh.position.x) > bounds) {
      velocity.current.x -= Math.sign(mesh.position.x) * boundaryForce;
    }
    
    if (Math.abs(mesh.position.y) > bounds) {
      velocity.current.y -= Math.sign(mesh.position.y) * boundaryForce;
    }
    
    if (Math.abs(mesh.position.z) > bounds) {
      velocity.current.z -= Math.sign(mesh.position.z) * boundaryForce * 0.5;
    }
    
    // Slow rotation based on velocity
    const rotationSpeed = velocity.current.length() * 10;
    mesh.rotation.x += rotationSpeed * 0.3;
    mesh.rotation.y += rotationSpeed * 0.2;
    mesh.rotation.z += rotationSpeed * 0.1;
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
        <PhysicsSphere 
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

// MouseTracker to visualize cursor in 3D space
const MouseTracker = () => {
  const { mouse, viewport } = useThree();
  // Fix: Ensure we have a proper Vector3 compatible position with exactly 3 elements
  const x = (mouse.x * viewport.width) / 2;
  const y = (mouse.y * viewport.height) / 2;
  const z = 0;

  return (
    <pointLight 
      position={[x, y, z]} 
      intensity={2}
      distance={3}
      decay={2}
      color="#ffffff"
    />
  );
};

const BackgroundScene = () => {
  return (
    <div className="canvas-container">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ cursor: 'none' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Cloud count={25} />
        <Environment preset="sunset" />
        <MouseTracker />
      </Canvas>
    </div>
  );
};

export default BackgroundScene;
