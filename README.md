# SkyCell

**A high-altitude balloon project showcase and interactive flight telemetry explorer.**

[Live demo](https://skycell.vercel.app/) · [Flight replay](https://skycell.vercel.app/dashboard) · [Hardware and flight software](https://github.com/knivier/SkyCell)

[![CI](https://github.com/sharonbasovich/skycell/actions/workflows/ci.yml/badge.svg)](https://github.com/sharonbasovich/skycell/actions/workflows/ci.yml)

SkyCell was built for Hack Club's APEX high-altitude balloon event. This repository contains the React frontend: a project overview, engineering context, and a browser-based replay of recorded balloon telemetry. The [companion repository](https://github.com/knivier/SkyCell) contains the payload, radio, and ground-station work.

![SkyCell flight replay dashboard](docs/demo.jpg)

## Try the demo

1. Open the [flight replay](https://skycell.vercel.app/dashboard).
2. Play or pause the archive, change playback speed, or scrub the timeline.
3. Rotate and zoom the 3D trajectory while inspecting the corresponding telemetry.

The dashboard reads a bundled archive. It does **not** connect to a running balloon or live radio feed. See [data provenance](docs/data.md) for exactly what the demo shows.

## Technical highlights

- **One replay clock:** the trajectory, timeline, charts, and current readings share a timestamp-based playback state instead of advancing independently.
- **Robust telemetry parsing:** header-based CSV parsing handles quoted fields, preserves UTC timestamps, validates coordinates, sorts observations, and removes repeated timestamps. Single-payload validation prevents unrelated tracks from being joined.
- **3D flight exploration:** React Three Fiber and Three.js render a geographic trajectory with consistent spatial units and interactive camera controls.
- **Useful failure states:** failed downloads and invalid archives surface as errors instead of invented telemetry or a blank dashboard.
- **Reproducible checks:** TypeScript checking, ESLint, Vitest tests, and a production build run in GitHub Actions.

## Run locally

Use Node.js **22.12 or later** (Node.js 24 is used in CI) and npm. No API keys, database, or environment variables are required.

```bash
git clone https://github.com/sharonbasovich/skycell.git
cd skycell
npm ci
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run typecheck` | Check application and configuration types |
| `npm run lint` | Run ESLint |
| `npm test` | Run the telemetry and replay tests once |
| `npm run test:watch` | Re-run tests while developing |
| `npm run build` | Type-check and create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |

## Architecture

```text
public/data.csv
      │
      ▼
csvDataUtils.ts — parse, validate, sort, deduplicate
      │
      ▼
Dashboard.tsx — archive loading and replay controls
      │
      ▼
use-flight-replay.ts — elapsed time and current sample
      ├── 3D trajectory
      ├── telemetry charts
      └── current readings
```

The frontend uses **React, TypeScript, Vite, Tailwind CSS, React Three Fiber, Three.js, and Recharts**. Route loading separates the showcase from the dashboard's heavier charting and 3D code.

```text
src/
  pages/                      # Project overview, engineering notes, dashboard
  components/dashboard/       # Trajectory and telemetry visualization
  hooks/use-flight-replay.ts   # Shared timestamp-based replay state
  utils/replayClock.ts         # Clock and playback transitions
  utils/csvDataUtils.ts        # CSV validation and trajectory calculations
  utils/csvDataUtils.test.ts   # Data and replay regression tests
public/
  data.csv                    # Bundled APEX tracker archive
  gallery/                    # Project and launch photographs
  b1.glb                      # Downloadable 3D model
docs/data.md                  # Archive source, schema, and limits
```

## Deployment

The demo runs on Vercel. `vercel.json` configures `npm ci`, the checked production build, and direct navigation to the client-side routes. Import this repository into Vercel to create another deployment; the build output is `dist/`.

## Scope and limitations

The archive is a partial flight recording. The replay interpolates position only between observations at most 60 seconds apart; longer gaps hold the last position and break the plotted path. Interpolated positions are visual estimates, and sensor readings remain the latest received values. The included APEX tracker data is separate from SkyCell's experimental 915 MHz mesh payload. This repository is a project demo and archive explorer, not a flight-control system.
