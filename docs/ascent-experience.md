# SkyCell ascent experience

Sharon selected the ascent idea and requested 3D. The ascent experience originated from `origin/main` (`16d83f3`), independently of the rough comparison draft. The current `codex/skycell-cinematic` revision starts from the earlier ascent commit `080078f` and rebuilds the assets, renderer and camera treatment. The validated archive parser, clock and replay remain reusable engineering foundations.

## Design contract

The subject is a four-student high-altitude radio experiment, first place at the APEX international research hackathon. The page should feel like a considered aerospace visualization: one continuous spatial story, substantial negative space, confident typography and real evidence. No unrelated effects, stock rocket imagery, hot-air balloons, or fabricated flight data.

Visual system: cobalt #1647d1, deep blue #0b2d68, night #07162e, white #ffffff, pale sky #e4eefb, ink #101f3a. Manrope variable (official Google Fonts, OFL) for display and UI; body 16–18 px, compact captions 12–13 px, desktop h1 around 90–112 px and mobile 46–58 px. Wide open layout, thin dividers where structural, restrained corners. Lucide outline icons at one optical weight.

Hero allowed copy: SkyCell; Ascent; Build; Flight replay; “A small radio. A much bigger horizon.”; “An experiment in connecting the ground to the stratosphere.”; “Follow the ascent”; “1st place at APEX 2025”; “International research hackathon”; “Four students. One high-altitude mission.” Scene controls and conceptual caption are functional UI. No hero eyebrow/badge above the heading.

## Full page and motion

- Fixed navigation and four HTML chapters accompany one persistent Three.js/R3F world. Ordinary browser scrolling drives the scene. Chapter buttons scroll explicitly to each panel’s top, independently of global header scroll padding. Real hardware/launch photographs, specifications and post-flight lessons follow, then the archive replay.
- `CinematicTrain` loads original self-hosted GLBs: a photo-observed foam payload and a seamless latex balloon reused for the twin-balloon train. Geometry/camera coordinates use metres. EPS maps, lid join, clear tape, generic recovery labels, blue attachment, cable loop and telescopic antenna give the enclosure its visible construction. The editable Blender source and scripts remain in [`tools/asset-pipeline`](../tools/asset-pipeline/README.md).
- One sun direction drives the key light, thin-latex backscatter, Earth surface and analytic atmosphere. An oriented Poly Haven pure-noon HDR supplies PMREM lighting. The environment uses kilometres, a 6,371 km Earth radius and a local east/up/north frame at 42°N, 71°W. NASA global June albedo/cloud maps transition into georeferenced regional MODIS Terra true-color imagery dated June 21, 2024. Its 0.5° edge feather excludes the independent global cloud overlay in the regional interior, whose source already contains clouds.
- Raw scroll samples four camera holds and arc-length cubic travel paths, with C² eased arrivals/departures. A **single desired-pose filter** blends current position, look target, lens and environment altitude toward that sample with the same 12/s exponential alpha. A large reverse jump blends directly toward the hero pose instead of replaying the payload waypoint. Responsive rigs preserve framing; convergence stops demand rendering. Pause holds the current pose; resume retargets current scroll.
- Reduced motion and unavailable/failed WebGL preserve every HTML chapter and use responsive poster captures from the final scene in native Chrome. There are no synthetic radio arcs or ground pedestal.
- Replay uses the real partial APEX tracker/SondeHub archive, explicitly separate from SkyCell’s 915 MHz payload telemetry. It is never labeled live.

## Rendering and asset limits

The GLBs are original exterior interpretations from photographs, not scans or dimensioned engineering models. Unseen surfaces, creases and exact tape overlaps are interpreted; recovery labels are generic. The closed enclosure does not expose invented internals. Nominal dimensions, bounds and triangle counts are in [`asset-metadata.json`](../public/models/cinematic/asset-metadata.json).

Camera travel, illustrative altitude, latex response, ocean appearance and analytic scattering are concept-illustration choices, not measurements or an archived-flight reconstruction. The regional image is historical geographic context from **2024-06-21**, not a photo of the 2025 flight or its weather. See [`asset-credits.md`](asset-credits.md) for sources and reuse terms.

Earth shades into a cached linear HalfFloat render target, capped at 1024 CSS pixels wide on desktop or 640 on compact canvases, preserving the actual camera projection and aspect. The target updates only when camera/projection, altitude, sun or target changes; its display pass applies tone mapping/output conversion once. It uses about 5 MiB at the tested 1440×900 desktop canvas and about 1 MiB in the phone canvas. Compared with the DPR-scaled foreground, these dimensions reduce expensive Earth-shader pixels by approximately 4.45× desktop and 2.25× phone; these are pixel-count reductions, not FPS measurements.

The regional map is chosen once per Canvas mount: 2048² below 900 CSS pixels or a 2048 texture-size limit; otherwise 4096². Six selected scene assets total **7,468,679 bytes desktop** or **4,857,081 bytes compact**, before application code, font and project photos. Final native-renderer posters add **30,508 / 5,574 bytes** for desktop/mobile. Estimated RGBA texture allocation with mipmaps is **138.7 / 74.7 MiB** for desktop/compact Earth maps, before the render target, GLBs, HDR and PMREM. Compressed transfer sizes do not establish GPU memory or frame time.

## Facts and limits

SkyCell: approximately 30 km mission altitude, 70 km LoRa/Meshtastic link at 915 MHz; Python NMEA GPS, environmental sensors and reconnection; RTL-SDR 30 MHz–1.5 GHz at 2.4 MS/s. Only a few payload packets were received and startup brownouts/power continuity were lessons. Do not turn a range connection into a claim of continuous telemetry.

Archive: APEX-2-T, 125 observations, June 21 2025 18:11:06–19:17:21 UTC, 29,510 m peak in this partial recording. Keep reception gaps, held sensor values and original provenance.

## Verification scope

Check all four holds and transitions at desktop, tablet and phone widths, including framing, text contrast, asset loading and ordinary scrolling. Exercise native anchors/chapter controls, pause/resume, reduced-motion changes, unavailable WebGL, context loss/recovery, route teardown/re-entry and archive playback. Record draw/triangle counts and rendering after camera convergence; desktop software Chromium viewports do not establish physical-phone FPS.

## Verification status, October 24, 2026

Lint, typecheck, production build and **29 tests** pass. The six-viewport matrix covers **360×780, 390×844, 375×667, 768×1024, 1440×900 and 1272×716**, with 24 retained screenshots. Final interaction checks pass for chapter buttons, pause/resume, keyboard dialog focus, expandable lessons, replay completion, three route cycles, reduced motion, unavailable WebGL and context loss/reload. The rerun asserts frozen camera pose and progress while paused; it does not treat one extra R3F commit render as scene movement. It recorded zero issues, page errors or failed requests.

Native Chrome recordings use an **RTX 3070 through D3D11**, at 1440×900 desktop and an emulated 390×844 viewport. Each records **1,099 requestAnimationFrame samples**, with median intervals around **13.3 ms** and p95 around **13.5 ms** on a 75 Hz display. These describe browser frame intervals on this hardware, not isolated GPU timings or physical-phone performance. Camera poses remain finite, and fast wide-to-hero jumps avoid the payload waypoint in both recordings. Over a 600 ms idle check, render counts stay **1599→1599 desktop** and **1606→1606 emulated mobile**.

Kiro completed an independent text review, not a visual inspection. Devin completed and archived a [browser audit of the earlier baseline](https://app.devin.ai/sessions/cf9c886a9f1f4099ac23e4d9fee4a1a9); its fast-reverse finding motivated the direct desired-pose filter. Baseline findings do not validate the replacement scene. Audit reports, browser recordings and QA evidence are retained outside Git.

Initial software-renderer timing prompted the bounded Earth render target. Its shaded-pixel reduction is not a measured causal FPS speedup; no controlled before/after hardware benchmark was run. Hardware evidence covers only the RTX 3070. Real phones and Safari remain untested. The archive parser and replay retain their existing provenance and semantics.
