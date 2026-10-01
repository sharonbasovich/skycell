import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatUTC,
  OBSERVATION_GAP_MS,
  type TrajectoryPoint,
} from "@/utils/csvDataUtils";

interface Props {
  points: TrajectoryPoint[];
  timestamp: number;
  onSeek: (elapsed: number) => void;
}

export default function TelemetryGraphs({ points, timestamp, onSeek }: Props) {
  const start = points[0].timestamp;
  const end = points[points.length - 1].timestamp;
  const data = points.flatMap((point, index) => {
    const sample = {
      ...point,
      altitudeKm: (point.altitude / 1000) as number | null,
    };
    const previous = points[index - 1];
    return previous && point.timestamp - previous.timestamp > OBSERVATION_GAP_MS
      ? [
          {
            ...sample,
            timestamp: (point.timestamp + previous.timestamp) / 2,
            altitudeKm: null,
            speed: null,
            temperature: null,
          },
          sample,
        ]
      : [sample];
  });
  const tooltip = {
    backgroundColor: "#111b2c",
    borderColor: "#334155",
    borderRadius: 10,
    color: "#e2e8f0",
    fontSize: 12,
  };
  const seekFromChart = (state: { activeLabel?: string | number } | null) => {
    if (typeof state?.activeLabel === "number")
      onSeek(state.activeLabel - start);
  };
  return (
    <section
      className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5"
      aria-label="Archived telemetry charts"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-semibold">Altitude profile</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Click the chart to seek · recorded samples over UTC time
          </p>
        </div>
        <span className="text-xs text-sky-400">Altitude (km)</span>
      </div>
      <div className="h-[270px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 6, left: -16, bottom: 4 }}
            onClick={seekFromChart}
          >
            <defs>
              <linearGradient id="altitude-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#263449"
              strokeDasharray="3 5"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={[start, Math.max(end, start + 1)]}
              tickFormatter={(value) => formatUTC(value).slice(0, 5)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              domain={[0, "auto"]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={tooltip}
              labelFormatter={(value) => `${formatUTC(Number(value))} UTC`}
              formatter={(value: number) => [
                `${value.toFixed(2)} km`,
                "Altitude",
              ]}
            />
            <Area
              dataKey="altitudeKm"
              type="linear"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#altitude-fill)"
              connectNulls={false}
              isAnimationActive={false}
            />
            <ReferenceLine
              x={timestamp}
              stroke="#f8fafc"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {[
          {
            key: "speed",
            title: "Ground speed",
            unit: "km/h",
            color: "#a78bfa",
          },
          {
            key: "temperature",
            title: "Tracker temperature",
            unit: "°C",
            color: "#fbbf24",
          },
        ].map(({ key, title, unit, color }) => (
          <div key={key} className="min-w-0 border-t border-border/60 pt-4">
            <div className="mb-3 flex justify-between text-xs">
              <h3 className="font-medium">{title}</h3>
              <span className="text-muted-foreground">{unit}</span>
            </div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={data}
                  margin={{ top: 5, right: 6, left: -16, bottom: 0 }}
                  onClick={seekFromChart}
                >
                  <CartesianGrid
                    stroke="#263449"
                    strokeDasharray="3 5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    domain={[start, Math.max(end, start + 1)]}
                    tickFormatter={(value) => formatUTC(value).slice(0, 5)}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={45}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltip}
                    labelFormatter={(value) =>
                      `${formatUTC(Number(value))} UTC`
                    }
                    formatter={(value: number) => [`${value} ${unit}`, title]}
                  />
                  <Line
                    dataKey={key}
                    type="linear"
                    stroke={color}
                    strokeWidth={1.8}
                    dot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                  <ReferenceLine
                    x={timestamp}
                    stroke="#f8fafc"
                    strokeDasharray="4 4"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Blank sections mark reception gaps longer than 60 seconds. They are not
        filled with estimated measurements.
      </p>
    </section>
  );
}
