"""Download public, georeferenced NASA GIBS true-color WMS imagery."""
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
from PIL import Image
import argparse, json, time

p=argparse.ArgumentParser()
p.add_argument('--date',default='2025-06-21')
p.add_argument('--width',default=2048,type=int)
p.add_argument('--bbox',nargs=4,type=float,default=[-80,30,-55,50],metavar=('WEST','SOUTH','EAST','NORTH'))
args=p.parse_args()
out=Path('C:/Users/Sharon/Documents/ChatGPT/skycell-cinematic-assets')
out.mkdir(parents=True,exist_ok=True)
bounds=args.bbox
height=round(args.width*(bounds[3]-bounds[1])/(bounds[2]-bounds[0]))
params={'SERVICE':'WMS','REQUEST':'GetMap','VERSION':'1.1.1','LAYERS':'MODIS_Terra_CorrectedReflectance_TrueColor','STYLES':'','FORMAT':'image/png','TRANSPARENT':'FALSE','WIDTH':args.width,'HEIGHT':height,'SRS':'EPSG:4326','BBOX':','.join(map(str,bounds)),'TIME':args.date}
url='https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?'+urlencode(params)
path=out/f'nasa-gibs-atlantic-{args.date}-{args.width}.png'
with urlopen(url,timeout=90) as r:
    data=r.read();headers=dict(r.headers)
path.write_bytes(data)
with Image.open(path) as im:
    im.load();dimensions=im.size
meta={'source':'NASA GIBS','layer':params['LAYERS'],'date':args.date,'bounds_west_south_east_north':bounds,'crs':'EPSG:4326','row_origin':'north (top)','width':dimensions[0],'height':dimensions[1],'download_bytes':len(data),'source_url':url,'source_file':str(path),'content_type':headers.get('Content-Type')}
path.with_suffix('.json').write_text(json.dumps(meta,indent=2))
print(json.dumps(meta))
