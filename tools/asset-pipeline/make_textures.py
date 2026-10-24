"""Original compact EPS/paper textures for the photo-observed SkyCell reconstruction.
Run with ordinary Python (Pillow and numpy); does not use downloaded image assets.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = Path(__file__).parent / 'textures'
OUT.mkdir(exist_ok=True)
rng = np.random.default_rng(915)
N, CELLS, TILE_METRES = 512, 31, .09
y, x = np.mgrid[:N, :N].astype(np.float64)
gx, gy = x/N*CELLS, y/N*CELLS
ix, iy = gx.astype(int), gy.astype(int)
centres = rng.random((CELLS, CELLS, 2))*.66+.17
values = rng.random((CELLS, CELLS))
best = np.full((N,N), 100.0)
second = best.copy()
cellval = np.zeros_like(best)
for dy in [-1,0,1]:
    for dx in [-1,0,1]:
        cx, cy = (ix+dx)%CELLS, (iy+dy)%CELLS
        d = (gx-(ix+dx+centres[cy,cx,0]))**2+(gy-(iy+dy+centres[cy,cx,1]))**2
        win = d < best
        second = np.where(win, best, np.minimum(second,d))
        best = np.where(win,d,best)
        cellval = np.where(win,values[cy,cx],cellval)
edge = np.sqrt(second)-np.sqrt(best)
seam = np.exp(-edge*38)
noise = rng.normal(0,1,(N,N))
# EPS beads have shallow fused rims, not stone-like deep cracks.
height = .000145*(1-np.minimum(best,1))-.000036*seam+.000003*noise
height += .000006*np.sin(gx*14+gy*8)*np.sin(gy*17-gx*5)
dh_y, dh_x = np.gradient(height, TILE_METRES/N)
normal = np.stack([-dh_x, dh_y, np.ones_like(height)],axis=-1)
normal /= np.linalg.norm(normal,axis=-1,keepdims=True)
Image.fromarray(np.uint8(np.clip(normal*.5+.5,0,1)*255),'RGB').save(OUT/'eps-normal.png',optimize=True)
light = .905+(cellval-.5)*.065-seam*.047+noise*.005
color=np.stack([light*1.008,light*1.003,light*.985],axis=-1)
Image.fromarray(np.uint8(np.clip(color,0,1)*255),'RGB').save(OUT/'eps-color.jpg',quality=91,optimize=True)
rough = np.clip(.77+.10*seam+.05*noise,.60,.96)
Image.fromarray(np.uint8(rough*255),'L').save(OUT/'eps-roughness.png',optimize=True)

# Fine stress wrinkles for the transparent packing tape; exported as normal map.
N=256
y,x=np.mgrid[:N,:N].astype(float)
tapeh=.25*np.sin(x*.13+y*.028)+.10*np.sin(x*.47+y*.032)+.035*rng.normal(size=(N,N))
dy,dx=np.gradient(tapeh)
n=np.stack([-dx*.25,dy*.25,np.ones_like(dx)],axis=-1)
n/=np.linalg.norm(n,axis=-1,keepdims=True)
Image.fromarray(np.uint8((n*.5+.5)*255),'RGB').save(OUT/'tape-normal.png',optimize=True)

font_dir=Path('C:/Windows/Fonts')
def font(size,bold=False):
    return ImageFont.truetype(str(font_dir/('arialbd.ttf' if bold else 'arial.ttf')),size)

paper=Image.new('RGB',(1024,640),(244,244,239))
d=ImageDraw.Draw(paper)
d.text((55,42),'Student Experiments',font=font(65),fill=(36,38,39))
d.line((55,121,964,121),fill=(44,46,47),width=3)
lines=[('SkyCell payload',47),('Student-led high-altitude balloon project',33),('Please handle with care',35),('Recovery identification',33)]
yy=154
for s,size in lines:
    d.text((57,yy),s,font=font(size),fill=(49,51,51)); yy+=65
d.text((57,449),'915 MHz',font=font(35),fill=(47,80,110))
d.line((57,493,236,493),fill=(47,80,110),width=2)
d.text((57,548),'SKYCELL  /  CONCEPTUAL RECONSTRUCTION',font=font(21),fill=(88,88,85))
# A paper fiber signal remains subtle enough not to look like a distressed poster.
pix=np.asarray(paper).astype(float)
pix+=rng.normal(0,.8,pix.shape[:2])[...,None]
Image.fromarray(np.uint8(np.clip(pix,0,255))).save(OUT/'recovery-label.jpg',quality=94,optimize=True)

print('Texture sizes:',{p.name:p.stat().st_size for p in OUT.iterdir()})
