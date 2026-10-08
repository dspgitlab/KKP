"""Re-play a slide's PowerPoint timing XML (pictures only) to check keyframe math."""
import sys, zipfile, re, io
from lxml import etree
from PIL import Image
pptx, slide_no, times, out = sys.argv[1], int(sys.argv[2]), [float(x) for x in sys.argv[3].split(',')], sys.argv[4]
z = zipfile.ZipFile(pptx)
x = etree.fromstring(z.read(f'ppt/slides/slide{slide_no}.xml'))
rels = etree.fromstring(z.read(f'ppt/slides/_rels/slide{slide_no}.xml.rels'))
rid = {r.get('Id'): 'ppt/slides/' + r.get('Target') for r in rels}
ns = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main', 'a': 'http://schemas.openxmlformats.org/drawingml/2006/main', 'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
PX = 6350
shapes = []
for pic in x.iter('{%s}pic' % ns['p']):
    sid = pic.find('.//p:cNvPr', ns).get('id')
    off = pic.find('.//a:off', ns); ext = pic.find('.//a:ext', ns)
    emb = pic.find('.//a:blip', ns).get('{%s}embed' % ns['r'])
    path = rid[emb].replace('slides/../', '')
    img = Image.open(io.BytesIO(z.read(path))).convert('RGBA')
    shapes.append(dict(id=sid, x=int(off.get('x')) / PX, y=int(off.get('y')) / PX, w=int(ext.get('cx')) / PX, h=int(ext.get('cy')) / PX, img=img))
eff = {}
for par in x.iter('{%s}par' % ns['p']):
    ctn = par.find('p:cTn', ns)
    if ctn is None or ctn.get('repeatCount') != 'indefinite':
        continue
    period = int(ctn.get('dur')) / 1000
    for b in ctn.find('p:childTnLst', ns):
        tgt = b.find('.//p:spTgt', ns).get('spid')
        bc = b.find('.//p:cBhvr/p:cTn', ns)
        dl = bc.find('.//p:cond', ns)
        delay = int(dl.get('delay')) / 1000 if dl is not None else 0
        dur = int(bc.get('dur')) / 1000
        eff.setdefault(tgt, []).append((period, b, delay, dur))
def interp(keys, t):
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t0 <= t <= t1:
            return v0 + (v1 - v0) * ((t - t0) / (t1 - t0) if t1 > t0 else 0)
    return keys[-1][1]
frames = []
for T in times:
    canvas = Image.new('RGBA', (1920, 1080), (7, 26, 34, 255))
    for s in shapes:
        cx, cy, w, h, vis, alpha = s['x'] + s['w'] / 2, s['y'] + s['h'] / 2, s['w'], s['h'], True, 1.0
        events = []
        for period, b, delay, dur in eff.get(s['id'], []):
            t = T % period
            tag = etree.QName(b).localname
            if tag == 'anim':
                attr = b.find('.//p:attrName', ns).text
                keys = [(int(tv.get('tm')) / 100000 * period, float(tv.find('.//p:strVal', ns).get('val'))) for tv in b.find('p:tavLst', ns)]
                v = interp(keys, t)
                if attr == 'ppt_x': cx = v * 1920
                if attr == 'ppt_y': cy = v * 1080
                if attr == 'ppt_w': w = v * 1920
                if attr == 'ppt_h': h = v * 1080
            elif tag == 'set' and t >= delay:
                events.append((delay, 'set', b.find('.//p:strVal', ns).get('val')))
            elif tag == 'animEffect' and t >= delay:
                events.append((delay, b.get('transition'), min(1, (t - delay) / dur)))
        for _, kind, v in sorted(events, key=lambda e: e[0]):
            if kind == 'set': vis = v == 'visible'; alpha = 1.0
            elif kind == 'in': alpha = v
            elif kind == 'out': alpha = 1 - v
        if not vis or alpha <= 0 or w < 1 or h < 1:
            continue
        im = s['img'].resize((max(1, int(w)), max(1, int(h))))
        if alpha < 1:
            a = im.getchannel('A').point(lambda p: int(p * alpha)); im.putalpha(a)
        canvas.alpha_composite(im, (int(cx - w / 2), int(cy - h / 2)))
    frames.append(canvas.convert('RGB').resize((640, 360)))
sheet = Image.new('RGB', (640 * len(frames), 360))
for i, f in enumerate(frames): sheet.paste(f, (640 * i, 0))
sheet.save(out, quality=80)
