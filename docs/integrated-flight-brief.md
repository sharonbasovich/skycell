# The flight is the page

Continue the accepted live Three.js flight and payload inspection. Sharon's current refinements are sharper Earth imagery, a balloon that visibly leads its payload during scroll-driven screen crossings, removal of the unnecessary footer/header collision, and a complete estimated recording path flown by the same rig through scroll-controlled playback and a moving camera. This continues the accepted direction rather than selecting a new motion engine.

Keep the continuous full-height journey, Manrope, deep atmospheric blue, white and restrained signal cyan. Use large direct headlines and only information that belongs to the current object or question. Provenance and original photographic evidence remain in the accessible flight-notes dialog. Remove the footer while retaining evidence/source links in the last chapter; at the document bottom, its headline must remain below the fixed SkyCell header.

## Sequence

1. Flight: a balloon leads; its denser payload trails turns, swings and settles independently. During lateral scroll-driven screen crossings, the suspended payload visibly lags the envelope, responds to reverse travel, and settles rather than translating as one rigid object. The world, camera and vehicle share coordinates.
2. Ascent: pass fixed cloud volumes and see the Earth fall away. The camera follows a trajectory rather than dragging the vehicle between screen positions. Real higher-resolution Landsat/WELD terrain and a sharper bounded render target resolve coast, city and field detail; historical images remain geographic context rather than flight-day photography.
3. Payload: approach the same foam enclosure. The balloon leaves the close frame above its tether for an explicit hardware inspection.
4. Inside: the lid and a reference-based technical cutaway reveal sensing, Python computation, power and radio hardware. This is an explanatory assembly, not an assertion that the lid opened during flight.
5. Connection: follow the antenna to explain the 70 km, 915 MHz result and the limited number of payload packets.
6. Power: return to the relevant power component to explain startup brownouts and the shorter operating window.
7. Recording: preserve the 125 actual event-tracker fixes and fill internal reception gaps with explicitly marked linear position/altitude estimates. Scrolling advances archive time and the same balloon/payload along this path, reveals travelled segments and pans the camera to expose depth. Remove the showcase slider. Keep the tracker source distinct from mesh telemetry; do not alter the CSV or invent positions outside the recorded interval.
8. Resolve: return to the complete vehicle, the four-student result and source/flight notes.

No separate hardware tab menu, generic card sequence, white document-like epilogue or footer. Original photographs remain useful evidence, available at the relevant inspection point. The advanced replay remains reachable and keeps its existing controls and data semantics.

## Heading comparison

Three bounded, query-selected treatments are implemented in the accepted Motion/Three stack: **1 Lift** (`?headings=1`, rising line masks), **2 Depth** (`?headings=2`, scroll entry and restrained pointer-responsive line depth), and **3 Signal** (`?headings=3`, a scroll-linked highlight sweep). All three actual interactions and variant switching are verified. They are ready for comparison, not automatically selected for the main page. **Depth is recommended** for its connection to the spatial scene and its scroll response on touch layouts; the base heading treatment remains unchanged until Sharon chooses. Reduced-motion/static mode uses ordinary readable headings.

## Completion evidence

- At fixed scroll, the balloon and payload have visibly distinct motion and a changing tether angle, with constant attachment length and no independent clocks. During screen crossings, the balloon leads and the payload trails; reversing scroll reverses that follow-through without instability or tether separation.
- Camera translation produces real parallax/occlusion through fixed world clouds. The scene is not a camera-following image plane.
- Coast, city and terrain details are visibly sharper. Optional detail-map failures retain broader imagery, and base-map failures retain the physical sky and live rig. Historical NASA sources and the transfer/memory budget remain documented.
- Approaching the payload preserves its identity and transforms into a modeled cutaway, with purposeful reading holds and reversible transitions.
- Each chapter contributes one clear point; provenance is readable in flight notes without recurring overlays. The last headline remains clear of the fixed header at maximum scroll after footer removal.
- The recording is continuous only across the available archive interval. Amber joins and a concise caption identify estimates, all actual fixes stay intact, and the same rig follows the path as scroll changes. Camera motion and ground projection make the path's depth legible. Forward/reverse scroll and pause/resume keep rig, revealed trace, UTC and altitude synchronized.
- The full sequence works on desktop, tablet and short/narrow phones; reduced motion and unavailable WebGL retain the story in normal reading order.
- Inspect recordings as well as stills. Check forward/reverse/idle/pause/resume, hardware, scroll-driven recording, fallback controls, route reentry, failure paths, frame cadence and resource ownership. Unit checks establish geometry/timing invariants, not visual approval; earlier checkpoint results do not substitute for current verification.

## Current verification

On `codex/skycell-scroll-flight`, lint, **71 tests**, strict typecheck and the production build pass. Two **26-second** continuous desktop/short-phone captures and dedicated reverse/suspension/replay checks passed with **zero JavaScript/shader errors or failed requests** during ordinary use. Their recordings and contact sheets were visually inspected: terrain detail resolves, the payload follows through in left/right crossings, and the same rig follows the revealed three-dimensional recording path. Final targeted checks after the ending-timing, Depth-entry and comparison-nav fixes pass at **1272×716, 415×582, 360×780 and 768×1024**, with clear controls and no header/headline or heading/heading collision. All three heading treatments are runnable, verified and awaiting the user's choice.

Separate detail-map 404, base-map 404 and **nine-second all-map delay** fixtures retain the live scene and a frozen paused camera/clock, with expected fixture diagnostics only. Reduced motion and unavailable WebGL retain eight readable chapters and static recording controls without requesting Three.js. Intel Iris Xe desktop/emulated-viewport callback measurements and their limitations are recorded in [ascent verification notes](ascent-experience.md); physical phones and Safari remain unverified. Current reports, movies and screenshots remain in `skycell-scroll-qa` outside Git. These checks assert no deployment outcome.
