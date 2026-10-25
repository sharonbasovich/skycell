"""Fetch a bounded, historical NASA Landsat/WELD Earth-detail patch.

Native dataset: annual global 30 m surface reflectance. This is geographic
context, not the flight day's appearance. Preserve nodata transparency.
Run from the repository root; source PNG stays outside the repository.
"""
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
from PIL import Image
import hashlib
import json

root = Path(__file__).resolve().parents[2]
source_dir = root.parent / 'skycell-cinematic-assets'
source_dir.mkdir(exist_ok=True)
out = root / 'public/textures/cinematic'
bounds = [-71.6, 41.3, -69.8, 43.1]
params = {
    'SERVICE': 'WMS', 'REQUEST': 'GetMap', 'VERSION': '1.1.1',
    'LAYERS': 'Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual',
    'STYLES': '', 'FORMAT': 'image/png', 'TRANSPARENT': 'TRUE',
    'WIDTH': 4096, 'HEIGHT': 4096, 'SRS': 'EPSG:4326',
    'BBOX': ','.join(map(str, bounds)), 'TIME': '2000-12-01',
}
url = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?' + urlencode(params)
source = source_dir / 'nasa-landsat-weld-annual-2000-detail-4096.png'
if not source.exists():
    with urlopen(url, timeout=120) as response:
        source.write_bytes(response.read())
with Image.open(source) as loaded:
    loaded.load()
    image = loaded.convert('RGBA')
    if image.size != (4096, 4096):
        raise ValueError(f'Unexpected source dimensions: {image.size}')
    variants = []
    for size, quality, filename in [(4096, 90, 'landsat-detail.webp'), (2048, 90, 'landsat-detail-2048.webp')]:
        variant = image if size == 4096 else image.resize((size, size), Image.Resampling.LANCZOS)
        path = out / filename
        variant.save(path, 'WEBP', quality=quality, method=6)
        variants.append({'file': 'public/textures/cinematic/' + filename, 'dimensions': [size, size],
                         'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                         'conversion': f'WebP quality {quality}; ' + ('no resampling' if size == 4096 else 'Lanczos 2048 square')})
    image.resize((1024, 1024), Image.Resampling.LANCZOS).save(source_dir / 'landsat-detail-review.png')
metadata = {
    'source': 'NASA Global Imagery Browse Services / Landsat WELD',
    'layer': params['LAYERS'], 'time': params['TIME'], 'dataset_resolution_metres': 30,
    'description': 'Historical annual composite, not imagery from the 2025 flight.',
    'bounds_west_south_east_north': bounds, 'crs': 'EPSG:4326', 'row_origin': 'north (top)',
    'source_url': url, 'source_bytes': source.stat().st_size,
    'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'variants': variants,
}
metadata_path = root / 'tools/asset-pipeline/landsat-detail-source.json'
metadata_path.write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf8')
print(json.dumps(metadata, indent=2))
