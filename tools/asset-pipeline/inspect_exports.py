"""Read the exported GLB containers; print independent delivery measurements."""
from pathlib import Path
import json, struct
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
for path in (ROOT/'public/models/cinematic').glob('*.glb'):
    raw=path.read_bytes()
    magic,version,length=struct.unpack_from('<III',raw)
    assert magic==0x46546C67 and version==2 and length==len(raw)
    json_len=struct.unpack_from('<I',raw,12)[0]
    doc=json.loads(raw[20:20+json_len])
    binary=raw[28+json_len:]
    def access(index):
        a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
        dtype={5126:np.float32,5125:np.uint32,5123:np.uint16,5121:np.uint8}[a['componentType']]
        size={'VEC3':3,'VEC2':2,'VEC4':4,'SCALAR':1}[a['type']]
        return np.frombuffer(binary,dtype=dtype,count=a['count']*size,offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(a['count'],size)
    triangles=0;lo=np.array([float('inf')]*3);hi=-lo
    for mesh in doc['meshes']:
        for p in mesh['primitives']:
            xyz=access(p['attributes']['POSITION'])
            lo=np.minimum(lo,xyz.min(axis=0));hi=np.maximum(hi,xyz.max(axis=0))
            triangles+=len(access(p['indices']))//3
            if mesh['name'].startswith('Natural latex envelope'):
                normals=access(p['attributes']['NORMAL'])
                print('Latex outward-normal dot median:',float(np.median(np.sum(xyz*normals,axis=1))))
    assert all('uri' not in im for im in doc.get('images',[])), 'GLB must embed its textures'
    print(path.name,{'bytes':len(raw),'triangles':triangles,'meshes':len(doc['meshes']),'images':len(doc.get('images',[])),'gltf_bounds_min':lo.tolist(),'gltf_bounds_max':hi.tolist(),'materials':[m['name'] for m in doc['materials']]})
