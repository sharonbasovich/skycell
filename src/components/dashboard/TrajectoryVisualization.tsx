import { Component, type ReactNode, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import {
  latLonTo3D,
  splitTrajectory,
  type ProcessedTrajectoryData,
  type TrajectoryPoint,
} from "@/utils/csvDataUtils";

interface Props {
  data: ProcessedTrajectoryData;
  point: TrajectoryPoint;
  index: number;
}

const projected = (
  point: TrajectoryPoint,
  data: ProcessedTrajectoryData,
): [number, number, number] => {
  const { x, y, z } = latLonTo3D(
    point.latitude,
    point.longitude,
    point.altitude,
    data.center.lat,
    data.center.lon,
    0.001,
  );
  return [x, y, z];
};

function GroundTrack({ data, point }: Props) {
  const locations = data.points.map((observation) =>
    projected(observation, data),
  );
  const width = Math.max(1, ...locations.map(([x]) => Math.abs(x))) * 2;
  const height = Math.max(1, ...locations.map(([, , z]) => Math.abs(z))) * 2;
  const scale = Math.min(330 / width, 250 / height);
  const [x, , z] = projected(point, data);
  return (
    <div className="flex h-full flex-col justify-center p-5">
      <svg
        viewBox="0 0 400 320"
        className="mx-auto h-full max-h-[370px] w-full"
        role="img"
        aria-label="Two dimensional ground track. North is up and east is right."
      >
        <defs>
          <pattern
            id="track-grid"
            width="25"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 25 0 L 0 0 0 25"
              fill="none"
              stroke="#263449"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          x="10"
          y="10"
          width="380"
          height="300"
          rx="12"
          fill="url(#track-grid)"
        />
        {splitTrajectory(data.points).map((segment, index) => (
          <polyline
            key={index}
            points={segment
              .map((observation) => {
                const [east, , south] = projected(observation, data);
                return `${200 + east * scale},${160 + south * scale}`;
              })
              .join(" ")}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
          />
        ))}
        <circle
          cx={200 + x * scale}
          cy={160 + z * scale}
          r="6"
          fill="#f8fafc"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        <text x="200" y="28" textAnchor="middle" fill="#94a3b8" fontSize="12">
          N
        </text>
        <text x="375" y="165" textAnchor="middle" fill="#94a3b8" fontSize="12">
          E
        </text>
      </svg>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Ground track · equal horizontal scale · no map baselayer
      </p>
    </div>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function FlightScene({ data, point, index }: Props) {
  const path = useMemo(
    () => data.points.map((observation) => projected(observation, data)),
    [data],
  );
  const current = projected(point, data);
  const segments = useMemo(
    () =>
      splitTrajectory(data.points).map((segment) =>
        segment.map((observation) => projected(observation, data)),
      ),
    [data],
  );
  const completed = splitTrajectory([
    ...data.points.slice(0, index + 1),
    point,
  ]).map((segment) =>
    segment.map((observation) => projected(observation, data)),
  );
  const horizontalExtent = Math.max(
    10,
    ...path.flatMap(([x, , z]) => [Math.abs(x), Math.abs(z)]),
  );
  const size = Math.ceil((horizontalExtent * 2.4) / 10) * 10;
  const top = Math.ceil(data.bounds.alt.max / 5000) * 5;
  const target = useMemo<[number, number, number]>(
    () => [0, top / 2, 0],
    [top],
  );
  const distance = Math.max(size * 0.85, top * 1.4);
  const camera = useMemo(
    () => ({
      position: [distance * 0.8, top + distance * 0.25, distance] as [
        number,
        number,
        number,
      ],
      fov: 43,
      near: 0.1,
      far: 1000,
    }),
    [distance, top],
  );
  return (
    <Canvas camera={camera} dpr={[1, 1.5]}>
      <color attach="background" args={["#0b1220"]} />
      <ambientLight intensity={1} />
      <directionalLight position={[10, 30, 20]} intensity={1.5} />
      <gridHelper args={[size, size / 5, "#475569", "#243246"]} />
      {segments.map(
        (segment, i) =>
          segment.length > 1 && (
            <Line
              key={`path-${i}`}
              points={segment}
              color="#38bdf8"
          lineWidth={2}
              transparent
          opacity={0.65}
            />
          ),
      )}
      {completed.map(
        (segment, i) =>
          segment.length > 1 && (
            <Line
              key={`completed-${i}`}
              points={segment}
              color="#38bdf8"
              lineWidth={3}
            />
          ),
      )}
      <Line
        points={[[current[0], 0, current[2]], current]}
        color="#94a3b8"
        lineWidth={1}
        dashed
        dashSize={0.5}
        gapSize={0.5}
      />
      <mesh position={current}>
        <sphereGeometry args={[0.45, 20, 20]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#38bdf8"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={path[0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color="#94a3b8" />
      </mesh>
      <Line
        points={[
          [-size / 2, 0, -size / 2],
          [-size / 2, top, -size / 2],
        ]}
        color="#475569"
        lineWidth={1}
      />
      {Array.from({ length: Math.floor(top / 5) + 1 }, (_, i) => i * 5).map(
        (altitude) => (
          <Html
            key={altitude}
            position={[-size / 2, altitude, -size / 2]}
            center
          >
            <span className="whitespace-nowrap rounded bg-[#0b1220]/80 px-1.5 py-0.5 text-[10px] text-slate-400">
              {altitude} km
            </span>
          </Html>
        ),
      )}
      <Html position={[0, 0, -size / 2]} center>
        <span className="text-[11px] text-slate-400">N</span>
      </Html>
      <Html position={[size / 2, 0, 0]} center>
        <span className="text-[11px] text-slate-400">E</span>
      </Html>
      <OrbitControls
        target={target}
        makeDefault
        minDistance={15}
        maxDistance={250}
        enableDamping
      />
    </Canvas>
  );
}

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    // Three.js r176 requires WebGL 2. Older contexts should use the SVG view.
    const context = canvas.getContext("webgl2");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
};

export default function TrajectoryVisualization(props: Props) {
  const [threeDAvailable, setThreeDAvailable] = useState(supportsWebGL);
  const [groundView, setGroundView] = useState(!threeDAvailable);
  const handleSceneFailure = () => {
    setThreeDAvailable(false);
    setGroundView(true);
  };
  const fallback = <GroundTrack {...props} />;
  return (
    <section
      className="overflow-hidden rounded-2xl border border-border/70 bg-[#0b1220]"
      aria-label="Flight trajectory"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="font-semibold">Flight trajectory</h2>
          <p
            className="mt-1 text-xs text-muted-foreground"
            role={!threeDAvailable ? "status" : undefined}
          >
            {!threeDAvailable
              ? "3D unavailable · ground track (north up)"
              : groundView
                ? "North up · ground position"
                : "Drag to orbit · scroll to zoom · grid spacing 5 km"}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border p-1 text-xs">
          <button
            onClick={() => setGroundView(false)}
            aria-pressed={!groundView}
            disabled={!threeDAvailable}
            className={`min-h-10 rounded-md px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40 ${!groundView ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
          >
            3D path
          </button>
          <button
            onClick={() => setGroundView(true)}
            aria-pressed={groundView}
            className={`min-h-10 rounded-md px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${groundView ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
          >
            Ground track
          </button>
        </div>
      </div>
      <div className="h-[360px] sm:h-[420px]">
        {groundView ? (
          fallback
        ) : (
          <SceneBoundary fallback={fallback} onFailure={handleSceneFailure}>
            <FlightScene {...props} />
          </SceneBoundary>
        )}
      </div>
      <p className="border-t border-border/60 px-5 py-3 text-xs leading-relaxed text-muted-foreground">
        Short intervals interpolate position; gaps over 60 seconds hold the last
        observation and break the path.
        {!groundView && " Grid height 0 represents recorded altitude 0."}
      </p>
    </section>
  );
}
