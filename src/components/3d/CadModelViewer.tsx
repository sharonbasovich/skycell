
import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import PixelReveal from './PixelReveal';

// GLB CAD Model Component
const GLBCadModel = ({ modelPath, isExploded }: { modelPath?: string; isExploded: boolean }) => {
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
  return <PlaceholderCadModel isExploded={isExploded} />;
};

// Placeholder CAD Model (remove when using GLB)
const PlaceholderCadModel = ({ isExploded }: { isExploded: boolean }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  
  // Determine position offsets for exploded view
  // Fix: Define positions as tuples with exactly 3 elements [x, y, z]
  const mainBodyPosition: [number, number, number] = [0, isExploded ? 0 : 0, 0];
  const antennaPosition: [number, number, number] = [0, isExploded ? 1.2 : 0.5, 0];
  const solarPosition: [number, number, number] = [isExploded ? 2 : 1.2, 0, 0];
  const cameraPosition: [number, number, number] = [0, 0, isExploded ? 1.5 : 0.6];
  const gpsPosition: [number, number, number] = [isExploded ? -1.8 : -0.8, isExploded ? 1 : 0.3, 0];
  
  return (
    <group ref={groupRef}>
      {/* Main Body */}
      <mesh 
        position={mainBodyPosition} 
        onPointerOver={() => setHoveredPart('main_body')}
        onPointerOut={() => setHoveredPart(null)}
      >
        <boxGeometry args={[2, 0.5, 1]} />
        <meshStandardMaterial 
          color={hoveredPart === 'main_body' ? '#0EA5E9' : '#FFFFFF'} 
          roughness={0.3}
          metalness={0.7}
        />
        {hoveredPart === 'main_body' && (
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
        onPointerOver={() => setHoveredPart('antenna')}
        onPointerOut={() => setHoveredPart(null)}
      >
        <cylinderGeometry args={[0.05, 0.05, 1]} />
        <meshStandardMaterial 
          color={hoveredPart === 'antenna' ? '#8B5CF6' : '#888888'} 
          roughness={0.2}
          metalness={0.8}
        />
        {hoveredPart === 'antenna' && (
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
        onPointerOver={() => setHoveredPart('solar')}
        onPointerOut={() => setHoveredPart(null)}
      >
        <boxGeometry args={[0.5, 0.8, 0.05]} />
        <meshStandardMaterial 
          color={hoveredPart === 'solar' ? '#0EA5E9' : '#2563EB'} 
          roughness={0.1}
          metalness={0.9}
        />
        {hoveredPart === 'solar' && (
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
        onPointerOver={() => setHoveredPart('camera')}
        onPointerOut={() => setHoveredPart(null)}
      >
        <boxGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial 
          color={hoveredPart === 'camera' ? '#8B5CF6' : '#222222'} 
          roughness={0.5}
        />
        {hoveredPart === 'camera' && (
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
        onPointerOver={() => setHoveredPart('gps')}
        onPointerOut={() => setHoveredPart(null)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color={hoveredPart === 'gps' ? '#0EA5E9' : '#DDDDDD'} 
          roughness={0.3}
        />
        {hoveredPart === 'gps' && (
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

const CadModelViewer = ({ modelPath = "" }: { modelPath?: string }) => {
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
            <GLBCadModel modelPath={modelPath} isExploded={viewMode === 'exploded'} />
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
          </Suspense>
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </PixelReveal>
    </div>
  );
};

export default CadModelViewer;
