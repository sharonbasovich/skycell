# SkyCell integrated flight experience

The ascent experience originated from `origin/main` (`16d83f3`), then developed through ascent, cinematic and flight-story revisions. The current `codex/skycell-integrated-flight` branch continues the selected live Three.js direction: the flight, hardware inspection and recording form one continuous scene. The [integrated brief](integrated-flight-brief.md) is the current design and acceptance contract. The validated archive parser, replay clock and advanced dashboard remain foundations.

## Page and information

Manrope, deep atmospheric blue, white and a restrained signal cyan form one visual system. Large direct headlines describe the current object or question. The permanent illustration caption, floating chapter labels, hero award and separate white field-story epilogue have been removed. The compact footer and accessible **Flight notes & evidence** dialog hold sources, interpretation and original photographic evidence.

The continuous sequence has eight chapters:

1. **Flight:** one balloon leads a denser, suspended payload, with distinct movement and a changing tether angle.
2. **Ascent:** the camera follows the same moving vehicle past fixed cloud volumes as Earth recedes.
3. **Payload:** approach the same foam enclosure, preserving its identity and antenna; an inspection link opens the actual build photograph.
4. **Inside:** lift the lid and separate interpreted sensing, computation, radio and power assemblies. This is a technical cutaway, not an event that occurred during flight.
5. **Connection:** use the antenna and spatial signal explanation to present the 70 km, 915 MHz result alongside the limited number of received payload packets.
6. **Power:** return to the relevant component to explain startup brownouts and the shorter operating window.
7. **Recording:** reveal the event tracker’s actual 125 observations in the same atmosphere, with a native HTML range input selecting an observation.
8. **Resolve:** return to the complete vehicle, the four-student result, project source and flight notes.

There is no separate three-tab hardware menu. The [optimized project photographs](hardware-gallery-assets.md) remain useful in the normal-flow fallback; inspection dialogs use their original JPEG evidence. The actual launch photograph retains its two-balloon train and factual caption. Reduced motion, unavailable WebGL and scene errors use `sky-story-static`: all eight chapters remain in normal reading order, with photographs, a static recording profile and manual controls.

## Flight, camera and inspection

`flightDynamics.ts` provides one deterministic pose from physical ascent progress and the parent’s visible scene time. Wind forces drive both the envelope and a reduced-order damped suspension response; the payload follows a lagged point on the curved route and overshoots independently. Ordinary-flight geometry projects this response onto an exact **2.947 m** nominal taut attachment length. The local route rises **28 m**, while environmental altitude independently progresses **8→30 km**. These are authored visualization coordinates and a reduced-order performance model, not reconstructed telemetry, measured rig dimensions or a full aerodynamic simulation.

The camera follows the actual sampled pose before approaching the enclosure for a purposeful inspection. It no longer keeps a stationary train and moves it between screen positions. The original exterior GLB remains the reference; code-authored cavity walls, circuit roles, wiring and a lifted lid extend it for the cutaway. Hidden surfaces and exact interior arrangement are interpreted from photographs. Shared reusable anchors keep suspension, camera targets and inspection parts consistent. The cord fades to 7% during the technical inspection range, approximately narrative progress .25–.82, then returns for ordinary flight; it does not dominate the cutaway or recording. The scene does not assert that the sealed enclosure opened in flight.

One Framer spring filters narrative scroll. The renderer publishes its actual presented progress through a MotionValue for HTML composition and interaction state, without a second continuous filter. After scrolling while paused, a bounded adaptive bridge reconnects the held pose: **0.3 + 0.75 × progress gap seconds**. A small gap settles quickly; a whole-journey jump gets more travel time. The parent-owned clock excludes time spent hidden, offscreen, paused or inside a modal dialog, and resets the first active timestep on waking. After finite loading transitions finish, the demand-scheduled Canvas requests continuous frames only while the visible scene is performing. Selecting a recorded observation explicitly invalidates a frame even when flight movement is paused, so its marker and reading still respond.

The GLTF pair loads in parallel, while model, HDR and photographic Earth loaders have separate nested Suspense boundaries. A texture-free `ProgressiveSky` supplies the physical spherical horizon without waiting on maps or HDR; fallback illumination remains available while environment lighting loads. The Canvas intentionally fades in over **220 ms after the actual rig mounts and completes three warm frames**, independently of Earth/HDR arrival. A rig poster is used only in static mode, so the live page cannot crossfade a poster balloon into a second model balloon. Once Earth imagery resolves, only its final display pass fades over the physical sky for 450 ms. This bounded asset-loading transition has its own clamped frame age and requests frames until complete, even if flight movement is paused; the actors and copy remain held. The cached Earth shading target is not recomputed for opacity alone. Static poster fixtures pass `fadeIn={false}`, so their four-frame captures remain fully opaque without needing a live scene clock.

## Shared environment and assets

The key light, wrapped-latex approximation, Earth, atmosphere and near clouds use one sun direction. The oriented Poly Haven pure-noon HDR supplies PMREM lighting. The key follows the payload’s world position while retaining that sun direction, so inspection detail does not lose its lighting when the vehicle travels.

Earth uses kilometres, a **6,371 km** radius and a fixed local east/up/north basis beginning at **42°N, 71°W**. The observer moves over the sphere along a bounded **66 km east / 18 km north** concept path, preserving radial altitude; the shader does not merely scroll a geographic texture under a stationary eye. NASA June global maps blend into georeferenced regional MODIS imagery from **2024-06-21**. Separate global clouds are excluded inside the regional patch. These historical images provide geographic context, not 2025 flight-day imagery or weather.

Near clouds are seven fixed world-space volumes submitted in one instanced draw. A deterministic, locally baked **32³ single-channel density field (32 KiB)** supplies six bounded samples per ray, with shared sunlight, first-density depth and hardware occlusion. No cloud mesh is positioned or scaled in camera space. Cloud banks are placed below the initial vehicle to preserve the opening reading area. Their opacity fades between **12.5 and 18 km**, leaving hardware inspection clear. The old generated cirrus bitmap has been removed from runtime; its [generation record](flight-cloud-asset.md) is retained as history.

Earth shades into a cached linear HalfFloat target, capped at **1024 CSS pixels wide desktop / 640 compact**, with matching aspect and projection. The cache ignores camera translation below **2 m** and approximately quarter-target-pixel rotation/projection changes; physical ascent, geographic travel, visible lens changes, sunlight or target changes refresh it. Foreground clouds retain genuine per-frame parallax. Canvas DPR is capped at **1.25**. A 1440×900 target uses about 5 MiB; a full-height 390×844 target uses about 2.51 MiB. Earth-map RGBA allocation with mipmaps is estimated at **138.7 / 74.7 MiB** desktop/compact before targets, models, HDR and PMREM.

The two GLBs, global NASA maps, one selected regional variant and HDR total **7,468,679 bytes desktop / 4,857,081 bytes compact**. Code, font, archive photographs and two fallback layers are additional. The layers add **30,624 bytes**. The procedural density field has no media download; its bounded read-only CPU bytes are reused while each mounted cloud pass owns its GPU texture. All owned geometries, materials and render targets have explicit disposal; loader-cached model geometry and imagery remain shared. See [asset provenance](asset-credits.md).

## Recording and mission limits

The recording geometry contains one point per actual observation, projected into a local east/north/up presentation with **0.5 scene units per kilometre on every axis**. Altitude is absolute. Connected pairs preserve native order and omit reception gaps over 60 seconds; no gap is filled with invented observations. A native range input selects indices 0–124 and supplies the corresponding recorded UTC time and altitude. The stronger 0.075-radius spatial trace and selected marker use a recording-camera offset **[62, 24, 10]** from the plot target; desktop composition is **[.65, .43]**, compact **[.50, .465]**. Projection tests include all 125 points, their ground projections, marker bounds and pointer orbit. The slider’s slim thumb has a visible keyboard-focus treatment. Plot location and scale explain the data; they do not place the illustrative rig on that trajectory.

SkyCell established an approximately **70 km LoRa / Meshtastic link at 915 MHz**, with an approximately **30 km** mission altitude. Python handled NMEA GPS, environmental readings and reconnection; the ground work included RTL-SDR **30 MHz–1.5 GHz at 2.4 MS/s**. Only a few payload packets were received. Startup brownouts required a power-bank workaround that shortened operating time. Range success is not a claim of continuous telemetry.

The separate **APEX-2-T / SondeHub event-tracker archive** contains **125 observations**, June 21, 2025 **18:11:06–19:17:21 UTC**, with a **29,510 m** peak in the partial recording. It is neither live nor SkyCell’s 915 MHz mesh packet stream. The flight-notes dialog preserves that distinction, the actual two-balloon event configuration and the cutaway’s interpretation.

## Current verification

**Lint, 59 tests, strict typecheck and the production build pass.** Geometry and timing checks cover suspension constraints, reversible narrative/camera sampling, cutaway anchors, the spherical observer, actual recording gaps and all-observation framing. Initial in-app loading compiled the cloud and latex shaders without errors.

The final offline audits of the continuous desktop and short-phone recordings **pass with no blocking finding**. In-app readability checks covered **390×844, 415×582 and 768×1024**. The portrait-tablet pass identified a cutaway crop caused by its camera-mode predicate. Portrait framing now applies at that aspect ratio; a rebuilt in-app check confirms the closed case and opened cutaway fit, and camera tests cover that viewport. The recorded timing table below precedes this classification adjustment.

Two local production-build runs in native Chrome used **Intel Iris Xe through ANGLE/D3D11**, device scale factor **1.5**, and Canvas DPR capped at **1.25**. Each recorded a **24-second forward journey**, reverse seek, photos and keyboard controls, pause-scroll-resume, advanced replay, route reentry and teardown. Both verified independent idle motion, frozen paused clock/camera/copy and a completed resume bridge, with **zero JavaScript/shader errors or failed requests**.

| Viewport | Recorded callback samples | rAF median / p95 | Rig-ready timestamp |
| --- | ---: | --- | ---: |
| 1272×716 | 1,754 | 15.9 / 16.8 ms | 3,629.7 ms |
| 415×582 | 3,029 | 8.0 / 8.2 ms | 868.8 ms |

These are captured, uncapped headless callback intervals on desktop hardware, not isolated GPU timings or an FPS guarantee. Video capture contributes overhead, and the short-phone viewport is desktop emulation, not a physical-device benchmark. Rig-ready timestamps describe these fixtures rather than a universal network or page-load promise. Physical phones and Safari remain unverified.

A controlled startup fixture held **all three Earth-map requests for 10 seconds**. The actual rig became ready at **4,006.2 ms while all maps were still held**, with **no live rig poster**. Releasing the maps completed the background upgrade while flight was paused, with camera and clock unchanged and no errors. The earlier movie’s roughly 22-second static-poster delay exposed the loading dependency; it is not a controlled before/after timing baseline.

Reduced motion verifies eight normal-flow chapters, the static SVG recording and native controls, with no Three.js chunk requested. Unavailable WebGL verifies eight chapters and poster fallback. Context loss enters the same readable fallback and reload recovers the live scene. These recovery checks likewise report zero JavaScript/shader errors or failed requests.

The earlier `779a71e` flight-story revision’s seven-viewport matrix, gallery tests and Intel timings describe that checkpoint only. October 24 RTX measurements, Kiro’s text review and Devin’s archived baseline audit do not validate this integrated revision. Current QA reports and recordings remain outside Git. No deployment result is asserted by this document.
