// Render each deck slide to looping frames by stepping SMIL time deterministically.
// usage: node render.js <workdir> <slideId> <loopSeconds> <fps> [startTime]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [,, W, id, loopS, fpsS, t0S] = process.argv;
const loop = parseFloat(loopS), fps = parseInt(fpsS, 10), t0 = parseFloat(t0S || '10');

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
html,body{width:1920px;height:1080px;background:#071A22;overflow:hidden}
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
  const fontsCss = fs.readFileSync(path.join(W, 'fonts/local.css'), 'utf8')
    .replace(/url\(([^)]+)\)/g, (m, f) => `url(file://${path.join(W, 'fonts', f)})`);
  let html = fs.readFileSync(path.join(W, `live/project/slides/${id}.html`), 'utf8');
  for (const [k, v] of Object.entries(BLOBS)) html = html.split(k).join(`file://${path.join(W, v)}`);
  const page_html = `<!doctype html><html><head><meta charset="utf-8"><style>${fontsCss}${CSS}</style></head><body>${html}</body></html>`;
  const htmlPath = path.join(W, `page-${id}.html`);
  fs.writeFileSync(htmlPath, page_html);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + htmlPath);
  await page.evaluate((ICONS) => {
    // inline SVG data-URI images so their SMIL clock can be driven
    for (const img of document.querySelectorAll('img[src^="data:image/svg+xml;base64,"]')) {
      const svgText = atob(img.src.split(',')[1]);
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const svg = document.importNode(doc.documentElement, true);
      svg.setAttribute('style', img.getAttribute('style'));
      img.replaceWith(svg);
    }
    for (const el of document.querySelectorAll('section, div')) {
      if (!/(^|;)\s*display\s*:/.test(el.getAttribute('style') || '')) { el.style.display = 'flex'; el.style.flexDirection = 'column'; }
    }
    for (const ic of document.querySelectorAll('x-icon')) {
      const n = ic.getAttribute('name');
      ic.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ''}</svg>`;
    }
  }, ICONS);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const outDir = path.join(W, 'frames', id);
  fs.mkdirSync(outDir, { recursive: true });
  const n = Math.round(loop * fps);
  for (let i = 0; i < n; i++) {
    const t = t0 + i / fps;
    await page.evaluate((t) => {
      for (const s of document.querySelectorAll('svg')) {
        if (s.ownerSVGElement) continue;
        s.pauseAnimations(); s.setCurrentTime(t);
      }
    }, t);
    await page.screenshot({ path: path.join(outDir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  await browser.close();
  console.log(id, n, 'frames');
})();
