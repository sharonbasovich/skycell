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
import { useScroll, useTransform } from "framer-motion";
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

// Smart Camera Component that calculates position based on viewport center
const SmartCamera = ({
  scrollYProgress,
  containerRef,
  orbitAngleOffset = 0,
}: {
  scrollYProgress: any;
  containerRef: React.RefObject<HTMLDivElement>;
  orbitAngleOffset?: number;
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  // Calculate distance from viewport center (0 = center, 1 = edge)
  const distanceFromCenter = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Calculate camera distance - closer when centered, further when at edges
  const cameraDistance = useTransform(
    distanceFromCenter,
    [0, 1],
    [4, 20] // 4 units when centered (full size), 20 units when at edge
  );

  // Calculate orbit angle based on distance from center
  const orbitAngle = useTransform(
    distanceFromCenter,
    [0, 1],
    [Math.PI + orbitAngleOffset, Math.PI * 2 + orbitAngleOffset] // 180° + offset when centered (facing forward), 360° + offset when at edge
  );

  // Calculate camera height - slight variation for depth
  const cameraHeight = useTransform(
    distanceFromCenter,
    [0, 1],
    [0, 2] // Level when centered, slightly elevated when at edge
  );

  useFrame(() => {
    if (cameraRef.current && containerRef.current) {
      const distance = cameraDistance.get();
      const angle = orbitAngle.get();
      const height = cameraHeight.get();

      // Calculate camera position in a circular orbit
      cameraRef.current.position.x = Math.sin(angle) * distance;
      cameraRef.current.position.z = Math.cos(angle) * distance;
      cameraRef.current.position.y = height;

      // Always look at the center
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 4]} // Start at optimal viewing distance
      fov={60}
    />
  );
};

const BalloonModel = ({
  interactive = false,
  modelPath = "",
  scale = 1,
  orbitAngleOffset = 0,
}: {
  interactive?: boolean;
  modelPath?: string;
  scale?: number;
  orbitAngleOffset?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
    rootMargin: "-50px 0px",
  });

  // Scroll progress for this specific component
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={containerRef} className="h-full w-full group cursor-pointer">
      <PixelReveal
        className="h-full w-full"
        gridSize={20}
        delay={inView ? 800 : 0}
      >
        <Canvas className={interactive ? "interactive" : ""}>
          <SmartCamera
            scrollYProgress={scrollYProgress}
            containerRef={containerRef}
            orbitAngleOffset={orbitAngleOffset}
          />

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

          {/* Disable all orbit controls - no user interaction */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={false}
          />
        </Canvas>
      </PixelReveal>
    </div>
  );
};

export default BalloonModel;
