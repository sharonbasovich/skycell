# SkyCell ascent experience

Sharon selected the ascent idea, specifically requested 3D, then asked for a much more ambitious implementation from scratch. This branch starts at original `origin/main` (16d83f3), not the comparison draft branch. The original validated archive parser, clock and replay remain reusable engineering foundations. The presentation and scene are new.

## Design contract

The subject is a four-student high-altitude radio experiment, first place at the APEX international research hackathon. The page should feel like a considered aerospace visualization: one continuous spatial story, substantial negative space, confident typography and real evidence. No unrelated effects, stock rocket imagery, hot-air balloons, or fabricated flight data.

Visual system: cobalt #1647d1, deep blue #0b2d68, night #07162e, white #ffffff, pale sky #e4eefb, ink #101f3a. Manrope variable (official Google Fonts, OFL) for display and UI; body 16–18 px, compact captions 12–13 px, desktop h1 around 90–112 px and mobile 46–58 px. Wide open layout, thin dividers where structural, restrained corners. Lucide outline icons at one optical weight.

Hero allowed copy: SkyCell; Ascent; Build; Flight replay; “A small radio. A much bigger horizon.”; “An experiment in connecting the ground to the stratosphere.”; “Follow the ascent”; “1st place at APEX 2025”; “International research hackathon”; “Four students. One high-altitude mission.” Scene controls and conceptual caption are functional UI. No hero eyebrow/badge above the heading.

## Full page and motion

- Fixed quiet navigation, one integrated four-viewport journey. Hero and three explanatory chapters sit alongside a persistent 3D world; the scene evolves through payload detail, radio connection and a wide stratospheric horizon. Scroll is ordinary browser scrolling, never captured or forced. Native chapter buttons provide direct navigation.
- True Three.js/R3F geometry: actual-inspired twin spherical helium balloons, thin train/tethers and suspended instruments, a white insulated enclosure, blue attachment, black side antenna, ground station, curved Earth and restrained atmospheric rim. Camera and communication arc are conceptual, not a reconstruction of the flight.
- Existing Framer Motion drives a progress value. GPU work is demand-based, with finite convergence and no endless ambient rotation. No external 51 MB model, remote environment map or unnecessary postprocessing. A pause control freezes scene movement. Mobile uses centered framing above the text. Reduced-motion and WebGL failure have a useful static equivalent and all prose remains visible.
- Calm white/pale-sky evidence sections follow: actual launch and hardware photos, engineering specifications, native post-flight lessons, then a navy archive chapter and source footer.
- Replay uses the real partial APEX tracker/SondeHub archive and is explicitly distinct from SkyCell’s 915 MHz payload telemetry. It is never labeled live.

## Facts and limits

SkyCell: approximately 30 km mission altitude, 70 km LoRa/Meshtastic link at 915 MHz; Python NMEA GPS, environmental sensors and reconnection; RTL-SDR 30 MHz–1.5 GHz at 2.4 MS/s. Only a few payload packets were received and startup brownouts/power continuity were lessons. Do not turn a range connection into a claim of continuous telemetry.

Archive: APEX-2-T, 125 observations, June 21 2025 18:11:06–19:17:21 UTC, 29,510 m peak in this partial recording. Keep reception gaps, held sensor values and original provenance.

## Observable completion

Production build, lint and existing regression tests pass. Inspect all four scene milestones at desktop, tablet and phone widths, verify framing/contrast and actual visible 3D. Check native anchors/chapter controls, pause/resume, reduced-motion changes, no WebGL, context failure, route teardown/re-entry, archive playback and broken resources. Record draw/triangle counts and idle rendering evidence; software Chromium is not a phone GPU benchmark. Separate branch preview only; main and production aliases remain unchanged.

## Verification, October 24, 2026

- ESLint, TypeScript and production build pass. All 16 original parser/replay tests pass; the archive, parser and replay clock are unchanged.
- IAB desktop rendering and a serial Chromium/Playwright matrix cover 360×780, 390×844, 375×667, 768×1024, 1440×900 and 1272×716. All four milestones render genuine WebGL 3D with correct asset/font loading and no document overflow. Mobile text/toolbar overlap and the hard canvas edge were corrected, then affected phone states were rechecked.
- Native chapter buttons and cross-route Build anchors work. Pause holds the camera/stage while the page scrolls; resume follows the current chapter. Photo lightbox Escape restores focus. Post-flight lessons expand. Detailed archive play/pause and keyboard seeking still work.
- Reduced motion and unsupported WebGL preserve all four HTML chapters and use the static illustration; they avoid loading the Three.js scene. Simulated context loss shows a fallback; Reload 3D clears loader state and recovers.
- Scene metrics after repeated route re-entry plateau around 35 geometries, 4 textures, 35 draw calls and 35,000 triangles. Render counts stop changing after camera convergence. A single React invalidation on pause is expected and is not continuing motion. These are renderer counters and idle behavior checks, not GPU timings or an FPS claim.
- Browser evidence and the harness are retained outside the source tree at `C:/Users/Sharon/Documents/ChatGPT/skycell-ascent-qa/`. The Chromium phone viewports use a software backend; physical phone GPUs and screen readers were not tested.
- The initially integrated Canvas fallback incorrectly reported failure even with WebGL available; it was replaced with an inert fallback. Retrying a failed lazy import/texture now reloads the page rather than reusing rejected caches. Hash navigation waits for lazy content without an arbitrary timeout.
