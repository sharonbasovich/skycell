
import { useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface PlaceholderCadModelProps {
  isExploded: boolean;
  selectedComponent: string | null;
  onComponentSelect: (component: string | null) => void;
}

const PlaceholderCadModel = ({ 
  isExploded, 
  selectedComponent, 
  onComponentSelect 
}: PlaceholderCadModelProps) => {
  const groupRef = useRef<THREE.Group>(null!);
  
  // Determine position offsets for exploded view
  const mainBodyPosition: [number, number, number] = [0, isExploded ? 0 : 0, 0];
  const antennaPosition: [number, number, number] = [0, isExploded ? 1.2 : 0.5, 0];
  const solarPosition: [number, number, number] = [isExploded ? 2 : 1.2, 0, 0];
  const cameraPosition: [number, number, number] = [0, 0, isExploded ? 1.5 : 0.6];
  const gpsPosition: [number, number, number] = [isExploded ? -1.8 : -0.8, isExploded ? 1 : 0.3, 0];
  
  const handleComponentClick = (componentId: string) => {
    console.log('Component clicked:', componentId);
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

export default PlaceholderCadModel;
