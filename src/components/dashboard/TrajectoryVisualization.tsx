
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

// Component for the Earth
const Earth = () => {
  return (
    <mesh position={[0, -100, 0]} rotation={[0.2, 0, 0]}>
      <sphereGeometry args={[100, 64, 64]} />
      <meshStandardMaterial 
        color="#1E3A8A" 
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
};

// Component for the balloon
const BalloonPosition = () => {
  // Create a simple line geometry for the connection
  const linePoints = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.1, 0),
      new THREE.Vector3(0, -0.6, 0)
    ]);
  }, []);

  return (
    <group>
      {/* Balloon */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Payload */}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#8B5CF6" />
      </mesh>
      
      {/* Connection line - using primitive for direct three.js object access */}
      <primitive object={new THREE.LineSegments(
        linePoints,
        new THREE.LineBasicMaterial({ color: "#FFFFFF" })
      )} />
      
      {/* Position light */}
      <pointLight position={[0, 0, 0]} intensity={1} distance={5} color="#FFFFFF" />
    </group>
  );
};

// Corrected TrajectoryPath component
const TrajectoryPath = () => {
  // Create a curved path using THREE.BufferGeometry
  const trajectoryGeometry = useMemo(() => {
    const curveSegments = 100;
    const points = [];
    
    for (let i = 0; i < curveSegments; i++) {
      const t = i / (curveSegments - 1);
      const x = Math.sin(t * Math.PI * 2) * 20;
      const y = t * 15;
      const z = Math.cos(t * Math.PI * 2) * 20;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <primitive 
      object={new THREE.Line(
        trajectoryGeometry,
        new THREE.LineBasicMaterial({ 
          color: "#0EA5E9", 
          opacity: 0.7, 
          transparent: true 
        })
      )}
    />
  );
};

const TrajectoryVisualization = () => {
  return (
    <div className="h-[300px] bg-skycell-dark rounded-lg overflow-hidden">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} />
        <BalloonPosition />
        <Earth />
        <TrajectoryPath />
        <Stars radius={100} depth={50} count={1000} factor={2} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default TrajectoryVisualization;
