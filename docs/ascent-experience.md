# SkyCell ascent experience

The ascent experience originated from `origin/main` (`16d83f3`), then developed through ascent and cinematic revisions. The current `codex/skycell-flight-story` branch continues Sharon’s selected live 3D direction with one illustrative balloon, a performed ascent and interactive downstream chapters. The validated archive parser, replay clock and dashboard semantics remain foundations. The current [flight-story brief](flight-story-brief.md) records the design and acceptance contract.

## Design contract

The subject is a four-student high-altitude radio experiment, first place at the APEX international research hackathon. The page should feel like a considered aerospace visualization: one continuous spatial story, substantial negative space, confident typography and real evidence. No unrelated effects, stock rocket imagery, hot-air balloons, or fabricated flight data.

Visual system: cobalt #1647d1, deep blue #0b2d68, night #07162e, white #ffffff, pale sky #e4eefb, ink #101f3a. Manrope variable (official Google Fonts, OFL) for display and UI; body 16–18 px, compact captions 12–13 px, desktop h1 around 90–112 px and mobile 46–58 px. Wide open layout, thin dividers where structural, restrained corners. Lucide outline icons at one optical weight.

The lead is “A small radio. A bigger horizon.” Four compositions change text placement and scale around one complete vehicle. The project-native brand glyph uses one balloon, a tether and a payload box. The live scene occupies the full visual height on phones as well as desktop.

## Full page and motion

- One latex balloon supports one foam payload. Their nominal local Y centres are 4.1 m and 0 m; a taut **2.947 m** tether joins the actual attachment points. Analytic wind and slight payload phase lag produce restrained movement without deforming the hardware or stretching the line. These are illustrative authoring dimensions, not a measured flight rig.
- A steady three-quarter following camera targets **[0, 2.05, 0]** from roughly **13–18 m** away. The complete vehicle remains the subject across four compositions. In the final narrow composition, the title stays left and the rig sits right. Desktop projection checks place the balloon’s top at least 82 px from the viewport top, clearing the fixed 74 px header with wind allowance. Illustrative altitude rises **8→30 km**, beginning above the cloud deck; Earth geography drifts along a bounded **66 km east / 18 km north** path. Neither path is the recorded APEX trajectory.
- One shared Framer spring filters scroll for the camera and atmosphere. The renderer publishes its actual presented progress back through a MotionValue, which drives HTML copy and navigation without another filter. Pause and the bounded 300 ms resume bridge therefore keep typography, metrics and rig in the same phase. The bridge runs only after scrolling while paused; ordinary scrolling uses the spring directly. Nearby transparent cirrus passes early in the climb and fades out by 14 km. Wind and wisps continue after scrolling stops while the scene is visible and unpaused.
- A parent-owned elapsed clock freezes when paused, hidden or when the journey’s visible intersection is at most 100 pixels high. The first frame after waking uses 1/60 s, excluding time spent away. The R3F Canvas uses demand scheduling but requests frames continuously during visible performance; it stops its loop offscreen, hidden or paused. Dynamic contact shadows use a bounded 1K map.
- The lower page contains a large actual-photo hardware explorer with tabs and image-clip reveal; a selectable sensing → Python → radio → ground sequence that also follows scroll; and a pointer/keyboard observation scrubber selecting the archive’s **125 actual points**. The gallery’s mounted WebP layers preload within 320 px and gate display on decode, retaining the prior photo behind a 160 ms incoming fade. A 240 ms aspect-ratio transition smooths phone frame-height changes; reduced motion removes these transitions. Hidden layers cannot receive focus, and the dialog opens the original JPEG. See [gallery assets](hardware-gallery-assets.md). Gaps over 60 seconds remain blank/shaded. Signal animation explains the system, not recorded or live packets. Reduced motion provides static story copy, poster imagery and manual controls.
- Power continuity, startup brownouts and the small number of received payload packets remain visible alongside the successful range result. The actual two-balloon launch photograph keeps its factual caption; it documents the event, while the one-balloon scene illustrates the idea.
- Native chapter controls target each panel’s top. Reduced motion, unavailable WebGL and scene errors enter `sky-static-flight`: normal-flow chapter copy remains readable beside the two-layer renderer-derived fallback. Its Earth background and true-alpha single-balloon rig are positioned independently for different screen shapes.

## Rendering and asset limits

The original Blender payload/balloon GLBs and material textures remain in [`tools/asset-pipeline`](../tools/asset-pipeline/README.md); nominal bounds and counts are in [`asset-metadata.json`](../public/models/cinematic/asset-metadata.json). Unseen surfaces, creases, exact tape overlaps and generic recovery labels are interpreted. Latex response, wind, payload lag, camera travel and altitude are concept-illustration choices, not scans, scientific simulation or reconstructed telemetry.

One shared sun lights the key, latex approximation, Earth and analytic atmosphere; the oriented Poly Haven pure-noon HDR supplies PMREM lighting. Earth uses kilometres, a 6,371 km radius and a drifting local frame beginning at 42°N, 71°W. NASA June global maps blend into georeferenced regional MODIS imagery from **2024-06-21**, with separate global clouds excluded inside the regional patch. These are historical geographic context, not 2025 flight-day imagery. Generated near-cloud wisps are separately identified in [cloud provenance](flight-cloud-asset.md) and [asset credits](asset-credits.md).

Earth still shades into a cached linear HalfFloat target, capped at **1024 CSS pixels wide desktop / 640 compact**, with matching aspect and projection. Camera, projection, altitude, geographic drift, sun or target changes invalidate it; elapsed wind time alone does not. Canvas DPR is capped at **1.25**. A 1440×900 canvas uses about 5 MiB for the target; a full-height 390×844 canvas uses about 2.51 MiB. Earth-map RGBA allocation with mipmaps is estimated at **138.7 / 74.7 MiB** desktop/compact before the target, models, HDR and PMREM.

Seven selected scene assets, including the generated wisp, total **7,617,909 bytes desktop / 5,006,311 bytes compact**, excluding application code, font, archive photographs and the two fallback layers, which add **30,624 bytes**. One regional variant is selected per Canvas mount. Transfer sizes and allocation estimates are distinct from frame-time measurements.

## Facts and limits

SkyCell: approximately 30 km mission altitude, 70 km LoRa/Meshtastic link at 915 MHz; Python NMEA GPS, environmental sensors and reconnection; RTL-SDR 30 MHz–1.5 GHz at 2.4 MS/s. Only a few payload packets were received and startup brownouts/power continuity were lessons. Do not turn a range connection into a claim of continuous telemetry.

Archive: APEX-2-T, 125 observations, June 21 2025 18:11:06–19:17:21 UTC, 29,510 m peak in this partial recording. Keep reception gaps, held sensor values and original provenance.

## Verification scope

Check complete-vehicle framing across all four compositions, forward/reverse scrolling and wake from idle. Verify wind/cloud continuity, taut attachment points, pause/resume, hidden/offscreen suspension, reduced motion, loading/failure and route re-entry. Exercise hardware tabs/photo dialog, signal selection, archive pointer/keyboard scrubbing, preserved gaps and replay links. Browser cadence or passing tests does not establish visual acceptance or physical-phone performance.

## Current verification, October 25, 2026

Final production checks pass: **full lint with zero errors and warnings, 29 tests, typecheck and build**. The seven-viewport matrix covers **415×582, 360×780, 390×844, 375×667, 768×1024, 1440×900 and 1272×716**, with **42 screenshots**, passing controls, keyboard interaction and replay. Reduced motion, unavailable WebGL and context-loss/reload recovery pass. The matrix recorded **zero issues, JavaScript errors or failed requests**.

An extra **3,500 ms delayed incoming-photo test** retains the outgoing image; rapid tab changes settle correctly with one accessible photo. The dialog opens the original JPEG and restores focus. Display variants preserve complete framing at **346,156 bytes**, **69.3% smaller** than the **1,129,035-byte** originals.

Production recordings at **1272×716** and **415×582** cover an **8.5 s forward ascent**, wheel reverse, pause-scroll-resume and field interactions. All camera values remain finite with a fixed following target; camera, clock and copy freeze on pause. Resume begins from the held state and completes its bridge without jumping. Both recordings complete with zero JavaScript errors.

Timing on **Intel Iris Xe / D3D11 Chromium** is recorded separately with and without video capture:

| Viewport | No-video rAF median / p95 (samples) | Recorded rAF median / p95 (samples) | No-video final rolling R3F median / p95 |
| --- | --- | --- | --- |
| 1272×716 | 7.3 / 20.7 ms (761) | 13.9 / 34.3 ms (539) | 7.9 / 21.3 ms |
| 415×582 | 6.9 / 13.6 ms (1,146) | 7.0 / 14.0 ms (1,011) | 6.9 / 7.9 ms |

The no-video measurements are one unpaced headless run on desktop hardware; the compact viewport is emulation, not a physical-phone benchmark. Browser callback intervals and the final rolling R3F window are different samples, neither isolated GPU timings nor an FPS guarantee. Video capture adds overhead. Development and capture conditions also included roughly 90% memory use, so the cadence differences cannot be assigned wholly to one code change.

The October 24 cinematic revision’s RTX 3070/native-Chrome measurements, idle-loop checks and camera-tour checks describe that earlier revision. Kiro’s independent text review and Devin’s [archived baseline browser audit](https://app.devin.ai/sessions/cf9c886a9f1f4099ac23e4d9fee4a1a9) likewise do not validate current moving performance. QA reports and recordings remain outside Git. Real phones and Safari remain untested; archive provenance and replay semantics are preserved.
