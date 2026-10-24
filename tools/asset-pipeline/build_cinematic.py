"""Blender 3.4 background pipeline. Original mesh reconstruction from supplied photos.

Coordinates in this source: X enclosure length; -Y labelled/front side; Z up.
glTF export converts Z-up to Y-up. Origin: centre of EPS enclosure.
"""
import bpy, math, json, os, sys
from pathlib import Path
from mathutils import Vector
from math import sin,cos,pi,sqrt

HERE=Path(__file__).resolve().parent
ROOT=HERE.parent.parent
OUT=ROOT/'public/models/cinematic'
TEX=HERE/'textures'
RENDERS=HERE/'renders'
OUT.mkdir(parents=True,exist_ok=True); RENDERS.mkdir(exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
for d in bpy.data.materials: bpy.data.materials.remove(d)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'; scene.unit_settings.scale_length=1
payload=[]; balloon=[]

def material(name,color,roughness=.5,metallic=0,alpha=1):
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,alpha)
    p.inputs['Roughness'].default_value=roughness
    p.inputs['Metallic'].default_value=metallic
    p.inputs['Alpha'].default_value=alpha
    if alpha<1:
        m.blend_method='BLEND'; m.use_screen_refraction=True; m.show_transparent_back=False
    return m

def image_node(m,file,noncolor=False):
    n=m.node_tree.nodes.new('ShaderNodeTexImage'); n.image=bpy.data.images.load(str(TEX/file))
    if noncolor:n.image.colorspace_settings.name='Non-Color'
    return n

foam=material('EPSFoam',(.94,.94,.92),.8)
p=foam.node_tree.nodes.get('Principled BSDF'); p.inputs['Specular'].default_value=.26
foam.node_tree.links.new(image_node(foam,'eps-color.jpg').outputs['Color'],p.inputs['Base Color'])
foam.node_tree.links.new(image_node(foam,'eps-roughness.png',True).outputs['Color'],p.inputs['Roughness'])
n=foam.node_tree.nodes.new('ShaderNodeNormalMap'); n.inputs['Strength'].default_value=.92
foam.node_tree.links.new(image_node(foam,'eps-normal.png',True).outputs['Color'],n.inputs['Color'])
foam.node_tree.links.new(n.outputs[0],p.inputs['Normal'])
tape=material('ClearTape',(.99,.985,.965),.155,alpha=.20)
p=tape.node_tree.nodes.get('Principled BSDF'); p.inputs['Specular'].default_value=.53; p.inputs['Clearcoat'].default_value=.8; p.inputs['Clearcoat Roughness'].default_value=.12
n=tape.node_tree.nodes.new('ShaderNodeNormalMap'); n.inputs['Strength'].default_value=.45
tape.node_tree.links.new(image_node(tape,'tape-normal.png',True).outputs['Color'],n.inputs['Color']); tape.node_tree.links.new(n.outputs[0],p.inputs['Normal'])
paper=material('PaperLabel',(.96,.96,.94),.84)
p=paper.node_tree.nodes.get('Principled BSDF'); p.inputs['Specular'].default_value=.18
paper.node_tree.links.new(image_node(paper,'recovery-label.jpg').outputs[0],p.inputs['Base Color'])
paperback=material('PaperBacking',(.91,.91,.88),.87)
blue=material('BlueWasher',(.009,.035,.72),.26)
p=blue.node_tree.nodes.get('Principled BSDF');p.inputs['Clearcoat'].default_value=.3
black=material('BlackAntenna',(.008,.011,.014),.285,metallic=.18)
cablemat=material('BlackCable',(.009,.013,.017),.46)
silver=material('AntennaFerrule',(.16,.18,.19),.29,.7)
rope=material('WhiteBraidedCord',(.94,.94,.90),.82)
glass=material('TransparentTube',(.86,.94,1),.09,alpha=.19)
p=glass.node_tree.nodes.get('Principled BSDF');p.inputs['Specular'].default_value=.65;p.inputs['Clearcoat'].default_value=.8;p.inputs['IOR'].default_value=1.46
shadow=material('LidJoin',(.55,.56,.54),.96)
latex=material('Latex',(.83,.77,.60),.57)
p=latex.node_tree.nodes.get('Principled BSDF');p.inputs['Subsurface'].default_value=.14;p.inputs['Subsurface Color'].default_value=(.94,.78,.54,1);p.inputs['Subsurface Radius'].default_value=(.1,.065,.025)

def mesh_object(name,verts,faces,mat,group=payload,uvs=None,smooth=True):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat)
    if uvs:
        uv=me.uv_layers.new(name='UVMap')
        for poly in me.polygons:
            for li,vi in zip(poly.loop_indices,poly.vertices):uv.data[li].uv=uvs[vi]
    if smooth:
        for poly in me.polygons:poly.use_smooth=True
    group.append(ob);return ob

def map_planar_uv(ob,scale=.09):
    uv=ob.data.uv_layers.new(name='UVMap')
    for p in ob.data.polygons:
        axis=max(range(3),key=lambda a:abs(p.normal[a]))
        for li,vi in zip(p.loop_indices,p.vertices):
            c=ob.data.vertices[vi].co
            if axis==2:pair=(c.x,c.y)
            elif axis==1:pair=(c.x,c.z)
            else:pair=(c.y,c.z)
            uv.data[li].uv=(pair[0]/scale,pair[1]/scale)

def axis_grid(h,r,pitch=.024):
    inner=h-r
    middle=max(2,int(2*inner/pitch))
    a=[-h+i*r/5 for i in range(5)]
    a += [-inner+i*2*inner/middle for i in range(middle+1)]
    a += [inner+i*r/5 for i in range(1,6)]
    return sorted(set(round(v,8) for v in a))

def foam_box(name,dims,centre,radius):
    h=[v/2 for v in dims];inner=[v-radius for v in h]
    grids=[axis_grid(v,radius) for v in h]
    vertices=[]; faces=[]; lookup={}
    def vertex(c):
        key=tuple(c)
        if key in lookup:return lookup[key]
        q=Vector([max(-inner[a],min(inner[a],c[a])) for a in range(3)])
        d=Vector(c)-q;normal=d.normalized();p=q+normal*radius
        # Minor compressed edges and handling dents avoid mathematically perfect EPS.
        coarse=.00037*sin(p.x*47+p.y*22)*sin(p.z*49-p.x*13)+.00018*cos(p.x*103+p.y*79+p.z*93)
        dents=0
        for pos,amp in [((-.245,-.09,.06),.0019),((.24,.09,-.055),.0014),((-.25,.085,-.06),.0013)]:
            dst=(p-Vector(pos)).length
            dents-=amp*math.exp(-((dst/.018)**2))
        p+=normal*(coarse+dents);p+=Vector(centre)
        lookup[key]=len(vertices);vertices.append(tuple(p));return len(vertices)-1
    for axis in range(3):
        others=[a for a in range(3) if a!=axis]
        for side in [-1,1]:
            rows=[]
            for b in grids[others[1]]:
                row=[]
                for a in grids[others[0]]:
                    c=[0,0,0];c[axis]=side*h[axis];c[others[0]]=a;c[others[1]]=b;row.append(vertex(c))
                rows.append(row)
            for j in range(len(rows)-1):
                for i in range(len(rows[0])-1):
                    f=[rows[j][i],rows[j][i+1],rows[j+1][i+1],rows[j+1][i]]
                    # Winding derived from the planar chart axes.
                    vec=(Vector(vertices[f[1]])-Vector(vertices[f[0]])).cross(Vector(vertices[f[2]])-Vector(vertices[f[0]]))
                    if vec[axis]*side<0:f.reverse()
                    faces.append(f)
    ob=mesh_object(name,vertices,faces,foam);map_planar_uv(ob);return ob

body=foam_box('EPS enclosure / irregular fused-bead body',(.55,.22,.163),(0,0,-.0135),.010)
lid=foam_box('EPS lid / shallow fitted cap',(.551,.221,.026),(0,0,.0819),.008)

def curve_tube(name,points,radius,mat,group=payload,sides=8,cyclic=False):
    # Explicit transported cross section keeps the GLB geometry stable and compact.
    verts=[];faces=[];uv=[];count=len(points)
    for i,p in enumerate(points):
        p=Vector(p)
        if cyclic:t=(Vector(points[(i+1)%count])-Vector(points[(i-1)%count])).normalized()
        elif i==0:t=(Vector(points[1])-p).normalized()
        elif i==count-1:t=(p-Vector(points[-2])).normalized()
        else:t=(Vector(points[i+1])-Vector(points[i-1])).normalized()
        ref=Vector((0,0,1)) if abs(t.z)<.95 else Vector((0,1,0))
        u=t.cross(ref).normalized();v=t.cross(u).normalized()
        for k in range(sides):
            a=2*pi*k/sides;rr=radius(i/count) if callable(radius) else radius
            verts.append(tuple(p+rr*(u*cos(a)+v*sin(a))));uv.append((k/sides,i/count))
    steps=count if cyclic else count-1
    for i in range(steps):
        for k in range(sides):faces.append((i*sides+k,i*sides+(k+1)%sides,((i+1)%count)*sides+(k+1)%sides,((i+1)%count)*sides+k))
    if not cyclic:faces.extend([tuple(range(sides-1,-1,-1)),tuple((count-1)*sides+k for k in range(sides))])
    return mesh_object(name,verts,faces,mat,group,uv)

# A recessed narrow join remains visible through the clear tape.
def rounded_rect(hx,hy,r,z):
    pts=[]
    for cx,cy,start in [(hx-r,hy-r,0),(-hx+r,hy-r,pi/2),(-hx+r,-hy+r,pi),(hx-r,-hy+r,3*pi/2)]:
        for i in range(9):
            a=start+i*pi/2/8;pts.append((cx+r*cos(a),cy+r*sin(a),z))
    return pts
curve_tube('Recessed lid seam',rounded_rect(.270,.106,.008,.068),.00024,shadow,sides=5,cyclic=True)

# Packing tape wraps all the way around the box. Across its width the film ripples
# by less than half a millimetre, leaving a readable specular catch at its edge.
def perimeter_profile(horizontal,vertical,radius,offset=0):
    pts=[]
    for cx,cz,start in [(horizontal-radius,vertical-radius,0),(-horizontal+radius,vertical-radius,pi/2),(-horizontal+radius,-vertical+radius,pi),(horizontal-radius,-vertical+radius,3*pi/2)]:
        for j in range(10):
            a=start+j*pi/2/9;pts.append((cx+(radius+offset)*cos(a),cz+(radius+offset)*sin(a)))
    return pts

def tape_wrap(name,axis,at,width):
    # Cross section profile is YZ for transverse straps, XZ for longitudinal tape.
    h=.110 if axis=='X' else .275
    profile=perimeter_profile(h,.095,.012,.0011)
    verts=[];faces=[];uv=[];nw=8
    for i,(q,z) in enumerate(profile):
        for j in range(nw+1):
            t=j/nw;w=at+(t-.5)*width
            ripple=.00016*sin(t*35+i*.7)+.00008*sin(t*63-i*.41)
            # A lifted final edge creates the hairline reflection seen on packing film.
            ripple+=.00023*(abs(t-.5)*2)**7
            q1=q+(ripple if q>0 else -ripple)
            z1=z+(ripple if z>0 else -ripple)
            verts.append((w,q1,z1) if axis=='X' else (q1,w,z1));uv.append((t*1.7,i/len(profile)*9))
    for i in range(len(profile)):
        for j in range(nw):
            a=i*(nw+1)+j;b=((i+1)%len(profile))*(nw+1)+j
            f=(a,a+1,b+1,b)
            faces.append(tuple(reversed(f)) if axis=='X' else f)
    return mesh_object(name,verts,faces,tape,uvs=uv)
tape_wrap('Clear packing tape / left broad wrap','X',-.171,.047)
tape_wrap('Clear packing tape / label end wrap','X',.180,.051)
tape_wrap('Clear packing tape / crossing long strip','Y',-.008,.047)

def label_mesh(name,centre,size,side=False,back=False,angle=0):
    nx,ny=14,9;vs=[];fs=[];uv=[]
    for j in range(ny+1):
        for i in range(nx+1):
            u,v=i/nx,j/ny
            x=(u-.5)*size[0];q=(v-.5)*size[1]
            # Paper is mostly flat; the lifted, uneven cut corners catch a thin shadow.
            lift=.00025*sin(u*6+v*5)+.00105*(abs(u-.5)*2)**9*(abs(v-.5)*2)**5
            xx=x*cos(angle)-q*sin(angle);qq=x*sin(angle)+q*cos(angle)
            if side:co=(centre[0]+xx,centre[1]-lift,centre[2]+qq)
            else:co=(centre[0]+xx,centre[1]+qq,centre[2]+lift)
            vs.append(co);uv.append((u,v))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i;fs.append((a,a+1,a+nx+2,a+nx+1))
    ob=mesh_object(name,vs,fs,paperback if back else paper,uvs=uv,smooth=True)
    # Paper has a physical edge, not a texture decal floating over the enclosure.
    so=ob.modifiers.new('Paper thickness 0.16 mm','SOLIDIFY');so.thickness=.00016
    bpy.context.view_layer.objects.active=ob;bpy.ops.object.modifier_apply(modifier=so.name)
    ob.data.use_auto_smooth=True;ob.data.auto_smooth_angle=.30
    return ob
label_mesh('Top recovery sheet / overlapped backing',(.161,.023,.0963),(.222,.151),back=True,angle=-.018)
label_mesh('Top recovery sheet / printed paper',(.143,.015,.0967),(.220,.145),angle=.025)
label_mesh('Front recovery sheet / overlapped backing',(.153,-.11035,.012),(.222,.135),side=True,back=True,angle=-.018)
label_mesh('Front recovery sheet / printed paper',(.145,-.11070,.015),(.219,.130),side=True,angle=.016)

def ring(name,centre,ro,ri,height,mat,segments=64):
    v=[];f=[]
    for z,r in [(-height/2,ro),(height/2,ro),(-height/2,ri),(height/2,ri)]:
        for i in range(segments):a=i*2*pi/segments;v.append((centre[0]+r*cos(a),centre[1]+r*sin(a),centre[2]+z))
    for i in range(segments):
        j=(i+1)%segments
        f.extend([(i,j,segments+j,segments+i),(segments+i,segments+j,3*segments+j,3*segments+i),(2*segments+i,3*segments+i,3*segments+j,2*segments+j),(i,2*segments+i,2*segments+j,j)])
    ob=mesh_object(name,v,f,mat)
    ob.data.use_auto_smooth=True; ob.data.auto_smooth_angle=.3
    return ob
ring('Cobalt flat suspension washer',(-.030,.018,.100),.034,.008,.0038,blue)
ring('Transparent upright suspension tube',(-.030,.018,.1257),.0088,.0064,.047,glass,48)
# The cord is a real three-strand braid with air visible through the loop.
for strand in range(3):
    pts=[]
    for i in range(104):
        a=2*pi*i/104
        c=Vector((-.030+.0078*cos(a),.018,.157+.026*sin(a)))
        t=Vector((-.0078*sin(a),0,.026*cos(a))).normalized()
        u=Vector((0,1,0));v=t.cross(u).normalized()
        twist=a*12+strand*2*pi/3
        pts.append(tuple(c+.00103*(u*cos(twist)+v*sin(twist))))
    curve_tube('Braided recovery loop / strand '+str(strand+1),pts,.00070,rope,sides=5,cyclic=True)

# Whip segments step down in diameter, with collars rather than an unbroken rod.
antenna_start=Vector((-.272,.027,.028));direction=Vector((-1,-.018,-.035)).normalized()
lengths=[.128,.122,.116,.086];radii=[.0033,.0027,.00215,.0016]
travel=0
for i,(le,ra) in enumerate(zip(lengths,radii)):
    a=antenna_start+direction*travel;b=a+direction*le
    curve_tube('Telescoping black whip / section '+str(i+1),[a,b],ra,black,sides=12)
    if i>0:curve_tube('Whip sleeve collar '+str(i),[a-direction*.002,a+direction*.0015],ra*1.13,silver,sides=12)
    travel+=le
curve_tube('Rounded antenna tip',[antenna_start+direction*travel,antenna_start+direction*(travel+.006)],.0018,black,sides=12)
curve_tube('Black antenna exit grommet',[antenna_start-direction*.005,antenna_start+direction*.005],.006,cablemat,sides=20)

# Separate black cable loop on the short end, as in the foam enclosure photograph.
pts=[]
for i in range(51):
    a=-.28*pi+i/50*1.81*pi
    pts.append((-.280-.023*sin(a),-.054+.021*cos(a),-.026+.023*sin(a)))
curve_tube('Separate short black cable loop',pts,.0028,cablemat,sides=9)
curve_tube('Cable loop sleeve',[(-.279,-.041,-.038),(-.292,-.041,-.038)],.0044,black,sides=12)

for ob in payload:ob['asset_role']='photo-observed conceptual SkyCell enclosure'

def select_group(group):
    bpy.ops.object.select_all(action='DESELECT')
    for ob in group:ob.select_set(True)
    bpy.context.view_layer.objects.active=group[0]

def export_group(group,file):
    select_group(group)
    bpy.ops.export_scene.gltf(filepath=str(OUT/file),export_format='GLB',use_selection=True,export_yup=True,export_apply=True,export_texcoords=True,export_normals=True,export_materials='EXPORT',export_cameras=False,export_lights=False,export_extras=True)

export_group(payload,'payload-cinematic.glb')

# Natural latex envelope. No panel seams or hot-air-balloon gore construction.
profile=[]
for j in range(1,48):
    theta=(pi*168/180)*j/47
    profile.append((.825*sin(theta),.825*cos(theta)))
profile=[(0,.832)]+profile+[(.115,-.838),(.069,-.861),(.037,-.883),(.021,-.901),(.0185,-.924),(.020,-.941),(.017,-.953)]
verts=[];faces=[];uv=[];segments=112
for j,(r,z) in enumerate(profile):
    neck=max(0,min(1,(-z-.81)/.14))
    for i in range(segments):
        a=2*pi*i/segments
        # Gentle asymmetric inflation and local microvariation avoid a perfect CG orb.
        variation=1+.007*sin(a*3+.7)*(1-neck)+.0035*cos(a*5+j*.23)*(1-neck)
        variation+=neck*.06*sin(a*14+j*.42)
        rr=r*variation
        xx=rr*cos(a)+.006*sin(j/len(profile)*pi)
        yy=rr*sin(a)*(1-.007*cos(j*.09))
        zz=z+.0028*sin(a*4+j*.27)*(1-neck)*sin(j/len(profile)*pi)
        verts.append((xx,yy,zz));uv.append((i/segments,j/(len(profile)-1)))
for j in range(len(profile)-1):
    for i in range(segments):faces.append(((j+1)*segments+i,(j+1)*segments+(i+1)%segments,j*segments+(i+1)%segments,j*segments+i))
envelope=mesh_object('Natural latex envelope / seamless gathered neck',verts,faces,latex,balloon,uv)
envelope['nominal_diameter_metres']=1.65
# The tied rolled knot is deliberately localised at the gathered neck.
pts=[]
for i in range(72):
    a=2*pi*i/72
    pts.append((.018*cos(a),.012*sin(a),-.944+.0045*sin(a*2)))
curve_tube('Latex neck / compressed tie knot',pts,.0072,latex,balloon,sides=8,cyclic=True)
# A short folded tail below the knot, with a small flared rolled opening.
verts=[];faces=[];uv=[]
for j in range(5):
    z=-.952-j*.006
    r=[.013,.011,.012,.016,.019][j]
    for i in range(48):
        a=2*pi*i/48;rr=r*(1+.10*sin(a*7+j*.4))
        verts.append((rr*cos(a)+.004*j/4,rr*sin(a)*.70,z+.002*sin(a*3)));uv.append((i/48,j/4))
for j in range(4):
    for i in range(48):faces.append(((j+1)*48+i,(j+1)*48+(i+1)%48,j*48+(i+1)%48,j*48+i))
mesh_object('Latex neck / folded tail',verts,faces,latex,balloon,uv)
export_group(balloon,'balloon-latex.glb')

def stats(group,file):
    coords=[ob.matrix_world@v.co for ob in group for v in ob.data.vertices]
    lo=[min(v[a] for v in coords) for a in range(3)];hi=[max(v[a] for v in coords) for a in range(3)]
    tris=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in group)
    return {'file':file,'bytes':(OUT/file).stat().st_size,'triangles':tris,'mesh_objects':len(group),'source_bounds_xyz_metres':{'min':lo,'max':hi},'gltf_dimensions_xyz_metres':[hi[0]-lo[0],hi[2]-lo[2],hi[1]-lo[1]]}
metadata={'units':'metres','source_axes':'X length, -Y labelled face, Z up; GLB Y up','origin':'centre of EPS enclosure; balloon centre approximately origin','foam_body_dimensions_metres':[.55,.22,.19],'reference_photos':['public/gallery/1000004204.jpg','public/gallery/1000004195.jpg'],'original_reconstruction':True,'label_note':'Generic recovery labels; no original contact information reproduced.','assets':[stats(payload,'payload-cinematic.glb'),stats(balloon,'balloon-latex.glb')]}
(OUT/'asset-metadata.json').write_text(json.dumps(metadata,indent=2))

# Simple controlled product lighting, used only for the two verification stills.
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.render.resolution_x=1024;scene.render.resolution_y=768;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
scene.world.color=(.04,.055,.08)
world=scene.world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.045,.068,.11,1);world.node_tree.nodes['Background'].inputs[1].default_value=.35
scene.view_settings.view_transform='Filmic';scene.view_settings.look='Medium High Contrast';scene.view_settings.exposure=-.35

def area(name,loc,energy,color,size):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size
    ob=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(ob);ob.location=loc
    ob.rotation_euler=(Vector((0,0,0))-ob.location).to_track_quat('-Z','Y').to_euler();return ob
keydata=bpy.data.lights.new('Warm directional sun','SUN');keydata.energy=2.25;keydata.angle=.11;keydata.color=(1,.94,.84)
key=bpy.data.objects.new('Warm directional sun',keydata);bpy.context.collection.objects.link(key);key.location=(-1,-1,2)
key.rotation_euler=(Vector((0,0,0))-key.location).to_track_quat('-Z','Y').to_euler()
fill=area('Cool fill',(1.0,.3,.85),7,(.59,.74,1),.85)
camdata=bpy.data.cameras.new('VerificationCamera');cam=bpy.data.objects.new('VerificationCamera',camdata);bpy.context.collection.objects.link(cam);scene.camera=cam
groundmat=material('RenderBackdrop',(.021,.036,.060),.74)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.099));ground=bpy.context.object;ground.name='Verification ground';ground.data.materials.append(groundmat)
def point_camera(loc,target,lens):
    cam.location=loc;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();camdata.lens=lens
for o in balloon:o.hide_render=True;o.hide_viewport=True
point_camera((-.94,-1.29,.84),(-.22,0,.025),58)
scene.render.filepath=str(RENDERS/'payload-beauty.png');bpy.ops.render.render(write_still=True)
# A closer materials view is useful for examining bead density, paper edge and tape.
point_camera((-.47,-.66,.50),(.035,0,.041),63)
scene.render.filepath=str(RENDERS/'payload-detail.png');bpy.ops.render.render(write_still=True)
for o in payload:o.hide_render=True;o.hide_viewport=True
for o in balloon:o.hide_render=False;o.hide_viewport=False
ground.location.z=-.997
key.location=(-2,-2,3);key.data.energy=2.25
fill.location=(2,1,1.5);fill.data.energy=45;fill.data.size=1.7
for l in [key,fill]:l.rotation_euler=(Vector((0,0,0))-l.location).to_track_quat('-Z','Y').to_euler()
point_camera((2.7,-4.1,1.45),(0,0,-.09),65)
scene.render.filepath=str(RENDERS/'balloon-beauty.png');bpy.ops.render.render(write_still=True)
sys.path.insert(0,str(HERE))
from finalize_source import finalize_source
finalize_source()
print('ASSET_METADATA',json.dumps(metadata))
