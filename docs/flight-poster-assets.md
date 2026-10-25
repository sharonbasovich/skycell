# First-party static flight layers

These fallback assets are browser renders of the existing first-party Three.js
components, with one balloon, its connected tether and the photo-observed payload.
They are illustrative renders, not photographs from the flight.

- `public/posters/flight-rig.webp`: transparent, tightly cropped around the complete
  subject with approximately 3% padding on each axis. Use `object-fit: contain` so
  every viewport retains the entire vehicle.
- `public/posters/flight-earth.webp`: Earth-only opaque background. It may cover a
  fallback container independently of the contained subject. NASA source/date and
  geographic-context attribution remain the same as the live Earth component.

## Reproduction

Start the repository's Vite dev server on port 8080, then run:

```powershell
node tools/asset-pipeline/render-flight-posters.cjs
```

Requires Node, Playwright, native Chrome, and Python with Pillow. No production
build or Blender process is launched by this command.

The fixture is outside the main app entrypoint and is not imported by production.
It imports `CinematicTrain` and `CinematicEarth` directly, rather than duplicating
the meshes or shaders. It runs with scene time 0, progress 0, illustration altitude
8 km, camera `[5.8, 3.6, 13.5]`, target `[0, 2.05, 0]`, FOV 30, DPR 1 and the same
HDR, 0.45 environment intensity, sun/light/shadow settings and 0.9 exposure as
`AscentScene`. The rig and Earth captures are rendered serially at 600×1200 and
1440×900 respectively. No near-cloud wisps, UI or text are included.

This deliberately uses dedicated native Chrome/Playwright capture because the
in-app browser does not expose alpha screenshots and exact asset viewports.
Only the local first-party fixture is visited. The script waits for asset
suspense, at least two completed scene renders and two compositor frames, captures
console/network failures, verifies alpha and ensures the subject does not touch
the source capture edges. Headless capture is not a GPU performance benchmark.

The default Chrome executable is
`C:/Program Files/Google/Chrome/Application/chrome.exe`. Playwright resolves from
the local project when available, then the Codex bundled dependency directory.
Optional environment overrides: `PLAYWRIGHT_MODULE_PATH`, `CHROME_EXECUTABLE`,
`POSTER_BASE_URL`, `POSTER_CAPTURE_DIR`, `PYTHON_BIN`.

Raw PNGs and JSON measurement reports stay outside the served project, under
`../skycell-cinematic-assets/flight-posters` by default. Pillow performs only
alpha-bounds cropping, padding and WebP format conversion. No painting,
compositing, recoloring or mesh changes are used.

## Verified output, 2026-10-25

| Layer | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Rig | 272×814 | 7,228 | `596c86b932390cc95e086460afc8d74181b050b0ae2e4bb551a6b63a75d18b46` |
| Earth | 1440×900 | 23,396 | `6044e45743b5fe6da6ce52c580e5e8fadfa76114879793435938bddd2044c361` |

Both fixture modes completed four frames without console errors or failed
requests on native Chrome using Intel Iris Xe through ANGLE/D3D11. The rig's
source alpha bounds were `[174, 156, 430, 924]` within the 600×1200 source; the
padded crop was `[166, 133, 438, 947]`. Its delivered alpha spans 0–255, with
74.589% fully transparent pixels and 0.682% partially transparent pixels. The
Earth layer is fully opaque. Visual inspection confirmed the complete single
balloon, connected tether, antenna and payload, with no UI text or loading state.
