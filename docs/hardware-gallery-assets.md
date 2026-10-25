# Hardware gallery display images

The gallery uses optimized copies of the original project photographs. The
original JPG files remain unchanged and are exposed through `EvidencePhoto.fullSrc`
for the full-resolution photo dialog. `src` identifies the small display variant.

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

## Loading and presentation

The three compressed images stay mounted and begin eager loading when the
hardware section approaches within 320 pixels of the viewport. Each incoming
image must complete its own `decode()` before becoming displayed. The previous
layer stays opaque until the 160 ms incoming fade finishes, rather than exiting
before the next resource is available. Reduced motion removes both fade and
delayed hide. Retry attempts have separate image keys, and stale asynchronous
decodes cannot change a newer tab selection.

Only the currently displayed, selected photo has the `.field-photo-button` class,
an enabled button and a tab stop. Hidden and retiring figures are `aria-hidden`
and their buttons are disabled. Loading and retry status remain explicit.

Scoped ESLint and whitespace checks passed. Browser checks are intentionally
left to root's serial production QA; no browser or rendering process was run for
this asset/transition change.

## SHA-256

- Enclosure: `8d620f7888f80ce9793a12af19db939bb26903695c6d4ec2e0f2554e84dd2229`
- Electronics: `c4584667507ef9f7653ffd5ed3081d4506c06a0ab4c7d17c12ccfd1522982057`
- Launch: `9baad3b87f1a08171d331ca839421fa24800d72de39e6dd3706f73a049852b1d`
