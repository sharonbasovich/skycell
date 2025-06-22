import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Stars,
  Text,
} from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useEffect, useState, useRef } from "react";
import {
  parseCSVData,
  latLonTo3D,
  type ProcessedTrajectoryData,
} from "@/utils/csvDataUtils";
import { Play, Pause, RotateCcw } from "lucide-react";

// Animation speed multiplier (100x faster than real time)
const ANIMATION_SPEED_MULTIPLIER = 100;

// Component for the ground plane
const GroundPlane = ({
  bounds,
}: {
  bounds: ProcessedTrajectoryData["bounds"];
}) => {
  const groundSize =
    Math.max(
      (bounds.lon.max - bounds.lon.min) * 111000,
      (bounds.lat.max - bounds.lat.min) * 111000
    ) * 0.001; // Scale down for visualization

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[groundSize, groundSize]} />
      <meshStandardMaterial
        color="#1F2937"
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Component for the trajectory path
const TrajectoryPath = ({
  points,
  center,
  scale = 0.001,
}: {
  points: any[];
  center: { lat: number; lon: number };
  scale?: number;
}) => {
  const trajectoryGeometry = useMemo(() => {
    if (points.length < 2) return null;

    const trajectoryPoints = points.map((point) => {
      const coords = latLonTo3D(
        point.latitude,
        point.longitude,
        point.altitude,
        center.lat,
        center.lon,
        scale
      );
      return new THREE.Vector3(coords.x, coords.y, coords.z);
    });

    return new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
  }, [points, center, scale]);

  if (!trajectoryGeometry) return null;

  return (
    <primitive
      object={
        new THREE.Line(
          trajectoryGeometry,
          new THREE.LineBasicMaterial({
            color: "#0EA5E9",
            opacity: 0.8,
            transparent: true,
            linewidth: 2,
          })
        )
      }
    />
  );
};

// Component for the animated balloon
const AnimatedBalloon = ({
  points,
  center,
  scale = 0.001,
  currentIndex,
  isPlaying,
}: {
  points: any[];
  center: { lat: number; lon: number };
  scale?: number;
  currentIndex: number;
  isPlaying: boolean;
}) => {
  const [interpolatedPosition, setInterpolatedPosition] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (
      !isPlaying ||
      points.length === 0 ||
      currentIndex >= points.length - 1
    ) {
      // Set to exact position when not playing or at the end
      if (points.length > 0 && currentIndex < points.length) {
        const point = points[currentIndex];
        const coords = latLonTo3D(
          point.latitude,
          point.longitude,
          point.altitude,
          center.lat,
          center.lon,
          scale
        );
        setInterpolatedPosition(coords);
      }
      return;
    }

    const startTime = Date.now();
    const startPoint = points[currentIndex];
    const endPoint = points[currentIndex + 1];

    // Calculate time difference between points and apply speed multiplier
    const startTimestamp = new Date(startPoint.datetime).getTime();
    const endTimestamp = new Date(endPoint.datetime).getTime();
    const duration =
      (endTimestamp - startTimestamp) / ANIMATION_SPEED_MULTIPLIER;

    // If points are too close in time, use a minimum duration
    const minDuration = 20; // 20ms minimum (reduced for faster playback)
    const actualDuration = Math.max(duration, minDuration);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / actualDuration, 1);

      // Linear interpolation between points
      const startCoords = latLonTo3D(
        startPoint.latitude,
        startPoint.longitude,
        startPoint.altitude,
        center.lat,
        center.lon,
        scale
      );
      const endCoords = latLonTo3D(
        endPoint.latitude,
        endPoint.longitude,
        endPoint.altitude,
        center.lat,
        center.lon,
        scale
      );

      const interpolated = {
        x: startCoords.x + (endCoords.x - startCoords.x) * progress,
        y: startCoords.y + (endCoords.y - startCoords.y) * progress,
        z: startCoords.z + (endCoords.z - startCoords.z) * progress,
      };

      setInterpolatedPosition(interpolated);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, isPlaying, points, center, scale]);

  if (!interpolatedPosition) return null;

  return (
    <group
      position={[
        interpolatedPosition.x,
        interpolatedPosition.y,
        interpolatedPosition.z,
      ]}
    >
      {/* Balloon */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Payload */}
      <mesh position={[0, -3, 0]}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#8B5CF6" />
      </mesh>

      {/* Connection line */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Position light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        distance={10}
        color="#FFFFFF"
      />

      {/* Current time display */}
      {points[currentIndex] && (
        <Text
          position={[0, 5, 0]}
          fontSize={1}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {new Date(points[currentIndex].datetime).toLocaleTimeString()}
        </Text>
      )}
    </group>
  );
};

// Playback controls component
const PlaybackControls = ({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  currentIndex,
  totalPoints,
  currentTime,
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  currentIndex: number;
  totalPoints: number;
  currentTime: string;
}) => {
  const progress =
    totalPoints > 0 ? (currentIndex / (totalPoints - 1)) * 100 : 0;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause size={16} className="text-white" />
          ) : (
            <Play size={16} className="text-white ml-0.5" />
          )}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
        >
          <RotateCcw size={16} className="text-white" />
        </button>

        <div className="flex-1">
          <div className="flex justify-between text-xs text-white mb-1">
            <span>{currentTime}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-white mt-1">
            Speed: {ANIMATION_SPEED_MULTIPLIER}x real-time
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TrajectoryVisualization component
 * Props:
 *   onCurrentPointChange?: (point: any | null) => void
 *     - Called with the current trajectory point (or null) whenever the animation index changes.
 *   initialCameraPosition?: [number, number, number]
 *     - The initial position of the camera (x, y, z)
 *   initialOrbitTarget?: [number, number, number]
 *     - The initial target for the orbit controls (x, y, z)
 */
const TrajectoryVisualization = ({
  onCurrentPointChange,
  initialCameraPosition = [25, 45, 60],
  initialOrbitTarget = [0, 0, 0],
}: {
  onCurrentPointChange?: (point: any | null) => void;
  initialCameraPosition?: [number, number, number];
  initialOrbitTarget?: [number, number, number];
}) => {
  const [trajectoryData, setTrajectoryData] =
    useState<ProcessedTrajectoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await parseCSVData();
        setTrajectoryData(data);
      } catch (error) {
        console.error("Failed to load trajectory data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Notify parent of current point change
  useEffect(() => {
    if (!trajectoryData || !trajectoryData.points.length) {
      onCurrentPointChange && onCurrentPointChange(null);
      return;
    }
    onCurrentPointChange &&
      onCurrentPointChange(trajectoryData.points[currentIndex] || null);
  }, [currentIndex, trajectoryData, onCurrentPointChange]);

  // Playback logic
  useEffect(() => {
    if (!isPlaying || !trajectoryData || trajectoryData.points.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    if (currentIndex >= trajectoryData.points.length - 1) {
      setIsPlaying(false);
      return;
    }

    const currentPoint = trajectoryData.points[currentIndex];
    const nextPoint = trajectoryData.points[currentIndex + 1];

    // Calculate time difference and apply speed multiplier
    const currentTime = new Date(currentPoint.datetime).getTime();
    const nextTime = new Date(nextPoint.datetime).getTime();
    const timeDiff = (nextTime - currentTime) / ANIMATION_SPEED_MULTIPLIER;

    // Use minimum interval for very close points
    const interval = Math.max(timeDiff, 20); // Reduced from 50ms for faster playback

    intervalRef.current = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex, trajectoryData]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <div className="h-[300px] bg-skycell-dark rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-white">Loading trajectory data...</div>
      </div>
    );
  }

  if (!trajectoryData || trajectoryData.points.length === 0) {
    return (
      <div className="h-[300px] bg-skycell-dark rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-white">No trajectory data available</div>
      </div>
    );
  }

  const scale = 0.001; // Scale factor for visualization
  const currentTime = trajectoryData.points[currentIndex]?.datetime
    ? new Date(
        trajectoryData.points[currentIndex].datetime
      ).toLocaleTimeString()
    : "";

  return (
    <div className="h-[300px] bg-skycell-dark rounded-lg overflow-hidden relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={initialCameraPosition} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        {/* Ground plane */}
        <GroundPlane bounds={trajectoryData.bounds} />

        {/* Trajectory path */}
        <TrajectoryPath
          points={trajectoryData.points}
          center={trajectoryData.center}
          scale={scale}
        />

        {/* Animated balloon */}
        <AnimatedBalloon
          points={trajectoryData.points}
          center={trajectoryData.center}
          scale={scale}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
        />

        {/* Stars background */}
        <Stars radius={200} depth={50} count={2000} factor={2} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={200}
          minDistance={20}
          target={initialOrbitTarget}
        />
      </Canvas>

      {/* Playback controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        currentIndex={currentIndex}
        totalPoints={trajectoryData.points.length}
        currentTime={currentTime}
      />
    </div>
  );
};

export default TrajectoryVisualization;
