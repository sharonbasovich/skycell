import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Float,
  PerspectiveCamera,
  OrbitControls,
  Html,
} from "@react-three/drei";
import { useInView } from "react-intersection-observer";
import * as THREE from "three";
import PixelReveal from "./PixelReveal";

// GLB Model Loader Component
const GLBModel = ({ modelPath, interactive = false, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const [rotationSpeed] = useState(() => 0.2 + Math.random() * 0.2);

  // Load GLB model - using b1.glb from public folder
  const { scene } = useGLTF("/b1.glb");

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
      scale={scale}
    >
      <primitive object={scene.clone()} />
    </group>
  );
};

// Placeholder balloon component removed - now using b1.glb model

const BalloonModel = ({ interactive = false, modelPath = "", scale = 1 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
    rootMargin: "-50px 0px",
  });

  return (
    <div ref={ref} className="h-full w-full group cursor-pointer">
      <PixelReveal
        className="h-full w-full"
        gridSize={20}
        delay={inView ? 800 : 0}
      >
        <Canvas className={interactive ? "interactive" : ""}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />

          {/* Enhanced lighting setup for better visibility */}
          <ambientLight intensity={1.2} color="#ffffff" />

          {/* Main directional light */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.5}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Secondary directional light for fill */}
          <directionalLight
            position={[-5, 3, -5]}
            intensity={0.8}
            color="#ffffff"
          />

          {/* Top light for better overall illumination */}
          <directionalLight
            position={[0, 10, 0]}
            intensity={1.0}
            color="#ffffff"
          />

          {/* Rim light for better definition */}
          <directionalLight
            position={[0, 0, 5]}
            intensity={0.6}
            color="#ffffff"
          />

          {/* Additional spot light for focused illumination */}
          <spotLight
            position={[10, 10, 10]}
            angle={0.3}
            penumbra={1}
            intensity={1.2}
            color="#ffffff"
            castShadow
          />

          {/* Environment lighting for better reflections */}
          <hemisphereLight
            intensity={0.4}
            groundColor="#000000"
            color="#ffffff"
          />
          <Suspense
            fallback={
              <Html center>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-xs text-primary">Loading Model...</p>
                </div>
              </Html>
            }
          >
            <Float
              speed={1}
              rotationIntensity={0}
              floatIntensity={1}
              enabled={!interactive}
            >
              <GLBModel
                modelPath={modelPath}
                interactive={true}
                scale={scale}
              />
            </Float>
          </Suspense>
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
      </PixelReveal>
    </div>
  );
};

export default BalloonModel;
