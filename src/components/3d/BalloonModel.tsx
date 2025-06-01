
import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { useInView } from 'react-intersection-observer';
import * as THREE from 'three';
import PixelReveal from './PixelReveal';

// Placeholder for balloon model
const Balloon = ({ interactive = false }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const [rotationSpeed] = useState(() => 0.2 + Math.random() * 0.2);
  
  useFrame(({ clock }) => {
    if (!interactive) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.y = t * rotationSpeed;
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => interactive && setHovered(true)}
      onPointerOut={() => interactive && setHovered(false)}
    >
      {/* Balloon */}
      <mesh position={[0, 2, 0]} scale={hovered && interactive ? 1.1 : 1}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color={hovered && interactive ? "#0EA5E9" : "#FFFFFF"} 
          roughness={0.3} 
          metalness={0.2}
        />
      </mesh>
      
      {/* Payload box */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color="#8B5CF6" roughness={0.5} />
      </mesh>
      
      {/* Antennas */}
      <mesh position={[0.4, -0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      
      {/* Solar panels */}
      <mesh position={[-0.6, -1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.8, 0.8, 0.02]} />
        <meshStandardMaterial color="#0EA5E9" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Connection strings */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={6}
            array={new Float32Array([
              0, 0, 0, 0, 2, 0,
              0, 0, 0, 0.5, 2, 0,
              0, 0, 0, -0.5, 2, 0,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#888888" linewidth={1} />
      </lineSegments>
    </group>
  );
};

const BalloonModel = ({ interactive = false }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.8, // Increased threshold to wait until more of the element is visible
    rootMargin: '-100px 0px', // Add negative margin to trigger later
  });

  return (
    <div ref={ref} className="h-full w-full">
      <PixelReveal 
        className="h-full w-full" 
        gridSize={20} 
        delay={inView ? 500 : 0} // Increased delay
      >
        <Canvas className={interactive ? "interactive" : ""}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <Float speed={1} rotationIntensity={0} floatIntensity={1} enabled={!interactive}>
            <Balloon interactive={interactive} />
          </Float>
          {interactive && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
        </Canvas>
      </PixelReveal>
    </div>
  );
};

export default BalloonModel;
