// Built-in scenes. A scene is ESC.name = (p, P, T) => { ... } that draws one whole shot:
//   p = progress through the shot (0..1), P = the params from plan.js, T = absolute time in seconds (for things that never stop moving).
// The same T always produces the same frame, so you can check any second without rendering the video.
// Projects add their own scenes with ESC.myScene = ... and their characters with Object.assign(LOOKS, {...}).
const ESC = {};
ESC.planet = (p, P, T) => {
  background('#05070d', '#0d1424'); stars(3, 160, T, H);
  const sun = 1 - ease(p * 1.4);
  if (P.sun) { glow(80, 420, 420 * sun + 10, 'rgba(255,200,90,.8)'); circle(80, 420, 120 * sun, '#ffd166'); }
  const cx = 560, cy = 1000, r = 400;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
  ctx.fillStyle = '#2b5a8a'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const rot = T * 10;
  const cont = [[-120, -150, 150], [80, -40, 120], [-40, 160, 130], [190, 170, 90], [-230, 40, 80], [140, -230, 70]];
  for (const [a, b, s] of cont) { const xx = cx + ((a + rot + 600) % 900) - 450; circle(xx, cy + b, s, '#3f8f5a'); circle(xx + s * .5, cy + b + s * .3, s * .6, '#3f8f5a'); }
  const dark = P.dark != null ? P.dark : ease(p * 1.3);
  ctx.fillStyle = `rgba(4,8,18,${.15 + .8 * dark})`; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  if (dark > .5) { const rr2 = rng(9); for (let i = 0; i < 70; i++) { const a = rr2() * 7, d = Math.sqrt(rr2()) * r; ctx.globalAlpha = (dark - .5) * 2 * (.4 + .6 * rr2()); circle(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3, C.light); } ctx.globalAlpha = 1; }
  ctx.restore();
  glow(cx, cy, r * 1.25, 'rgba(90,150,255,.15)');
};
ESC.calendar = (p, P, T) => {
  background('#2b303b', '#1d212a');
  const n = Math.round(lerp(P.from || 1, P.to || 2, ease(p)));
  rrect(290, 520, 500, 600, 30, C.cream); rrect(290, 520, 500, 140, 30, C.red); ctx.fillStyle = C.red; ctx.fillRect(290, 600, 500, 60);
  text(P.month || 'NOV', 540, 592, 96, C.white); text(String(n), 540, 880, 300, '#3a3f4b'); text(P.day || '', 540, 1050, 60, '#8a8f99');
  circle(380, 520, 16, '#555'); circle(700, 520, 16, '#555');
  if (P.cross) { const f = easeOut((p - .3) * 2); ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(330, 700); ctx.lineTo(330 + 420 * f, 700 + 380 * f); ctx.stroke(); if (f > .5) { const g = (f - .5) * 2; ctx.beginPath(); ctx.moveTo(750, 700); ctx.lineTo(750 - 420 * g, 700 + 380 * g); ctx.stroke(); } }
};
ESC.face = (p, P, T) => {
  background(P.bg || '#2b3346', P.bg2 || '#1b2130');
  if (P.glow) glow(540, 900, 900, P.glow, .9);
  hero(540, 2240 - easeOut(p * 3) * 40, 3.3, { expr: P.expr || 'scared', T, gaze: P.gaze || 0, coats: P.coats || 0, look: P.look ? LOOKS[P.look] : undefined });
  if (P.heartbeat) { const b = 1 + .12 * Math.max(0, Math.sin(T * 9)); ctx.save(); ctx.translate(540, 1720); ctx.scale(b, b); ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(0, 40); ctx.bezierCurveTo(-90, -30, -50, -100, 0, -55); ctx.bezierCurveTo(50, -100, 90, -30, 0, 40); ctx.fill(); ctx.restore(); }
};
ESC.phone = (p, P, T) => {
  background('#202737', '#121722');
  hand(560, 1700, 1.4);
  phone(540, 980, 1.25, () => {
    ctx.fillStyle = gradient('#1c2a4a', '#0e1424', -446, 446); ctx.fillRect(-208, -446, 416, 892);
    text(P.time || '07:04', 0, -230, 150, C.white, { weight: '300', font: FONT2 });
    text(P.date || 'Tuesday, November 3', 0, -130, 30, '#c9d3e6', { weight: '500', font: FONT2 });
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#fff'; ctx.fillRect(120 + i * 16, -400 - i * 8, 10, 14 + i * 8); }
  });
};
ESC.street = (p, P, T) => {
  background('#0a0f1c', '#1d2a44'); stars(13, 70, T, 700);
  city(41, 1250, 600, '#1a2233', .55, C.light);
  ctx.fillStyle = '#2a2f3a'; ctx.fillRect(-50, 1250, W + 100, 700); ctx.fillStyle = '#3a404c'; ctx.fillRect(-50, 1250, W + 100, 60);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = '#d8d2c2'; ctx.fillRect(i * 160 - ((T * 60) % 160), 1560, 90, 14); }
  streetlamp(150, 1300, T); streetlamp(860, 1300, T);
  if (P.cars) { car(300 + Math.sin(T) * 6, 1520, 1, C.red, { lights: true }); car(820, 1700, 1.15, '#4a7fc0', { lights: true }); }
  if (P.honks) { const k = Math.floor(T * 3) % 2; bubble(80 + k * 500, 1140 - k * 60, 300, 110, ['HONK!'], { size: 70, tail: 160 + k * 500 }); }
  if (P.crowd) { silhouette(240, 1500, 1.3); silhouette(520, 1540, 1.4); silhouette(800, 1510, 1.25); silhouette(660, 1480, 1.1, '#141a26'); }
};
ESC.clockSpin = (p, P, T) => {
  background('#1e2433', '#121722');
  const v = P.speed || 4, m = (p * 60 * v) % 60, h = 7 + p * v;
  clock(540, 900, 330, h, m, { face: C.cream });
  for (let i = 0; i < 6; i++) { ctx.globalAlpha = .12; ctx.lineWidth = 14; ctx.strokeStyle = C.white; ctx.beginPath(); ctx.arc(540, 900, 380 + i * 30, T * 3 + i, T * 3 + i + 1); ctx.stroke(); } ctx.globalAlpha = 1;
};
ESC.cityLights = (p, P, T) => {
  background('#070a12', '#121a2b'); stars(19, 120, T, 900);
  city(71, 1500, 900, '#141b29', .7, C.light, { wave: ease(p * 1.2) });
  ctx.fillStyle = '#0d1018'; ctx.fillRect(-50, 1500, W + 100, 600);
};
ESC.thermometer = (p, P, T) => {
  background('#14202c', '#0b1118');
  const g = lerp(P.from, P.to, ease(p));
  thermometer(440, 1150, 1.3, g);
  text(Math.round(g) + '°C', 820, 520, 160, g < 0 ? '#7cc0e8' : C.white);
  const frost = clamp((5 - g) / 20);
  ctx.globalAlpha = frost * .8; for (const [cx, cy] of [[0, 0], [W, 0], [0, H], [W, H]]) glow(cx, cy, 700, 'rgba(190,230,250,.9)'); ctx.globalAlpha = 1;
  snow(23, 40 * frost, T, .6);
};
ESC.tally = (p, P, T) => {
  background(P.day ? '#b9b2a6' : '#3a3d45');
  ctx.globalAlpha = .08; const r = rng(31); for (let i = 0; i < 300; i++) { ctx.fillStyle = r() < .5 ? '#fff' : '#000'; ctx.fillRect(r() * W, r() * H, 3 + r() * 8, 3 + r() * 8); } ctx.globalAlpha = 1;
  if (!P.day) glow(540, 1000, 900, 'rgba(255,190,90,.25)');
  const n = P.total || 40, from = (P.from || 0) / n, to = (P.to ?? n) / n;
  ctx.save(); ctx.translate(540, 900); const sc = n > 20 ? .9 : 1.3; ctx.scale(sc, sc); ctx.translate(-400, -500);
  tally(0, 0, n, lerp(from, to, ease(p)), P.day ? '#fbfaf5' : '#f4f1e8');
  ctx.restore();
};
ESC.sunrise = (p, P, T) => {
  const a = ease(p * 1.1);
  background(lerpColor('#0b1120', '#5fa8e0', a), lerpColor('#1d2a44', '#ffb36b', a));
  if (a < .6) stars(67, 120, T, 1100);
  ctx.globalAlpha = .6 + .4 * a; glow(540, 1250, 1100 * a + 60, 'rgba(255,150,70,.95)'); ctx.globalAlpha = 1;
  circle(540, 1320 - 260 * a, 150, '#ffd27a');
  ctx.fillStyle = lerpColor('#0f1622', '#3b4456', a); ctx.fillRect(-50, 1250, W + 100, 800);
  city(71, 1300, 520, lerpColor('#141b29', '#4d566a', a), .05 * (1 - a), C.light);
};
ESC.dialogue = (p, P, T) => {
  room({ wall: '#c8bca6', floor: '#8a7a62' }); glow(540, 500, 1000, 'rgba(255,230,170,.45)');
  hero(540, 1780, 1.35, { expr: P.expr || 'surprised', T, coats: 1 });
  if (P.lines) { const f = easeOut(p * 3); ctx.globalAlpha = f; bubble(70, 160, 940, 70 + P.lines.length * 82, P.lines, { size: 70, tail: 420, fill: '#fff4d6' }); ctx.globalAlpha = 1; }
};
ESC.title = (p, P, T) => {
  background(P.top || '#0b0f18', P.bottom || '#151c2a');
  if (P.stars) stars(73, 120, T, H);
  const f = easeOut(p * 3); ctx.globalAlpha = f; ctx.save(); ctx.translate(540, 940); ctx.scale(.85 + .15 * f, .85 + .15 * f);
  const size = P.size || 170; (P.lines || []).forEach((l, i, a) => text(l, 0, (i - (a.length - 1) / 2) * size, size, P.color || C.white));
  ctx.restore(); ctx.globalAlpha = 1;
};
const LOOKS = {}; // projects register their characters here: Object.assign(LOOKS, { NAME: { hair, top, scarf, skin, hairColor, cap, pants, hood, glasses, badge } })
