// Decompose one slide into: static background, animated units (with sampled keyframes), overlays and editable text.
// usage: node extract.js <renderDir> <slideId> <loopSeconds> <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [,, W, id, loopS, OUT] = process.argv;
const L = parseFloat(loopS);
const FPS = 10;
const DSF = 2;
const TREF = L * Math.ceil(10 / L);

const ICONS = {
  Lightning: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  Chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  Lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  Users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/>',
  Lightbulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
  Verified: '<path d="M12 2l2.4 2.1 3.2-.3.8 3.1 2.9 1.5-1.2 3 1.2 3-2.9 1.5-.8 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.8-3.1-2.9-1.5 1.2-3-1.2-3 2.9-1.5.8-3.1 3.2.3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  Key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9"/><path d="M17 6l3 3"/><path d="M15 8l2 2"/>',
  Globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
  Chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  Warning: '<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><path d="M12 18h.01"/>',
  PaperPlane: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
  Clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
const BLOBS = {
  '/_blob/3c13984c4e8d04f4de666ba95b4eb01b': 'neopond-detail-kolam.png',
  '/_blob/1a0eaa9d53bcf0912f48af7b6e295459': 'neopond-keuangan.png',
};
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;background:transparent;overflow:hidden}
section{position:relative;width:1920px;height:1080px;overflow:hidden}
div{min-width:0}
h1{font-size:96px;font-weight:600;line-height:1.1}
h2{font-size:64px;font-weight:600;line-height:1.15}
h3{font-size:44px;font-weight:600;line-height:1.2}
p{font-size:32px;line-height:1.4}
ul{padding-left:1.2em}
li{margin:0}
aside{display:none}
img{display:block}
table{border-collapse:collapse}
td,th{border:1px solid rgba(255,255,255,0.12);padding:0.35em 0.6em;font-weight:inherit}
th{font-weight:600}
x-icon{display:flex;align-items:center;justify-content:center;flex:none}
x-icon svg{width:70%;height:70%}
`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const fontsCss = fs.readFileSync(path.join(W, 'fonts/local.css'), 'utf8')
    .replace(/url\(([^)]+)\)/g, (m, f) => `url(file://${path.join(W, 'fonts', f)})`);
  let html = fs.readFileSync(path.join(W, `live/project/slides/${id}.html`), 'utf8');
  for (const [k, v] of Object.entries(BLOBS)) html = html.split(k).join(`file://${path.join(W, v)}`);
  const pageHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}${CSS}</style><style id="mode"></style></head><body>${html}</body></html>`;
  const htmlPath = path.join(OUT, `page.html`);
  fs.writeFileSync(htmlPath, pageHtml);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: DSF });
  await page.goto('file://' + htmlPath);
  await page.evaluate((ICONS) => {
    for (const img of document.querySelectorAll('img[src^="data:image/svg+xml;base64,"]')) {
      const svgText = atob(img.src.split(',')[1]);
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const svg = document.importNode(doc.documentElement, true);
      svg.setAttribute('style', img.getAttribute('style'));
      if (img.getAttribute('alt')) svg.setAttribute('aria-label', img.getAttribute('alt'));
      img.replaceWith(svg);
    }
    for (const el of document.querySelectorAll('section, div')) {
      if (!/(^|;)\s*display\s*:/.test(el.getAttribute('style') || '')) { el.style.display = 'flex'; el.style.flexDirection = 'column'; }
    }
    for (const sec of document.querySelectorAll('section')) {
      for (const ch of sec.children) { if (getComputedStyle(ch).position === 'static') ch.style.position = 'relative'; }
    }
    for (const ic of document.querySelectorAll('x-icon')) {
      const n = ic.getAttribute('name');
      ic.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;
    }
  }, ICONS);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const setTime = (t) => page.evaluate((t) => {
    for (const s of document.querySelectorAll('svg')) { if (s.ownerSVGElement) continue; s.pauseAnimations(); s.setCurrentTime(t); }
  }, t);
  await setTime(TREF);

  // ---------- find animated units ----------
  const info = await page.evaluate(() => {
    const ANIM = new Set(['animate', 'animateTransform', 'animateMotion', 'set']);
    const SKIP = new Set(['defs', 'linearGradient', 'radialGradient', 'pattern', 'clipPath', 'mask', 'title', 'desc', 'stop', 'animate', 'animateTransform', 'animateMotion', 'set', 'mpath']);
    const units = []; let uid = 0;
    const animsOf = (el) => [...el.children].filter(c => ANIM.has(c.localName)).map(a => ({
      tag: a.localName, attr: a.getAttribute('attributeName') || '', type: a.getAttribute('type') || '',
      from: a.getAttribute('from'), to: a.getAttribute('to'), values: a.getAttribute('values'), dur: parseFloat(a.getAttribute('dur')) || 0,
    }));
    for (const root of document.querySelectorAll('svg')) {
      if (root.ownerSVGElement) continue;
      if (root.closest('x-icon')) continue;
      const targets = new Set([...root.querySelectorAll('animate,animateTransform,animateMotion,set')].map(a => a.parentElement));
      if (!targets.size) continue;
      const below = new Map();
      const hasBelow = (n) => {
        if (below.has(n)) return below.get(n);
        let r = false;
        for (const c of n.children) { if (SKIP.has(c.localName)) continue; if (targets.has(c) || hasBelow(c)) { r = true; } }
        below.set(n, r); return r;
      };
      const proc = (n, aff, chain) => {
        if (SKIP.has(n.localName)) return;
        const isT = targets.has(n) && n !== root;
        const a = aff || isT;
        const ch = isT ? chain.concat(animsOf(n)) : chain;
        if (!hasBelow(n)) {
          if (a) {
            const k = 'u' + (uid++);
            n.setAttribute('data-unit', k);
            units.push({ id: k, tag: n.localName, anims: ch, own: isT ? animsOf(n) : [], back: (root.getAttribute('aria-label') || '').startsWith('Latar beranimasi') });
          }
          return;
        }
        for (const c of [...n.children]) proc(c, a, ch);
      };
      // root itself may carry animations? treat root children
      for (const c of [...root.children]) proc(c, false, targets.has(root) ? animsOf(root) : []);
    }
    return units;
  });

  // classify
  const units = info.map(u => {
    const attrs = new Set(u.anims.map(a => a.attr));
    if (u.anims.length && [...attrs].every(a => a === 'stroke-dashoffset')) u.kind = 'dash';
    else if ((u.tag === 'circle' || u.tag === 'ellipse') && u.own.some(a => ['r', 'rx', 'ry'].includes(a.attr))) u.kind = 'ellipse';
    else u.kind = 'sprite';
    return u;
  });

  // ---------- dash units: geometry ----------
  for (const u of units.filter(u => u.kind === 'dash')) {
    const a = u.anims.find(a => a.attr === 'stroke-dashoffset');
    let from = parseFloat(a.from), to = parseFloat(a.to);
    if (a.values) { const v = a.values.split(';').map(parseFloat); from = v[0]; to = v[v.length - 1]; }
    u.dash = { delta: to - from, dur: a.dur };
    u.geo = await page.evaluate((k) => {
      const el = document.querySelector(`[data-unit="${k}"]`);
      const leaves = el.children.length && !['line', 'path', 'circle', 'polyline', 'polygon', 'rect', 'ellipse'].includes(el.localName)
        ? [...el.querySelectorAll('line,path,circle,polyline,polygon,rect,ellipse')] : [el];
      const out = [];
      const col = (s) => { const m = s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };
      for (const g of leaves) {
        const cs = getComputedStyle(g);
        if (cs.stroke === 'none' || cs.display === 'none') continue;
        if (!/^rgb/.test(cs.stroke)) { out.push({ fail: true }); continue; }
        const M = g.getScreenCTM(); const sc = Math.hypot(M.a, M.b);
        const P = (x, y) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f];
        const st = {
          stroke: col(cs.stroke), width: parseFloat(cs.strokeWidth) * sc, cap: cs.strokeLinecap,
          dash: cs.strokeDasharray === 'none' ? null : cs.strokeDasharray.split(/[ ,]+/).map(v => parseFloat(v) * sc),
          opacity: parseFloat(cs.strokeOpacity) * (() => { let o = 1, n = g; while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } return o; })(),
          scale: sc,
        };
        const segs = [];
        const tag = g.localName;
        if (tag === 'line') segs.push([P(g.x1.baseVal.value, g.y1.baseVal.value), P(g.x2.baseVal.value, g.y2.baseVal.value)]);
        else if (tag === 'polyline' || tag === 'polygon') {
          const pts = [...g.points].map(p => P(p.x, p.y));
          for (let i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1]]);
          if (tag === 'polygon') segs.push([pts[pts.length - 1], pts[0]]);
        } else if (tag === 'path') {
          const d = g.getAttribute('d');
          if (/[^MLHVZmlhvz0-9.,\s-]/.test(d)) { out.push({ fail: true }); continue; }
          const tok = d.match(/[MLHVZmlhvz]|-?[\d.]+/g); let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0;
          while (i < tok.length) {
            if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
            const rel = cmd === cmd.toLowerCase(); const C = cmd.toUpperCase();
            if (C === 'Z') { segs.push([P(x, y), P(sx, sy)]); x = sx; y = sy; continue; }
            let nx = x, ny = y;
            if (C === 'M' || C === 'L') { nx = +tok[i++] + (rel ? x : 0); ny = +tok[i++] + (rel ? y : 0); }
            else if (C === 'H') nx = +tok[i++] + (rel ? x : 0);
            else if (C === 'V') ny = +tok[i++] + (rel ? y : 0);
            if (C === 'M') { sx = nx; sy = ny; cmd = rel ? 'l' : 'L'; } else segs.push([P(x, y), P(nx, ny)]);
            x = nx; y = ny;
          }
        } else if (tag === 'circle' || tag === 'ellipse') {
          const c = P(g.cx.baseVal.value, g.cy.baseVal.value);
          const r = (tag === 'circle' ? g.r.baseVal.value : g.rx.baseVal.value) * sc;
          const ry = (tag === 'circle' ? g.r.baseVal.value : g.ry.baseVal.value) * sc;
          out.push({ circle: { cx: c[0], cy: c[1], rx: r, ry }, ...st, fill: cs.fill === 'none' ? null : col(cs.fill) });
          continue;
        } else { out.push({ fail: true }); continue; }
        out.push({ segs, ...st });
      }
      return out;
    }, u.id);
    if (u.geo.some(g => g.fail)) u.kind = 'static';
  }

  // ---------- sample sprite / ellipse units ----------
  const live = units.filter(u => u.kind === 'sprite' || u.kind === 'ellipse');
  const N = Math.round(L * FPS);
  for (const u of live) u.samples = [];
  for (let i = 0; i <= N; i++) {
    await setTime(TREF + i / FPS);
    const res = await page.evaluate((ids) => {
      const col = (s) => { const m = s && s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };
      return ids.map(k => {
        const el = document.querySelector(`[data-unit="${k}"]`);
        const M = el.getScreenCTM(); const b = el.getBBox();
        let o = 1, n = el;
        while (n && n.nodeType === 1 && n.localName !== 'section') { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
        const cs = getComputedStyle(el);
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
        return {
          x: M.a * cx + M.c * cy + M.e, y: M.b * cx + M.d * cy + M.f, w: b.width, h: b.height,
          s: Math.hypot(M.a, M.b), rot: Math.atan2(M.b, M.a) * 180 / Math.PI, o,
          fo: parseFloat(cs.fillOpacity), so: parseFloat(cs.strokeOpacity), fill: cs.fill.startsWith('url') ? cs.fill : col(cs.fill),
          stroke: col(cs.stroke), sw: parseFloat(cs.strokeWidth),
        };
      });
    }, live.map(u => u.id));
    res.forEach((r, j) => live[j].samples.push(r));
  }
  for (const u of live) {
    const ownAttrs = new Set(u.own.map(a => a.attr));
    const S = u.samples;
    for (const s of S) {
      s.eff = s.o * (ownAttrs.has('stroke-opacity') ? s.so : 1) * (ownAttrs.has('fill-opacity') ? s.fo : 1);
    }
    if (u.kind === 'ellipse' && (S[0].fill && typeof S[0].fill === 'string')) u.kind = 'sprite';
    // fill states
    const fa = u.own.find(a => a.attr === 'fill');
    u.fillStates = fa ? [...new Set(fa.values.split(';'))] : null;
  }

  // ---------- text blocks ----------
  const texts = await page.evaluate(() => {
    const sec = document.querySelector('section');
    const walker = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
    const blocks = new Map();
    const blockOf = (el) => { let n = el; while (n && getComputedStyle(n).display === 'inline') n = n.parentElement; return n; };
    const col = (s) => { const m = s.match(/[\d.]+/g); return m ? m.slice(0, 4).map(Number) : null; };
    let tn;
    while ((tn = walker.nextNode())) {
      const pe = tn.parentElement;
      if (!pe || pe.closest('svg') || pe.closest('aside') || !tn.textContent.trim()) continue;
      const blk = blockOf(pe);
      if (!blocks.has(blk)) blocks.set(blk, []);
      const cs = getComputedStyle(pe);
      const tt = cs.textTransform;
      const re = /\S+/g; let m;
      while ((m = re.exec(tn.textContent))) {
        const r = document.createRange(); r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length);
        const rects = r.getClientRects(); if (!rects.length) continue;
        const rc = rects[0];
        let w = m[0]; if (tt === 'uppercase') w = w.toUpperCase();
        blocks.get(blk).push({
          t: w, l: rc.left, r: rc.right, top: rc.top, bot: rc.bottom, spaceBefore: m.index > 0 && /\s/.test(tn.textContent[m.index - 1]),
          font: cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim(), size: parseFloat(cs.fontSize), weight: parseInt(cs.fontWeight),
          italic: cs.fontStyle === 'italic', color: col(cs.color), ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
          node: 0,
        });
      }
    }
    const out = [];
    for (const [blk, toks] of blocks) {
      const bcs = getComputedStyle(blk); const br = blk.getBoundingClientRect();
      const lh = bcs.lineHeight === 'normal' ? parseFloat(bcs.fontSize) * 1.2 : parseFloat(bcs.lineHeight);
      out.push({
        align: bcs.textAlign, lh, box: { l: br.left + parseFloat(bcs.paddingLeft) + parseFloat(bcs.borderLeftWidth), r: br.right - parseFloat(bcs.paddingRight) - parseFloat(bcs.borderRightWidth), t: br.top, b: br.bottom },
        toks,
      });
    }
    return out;
  });

  // ---------- top layer detection (static things that must sit above content units) ----------
  const unionRects = [];
  for (const u of live.filter(u => !u.back)) for (const s of u.samples) {
    if (s.eff < 0.02) continue;
    const hw = s.w * s.s / 2 + 10, hh = s.h * s.s / 2 + 10;
    unionRects.push([s.x - hw, s.y - hh, s.x + hw, s.y + hh]);
  }
  for (const u of units.filter(u => u.kind === 'dash' && !u.back)) for (const g of u.geo) {
    if (g.segs) for (const [[x1, y1], [x2, y2]] of g.segs) unionRects.push([Math.min(x1, x2) - 20, Math.min(y1, y2) - 20, Math.max(x1, x2) + 20, Math.max(y1, y2) + 20]);
    if (g.circle) unionRects.push([g.circle.cx - g.circle.rx - 10, g.circle.cy - g.circle.ry - 10, g.circle.cx + g.circle.rx + 10, g.circle.cy + g.circle.ry + 10]);
  }
  const contentUnitIds = units.filter(u => !u.back && u.kind !== 'static').map(u => u.id);
  const nTop = await page.evaluate(([rects, ids]) => {
    if (!ids.length) return 0;
    const firstUnit = document.querySelector(`[data-unit="${ids[0]}"]`);
    const hit = (r) => rects.some(q => q[0] < r.right && q[2] > r.left && q[1] < r.bottom && q[3] > r.top);
    let k = 0;
    const SH = new Set(['rect', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'text', 'image', 'use']);
    for (const el of document.querySelectorAll('section *')) {
      if (el.closest('aside') || el.closest('[data-unit]') || el.closest('defs')) continue;
      if (!(firstUnit.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
      if (el.querySelector('[data-unit]')) continue;
      const inSvg = !!el.closest('svg') && !el.closest('x-icon');
      if (inSvg) {
        if (!SH.has(el.localName)) continue;
        const root = el.ownerSVGElement && (function f(n) { while (n.ownerSVGElement) n = n.ownerSVGElement; return n; })(el);
        if (root && (root.getAttribute('aria-label') || '').startsWith('Latar beranimasi')) continue;
      } else {
        if (el.localName === 'svg' || el.closest('x-icon') && el.localName !== 'x-icon') continue;
        const cs = getComputedStyle(el);
        const bgc = cs.backgroundColor; const hasBg = (bgc && !/rgba\(.*,\s*0\)$/.test(bgc) && bgc !== 'transparent') || cs.backgroundImage !== 'none';
        const hasBorder = ['Top', 'Right', 'Bottom', 'Left'].some(s => parseFloat(cs['border' + s + 'Width']) > 0 && !/rgba\(.*,\s*0\)$/.test(cs['border' + s + 'Color']));
        const isImg = el.localName === 'img' || el.localName === 'x-icon';
        if (!(hasBg || hasBorder || isImg)) continue;
      }
      if (el.parentElement && el.parentElement.closest('[data-top]')) continue;
      if (!hit(el.getBoundingClientRect())) continue;
      el.setAttribute('data-top', '1'); k++;
    }
    return k;
  }, [unionRects, contentUnitIds]);
  // ---------- render helpers ----------
  const mode = (css) => page.evaluate((css) => { document.getElementById('mode').textContent = css; }, css);
  const HIDE_TEXT = `section *:not(svg):not(svg *){-webkit-text-fill-color:transparent !important;text-shadow:none !important}`;

  await setTime(TREF);
  const BACK = `svg[aria-label^="Latar beranimasi"]`;
  const hideUnits = units.filter(u => u.kind !== 'static').map(u => `html body section [data-unit="${u.id}"], html body section [data-unit="${u.id}"] *`).join(',');
  const HU = hideUnits ? hideUnits + '{visibility:hidden !important}' : '';
  // layer 0: section background + static backdrop
  await mode(`${HU} section *{visibility:hidden !important} ${BACK}, ${BACK} *{visibility:visible !important} ${HU} html,body{background:#071A22}`);
  await page.screenshot({ path: path.join(OUT, 'bg0.jpg'), type: 'jpeg', quality: 90 });
  // layer 1: all other static content, transparent
  await mode(`${HIDE_TEXT} ${HU} html,body{background:transparent !important} section{background:none !important} ${BACK}{visibility:hidden !important} ${BACK} *{visibility:hidden !important}`);
  await page.screenshot({ path: path.join(OUT, 'bg1.png'), omitBackground: true });
  // top layer
  if (nTop) {
    await mode(`${HIDE_TEXT} html,body{background:transparent !important} section{background:none !important} section *{visibility:hidden !important} [data-top], [data-top] *{visibility:visible !important} ${HU}`);
    await page.screenshot({ path: path.join(OUT, 'top.png'), omitBackground: true });
  }
  await mode('');

  // sprite snapshots
  const snap = async (sel, t, file) => {
    await setTime(t);
    const box = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const b = el.getBBox(); const M = el.getScreenCTM();
      const cs = getComputedStyle(el);
      const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      // stroke padding (max stroke width among subtree)
      let sw = 0; for (const n of [el, ...el.querySelectorAll('*')]) { const v = parseFloat(getComputedStyle(n).strokeWidth) || 0; if (getComputedStyle(n).stroke !== 'none') sw = Math.max(sw, v); }
      const pad = sw * Math.hypot(M.a, M.b) / 2 + 3;
      return { l: Math.min(...xs) - pad, t: Math.min(...ys) - pad, r: Math.max(...xs) + pad, b: Math.max(...ys) + pad };
    }, sel);
    const w = Math.max(2, Math.ceil(box.r - box.l)), h = Math.max(2, Math.ceil(box.b - box.t));
    await page.setViewportSize({ width: Math.max(w, 2), height: Math.max(h, 2) });
    await mode(`html,body{background:transparent !important;overflow:visible !important;width:9999px !important;height:9999px !important} svg{overflow:visible !important} section{overflow:visible !important;visibility:hidden !important;background:none !important;transform:translate(${-box.l}px,${-box.t}px)} section *{visibility:hidden !important} ${sel}, ${sel} *{visibility:visible !important}`);
    await page.screenshot({ path: path.join(OUT, file), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await mode('');
    return { l: box.l, t: box.t, w, h };
  };

  const meta = { id, L, TREF, FPS, units: [], top: nTop > 0, texts };
  for (const u of units) {
    if (u.kind === 'static') continue;
    if (u.kind === 'dash') { meta.units.push({ id: u.id, kind: 'dash', back: u.back, dash: u.dash, geo: u.geo }); continue; }
    const S = u.samples;
    if (u.kind === 'ellipse') { meta.units.push({ id: u.id, kind: 'ellipse', back: u.back, samples: S, own: u.own }); continue; }
    // sprite: one picture per fill state (or one)
    const states = u.fillStates || [null];
    const pics = [];
    for (let si = 0; si < states.length; si++) {
      // choose ref sample: max eff (and for fill states, closest fill)
      let best = 0, bestScore = -1;
      S.forEach((s, i) => {
        let w = 1;
        if (states[si]) {
          const hex = states[si]; const c = [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16));
          const d = s.fill && Array.isArray(s.fill) ? Math.hypot(...c.map((v, k) => v - s.fill[k])) : 999;
          w = d < 6 ? 1 : 0;
        }
        const score = s.eff * w * 1000 + s.w * s.h * s.s * s.s * 1e-6;
        if (score > bestScore) { bestScore = score; best = i; }
      });
      const file = `${u.id}_${si}.png`;
      const box = await snap(`[data-unit="${u.id}"]`, TREF + best / FPS, file);
      pics.push({ file, ref: best, box, state: states[si] });
    }
    meta.units.push({ id: u.id, kind: 'sprite', back: u.back, samples: S, pics, own: u.own });
  }
  // reference full frame for comparison
  await setTime(TREF);
  await page.screenshot({ path: path.join(OUT, 'ref.jpg'), type: 'jpeg', quality: 85 });
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta));
  await browser.close();
  console.log(id, 'units', meta.units.length, 'dash', meta.units.filter(u => u.kind === 'dash').length, 'top', nTop, 'texts', texts.length, 'static', units.filter(u => u.kind === 'static').length);
})();
