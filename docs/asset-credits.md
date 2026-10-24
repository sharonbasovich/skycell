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

## Code-native 3D illustration

The new ascent scene is a conceptual illustration made from project-native geometry and materials, inspired by the actual balloon train and enclosure. It is not a measurement, a reconstruction of the archived track, or camera footage from flight. Keep the two white helium balloons, slender tether and suspended payload relationship recognizable; avoid a hot-air balloon basket or burner.

The pre-existing `public/b1.glb` (approximately 51 MB) and `public/hab/hot_air_balloon_low_poly.glb` are not the model source for the new ascent. Their provenance is not asserted here. Both unused models were removed from this new implementation branch; they remain recoverable in the original repository history and the draft comparison branch.

Existing Lucide control icons remain governed by the package's ISC license. No commercial model, purchased asset, or remote HDR environment was added for this implementation.

## NASA Earth albedo texture

- Local file: [`public/textures/earth-blue-marble-2048.webp`](../public/textures/earth-blue-marble-2048.webp)
- Size: **2048×1024**, 2:1 equirectangular whole-world color map, **181,470 bytes**.
- Official item: [Blue Marble — A Seamless Image Mosaic of the Earth (WMS), NASA SVS 2915](https://svs.gsfc.nasa.gov/2915/).
- Exact source: <https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002915/bluemarble-2048.png> (2048×1024 PNG).
- NASA media usage guidance: <https://www.nasa.gov/nasa-brand-center/images-and-media/>.
- Credit: **NASA/Goddard Space Flight Center Scientific Visualization Studio. Blue Marble data courtesy of Reto Stockli (NASA/GSFC) and NASA's Earth Observatory.**
- Local file SHA-256: `8d0a3eabd93b77137d348d0ecb623e7fc7c3eb30cf11c52b772acf6c4753f7b6`.

Downloaded from NASA on October 24, 2026 and encoded to WebP at quality 85 using local Sharp. The pixel dimensions and whole-world extent were preserved. No generative edits, compositing, or artistic alterations were applied. The original PNG was a temporary encoding input and is not included in the application.

NASA's guidance states that its content, including texture maps for 3D models, generally is not subject to copyright in the United States and may be used for informational web pages and graphical simulations. The SVS item identifies NASA credits and no third-party copyright restriction. NASA is acknowledged as the source; this use does not imply NASA endorsement of SkyCell.

This is a historical satellite-data composite used as a conceptual Earth surface, not SkyCell flight imagery or a June 2025 measurement. Load it as an **sRGB albedo texture** (`texture.colorSpace = SRGBColorSpace`) with conventional sphere UVs and the North Pole at the top. It is not an environment/reflection map. Keep atmosphere and communication effects separate; a neutral white material base avoids tinting the source into muddy procedural colors. The map contains land, ocean and ice but no cloud layer.

## Replay data

The APEX tracker / SondeHub archive remains documented in [`docs/data.md`](data.md). It is separate from SkyCell's 915 MHz LoRa / Meshtastic payload telemetry and is not live. Do not use the conceptual scene's scroll position as an observation timestamp or altitude reading.
