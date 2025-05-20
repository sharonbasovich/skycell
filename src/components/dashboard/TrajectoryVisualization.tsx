
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';

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
      
      {/* Connection line */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute 
            attach="attributes-position" 
            array={new Float32Array([0, -0.1, 0, 0, -0.6, 0])} 
            count={2} 
            itemSize={3} 
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FFFFFF" />
      </line>
      
      {/* Position light */}
      <pointLight position={[0, 0, 0]} intensity={1} distance={5} color="#FFFFFF" />
    </group>
  );
};

// Fixed TrajectoryPath component
const TrajectoryPath = () => {
  // Create a curved path representing the balloon's trajectory
  const curveSegments = 100;
  const pointsArray = new Float32Array(curveSegments * 3);
  
  for (let i = 0; i < curveSegments; i++) {
    const t = i / (curveSegments - 1);
    const idx = i * 3;
    pointsArray[idx] = Math.sin(t * Math.PI * 2) * 20;
    pointsArray[idx + 1] = t * 15;
    pointsArray[idx + 2] = Math.cos(t * Math.PI * 2) * 20;
  }
  
  return (
    <line>
      <bufferGeometry>
        <float32BufferAttribute
          attach="attributes-position"
          array={pointsArray}
          count={curveSegments}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#0EA5E9" opacity={0.7} transparent />
    </line>
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
