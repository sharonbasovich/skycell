const stats = [
  {
    value: "≈30",
    unit: "km",
    label: "Mission altitude",
    detail: "Into the stratosphere",
  },
  { value: "70", unit: "km", label: "Radio link", detail: "LoRa / Meshtastic" },
  {
    value: "1st",
    unit: "place",
    label: "APEX 2025 result",
    detail: "Hack Club hackathon winner",
  },
  {
    value: "4",
    unit: "",
    label: "Team members",
    detail: "Across the US & Canada",
  },
];

const InteractiveStats = () => (
  <section
    aria-label="SkyCell mission results"
    className="border-b border-border bg-card"
  >
    <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-8 md:grid-cols-4 md:px-8 md:py-10">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="md:border-r md:border-border md:pr-4 md:last:border-0"
        >
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {stat.label}
          </dt>
          <dd className="mt-2 font-mono text-3xl font-medium tabular-nums tracking-tight md:text-4xl">
            {stat.value}
            <span className="ml-1 text-lg text-primary">{stat.unit}</span>
          </dd>
          <dd className="mt-2 text-xs text-muted-foreground">{stat.detail}</dd>
        </div>
      ))}
    </dl>
  </section>
);

export default InteractiveStats;
