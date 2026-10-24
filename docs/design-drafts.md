# SkyCell design comparison

Sharon requested less-polished, working drafts of all three directions before choosing. This branch is a comparison preview and does not select a direction for final integration. The original data/parser/replay engine remains intact.

## Shared requirements

- Real APEX balloon-train and hardware photography; no synthetic flight evidence.
- SkyCell payload: 915 MHz LoRa/Meshtastic, approximately 30 km mission altitude, 70 km radio link. Team project, first place at APEX international research hackathon.
- Python NMEA GPS, environmental sensing and reconnection; RTL-SDR sweeps 30 MHz–1.5 GHz at 2.4 MS/s.
- Browser archive: APEX tracker / SondeHub export for APEX-2-T, 125 observations, partial June 21 2025 recording, not live and not the separate SkyCell mesh payload telemetry.
- All routes usable at desktop and phone widths. Native controls, keyboard focus, reduced-motion handling. No new animation engine required for comparison drafts.
- Existing `/dashboard`, `/development`, and `/original` remain available. Preview root compares drafts. No production alias deployment.

## Directions and systems

1. `/drafts/mission`: Near Space Labs and Sceye inspired full-page rhythm. Actual photo-led opening, open white/sky-blue bands, hardware journal, dark archive chapter. Sans typography with large short headings; documentary image captions. Minimal UI motion. White #ffffff, sky #dcedfa, ink #142b44, blue #2163b5. Photo keeps original colors, no tint.
2. `/drafts/ascent`: Planet and Near Space Labs technology inspired explanation. Cobalt opening, purposeful conceptual ground-to-stratosphere schematic tied to scroll, actual evidence, archive chapter. React/Framer Motion scroll values with static mobile/reduced-motion counterpart. Concept schematic explicitly not flight data. Cobalt/ink/sky palette; no photorealistic fake balloon.
3. `/drafts/explorer`: SondeHub inspired workspace semantics. UTC and archive identity, trajectory, actual shared playback, charts/current readings, provenance, then concise mission story. Neutral technical workspace with blue accent; no ornamental dashboard metrics.

References are design/interaction research, not copied proprietary assets. Existing Lucide controls and project photos supply the media. Working drafts deliberately stop before final typographic, choreography, and media editing passes.

## Acceptance and evidence

Each draft must show its complete direction and defining behavior, preserve data provenance, provide functional navigation/replay, and remain readable without horizontal overflow at 360, 390, 768, and 1440 px. Build, lint, existing regression tests, desktop/phone browser inspection, scroll behavior and reduced-motion checks are required. Record actual checks in the final QA note; do not imply final production readiness.
