
import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, PerspectiveCamera, OrbitControls, Html } from '@react-three/drei';
import { useInView } from 'react-intersection-observer';
import * as THREE from 'three';
import PixelReveal from './PixelReveal';

// GLB Model Loader Component
const GLBModel = ({ modelPath, interactive = false }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const [rotationSpeed] = useState(() => 0.2 + Math.random() * 0.2);
  
  // Load GLB model - replace with your model path
  // const { scene } = useGLTF(modelPath);
  
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
      scale={hovered && interactive ? 1.1 : 1}
    >
      {/* Uncomment this line and comment out the placeholder when you have a GLB model */}
      {/* <primitive object={scene.clone()} /> */}
      
      {/* Placeholder balloon - remove when using GLB */}
      <PlaceholderBalloon interactive={interactive} hovered={hovered} />
    </group>
  );
};

// Placeholder balloon component (remove when using GLB)
const PlaceholderBalloon = ({ interactive, hovered }) => {
  return (
    <group>
      {/* Balloon */}
      <mesh position={[0, 2, 0]}>
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

const BalloonModel = ({ interactive = false, modelPath = "" }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
    rootMargin: '-50px 0px',
  });

  return (
    <div ref={ref} className="h-full w-full">
      <PixelReveal 
        className="h-full w-full" 
        gridSize={20} 
        delay={inView ? 800 : 0}
      >
        <Canvas className={interactive ? "interactive" : ""}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-xs text-primary">Loading Model...</p>
              </div>
            </Html>
          }>
            <Float speed={1} rotationIntensity={0} floatIntensity={1} enabled={!interactive}>
              <GLBModel modelPath={modelPath} interactive={interactive} />
            </Float>
          </Suspense>
          {interactive && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
        </Canvas>
      </PixelReveal>
    </div>
  );
};

export default BalloonModel;
