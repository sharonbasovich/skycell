# Hardware display images and prior gallery

These optimized copies were prepared for the `779a71e` revision’s three-tab
hardware gallery. The current integrated flight replaces that menu with a camera
approach and modeled payload cutaway. It reuses the small images only in the
normal-flow reduced-motion/unavailable-WebGL fallback, while relevant inspection
links and flight notes open the unchanged original JPEG photographs.

The earlier gallery exposed originals through `EvidencePhoto.fullSrc`, with `src`
identifying the small display variant. The processing and hashes below remain
current; the gallery loading behaviour is preserved only as implementation history.

| Original | Display variant | Dimensions | Bytes |
| --- | --- | --- | ---: |
| `1000004204.jpg` | `hardware-enclosure-1600.webp` | 1600×1200 | 141,960 |
| `1000004195.jpg` | `hardware-electronics-1600.webp` | 1200×1600 | 196,784 |
| `PXL_20250621_172905846.MP.jpg` | `hardware-launch.webp` | 659×880 | 7,412 |

All files are under `public/gallery/`. Pillow applied EXIF orientation, RGB format
conversion and Lanczos resizing to a maximum long edge of 1600 pixels, without
upscaling. WebP quality is 85, method 6. No cropping, painting, recoloring,
compositing or AI editing was used. Combined transfer size is 346,156 bytes,
compared with 1,129,035 bytes for the originals (69.3% smaller).

Offline visual inspection confirmed the enclosure's full framing and readable
packaging/antenna detail, the electronics and power connections, and the complete
actual two-balloon launch train. Launch wording remains accurately attributed to
the Massachusetts APEX event on June 21, 2025.

## Earlier three-tab presentation (`779a71e`)

The former three-tab gallery kept compressed image layers mounted and began
eager loading within 320 pixels of the viewport. Incoming images completed
`decode()` before display; the previous layer stayed opaque until a 160 ms fade
finished. Reduced motion removed the fade and delayed hide. Retry attempts used
separate keys, and stale asynchronous decodes could not replace a newer selection.

Only the then-displayed, selected photo had an enabled `.field-photo-button` and
tab stop. Hidden/retiring figures were `aria-hidden`, with disabled buttons and
explicit loading/retry status. Those menu states are not part of the integrated
main-page journey.

That checkpoint’s scoped checks and later gallery browser tests belong to the
earlier revision. They do not validate the current integrated camera, cutaway,
recording controls or motion.

## SHA-256

- Enclosure: `8d620f7888f80ce9793a12af19db939bb26903695c6d4ec2e0f2554e84dd2229`
- Electronics: `c4584667507ef9f7653ffd5ed3081d4506c06a0ab4c7d17c12ccfd1522982057`
- Launch: `9baad3b87f1a08171d331ca839421fa24800d72de39e6dd3706f73a049852b1d`
