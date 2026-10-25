# Illustrative near-cloud plate

`public/textures/flight/cirrus-wisp.webp` is a generated photographic-style cirrus
plate used by `FlightClouds.tsx`. It is an illustrative passage element, not a
photograph from the recorded SkyCell/APEX flight and not a scientific cloud map.
The separately credited NASA Earth imagery remains geographic context.

Created with the built-in imagegen tool on 2026-10-25, with a transparent-background
request. Original RGBA output: 1916 × 821 pixels, 1,565,684 bytes. Inspection found
50.36% fully transparent pixels, a genuinely varying alpha channel from 0 to 253,
and no baked sky rectangle. The original RGBA output is retained outside Git with the generation record.

The project copy was resized with Lanczos to 1024 × 439 and encoded as WebP quality
92 with its alpha preserved. No painting, compositing or recoloring was applied.
Runtime opacity is restrained and the planes sit behind the opaque rig.

- Runtime bytes: 149,230
- SHA-256: `30151c542707d47fc536ea26778c71ed024ec8046ab9f030a0fbc76a288a11e2`
- Three planes share one texture and one two-triangle geometry.
- `elapsedSeconds` comes only from the parent pause/visibility-aware clock.
- Three fixed progress windows descend through the composition; no particle
  respawning or hard wrapping. Opacity reaches zero above 14 km.
- Earth geographic drift is bounded to an illustrative 66 km east / 18 km north
  path, separately from the preserved recorded APEX trajectory.

## Generation prompt

> Use case: photorealistic-natural. Asset type: one transparent cloud texture plate for a real-time Three.js daylight high-altitude balloon scene. Primary request: a single very thin photographic cirrus wisp seen from slightly above the cloud tops, an elongated horizontal veil of delicate ice-crystal filaments and a few overlapping translucent curls, irregular airy silhouette, natural extremely fine strand detail. The cloud should occupy the central 75 percent of a landscape frame with generous fully transparent margins. Real soft alpha transparency through the strands and along all feathered edges, not an opaque white mass and not a painted sky. Lighting: neutral daylight from upper left, soft warm white highlights and faint cool blue-grey lower shading. The wisps are close atmospheric passage elements, not a background sky, horizon or cloud deck. No ground, no balloon, no objects, no sun, no blue rectangle, no black rectangle, no checkerboard pattern, no text, no watermark. Preserve true transparent background.
