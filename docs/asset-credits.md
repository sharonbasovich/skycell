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

Captions describe visible material. Dates and mission outcomes come from the confirmed project record rather than image appearance alone.

## Original cinematic 3D assets

`CinematicTrain` uses original meshes authored in Blender from the inspected project photographs, especially `1000004204.jpg` and `1000004195.jpg`, with the twin-balloon relationship observed in `PXL_20250621_172905846.MP.jpg`. The editable `.blend`, source scripts, original material textures and inspection renders are retained in [`tools/asset-pipeline`](../tools/asset-pipeline/README.md). This pipeline uses no downloaded, purchased or AI-generated 3D model.

| Runtime file | Bytes | Content |
| --- | ---: | --- |
| [`public/models/cinematic/payload-cinematic.glb`](../public/models/cinematic/payload-cinematic.glb) | 1,351,300 | Foam enclosure, lid join, clear wraps, paper labels, blue attachment, cable loop and telescopic black antenna; embedded original PBR maps. |
| [`public/models/cinematic/balloon-latex.glb`](../public/models/cinematic/balloon-latex.glb) | 308,100 | Seamless latex balloon with inflation asymmetry, gathered neck, knot and tail; reused for two balloons. |

GLB coordinates use metres and Y-up. Nominal enclosure dimensions are 0.55 × 0.22 × 0.19 m; these are authoring dimensions rather than a measured scan. [`asset-metadata.json`](../public/models/cinematic/asset-metadata.json) records source references, bounds and triangle counts. Unseen surfaces, small creases, exact tape overlaps and label wording are interpreted; recovery labels are generic. The runtime latex/backscatter shader is a visual approximation. The scene is a conceptual exterior illustration, not flight footage, a measurement or a reconstruction of the archived track.

The old approximately 51 MB `public/b1.glb` and hot-air-balloon asset are not sources for this scene; their provenance is not asserted here. They remain recoverable in repository history. Existing Lucide control icons retain the package’s ISC license.

## NASA global and regional Earth imagery

| Runtime file | Resolution | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| [`public/textures/cinematic/nasa-bmng-june-4096.webp`](../public/textures/cinematic/nasa-bmng-june-4096.webp) | 4096×2048 | 643,188 | `75b90cc57df7a2054764f1bcbbfe1c0861bf75926e149648c6a83ffbebc7860c` |
| [`public/textures/cinematic/nasa-clouds-2048.webp`](../public/textures/cinematic/nasa-clouds-2048.webp) | 2048×1024 | 522,952 | `e1b0e16adb9cff7d2109aa7e72d4b639bfec22e581b6e0967a373223b224dde6` |
| [`public/textures/cinematic/regional-earth.webp`](../public/textures/cinematic/regional-earth.webp) | 4096×4096 | 3,554,070 | `74675056ae9c891c5bee334da68be43de1fca6d124f9e3d7256c89f30fe21a72` |
| [`public/textures/cinematic/regional-earth-2048.webp`](../public/textures/cinematic/regional-earth-2048.webp) | 2048×2048 | 942,472 | `e92e44a728358483af820cd8ede015b4e17d1ad71eb0b61e84175a78347f51fc` |

The albedo comes from NASA’s [Blue Marble: Next Generation base map, June 2004](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/), without shaded relief or bathymetry. The [original 21600×10800 JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/june/world.200406.3x21600x10800.jpg) is 21,793,655 bytes. Credit: **NASA Earth Observatory; Reto Stöckli**.

The cloud opacity comes from the separate 2002 [Blue Marble cloud mosaic](https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/). The [original 8192×4096 TIFF](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_8192.tif) is 35,870,468 bytes. Credit: **NASA Goddard Space Flight Center; image by Reto Stöckli, enhancements by Robert Simmon**.

The global derivatives were retrieved October 24, 2026 and use Pillow Lanczos resizing/WebP encoding: quality 88 for albedo; grayscale conversion and quality 84 for clouds. No generative edits or color grading were applied. Albedo loads as sRGB; cloud opacity is non-color data.

The regional source is **NASA GIBS, `MODIS_Terra_CorrectedReflectance_TrueColor`, 2024-06-21**: [exact WMS request](https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&STYLES=&FORMAT=image%2Fpng&TRANSPARENT=FALSE&WIDTH=4096&HEIGHT=4096&SRS=EPSG%3A4326&BBOX=-78.0%2C34.0%2C-64.0%2C48.0&TIME=2024-06-21). Its EPSG:4326 bounds are west −78°, south 34°, east −64°, north 48°, with north at the top. The 4096² source PNG is 27,298,969 bytes. The desktop derivative is format conversion at WebP quality 92; the 2048² variant uses Lanczos resampling and quality 90 with the same bounds. Neither has painting, color correction or synthetic geographic edits.

Regional imagery is provided by **NASA Global Imagery Browse Services (GIBS), part of NASA’s Earth Science Data and Information System (ESDIS)**; see [GIBS data-use guidance](https://nasa-gibs.github.io/gibs-api-docs/#data-use-guidance-and-acknowledgements). It is representative historical Earth context, not SkyCell’s flight-day photograph. The shader feathers its boundary over 0.5° and excludes separate global clouds in the regional interior. The 2048²/4096² variant is selected once per Canvas mount.

NASA’s [Earth Science reuse guidance](https://science.nasa.gov/earth/faq/) and [media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) apply. NASA content generally is not subject to copyright in the United States, except where third-party rights are indicated; NASA asks for source credit. This informational visualization acknowledges NASA and does not imply NASA endorsement of SkyCell. Neither the global composites nor the regional 2024 image establishes SkyCell’s flight path, altitude, imagery or June 2025 weather.

## Poly Haven environment lighting

- Runtime file: [`public/textures/cinematic/qwantani_noon_puresky_1k.hdr`](../public/textures/cinematic/qwantani_noon_puresky_1k.hdr), **1024×512**, **1,089,069 bytes**.
- Asset: [Qwantani Noon (Pure Sky)](https://polyhaven.com/a/qwantani_noon_puresky), Greg Zaal (photography) and Jarod Guest (processing).
- [Exact 1K HDR download](https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/qwantani_noon_puresky_1k.hdr), retrieved October 24, 2026 without modification.
- License: [Poly Haven CC0 asset terms](https://polyhaven.com/license), [CC0 1.0 dedication](https://creativecommons.org/publicdomain/zero/1.0/).
- SHA-256: `7b51637c363377f25bcd1df8ab679127353de7f7ee0622b046f392e822e2ec76`.

The self-hosted HDR supplies PMREM environment lighting, oriented to the shared sun. The visible atmosphere is an analytic concept-illustration shader rather than this ground-level sky photograph. No remote environment request is needed at runtime.

## Renderer-derived fallback posters and inventory

The responsive fallback uses final native-Chrome captures of the actual scene, preserving its conceptual and third-party imagery credits. These are illustrations rather than documentary flight photographs. Files are [`ascent-desktop.webp`](../public/posters/ascent-desktop.webp), 1440×900 / **30,508 bytes**, and [`ascent-mobile.webp`](../public/posters/ascent-mobile.webp), 390×342 / **5,574 bytes**.

The two GLBs, global NASA maps, selected regional variant and HDR total **7,468,679 bytes desktop** or **4,857,081 bytes compact**; poster, application code, fonts and archive photographs are additional. Only one regional variant is selected per Canvas mount. Estimated Earth-map RGBA allocation with mipmaps is **138.7 / 74.7 MiB** desktop/compact, before the cached HalfFloat target, models, HDR and PMREM. Transfer size, estimated allocation and shaded-pixel reduction are separate from measured frame time; no physical-phone FPS result is claimed.

## Replay data

The APEX tracker / SondeHub archive remains documented in [`docs/data.md`](data.md). It is separate from SkyCell's 915 MHz LoRa / Meshtastic payload telemetry and is not live. Do not use the conceptual scene's scroll position as an observation timestamp or altitude reading.
