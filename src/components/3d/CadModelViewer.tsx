
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import PixelReveal from './PixelReveal';

// Camera Controller Component
const CameraController = ({ targetComponent, onComplete }: { targetComponent: string | null, onComplete: () => void }) => {
  const { camera, controls } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const startPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const startTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const endPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const endTarget = useRef<THREE.Vector3>(new THREE.Vector3());
  const animationProgress = useRef(0);
  
  useEffect(() => {
    if (targetComponent && controls && 'target' in controls) {
      // Define target positions and camera positions for each component
      const componentTargets: Record<string, { target: [number, number, number], position: [number, number, number] }> = {
        main_body: { target: [0, 0, 0], position: [3, 1, 3] },
        antenna: { target: [0, 0.6, 0], position: [2, 2, 2] },
        solar: { target: [1.2, 0, 0], position: [4, 1, 1] },
        camera: { target: [0, 0, 0.6], position: [1, 1, 3] },
        gps: { target: [-0.8, 0.3, 0], position: [-2, 1, 2] }
      };
      
      const config = componentTargets[targetComponent];
      if (config) {
        // Store current position and target
        startPosition.current.copy(camera.position);
        startTarget.current.copy((controls as any).target);
        
        // Set end position and target
        endPosition.current.set(config.position[0], config.position[1], config.position[2]);
        endTarget.current.set(config.target[0], config.target[1], config.target[2]);
        
        // Start animation
        setIsAnimating(true);
        animationProgress.current = 0;
      }
    }
  }, [targetComponent, camera, controls]);
  
  // Animation frame loop
  useFrame((state, delta) => {
    if (isAnimating && controls && 'target' in controls) {
      animationProgress.current += delta * 2; // Animation speed
      
      if (animationProgress.current >= 1) {
        // Animation complete
        animationProgress.current = 1;
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
      }
      
      // Smooth interpolation using easing
      const easeProgress = 1 - Math.pow(1 - animationProgress.current, 3); // Ease out cubic
      
      // Interpolate camera position
      camera.position.lerpVectors(startPosition.current, endPosition.current, easeProgress);
      
      // Interpolate controls target
      const currentTarget = new THREE.Vector3().lerpVectors(startTarget.current, endTarget.current, easeProgress);
      (controls as any).target.copy(currentTarget);
      
      // Update controls
      (controls as any).update();
    }
  });
  
  return null;
};

// GLB CAD Model Component
const GLBCadModel = ({ modelPath, isExploded, selectedComponent, onComponentSelect }: { 
  modelPath?: string; 
  isExploded: boolean;
  selectedComponent: string | null;
  onComponentSelect: (component: string | null) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  
  // Load GLB model - replace with your model path
  // const { scene } = useGLTF(modelPath || '');
  
  // If you have a GLB model, uncomment this and comment out the placeholder
  // return (
  //   <group ref={groupRef} scale={isExploded ? 1.2 : 1}>
  //     <primitive object={scene.clone()} />
  //   </group>
  // );

  // Placeholder CAD model (remove when using GLB)
  return <PlaceholderCadModel isExploded={isExploded} selectedComponent={selectedComponent} onComponentSelect={onComponentSelect} />;
};

// Placeholder CAD Model (remove when using GLB)
const PlaceholderCadModel = ({ 
  isExploded, 
  selectedComponent, 
  onComponentSelect 
}: { 
  isExploded: boolean;
  selectedComponent: string | null;
  onComponentSelect: (component: string | null) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  
  // Determine position offsets for exploded view
  const mainBodyPosition: [number, number, number] = [0, isExploded ? 0 : 0, 0];
  const antennaPosition: [number, number, number] = [0, isExploded ? 1.2 : 0.5, 0];
  const solarPosition: [number, number, number] = [isExploded ? 2 : 1.2, 0, 0];
  const cameraPosition: [number, number, number] = [0, 0, isExploded ? 1.5 : 0.6];
  const gpsPosition: [number, number, number] = [isExploded ? -1.8 : -0.8, isExploded ? 1 : 0.3, 0];
  
  const handleComponentClick = (componentId: string) => {
    onComponentSelect(componentId);
  };
  
  return (
    <group ref={groupRef}>
      {/* Main Body */}
      <mesh 
        position={mainBodyPosition} 
        onPointerOver={() => onComponentSelect('main_body')}
        onPointerOut={() => onComponentSelect(null)}
        onClick={() => handleComponentClick('main_body')}
      >
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial 
          color={selectedComponent === 'main_body' ? '#0EA5E9' : '#FFFFFF'} 
          roughness={0.3}
          metalness={0.7}
        />
        {selectedComponent === 'main_body' && (
          <Html position={[0, 1, 0]}>
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-lg">
              <p className="text-xs font-semibold">Main Body</p>
              <p className="text-xs">Houses the main electronics</p>
            </div>
          </Html>
        )}
      </mesh>
      
      {/* Antenna */}
      <mesh 
        position={antennaPosition} 
        onPointerOver={() => onComponentSelect('antenna')}
        onPointerOut={() => onComponentSelect(null)}
        onClick={() => handleComponentClick('antenna')}
      >
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial 
          color={selectedComponent === 'antenna' ? '#8B5CF6' : '#888888'} 
          roughness={0.2}
          metalness={0.8}
        />
        {selectedComponent === 'antenna' && (
          <Html position={[0, 1, 0]}>
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-lg">
              <p className="text-xs font-semibold">Mesh Network Antenna</p>
              <p className="text-xs">915MHz communications</p>
            </div>
          </Html>
        )}
      </mesh>
      
      {/* Solar Panel */}
      <mesh 
        position={solarPosition} 
        rotation={[0, 0, Math.PI / 2]}
        onPointerOver={() => onComponentSelect('solar')}
        onPointerOut={() => onComponentSelect(null)}
        onClick={() => handleComponentClick('solar')}
      >
        <boxGeometry args={[0.5, 0.8, 0.05]} />
        <meshStandardMaterial 
          color={selectedComponent === 'solar' ? '#0EA5E9' : '#2563EB'} 
          roughness={0.1}
          metalness={0.9}
        />
        {selectedComponent === 'solar' && (
          <Html position={[0, 1, 0]}>
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-lg">
              <p className="text-xs font-semibold">Solar Panel</p>
              <p className="text-xs">5W power generation</p>
            </div>
          </Html>
        )}
      </mesh>
      
      {/* Camera Module */}
      <mesh 
        position={cameraPosition} 
        onPointerOver={() => onComponentSelect('camera')}
        onPointerOut={() => onComponentSelect(null)}
        onClick={() => handleComponentClick('camera')}
      >
        <boxGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial 
          color={selectedComponent === 'camera' ? '#8B5CF6' : '#222222'} 
          roughness={0.5}
        />
        {selectedComponent === 'camera' && (
          <Html position={[0, 1, 0]}>
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-lg">
              <p className="text-xs font-semibold">Camera Module</p>
              <p className="text-xs">8MP image sensor</p>
            </div>
          </Html>
        )}
      </mesh>
      
      {/* GPS Module */}
      <mesh 
        position={gpsPosition} 
        onPointerOver={() => onComponentSelect('gps')}
        onPointerOut={() => onComponentSelect(null)}
        onClick={() => handleComponentClick('gps')}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={selectedComponent === 'gps' ? '#0EA5E9' : '#DDDDDD'} 
          roughness={0.3}
        />
        {selectedComponent === 'gps' && (
          <Html position={[0, 1, 0]}>
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-md shadow-lg">
              <p className="text-xs font-semibold">GPS Module</p>
              <p className="text-xs">High-precision positioning</p>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
};

const CadModelViewer = ({ modelPath = "", selectedComponent = null, onComponentSelect = () => {} }: { 
  modelPath?: string;
  selectedComponent?: string | null;
  onComponentSelect?: (component: string | null) => void;
}) => {
  const [viewMode, setViewMode] = useState('3d');
  
  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          className={`px-3 py-1 rounded-md text-sm ${viewMode === '3d' ? 'bg-primary text-white' : 'bg-background text-primary border border-primary'}`}
          onClick={() => setViewMode('3d')}
        >
          3D View
        </button>
        <button 
          className={`px-3 py-1 rounded-md text-sm ${viewMode === 'exploded' ? 'bg-primary text-white' : 'bg-background text-primary border border-primary'}`}
          onClick={() => setViewMode('exploded')}
        >
          Exploded View
        </button>
      </div>
      
      <PixelReveal className="h-full w-full" gridSize={25} delay={500}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[4, 3, 4]} />
          
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-primary">Loading Model...</p>
              </div>
            </Html>
          }>
            <GLBCadModel 
              modelPath={modelPath} 
              isExploded={viewMode === 'exploded'} 
              selectedComponent={selectedComponent}
              onComponentSelect={onComponentSelect}
            />
            <Grid 
              position={[0, -0.5, 0]} 
              args={[10, 10]} 
              cellSize={0.5} 
              cellThickness={0.5} 
              cellColor="#6366F1" 
              sectionSize={2}
              sectionThickness={1}
              sectionColor="#8B5CF6"
              fadeDistance={30}
            />
            <Environment preset="studio" />
            <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={1.5} far={4} />
            <CameraController targetComponent={selectedComponent} onComplete={() => {}} />
          </Suspense>
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </PixelReveal>
    </div>
  );
};

export default CadModelViewer;
