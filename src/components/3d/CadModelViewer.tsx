
import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, ContactShadows, Html } from '@react-three/drei';
import PixelReveal from './PixelReveal';
import CameraController from './CameraController';
import PlaceholderCadModel from './PlaceholderCadModel';

const CadModelViewer = ({ modelPath = "", selectedComponent = null, onComponentSelect = () => {} }: { 
  modelPath?: string;
  selectedComponent?: string | null;
  onComponentSelect?: (component: string | null) => void;
}) => {
  const [viewMode, setViewMode] = useState('3d');
  const [animationTarget, setAnimationTarget] = useState<string | null>(null);
  
  // Handle component selection and trigger camera animation
  const handleComponentSelect = (componentId: string | null) => {
    console.log('CadModelViewer handleComponentSelect called with:', componentId);
    onComponentSelect(componentId);
    
    // Trigger camera animation for the clicked component
    if (componentId) {
      setAnimationTarget(componentId);
      // Reset animation target
      setTimeout(() => setAnimationTarget(null), 200);
    }
  };
  
  // Handle external component selection (from sidebar)
  useEffect(() => {
    if (selectedComponent) {
      console.log('External selectedComponent changed to:', selectedComponent);
      setAnimationTarget(selectedComponent);
      // Reset animation target
      setTimeout(() => setAnimationTarget(null), 200);
    }
  }, [selectedComponent]);
  
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
            <PlaceholderCadModel 
              isExploded={viewMode === 'exploded'} 
              selectedComponent={selectedComponent}
              onComponentSelect={handleComponentSelect}
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
            <CameraController targetComponent={animationTarget} />
          </Suspense>
          
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </PixelReveal>
    </div>
  );
};

export default CadModelViewer;
