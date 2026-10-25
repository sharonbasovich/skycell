# Flight story refinement

Continue Sharon's selected live 3D ascent direction in the existing React/Three.js stack. This revision addresses the October 25 feedback, rather than choosing a new motion medium.

## Story and visual contract

One helium balloon directly supports one payload in the illustrative scene. Keep the complete vehicle as the subject while its environment changes from the cloud tops to the stratosphere. Begin above the cloud deck (8 km illustration altitude), rather than claim a ground launch that the environment cannot show. A steady three-quarter following camera replaces the upper-balloon/payload/retreat tour. Restrained wind, tether tension, payload lag and moving nearby cloud wisps make the flight perceptible after scrolling stops.

Use full-height 3D on phones as well as desktop. Four compositions vary text placement and scale around the same vehicle; do not reserve a permanently dark left column. The scene remains illustrative, separate from the actual tracker recording. Preserve real two-balloon launch photographs as accurately captioned evidence. HTML copy and navigation must follow actual presented scene progress, so pause and the bounded 300 ms resume after paused scrolling keep text and rig synchronized without a second scroll filter.

Continue into three meaningful interactive surfaces: an actual-photo hardware story, an explanation of sensing → Python → radio → ground, and a directly scrubbable partial APEX archive. Make the outcome and power/packet limitations visible. Avoid repeated photo grids/specification lists, generic staggered cards, fake telemetry and decorative dashboard chrome.

## System

Manrope variable; blue #1647d1, ink #101f3a, white #ffffff, deep atmosphere #071426 and pale sky #e4eefb. Large open typography, full-bleed media, carefully restrained rules, native buttons and inputs. The hero is the dominant visual idea; the lower surfaces vary rhythm and density without competing palettes.

## Ownership

Root: page composition, scene clock/render scheduling, integration and verification. Scene agent: one-balloon rig and following-camera sampler. Environment agent: Earth/cloud passage. Field agent: downstream interactive sections and their styles. Preserve shared parser, replay clock and dashboard semantics.

## Acceptance

- One complete balloon/payload remains legible; forward scroll conveys rising, reverse remains understandable, with no vertical inventory tour or large zoom-out.
- Motion is smooth after idle and during fast changes; wind/cloud animation pauses and resumes correctly, stops offscreen/hidden, and respects reduced motion.
- All four compositions and downstream surfaces work at narrow/short phone, tablet and desktop widths without overlay collisions.
- Real imagery, data and outcomes remain accurately labeled. The archive has 125 observations, a 29,510 m recorded peak, preserved gaps and separate provenance from mesh telemetry.
- Test actual browser scrolling, keyboard interactions, photos, archive scrubbing, route re-entry, loading/failure, reduced motion and native GPU timing. Do not equate frame cadence or passing tests with an approved visual design.
