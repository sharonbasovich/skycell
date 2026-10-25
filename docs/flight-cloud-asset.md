# Historical illustrative near-cloud plate

The generated `cirrus-wisp.webp` plate belonged to the prior `779a71e` flight-story
revision and has been removed from the integrated journey’s runtime. The exact
[archived asset](https://github.com/sharonbasovich/skycell/blob/779a71ef56be61c02cc77180bb484e84fb7a616e/public/textures/flight/cirrus-wisp.webp)
and [earlier plane implementation](https://github.com/sharonbasovich/skycell/blob/779a71ef56be61c02cc77180bb484e84fb7a616e/src/experience/scene/FlightClouds.tsx)
remain in Git history. This document retains the generation prompt and provenance;
the current scene uses procedural world-space cloud volumes instead.

The plate was an illustrative passage element, not a
photograph from the recorded SkyCell/APEX flight and not a scientific cloud map.
The separately credited NASA Earth imagery remains geographic context.

Created with the built-in imagegen tool on 2026-10-25, with a transparent-background
request. Original RGBA output: 1916 × 821 pixels, 1,565,684 bytes. Inspection found
50.36% fully transparent pixels, a genuinely varying alpha channel from 0 to 253,
and no baked sky rectangle. The original RGBA output is retained outside Git with the generation record.

The previous project copy was resized with Lanczos to 1024 × 439 and encoded as WebP quality
92 with its alpha preserved. No painting, compositing or recoloring was applied.
At that checkpoint its runtime opacity was restrained and the planes sat behind
the opaque rig.

- Archived derivative bytes: 149,230
- SHA-256: `30151c542707d47fc536ea26778c71ed024ec8046ab9f030a0fbc76a288a11e2`
- The former implementation used three planes sharing one texture and one
  two-triangle geometry, with a parent pause/visibility-aware clock.
- Three fixed progress windows descended through the composition without
  particle respawning or hard wrapping; opacity reached zero above 14 km.
- Its illustrative 66 km east / 18 km north geographic path was separate from
  the preserved recorded APEX trajectory.

## Generation prompt

> Use case: photorealistic-natural. Asset type: one transparent cloud texture plate for a real-time Three.js daylight high-altitude balloon scene. Primary request: a single very thin photographic cirrus wisp seen from slightly above the cloud tops, an elongated horizontal veil of delicate ice-crystal filaments and a few overlapping translucent curls, irregular airy silhouette, natural extremely fine strand detail. The cloud should occupy the central 75 percent of a landscape frame with generous fully transparent margins. Real soft alpha transparency through the strands and along all feathered edges, not an opaque white mass and not a painted sky. Lighting: neutral daylight from upper left, soft warm white highlights and faint cool blue-grey lower shading. The wisps are close atmospheric passage elements, not a background sky, horizon or cloud deck. No ground, no balloon, no objects, no sun, no blue rectangle, no black rectangle, no checkerboard pattern, no text, no watermark. Preserve true transparent background.
