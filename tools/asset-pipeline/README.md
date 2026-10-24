# SkyCell original cinematic asset pipeline

The two supplied documentary photos, `public/gallery/1000004204.jpg` and
`public/gallery/1000004195.jpg`, were inspected to build these original meshes.
This is a conceptual exterior reconstruction, not a dimensioned engineering scan.
It uses no purchased, downloaded, or AI-generated 3D assets.

## Build

From the repository root, with Python, Pillow/numpy and Blender 3.4.1 installed:

```powershell
python tools/asset-pipeline/make_textures.py
& 'C:\Program Files\Blender Foundation\Blender 3.4\blender.exe' --background --python tools/asset-pipeline/build_cinematic.py
```

The pipeline runs without a visible Blender window. It exports self-contained GLBs
to `public/models/cinematic`, then renders three modest 1024 x 768 inspection stills
sequentially with Cycles at 48 samples. The original editable Blender file stays
here in `skycell-original-assets.blend`; it is not served in `public`.
The source has separate payload, balloon and verification-rig collections, packed
textures, and opens with the payload visible; reveal the balloon objects to edit it.

## Geometry and materials

The EPS body is approximately 0.55 m long x 0.22 m deep x 0.19 m high, including
the fitted lid. Its mesh has rounded, slightly compressed/dented edges. A narrow
join separates lid and body. Original color, normal and roughness maps represent
fused EPS beads at about 2.9 mm spacing; grain is a surface signal, not thousands
of separate spheres. Three complete transparent film wraps have shallow ripples
and raised cut edges. Two pairs of overlapping paper labels have physical thin
edges. The top disk is a flat cobalt washer, with an open transparent tube and
three-strand braided white recovery loop. The black whip steps down through four
telescopic sections with small collars. A separate black cable loop emerges from
the short end. Recovery text is generic: unrelated photo contact details are not
reproduced.

The latex balloon is a seamless near-sphere, nominally 1.65 m in diameter, with
subtle inflation asymmetry, a gathered narrow neck, tied knot and folded tail.
There are no sewn panels, gores, or basket. The material named `Latex` is intended
to be replaced by the runtime thin-latex/backscatter shader.

Material names are stable: `EPSFoam`, `ClearTape`, `PaperLabel`, `PaperBacking`,
`BlueWasher`, `TransparentTube`, `WhiteBraidedCord`, `BlackAntenna`,
`AntennaFerrule`, `BlackCable`, `LidJoin`, and `Latex`. The thin clear film and tube
use glTF alpha blending, so their appearance depends on the runtime lighting and
transparency ordering. The opaque core and its texture maps remain standard PBR.

## Coordinates and measurements

Blender source axes: X is enclosure length, -Y is the printed front side, Z is up.
The GLB exporter converts to Y-up. Both model origins are near their main volume
centres; payload origin is at the enclosure centre, not the full antenna bounds.
The whip extends toward negative X. Exported node names preserve descriptive part
names. `asset-metadata.json` records bounds, physical dimensions, triangle counts
and bytes. Bounds include antenna and hardware; the payload's overall X extent
is about 1.01 m even though the foam body is about 0.55 m long.

EPS geometry has millimetre-scale edge irregularity, not a scanned surface. Small
creases, exact tape overlaps, label wording and unseen sides are interpretive.
The electronic interior in the second photo is deliberately not fabricated or
exposed in this closed exterior model.
