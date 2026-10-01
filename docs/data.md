# Demo data

## Provenance

`public/data.csv` is an actual APEX tracker / SondeHub community telemetry export from **June 21, 2025**, confirmed by the project team. It contains **125 observations** for callsign **APEX-2-T**, recorded between **18:11:06 and 19:17:21 UTC**. The export identifies **Horus Binary v2** reception around **432.625 MHz**.

This is the event balloon's tracker archive, **not** a recording of SkyCell's 915 MHz mesh payload. The recorded maximum altitude is **29,510 m**; it describes this partial archive, rather than establishing the balloon's complete-flight maximum. Receiver gaps and a missing launch segment are preserved.

The archive is bundled so the demo is reproducible without credentials or a running radio receiver. The frontend does not fetch SondeHub's live API. No independent license or exclusive ownership of the community export is asserted by this repository.

## Fields consumed by the frontend

Columns are looked up by header name. Additional receiver metadata in the export is ignored by the visualization.

| Column | Meaning | Units / format |
| --- | --- | --- |
| `datetime` | Observation timestamp | ISO 8601 with an explicit UTC offset |
| `payload_callsign` | Tracker identifier | Text; optional metadata |
| `lat` | Latitude | Decimal degrees |
| `lon` | Longitude | Decimal degrees |
| `alt` | Altitude | Metres |
| `ascent_rate` | Vertical speed | Metres per second; optional |
| `speed` | Ground speed | Kilometres per hour; optional |
| `temp` | Tracker temperature | Degrees Celsius; optional |
| `batt` | Tracker battery voltage | Volts; optional |

`datetime`, `lat`, `lon`, and `alt` are required. Invalid timestamps, missing coordinates, out-of-range coordinates, and implausible altitudes are rejected. Archives with more than one payload callsign are rejected, so unrelated flights cannot be joined into one trajectory. Optional absent or invalid sensor values become `null`, so the UI can distinguish a missing reading from a real zero.

## Replay semantics

Observations are sorted by their absolute UTC timestamp, with one observation retained per timestamp. Playback advances elapsed time through this sequence. A binary search finds the most recent observation, and latitude, longitude, and altitude are linearly interpolated toward the next observation when the gap is at most 60 seconds. Longer gaps hold the last position and break the plotted path until reception resumes. Speed, temperature, battery voltage, and ascent rate retain the most recent recorded reading.

The replay has one shared clock for the 3D marker, charts, and current readings. It defaults to 100× speed, with 1×, 25×, and 250× options. Play/pause, reset, and timeline seeking operate on the same clock; rendering updates are capped at 30 per second. The original gaps affect timing and are visibly distinguished from recorded reception. Ground distance is the sum of great-circle distances between recorded coordinates, including straight segments across gaps; it is a sampled estimate rather than the complete flown distance. The 3D view uses a local geographic projection suited to displaying this regional flight, rather than a global navigation model.

## Replacing the archive

Replace `public/data.csv` with a CSV that uses the required headers and explicit timestamp offsets. Keep an appropriate source/provenance note with the data, then run:

```bash
npm test
npm run build
```

Open the dashboard and verify its point count, altitude range, timeline, and missing-value presentation against your source. Do not label a recorded or generated dataset as a live feed.
