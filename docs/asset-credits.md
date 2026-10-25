# SkyCell ascent: assets and provenance

## Typeface

The experience uses **Manrope**, the normal variable font, with a weight range of **200–800**. The locally served Latin WOFF2 is 24,836 bytes. Its header is `wOF2` and its SHA-256 is `a30ddcd349703aff7464c34bef3fffdff405ee50c113440d7c8693c02d210972`.

- Font file: [`public/fonts/manrope-latin-variable.woff2`](../public/fonts/manrope-latin-variable.woff2)
- Copyright and complete license: [`public/fonts/OFL-Manrope.txt`](../public/fonts/OFL-Manrope.txt)
- Official Google Fonts family page: <https://fonts.google.com/specimen/Manrope/about>
- Official CSS manifest used on October 24, 2026: <https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap>
- Exact WOFF2 distributed by that manifest: <https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2>
- License source: <https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt>

Copyright 2018 The Manrope Project Authors. The font is distributed under the SIL Open Font License 1.1; the complete notice is retained next to the font. The font file was downloaded without modification. No external font service is required at page runtime. Mathematical symbols outside the Latin subset may use the declared system fallback.

```css
@font-face {
  font-family: "Manrope";
  font-style: normal;
  font-weight: 200 800;
  font-display: swap;
  src: url("/fonts/manrope-latin-variable.woff2") format("woff2");
}
```

## Project photographs

The photographs below already belong to the SkyCell repository's project archive. The balloon-train photograph was also directly supplied by Sharon for this website work. This document does not assert a new public license or exclusive ownership for the archive photographs.

| Repository asset | Inspected content | Accurate caption / usage |
| --- | --- | --- |
| `public/gallery/PXL_20250621_172905846.MP.jpg` | 659×880 portrait. Two white helium balloons separated vertically, very fine suspended train and packages, blue sky. | “APEX balloon train, June 21, 2025.” Preserve the complete train where possible; no fabricated high-altitude camera view. |
| `public/gallery/1000004195.jpg` | 3024×4032 portrait. Raspberry Pi and other payload electronics, blue power-converter board, wiring and cables before packaging. | “Payload electronics and power connections before packaging.” It is a portrait photograph, not a landscape hardware product render. |
| `public/gallery/1000004204.jpg` | 4032×3024 landscape. White insulated foam enclosure with long black antenna exiting its side and a blue top suspension attachment. | “The insulated enclosure with its radio antenna, ready for flight.” The blue part is not a blue enclosure lid. |
| `public/gallery/IMG_0338.jpg` | 3024×4032 portrait. Ordered hardware layout on foam, including Raspberry Pi, RTL-SDR dongle, GPS puck, microcontroller and power converter, with a ruler. | “The payload electronics laid out on the workbench.” Strong hardware overview, but larger than the other selected archive photographs. |
| `public/gallery/1000004196.jpg` | 3024×4032 portrait. Foam enclosure and AA battery holder, with radio board and wiring below. | “Power and packaging during payload preparation.” Do not imply the photographed battery configuration solved the later power interruptions. |
| `public/gallery/PXL_20250621_125406998.jpg` | 4032×3024 landscape. Event attendees inside a bus. | Event travel context only; not launch hardware or flight evidence. |

Captions describe visible material. Dates and mission outcomes come from the confirmed project record rather than image appearance alone. Full-size dialogs retain the original JPEG evidence and existing provenance.

### Gallery display derivatives

| Display file | Dimensions | Bytes |
| --- | --- | ---: |
| [`hardware-enclosure-1600.webp`](../public/gallery/hardware-enclosure-1600.webp) | 1600×1200 | 141,960 |
| [`hardware-electronics-1600.webp`](../public/gallery/hardware-electronics-1600.webp) | 1200×1600 | 196,784 |
| [`hardware-launch.webp`](../public/gallery/hardware-launch.webp) | 659×880 | 7,412 |

These total **346,156 bytes**, versus **1,129,035 bytes** for the three originals: **69.3% smaller**. EXIF orientation, Lanczos resizing and WebP encoding preserve the full framing, including the actual two-balloon launch train; no cropping or AI editing was used. The integrated journey reuses the optimized images in its normal-flow reduced-motion/unavailable-WebGL fallback. Relevant hardware inspection links and flight notes open the original JPEG evidence. [Image processing and hashes](hardware-gallery-assets.md) also preserve the earlier three-tab gallery’s loading record as history; that menu and its transition tests do not describe the current main page.

## Original cinematic 3D assets

`CinematicTrain` uses original exterior meshes authored in Blender from inspected project photographs, especially `1000004204.jpg` and `1000004195.jpg`. The integrated flight places **one balloon above one payload**, with a coupled analytic wind/suspension performance and an exact taut attachment constraint. The actual two-balloon event photograph remains accurately captioned documentary evidence; it is not altered to match the illustrative rig. Editable `.blend`, scripts, material textures and inspection renders remain in [`tools/asset-pipeline`](../tools/asset-pipeline/README.md). The meshes use no downloaded, purchased or AI-generated 3D model.

| Runtime file | Bytes | Content |
| --- | ---: | --- |
| [`public/models/cinematic/payload-cinematic.glb`](../public/models/cinematic/payload-cinematic.glb) | 1,351,300 | Foam enclosure, lid join, clear wraps, paper labels, blue attachment, cable loop and telescopic black antenna; embedded original PBR maps. |
| [`public/models/cinematic/balloon-latex.glb`](../public/models/cinematic/balloon-latex.glb) | 308,100 | Seamless latex balloon with inflation asymmetry, gathered neck, knot and tail; one instance in the current story. |

GLB coordinates use metres and Y-up. Nominal enclosure dimensions are 0.55 × 0.22 × 0.19 m; these are authoring dimensions rather than a measured scan. [`asset-metadata.json`](../public/models/cinematic/asset-metadata.json) records source references, bounds and triangle counts. Unseen surfaces, small creases, exact tape overlaps and label wording are interpreted; recovery labels are generic. The runtime wrapped-latex/backscatter response and reduced-order suspension are visual approximations, not measured material or aerodynamic simulations.

[`PayloadReveal.tsx`](../src/experience/scene/PayloadReveal.tsx) adds code-authored cavity walls, a lifted cap, circuit boards, ports, components and wiring to a private exterior-model clone. The parts explain sensing, computation, radio and power roles; hidden geometry and exact arrangement are interpreted from the workbench photographs. Details are batched by material, with procedural meshes and existing foam maps rather than an additional purchased or generated model. The technical cutaway does **not** depict the sealed enclosure opening during flight. Its assembly coordinates, the single-balloon performance and the scaled recording visualization are not flight footage or reconstructions of the archived trajectory. These distinctions are available in the flight-notes dialog without recurring scene captions.

The old approximately 51 MB `public/b1.glb` and hot-air-balloon asset are not sources for this scene; their provenance is not asserted here. They remain recoverable in repository history. Existing Lucide control icons retain the package’s ISC license. The single-balloon/tether/box brand glyph is project-native SVG geometry.

## NASA global and regional Earth imagery

| Runtime file | Resolution | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| [`public/textures/cinematic/nasa-bmng-june-4096.webp`](../public/textures/cinematic/nasa-bmng-june-4096.webp) | 4096×2048 | 643,188 | `75b90cc57df7a2054764f1bcbbfe1c0861bf75926e149648c6a83ffbebc7860c` |
| [`public/textures/cinematic/nasa-clouds-2048.webp`](../public/textures/cinematic/nasa-clouds-2048.webp) | 2048×1024 | 522,952 | `e1b0e16adb9cff7d2109aa7e72d4b639bfec22e581b6e0967a373223b224dde6` |
| [`public/textures/cinematic/regional-earth.webp`](../public/textures/cinematic/regional-earth.webp) | 4096×4096 | 3,554,070 | `74675056ae9c891c5bee334da68be43de1fca6d124f9e3d7256c89f30fe21a72` |
| [`public/textures/cinematic/regional-earth-2048.webp`](../public/textures/cinematic/regional-earth-2048.webp) | 2048×2048 | 942,472 | `e92e44a728358483af820cd8ede015b4e17d1ad71eb0b61e84175a78347f51fc` |
| [`public/textures/cinematic/landsat-detail.webp`](../public/textures/cinematic/landsat-detail.webp) | 4096×4096 | 5,681,120 | `1b0004082dc2dcdfa9d21b26c9cec9fe452f25ec366eceb389b0ff937bc613f4` |
| [`public/textures/cinematic/landsat-detail-2048.webp`](../public/textures/cinematic/landsat-detail-2048.webp) | 2048×2048 | 1,161,924 | `cbbca376669c4ce5d01fb98103efea9901cb85099502ea8335cf130e82a97163` |

The albedo comes from NASA’s [Blue Marble: Next Generation base map, June 2004](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/), without shaded relief or bathymetry. The [original 21600×10800 JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/june/world.200406.3x21600x10800.jpg) is 21,793,655 bytes. Credit: **NASA Earth Observatory; Reto Stöckli**.

The cloud opacity comes from the separate 2002 [Blue Marble cloud mosaic](https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/). The [original 8192×4096 TIFF](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_8192.tif) is 35,870,468 bytes. Credit: **NASA Goddard Space Flight Center; image by Reto Stöckli, enhancements by Robert Simmon**.

The global derivatives were retrieved October 24, 2026 and use Pillow Lanczos resizing/WebP encoding: quality 88 for albedo; grayscale conversion and quality 84 for clouds. No generative edits or color grading were applied. Albedo loads as sRGB; cloud opacity is non-color data.

The regional source is **NASA GIBS, `MODIS_Terra_CorrectedReflectance_TrueColor`, 2024-06-21**: [exact WMS request](https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=FALSE&WIDTH=4096&HEIGHT=4096&SRS=EPSG%3A4326&BBOX=-78.0%2C34.0%2C-64.0%2C48.0&TIME=2024-06-21). Its EPSG:4326 bounds are west −78°, south 34°, east −64°, north 48°, with north at the top. The 4096² source PNG is 27,298,969 bytes. The desktop derivative is format conversion at WebP quality 92; the 2048² variant uses Lanczos resampling and quality 90 with the same bounds. Neither has painting, color correction or synthetic geographic edits.

Regional imagery is provided by **NASA Global Imagery Browse Services (GIBS), part of NASA’s Earth Science Data and Information System (ESDIS)**; see [GIBS data-use guidance](https://nasa-gibs.github.io/gibs-api-docs/#data-use-guidance-and-acknowledgements). It is representative historical Earth context, not SkyCell’s flight-day photograph. The shader feathers its boundary over 0.5° and excludes separate global clouds in the regional interior. The 2048²/4096² variant is selected once per Canvas mount.

The close terrain patch uses **NASA GIBS / Landsat WELD, `Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual`, time `2000-12-01`**. This annual historical composite supplies actual higher-resolution geography; it is not flight-day imagery. NASA identifies the dataset as [Global Web-Enabled Landsat Data, annual global 30 m](https://ecsinfo.gsfc.nasa.gov/projects/VISLABS/repos/metadata-mapping/browse/umm/visualization/data/tiles/input/gibs.earthdata.nasa.gov/layer-metadata/v1.0/Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual.json), and the [GIBS access guidance](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) describes the public image service. The EPSG:4326 patch covers west −71.6°, south 41.3°, east −69.8°, north 43.1°, north at the top. Source PNG: **4096², 39,668,558 bytes**, SHA-256 `8558b3fe65b4bc801102ed79bfa7d9c2cc867799d5c1b00e9241c1ed19869fb6`. The [fetch script](../tools/asset-pipeline/fetch_landsat_detail.py) and [metadata](../tools/asset-pipeline/landsat-detail-source.json) retain the exact request and derivative hashes. Derivatives use WebP quality 90, with Lanczos downsampling only for the compact variant. No synthetic geographic details, sharpening or color grading are added.

The optional detail map loads after the base Earth is available, one resolution per mount. Its boundary feathers over 0.10° and transparent nodata retains the broader regional map. Failed detail requests leave the broader map in place; failed base-map requests leave the texture-free physical sky and live vehicle available. The background render target now follows the actual canvas pixel ratio up to 1.25, bounded by a **2048-pixel longest edge on desktop / 1024 on compact viewports**, rather than enlarging the former 1024/640-pixel target. Cached redraw tolerances remain tied to target-pixel size.

NASA’s [Earth Science reuse guidance](https://science.nasa.gov/earth/faq/) and [media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) apply. NASA content generally is not subject to copyright in the United States, except where third-party rights are indicated; NASA asks for source credit. This informational visualization acknowledges NASA and does not imply NASA endorsement of SkyCell. Neither the global composites, regional 2024 image nor annual Landsat composite establishes SkyCell’s flight path, altitude, imagery or June 2025 weather.

## Poly Haven environment lighting

- Runtime file: [`public/textures/cinematic/qwantani_noon_puresky_1k.hdr`](../public/textures/cinematic/qwantani_noon_puresky_1k.hdr), **1024×512**, **1,089,069 bytes**.
- Asset: [Qwantani Noon (Pure Sky)](https://polyhaven.com/a/qwantani_noon_puresky), Greg Zaal (photography) and Jarod Guest (processing).
- [Exact 1K HDR download](https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_noon_puresky_1k.hdr), retrieved October 24, 2026 without modification.
- License: [Poly Haven CC0 asset terms](https://polyhaven.com/license), [CC0 1.0 dedication](https://creativecommons.org/publicdomain/zero/1.0/).
- SHA-256: `7b51637c363377f25bcd1df8ab679127353de7f7ee0622b046f392e822e2ec76`.

The self-hosted HDR supplies PMREM environment lighting, oriented to the shared sun. The visible atmosphere is an analytic concept-illustration shader rather than this ground-level sky photograph. No remote environment request is needed at runtime.

## Procedural spatial clouds

The current [`FlightClouds.tsx`](../src/experience/scene/FlightClouds.tsx) uses seven fixed world-space volumes in one instanced draw. [`spatialEnvironment.ts`](../src/experience/scene/spatialEnvironment.ts) procedurally bakes a deterministic **32³ single-channel density volume (32,768 bytes)** on the CPU; it has no downloaded image or network media transfer. The read-only CPU bytes form a bounded cache, and each mounted pass owns/disposes its GPU texture, geometry and material.

The shader takes six bounded samples per ray inside each ellipsoid, uses the shared sun for a lighting approximation, and writes first-density depth for opaque-hardware/near-vapour occlusion. Cloud placement is independent of camera coordinates; perspective and parallax come from the moving observer. The field fades between **12.5 and 18 km**, before close hardware inspection. These are authored explanatory volumes, not a measured 2025 weather reconstruction.

The earlier generated `cirrus-wisp.webp` plate has been removed from runtime. Its exact [archived asset at `779a71e`](https://github.com/sharonbasovich/skycell/blob/779a71ef56be61c02cc77180bb484e84fb7a616e/public/textures/flight/cirrus-wisp.webp), SHA-256 and complete generation prompt remain in the [historical generation record](flight-cloud-asset.md). The current cloud pass does not sample that image.

## Renderer-derived fallback posters and inventory

The live environment also has a code-authored, texture-free [`ProgressiveSky`](../src/experience/scene/ProgressiveSky.tsx). It uses the actual projection, observer altitude and shared sun with analytic ray/sphere intersection and an air-column approximation. It adds no media download and does not claim geographic surface detail. Parallel model loading and separately suspended HDR/Earth loaders allow the actual rig to appear before photographic maps finish; the Canvas reveals after three rig warm frames with a 220 ms fade. The photographic Earth display subsequently blends over the physical sky in 450 ms, with depth testing at the far plane so loaded imagery cannot paint over the opaque rig. Asset arrival is a bounded loading transition independent of paused flight movement.

The static fallback uses two renderer-derived layers: [`flight-earth.webp`](../public/posters/flight-earth.webp), **1440×900 / 23,396 bytes**, and [`flight-rig.webp`](../public/posters/flight-rig.webp), **272×814 / 7,228 bytes**. The rig poster appears **only in static mode**, retaining genuine alpha transparency and depicting the single conceptual balloon/payload; it is not overlaid with a loading live model. CSS positions it independently over Earth for different screen shapes. `sky-story-static` supplies the eight chapters in normal flow, with original-project image derivatives, a static SVG recording profile and native controls. The poster fixtures render Earth and rig separately with `fadeIn={false}`, inheriting the NASA/Poly Haven and original-model credits; the removed generated cirrus was not part of either fixture. They are not documentary flight photographs. Together the layers add **30,624 bytes**.

The six selected files—the two GLBs, global NASA maps, one regional variant and HDR—total **7,468,679 bytes desktop / 4,857,081 bytes compact**, exactly **149,230 bytes less** than the previous selected scene inventory. The two fallback layers, application code, fonts and archive photographs are additional. Code-authored cutaway geometry and the procedural cloud density add no external media request. Only one regional variant is selected per Canvas mount. Estimated Earth-map RGBA allocation with mipmaps remains **138.7 / 74.7 MiB** desktop/compact, before the cached HalfFloat target, models, HDR, PMREM and small cloud volume. Transfer and allocation figures are distinct from frame-time measurements. Current **57-test/lint/typecheck/build checks**, two recorded Intel production runs and the controlled delayed-Earth startup/fallback checks are described with their limits in [verification notes](ascent-experience.md); they do not establish an FPS guarantee, physical-phone result or deployment outcome.

## Replay data

The APEX-2-T tracker / SondeHub archive remains documented in [`docs/data.md`](data.md): **125 actual observations**, June 21, 2025 **18:11:06–19:17:21 UTC**, **29,510 m** peak in this partial recording. It is separate from SkyCell’s **915 MHz LoRa / Meshtastic payload telemetry** and is not live. The integrated 3D profile uses one point per observation, a shared **0.5 scene units/km** scale on all axes, absolute altitude and unconnected gaps over 60 seconds. A native HTML range input selects real observation indices. Plot placement is explanatory; the conceptual scene’s scroll position is not an observation timestamp or altitude reading.
