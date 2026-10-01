import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  Clock3,
  Database,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Route,
} from "lucide-react";
import { Link } from "react-router-dom";
import TelemetryGraphs from "@/components/dashboard/TelemetryGraphs";
import { useFlightReplay } from "@/hooks/use-flight-replay";
import {
  formatDuration,
  formatUTC,
  groundDistance,
  parseCSVData,
  type ProcessedTrajectoryData,
  type TrajectoryPoint,
} from "@/utils/csvDataUtils";

const TrajectoryVisualization = lazy(
  () => import("@/components/dashboard/TrajectoryVisualization"),
);
const EMPTY_POINTS: TrajectoryPoint[] = [];
const number = (value: number | null, decimals = 1) =>
  value === null ? "—" : value.toFixed(decimals);
const coordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

export default function Dashboard() {
  const [data, setData] = useState<ProcessedTrajectoryData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const points = data?.points ?? EMPTY_POINTS;
  const replay = useFlightReplay(points);
  const distance = useMemo(() => groundDistance(points), [points]);
  const largestGap = useMemo(
    () =>
      points.reduce(
        (largest, point, index) =>
          index
            ? Math.max(largest, point.timestamp - points[index - 1].timestamp)
            : largest,
        0,
      ),
    [points],
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    parseCSVData(controller.signal)
      .then((archive) => {
        if (!archive.points.length)
          throw new Error(
            "The flight archive contains no valid position observations.",
          );
        setData(archive);
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : "The flight archive could not be loaded.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  const current = replay.point;
  const recorded = points[replay.index];
  const gap =
    recorded && points[replay.index + 1]
      ? (points[replay.index + 1].timestamp - recorded.timestamp) / 1000
      : 0;
  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40";

  return (
    <div className="min-h-screen pt-10 pb-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-sky-400">
              <Radio size={14} /> Archived APEX tracker data
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Replay the flight.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Explore a recorded June 21, 2025 APEX flight through synchronized
              telemetry plots and a 3D trajectory. This is an archive replay,
              separate from the SkyCell payload’s 915 MHz Meshtastic telemetry.
            </p>
          </div>
          <a
            href="https://github.com/sharonbasovich/skycell"
            target="_blank"
            rel="noreferrer"
            className={buttonClass}
          >
            View source <ArrowUpRight size={15} />
          </a>
        </div>

        {loading && (
          <div
            className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card/40 text-muted-foreground"
            role="status"
          >
            <Activity className="mr-3 h-5 w-5 animate-pulse" /> Loading the
            flight archive…
          </div>
        )}
        {!loading && error && (
          <div
            className="rounded-2xl border border-red-400/30 bg-red-400/5 p-8"
            role="alert"
          >
            <h2 className="font-semibold">Archive unavailable</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              className={`${buttonClass} mt-5`}
              onClick={() => setAttempt((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && data && current && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  title: "Peak recorded altitude",
                  value: `${(data.bounds.alt.max / 1000).toFixed(2)} km`,
                  icon: <ArrowUpRight size={16} />,
                },
                {
                  title: "Recorded time span",
                  value: formatDuration(replay.duration),
                  icon: <Clock3 size={16} />,
                },
                {
                  title: "Sampled ground track",
                  value: `${(distance / 1000).toFixed(1)} km`,
                  icon: <Route size={16} />,
                },
                {
                  title: "Unique observations",
                  value: points.length.toLocaleString(),
                  icon: <Database size={16} />,
                },
              ].map((metric) => (
                <div
                  key={metric.title}
                  className="rounded-xl border border-border/70 bg-card/40 p-4 sm:p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{metric.title}</span>
                    <span className="text-sky-400">{metric.icon}</span>
                  </div>
                  <p className="text-xl font-semibold tabular-nums sm:text-2xl">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <section
              className="mb-6 rounded-2xl border border-sky-400/25 bg-sky-400/[0.04] p-4 sm:p-5"
              aria-label="Flight replay controls"
            >
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={replay.toggle}
                  disabled={!replay.duration}
                  className={`${buttonClass} min-w-[115px] border-sky-400/40 bg-sky-400/15 text-primary hover:bg-sky-400/25`}
                  aria-label={replay.isPlaying ? "Pause replay" : "Play replay"}
                >
                  {replay.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {replay.isPlaying
                    ? "Pause"
                    : replay.elapsed >= replay.duration
                      ? "Replay"
                      : "Play flight"}
                </button>
                <button
                  onClick={replay.reset}
                  className={buttonClass}
                  aria-label="Reset replay"
                >
                  <RotateCcw size={16} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <label
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  htmlFor="replay-speed"
                >
                  Speed
                  <select
                    id="replay-speed"
                    value={replay.speed}
                    onChange={(event) =>
                      replay.setSpeed(Number(event.target.value))
                    }
                    className="rounded-lg border border-border bg-[#111b2c] px-2 py-2.5 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {[1, 25, 100, 250].map((speed) => (
                      <option key={speed} value={speed}>
                        {speed}×
                      </option>
                    ))}
                  </select>
                </label>
                <div className="ml-auto text-right">
                  <p className="text-sm font-medium tabular-nums">
                    {formatUTC(current.timestamp)}{" "}
                    <span className="text-xs text-muted-foreground">UTC</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {replay.isPlaying
                      ? "Replaying archive"
                      : replay.elapsed >= replay.duration
                        ? "Replay complete"
                        : "Replay paused"}
                  </p>
                </div>
              </div>
              <label htmlFor="flight-timeline" className="sr-only">
                Flight timeline
              </label>
              <input
                id="flight-timeline"
                type="range"
                min={0}
                max={replay.duration || 1}
                step={1000}
                value={replay.elapsed}
                onChange={(event) => {
                  replay.seek(Number(event.target.value));
                }}
                onPointerDown={() => {
                  if (replay.isPlaying) replay.toggle();
                }}
                className="mt-5 h-5 w-full cursor-pointer accent-sky-400"
                aria-valuetext={`${formatUTC(current.timestamp)} UTC`}
              />
              <div className="mt-1 flex justify-between text-[11px] tabular-nums text-muted-foreground">
                <span>{formatUTC(points[0].timestamp)} UTC</span>
                <span>
                  {Math.round((replay.elapsed / (replay.duration || 1)) * 100)}%
                </span>
                <span>
                  {formatUTC(points[points.length - 1].timestamp)} UTC
                </span>
              </div>
              {replay.isGap && (
                <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs leading-5 text-amber-500">
                  Reception gap · no new tracker observations for this{" "}
                  {formatDuration(gap * 1000)} segment. Position is held at the
                  last received sample.
                </p>
              )}
            </section>

            <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_1fr]">
              <TelemetryGraphs
                points={points}
                timestamp={current.timestamp}
                onSeek={replay.seek}
              />
              <div className="min-w-0 space-y-4">
                <Suspense
                  fallback={
                    <div className="flex h-[420px] items-center justify-center rounded-2xl border border-border text-sm text-muted-foreground">
                      Loading trajectory viewer…
                    </div>
                  }
                >
                  <TrajectoryVisualization
                    data={data}
                    point={current}
                    index={replay.index}
                  />
                </Suspense>
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/70 bg-card/40 p-4 text-center">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Latitude
                    </p>
                    <p className="mt-1 text-xs font-medium tabular-nums sm:text-sm">
                      {coordinate(current.latitude, "N", "S")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Longitude
                    </p>
                    <p className="mt-1 text-xs font-medium tabular-nums sm:text-sm">
                      {coordinate(current.longitude, "E", "W")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Altitude
                    </p>
                    <p className="mt-1 text-xs font-medium tabular-nums sm:text-sm">
                      {Math.round(current.altitude).toLocaleString()} m
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section
              className="mt-5 rounded-2xl border border-border/70 bg-card/40 p-5"
              aria-label="Recorded tracker readings"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">
                  Latest recorded tracker sample
                </h2>
                <p className="text-xs text-muted-foreground">
                  {formatUTC(recorded.timestamp)} UTC · sensor values held until
                  the next observation
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  {
                    title: "Ground speed",
                    value: number(recorded.speed, 0),
                    unit: "km/h",
                  },
                  {
                    title: "Tracker temperature",
                    value: number(recorded.temperature, 0),
                    unit: "°C",
                  },
                  {
                    title: "Tracker battery",
                    value: number(recorded.battery, 2),
                    unit: "V",
                  },
                  {
                    title: "Ascent rate",
                    value: number(recorded.ascent_rate, 1),
                    unit: "m/s",
                  },
                ].map((metric) => (
                  <div key={metric.title}>
                    <p className="text-xs text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="mt-2 text-xl font-medium tabular-nums">
                      {metric.value}{" "}
                      <span className="text-xs text-muted-foreground">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <details className="mt-6 rounded-xl border border-border/60 px-5 py-4 text-sm">
              <summary className="cursor-pointer font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                About this data and replay
              </summary>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <p>
                  Source: archived APEX tracker / SondeHub data. Payload
                  callsign:{" "}
                  <span className="text-foreground">
                    {data.source.callsigns.join(", ") || "not provided"}
                  </span>
                  . The export contains {data.source.rows} rows;{" "}
                  {data.source.duplicates} duplicate timestamps and{" "}
                  {data.source.rejected} invalid observations were excluded. All
                  timestamps are displayed in UTC.
                </p>
                <p>
                  The archive is a partial flight record; its first sample is
                  already airborne. The longest reception gap is{" "}
                  {formatDuration(largestGap)}. Gaps over 60 seconds break the
                  plotted path and hold the last position during replay.
                  Ground-track distance sums geodesic distances between
                  successive recorded positions, including straight distances
                  across gaps.
                </p>
                <p>
                  This visualization uses APEX tracker fields. It does not
                  represent the SkyCell Meshtastic node’s battery, CPU
                  temperature, or radio signal strength.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={`${import.meta.env.BASE_URL}data.csv`}
                    download
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:underline"
                  >
                    <ArrowDownToLine size={14} /> Download CSV
                  </a>
                  <a
                    href="https://sondehub.org/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sky-400 hover:underline"
                  >
                    SondeHub <ArrowUpRight size={14} />
                  </a>
                  <Link
                    to="/development"
                    className="text-sky-400 hover:underline"
                  >
                    Project development →
                  </Link>
                </div>
              </div>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
