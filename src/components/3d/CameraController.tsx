
import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  targetComponent: string | null;
}

const CameraController = ({ targetComponent }: CameraControllerProps) => {
  const { camera, controls } = useThree();
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef({
    startPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 0
  });
  
  useEffect(() => {
    if (!targetComponent || !controls) return;
    
    console.log('Starting camera animation for:', targetComponent);
    
    // Define optimized component positions and targets for better framing
    const positions: Record<string, { position: THREE.Vector3, target: THREE.Vector3 }> = {
      main_body: { 
        position: new THREE.Vector3(2.5, 1.5, 2.5), 
        target: new THREE.Vector3(0, 0, 0) 
      },
      antenna: { 
        position: new THREE.Vector3(1.5, 3, 1.5), 
        target: new THREE.Vector3(0, 0.5, 0) 
      },
      solar: { 
        position: new THREE.Vector3(3.5, 0.5, 1), 
        target: new THREE.Vector3(1.2, 0, 0) 
      },
      camera: { 
        position: new THREE.Vector3(1, 1.5, 4), 
        target: new THREE.Vector3(0, 0, 0.6) 
      },
      gps: { 
        position: new THREE.Vector3(-2.5, 2, 2.5), 
        target: new THREE.Vector3(-0.8, 0.3, 0) 
      }
    };
    
    const config = positions[targetComponent];
    if (!config) return;
    
    // Store animation data
    const anim = animationRef.current;
    anim.startPosition.copy(camera.position);
    anim.startTarget.copy((controls as any).target);
    anim.endPosition.copy(config.position);
    anim.endTarget.copy(config.target);
    anim.progress = 0;
    
    // Disable controls and start animation
    (controls as any).enabled = false;
    setIsAnimating(true);
    
    console.log('Animation setup complete, moving from:', anim.startPosition, 'to:', anim.endPosition);
  }, [targetComponent, camera, controls]);
  
  useFrame((state, delta) => {
    if (!isAnimating || !controls) return;
    
    const anim = animationRef.current;
    anim.progress += delta * 2; // Animation speed
    
    if (anim.progress >= 1) {
      // Animation complete
      anim.progress = 1;
      setIsAnimating(false);
      (controls as any).enabled = true;
      console.log('Animation completed');
    }
    
    // Ease out cubic for smooth animation
    const eased = 1 - Math.pow(1 - anim.progress, 3);
    
    // Update camera position
    camera.position.lerpVectors(anim.startPosition, anim.endPosition, eased);
    
    // Update controls target
    const newTarget = new THREE.Vector3().lerpVectors(anim.startTarget, anim.endTarget, eased);
    (controls as any).target.copy(newTarget);
    (controls as any).update();
  });
  
  return null;
};

export default CameraController;
