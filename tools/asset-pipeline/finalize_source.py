"""Organize and save the editable source after the inspection renders finish."""
from pathlib import Path
import bpy
from mathutils import Vector

def finalize_source():
    scene=bpy.context.scene
    payload=[o for o in scene.objects if o.get('asset_role')]
    balloon=[o for o in scene.objects if o.name.startswith(('Natural latex','Latex neck'))]
    for name,objects in [('Payload exterior',payload),('Latex balloon',balloon),('Verification rig',[o for o in scene.objects if o not in payload+balloon])]:
        c=bpy.data.collections.get(name) or bpy.data.collections.new(name)
        if c.name not in scene.collection.children:scene.collection.children.link(c)
        for o in objects:
            for old in list(o.users_collection):old.objects.unlink(o)
            c.objects.link(o)
    for o in payload:o.hide_render=False;o.hide_viewport=False
    for o in balloon:o.hide_render=True;o.hide_viewport=True
    ground=bpy.data.objects.get('Verification ground')
    if ground:ground.location.z=-.099
    cam=bpy.data.objects.get('VerificationCamera')
    if cam:
        cam.location=(-.94,-1.29,.84)
        cam.rotation_euler=(Vector((-.22,0,.025))-cam.location).to_track_quat('-Z','Y').to_euler()
        cam.data.lens=58
    fill=bpy.data.objects.get('Cool fill')
    if fill:
        fill.location=(1,.3,.85);fill.data.energy=7;fill.data.size=.85
        fill.rotation_euler=(-fill.location).to_track_quat('-Z','Y').to_euler()
    key=bpy.data.objects.get('Warm directional sun')
    if key:
        key.location=(-1,-1,2);key.data.energy=2.25
        key.rotation_euler=(-key.location).to_track_quat('-Z','Y').to_euler()
    bpy.context.preferences.filepaths.save_version=0
    for im in bpy.data.images:
        if im.source=='FILE' and not im.packed_file:im.pack()
    path=Path(__file__).resolve().parent/'skycell-original-assets.blend'
    bpy.ops.wm.save_as_mainfile(filepath=str(path))

if __name__=='__main__':finalize_source()
