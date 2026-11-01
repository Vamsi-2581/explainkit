// Drawing helpers shared by every scene. Everything draws on a 1080x1920 canvas through the global `ctx`.
// Scenes and projects use these as plain globals (the runtime is a set of classic scripts, no bundler).
const W = 1080, H = 1920;
// Palette (any CSS color works anywhere; these are just the defaults the built-in scenes use).
const C = {
  night: '#121a28', night2: '#1d2940', blue: '#2b3c58', gray: '#565f6e', gray2: '#7c8696', gray3: '#a3abb8',
  wall: '#343a48', wall2: '#2a2f3b', floor: '#23262f', cream: '#efe6d6', light: '#ffd166', light2: '#ffb347',
  red: '#e5484d', orange: '#f08a3c', green: '#3fbf7f', skin: '#f2c6a0', cheek: '#f29b9b', hair: '#33241c',
  sweater: '#d9a441', scarf: '#c8463d', pants: '#2d3445', white: '#f5f2ea', black: '#0c1016', ice: '#bfe3f2',
};
const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif'; // headings, subtitles, labels
const FONT2 = '"Barlow", Arial, sans-serif'; // body text
const MONO = '"JetBrains Mono", monospace'; // code, numbers, terminals

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = p => (p = clamp(p), p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const easeOut = p => 1 - Math.pow(1 - clamp(p), 3);
const lerp = (a, b, p) => a + (b - a) * p;
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

let ctx; // 2D context, set by the engine
function bind(c) { ctx = c; }

function rrect(px, py, w, h, r, fill, stroke, lw) {
  ctx.beginPath(); ctx.roundRect(px, py, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw || 4; ctx.strokeStyle = stroke; ctx.stroke(); }
}
function circle(cx, cy, r, fill, stroke, lw) {
  ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.lineWidth = lw || 4; ctx.strokeStyle = stroke; ctx.stroke(); }
}
// Centered text by default. o = { weight, font, align, base, outline (stroke width), outlineColor }
function text(s, px, py, size, color, o = {}) {
  ctx.font = `${o.weight || 'bold'} ${size}px ${o.font || FONT}`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  if (o.outline) { ctx.lineJoin = 'round'; ctx.lineWidth = o.outline; ctx.strokeStyle = o.outlineColor || C.black; ctx.strokeText(s, px, py); }
  ctx.fillStyle = color; ctx.fillText(s, px, py);
}
function gradient(top, bot, y0 = 0, y1 = H) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot); return g; }
function background(top, bot) { ctx.fillStyle = bot ? gradient(top, bot) : top; ctx.fillRect(-200, -200, W + 400, H + 400); }
function glow(cx, cy, r, color, a = 1) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.globalAlpha = 1;
}
function stars(seed, n, T, y1 = H * .6) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const sx = r() * W, sy = r() * y1, s = r() * 2.6 + .8, f = r() * 6;
    ctx.globalAlpha = .35 + .65 * Math.abs(Math.sin(T * .8 + f));
    circle(sx, sy, s, '#dfe8ff');
  }
  ctx.globalAlpha = 1;
}
// Snow falling: strength = speed multiplier, wind = horizontal drift
function snow(seed, n, T, strength = 1, wind = 0) {
  const r = rng(seed);
  ctx.fillStyle = 'rgba(235,245,255,.85)';
  for (let i = 0; i < n; i++) {
    const v = 120 + r() * 220, sx = r() * W, sy = r() * H, s = 2 + r() * 5;
    const yy = (sy + T * v * strength) % (H + 40) - 20, xx = ((sx + T * wind * (0.6 + r())) % (W + 80) + W + 80) % (W + 80) - 40;
    ctx.beginPath(); ctx.arc(xx, yy, s, 0, 7); ctx.fill();
  }
}
// City skyline. lit = fraction of windows on (0..1); o.wave (0..1) switches windows off in a sweep from the left.
function city(seed, base, height, color, lit, litColor = C.light, o = {}) {
  const r = rng(seed); let px = -40;
  while (px < W + 40) {
    const w = 90 + r() * 120, h = height * (0.45 + r() * 0.75), top = base - h;
    ctx.fillStyle = color; ctx.fillRect(px, top, w, h + 400);
    if (r() < .3) { ctx.fillRect(px + w * .4, top - 40, 6, 40); }
    const cols = Math.max(2, Math.floor(w / 34)), rows = Math.floor(h / 46);
    for (let f = 0; f < rows; f++) for (let c = 0; c < cols; c++) {
      const v = r(), ola = (px / W) * .5 + v * .5;
      const enc = o.wave != null ? ola > o.wave && v < lit : v < lit;
      ctx.fillStyle = enc ? litColor : (o.offWindow || 'rgba(0,0,0,.18)');
      ctx.fillRect(px + 10 + c * ((w - 20) / cols), top + 16 + f * 46, (w - 20) / cols - 10, 24);
    }
    px += w + 4 + r() * 10;
  }
}
// Speech bubble. lines = array of strings, o = { fill, tail (x of the tail), size, color, font }
function bubble(px, py, w, h, lines, o = {}) {
  rrect(px, py, w, h, 36, o.fill || C.white);
  ctx.fillStyle = o.fill || C.white; ctx.beginPath(); const cx = o.tail || px + 80;
  ctx.moveTo(cx, py + h - 2); ctx.lineTo(cx + 40, py + h - 2); ctx.lineTo(cx - 10, py + h + 50); ctx.fill();
  lines.forEach((l, i) => text(l, px + w / 2, py + h / 2 + (i - (lines.length - 1) / 2) * (o.size || 54) * 1.05, o.size || 54, o.color || C.black, { fuente: o.font || FONT }));
}
// Analog clock. h, m = time; o = { frame, face, seconds }
function clock(cx, cy, r, h, m, o = {}) {
  circle(cx, cy, r + 14, o.frame || '#2a2f3a'); circle(cx, cy, r, o.face || C.white);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.lineWidth = i % 3 ? 4 : 9; ctx.strokeStyle = C.black; ctx.beginPath(); ctx.moveTo(cx + Math.sin(a) * r * .82, cy - Math.cos(a) * r * .82); ctx.lineTo(cx + Math.sin(a) * r * .93, cy - Math.cos(a) * r * .93); ctx.stroke(); }
  const ah = (h % 12 + m / 60) / 12 * Math.PI * 2, am = m / 60 * Math.PI * 2;
  ctx.lineCap = 'round'; ctx.lineWidth = r * .07; ctx.strokeStyle = C.black; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(ah) * r * .5, cy - Math.cos(ah) * r * .5); ctx.stroke();
  ctx.lineWidth = r * .045; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(am) * r * .75, cy - Math.cos(am) * r * .75); ctx.stroke();
  if (o.seconds != null) { const as = o.seconds / 60 * Math.PI * 2; ctx.lineWidth = 3; ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(as) * r * .8, cy - Math.cos(as) * r * .8); ctx.stroke(); }
  circle(cx, cy, r * .06, C.red);
}
function beam(cx, cy, ang, len, spread, a) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang); ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, 'rgba(255,240,180,.95)'); g.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(len, -spread); ctx.lineTo(len, spread); ctx.lineTo(0, 20); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1;
}
function room(o = {}) {
  background(o.wall || C.wall); ctx.fillStyle = o.floor || C.floor; ctx.fillRect(-200, 1500, W + 400, 800);
  ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let i = -200; i < W + 200; i += 120) ctx.fillRect(i, 0, 60, 1500);
}
function car(px, py, s, color, o = {}) {
  ctx.save(); ctx.translate(px, py); ctx.scale(s * (o.flip ? -1 : 1), s);
  rrect(-170, -90, 340, 90, 30, color); rrect(-110, -160, 200, 80, 30, color); rrect(-95, -148, 80, 60, 12, '#bcd3e6'); rrect(-5, -148, 80, 60, 12, '#bcd3e6');
  if (o.luggage) { rrect(-90, -200, 90, 40, 8, '#8a5a3a'); rrect(10, -190, 70, 30, 8, '#4a6a8a'); }
  circle(-100, 0, 40, '#1a1a1a'); circle(100, 0, 40, '#1a1a1a'); circle(-100, 0, 16, '#888'); circle(100, 0, 16, '#888');
  rrect(150, -70, 24, 26, 6, '#fff2b0'); rrect(-176, -70, 16, 26, 6, C.red);
  if (o.lights) beam(170, -56, 0, 380, 70, .45);
  ctx.restore();
}
function streetlamp(px, by, T) { ctx.fillStyle = '#2b3140'; ctx.fillRect(px - 8, by - 520, 16, 520); ctx.fillRect(px - 8, by - 520, 90, 14); circle(px + 80, by - 500, 18, C.light); ctx.globalAlpha = .18; ctx.fillStyle = C.light; ctx.beginPath(); ctx.moveTo(px + 66, by - 500); ctx.lineTo(px + 200, by); ctx.lineTo(px - 40, by); ctx.fill(); ctx.globalAlpha = 1; }
function silhouette(px, by, s, c = '#0f141e', look = 1) { ctx.save(); ctx.translate(px, by); ctx.scale(s, s); ctx.fillStyle = c; rrect(-36, -230, 72, 230, 30, c); circle(0, -275 - look * 6, 44, c); ctx.restore(); }
function thermometer(cx, cy, s, degrees) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  rrect(-50, -520, 100, 560, 50, C.white); circle(0, 80, 90, C.white);
  const f = clamp((degrees + 20) / 50); const col = degrees < 0 ? '#4aa3df' : degrees < 10 ? '#7cc0e8' : C.red;
  rrect(-24, 40 - f * 520, 48, f * 520 + 40, 24, col); circle(0, 80, 66, col);
  for (let g = -20; g <= 30; g += 10) { const y = 40 - (g + 20) / 50 * 520; ctx.fillStyle = C.black; ctx.fillRect(54, y - 3, 30, 6); text(g + '°', 150, y, 54, C.white); }
  ctx.restore();
}
function tally(px, py, n, prog, color = '#f4f1e8', scale = 1) {
    // tally marks in groups of five: four strokes and the diagonal
  const total = n * prog; ctx.lineCap = 'round'; ctx.strokeStyle = color; ctx.lineWidth = 9 * scale;
  for (let i = 0; i < Math.ceil(total); i++) {
    const g = Math.floor(i / 5), k = i % 5, row = Math.floor(g / 4), col = g % 4;
    const gx = px + col * 210 * scale, gy = py + row * 190 * scale, f = clamp(total - i);
    ctx.beginPath();
    if (k < 4) { const lx = gx + k * 34 * scale + Math.sin(i * 7) * 3; ctx.moveTo(lx, gy); ctx.lineTo(lx + Math.sin(i) * 4, gy + 130 * scale * f); }
    else { ctx.moveTo(gx - 16 * scale, gy + 110 * scale); ctx.lineTo(gx - 16 * scale + 150 * scale * f, gy + (110 - 90 * f) * scale); }
    ctx.stroke();
  }
}
function hand(cx, cy, s) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); rrect(-120, -40, 240, 360, 110, C.skin); rrect(-150, -80, 70, 170, 35, C.skin); ctx.restore(); }
function phone(cx, cy, s, paint) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  rrect(-230, -470, 460, 940, 60, '#11151d'); rrect(-208, -446, 416, 892, 44, '#1d2533');
  ctx.save(); ctx.beginPath(); ctx.roundRect(-208, -446, 416, 892, 44); ctx.clip(); paint(); ctx.restore();
  rrect(-60, -436, 120, 26, 13, '#11151d');
  ctx.restore();
}
function lerpColor(a, b, t) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const c = [16, 8, 0].map(s => Math.round(lerp(pa >> s & 255, pb >> s & 255, t))); return `rgb(${c.join(',')})`; }
