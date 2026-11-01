// Scenes for the DAY series example. dayHud() draws the persistent "DAY 3" tag and the clock in the corner of every shot.
const DAY = 3;
function dayHud(time) {
  rrect(40, 40, 230, 90, 18, 'rgba(8,10,14,.8)', 'rgba(255,255,255,.25)', 3); text('DAY ' + DAY, 155, 88, 62, C.light);
  if (time) { rrect(790, 40, 250, 90, 18, 'rgba(8,10,14,.8)', 'rgba(255,255,255,.25)', 3); text(time, 915, 88, 58, C.white, { font: MONO }); }
}
const withHud = (fn) => (p, P, T) => { fn(p, P, T); dayHud(P.time); };

function sea(T, y = 1380) {
  background('#050912', '#0f1a30'); stars(5, 110, T, 1100);
  glow(820, 300, 360, 'rgba(210,225,255,.25)'); circle(820, 300, 70, '#e8eefc');
  ctx.fillStyle = '#0a1426'; ctx.fillRect(-20, y, W + 40, H);
  ctx.strokeStyle = 'rgba(160,190,255,.25)'; ctx.lineWidth = 5;
  for (let i = 0; i < 14; i++) { const yy = y + 40 + i * 38, off = (T * 40 + i * 70) % 160; ctx.beginPath(); for (let x = -160; x < W + 160; x += 160) { ctx.moveTo(x + off, yy); ctx.quadraticCurveTo(x + off + 40, yy - 12, x + off + 80, yy); } ctx.stroke(); }
}
function tower(cx, base, h, on, T) {
  const topW = 120, botW = 230;
  ctx.fillStyle = '#e9e2d3'; ctx.beginPath(); ctx.moveTo(cx - botW / 2, base); ctx.lineTo(cx + botW / 2, base); ctx.lineTo(cx + topW / 2, base - h); ctx.lineTo(cx - topW / 2, base - h); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = '#c0392b'; for (let k = 0; k < 4; k++) ctx.fillRect(cx - 200, base - h * (k * 2 + 1) / 8 - h / 16, 400, h / 8); ctx.restore();
  rrect(cx - 105, base - h - 24, 210, 24, 6, '#2b3140'); rrect(cx - 60, base - h - 150, 120, 126, 10, '#1b2130', '#2b3140', 6);
  if (on) { glow(cx, base - h - 90, 260, 'rgba(255,225,140,.75)'); rrect(cx - 44, base - h - 132, 88, 92, 8, C.light); }
  rrect(cx - 80, base - h - 176, 160, 30, 6, '#b0382d');
  if (on) { const a = T * 1.1; beam(cx, base - h - 88, Math.sin(a) * .22 - .05 + Math.PI * (Math.cos(a) > 0 ? 0 : 1) * 0, 1100, 200, .35); }
}
function rock(cx, y) { ctx.fillStyle = '#1a2233'; ctx.beginPath(); ctx.moveTo(cx - 420, y + 200); ctx.quadraticCurveTo(cx - 300, y - 40, cx - 120, y - 10); ctx.lineTo(cx + 130, y - 10); ctx.quadraticCurveTo(cx + 330, y - 30, cx + 440, y + 200); ctx.closePath(); ctx.fill(); }

ESC.lighthouse = withHud((p, P, T) => {
  sea(T);
  const flick = P.flicker ? (Math.sin(T * 23) > .1 && Math.sin(T * 7.3) > -.5 ? 1 : 0) : 1;
  rock(540, 1340); tower(540, 1330, 760 + 20 * easeOut(p * 2), flick, T);
  hero(300, 1330, .55, { view: 'back', coats: 1, T, look: LOOKS.keeper });
});

ESC.dayCard = withHud((p, P, T) => {
  background('#0a0f1c', '#1b1226'); stars(9, 90, T, H);
  const f = easeOut(p * 3);
  ctx.save(); ctx.translate(540, 900); ctx.scale(.8 + .2 * f, .8 + .2 * f); ctx.globalAlpha = f;
  text('DAY', 0, -330, 250, C.white); text(String(DAY), 0, -20, 520, C.light); text('OF 30', 0, 300, 130, '#9aa3b0');
  ctx.restore(); ctx.globalAlpha = 1;
});

const RULES = ['THE LAMP NEVER GOES OUT BEFORE SIX', 'IF SOMEONE KNOCKS, DO NOT OPEN', 'NEVER COUNT THE KNOCKS'];
ESC.rules = withHud((p, P, T) => {
  background('#1a130d', '#0b0806'); glow(540, 700, 800, 'rgba(255,190,90,.22)');
  rrect(90, 330, 900, 980, 30, '#d8c39a', '#7a5a2e', 14);
  text('RULES', 540, 450, 150, '#3a2a14');
  RULES.forEach((r, i) => {
    const a = i < P.upto ? easeOut(i === P.upto - 1 ? p * 4 : 1) : 0; if (!a) return;
    const y = 640 + i * 230; ctx.globalAlpha = a;
    circle(190, y, 48, '#7a2f2f'); text(String(i + 1), 190, y + 4, 64, C.cream);
    const words = r.split(' '), mid = Math.ceil(words.length / 2);
    text(words.slice(0, mid).join(' '), 270, y - 30, 56, '#2b1d0c', { align: 'left' }); text(words.slice(mid).join(' '), 270, y + 34, 56, '#2b1d0c', { align: 'left' });
    ctx.globalAlpha = 1;
  });
  hero(920, 1800, .75, { expr: 'normal', T, look: LOOKS.keeper });
});

ESC.door = withHud((p, P, T) => {
  room({ wall: '#1d1814', floor: '#0e0b09' });
  rrect(290, 380, 500, 1120, 22, '#4a2f1c', '#2a1a0e', 10);
  for (const y of [560, 900, 1240]) ctx.fillRect(0, 0, 0, 0), rrect(320, y, 440, 18, 6, '#3a2414');
  circle(710, 960, 26, '#d4af37');
  glow(540, 1500, 360, 'rgba(255,200,110,.25)');
  const k = Math.floor(clamp(p * 1.4) * (P.knocks || 1) + .001), shake = (T * 3.3 % 1) < .18 && k < (P.knocks || 1) + 1 ? Math.sin(T * 90) * 6 : 0;
  ctx.save(); ctx.translate(shake, 0);
  hero(260, 1780, 1.1, { view: 'back', coats: 1, T, look: LOOKS.keeper }); ctx.restore();
  if (P.count) { const n = Math.min(P.knocks, 1 + Math.floor(p * P.knocks)); text(String(n), 540, 700, 360, 'rgba(255,255,255,.85)', { outline: 10 }); }
  else if (T % 1 < .5) bubble(560, 220, 420, 130, ['KNOCK'], { size: 90, tail: 700 });
});

ESC.clockFinal = withHud((p, P, T) => {
  background('#1a0c10', '#06060a'); const pulse = 1 + .03 * Math.max(0, Math.sin(T * 9));
  glow(540, 760, 900 * pulse, 'rgba(229,72,77,.35)');
  ctx.save(); ctx.translate(540, 760); ctx.scale(pulse, pulse); ctx.translate(-540, -760);
  clock(540, 760, 330, 4, 52, { cara: C.cream, face: C.cream, seconds: (T * 6) % 60 }); ctx.restore();
  text('04:52', 540, 1170, 200, C.red, { font: MONO });
});

ESC.vote = withHud((p, P, T) => {
  background('#0d1220', '#06080f');
  text('YOUR CALL', 540, 380, 150, C.white); text('COMMENT A OR B', 540, 520, 76, '#9aa3b0');
  [[P.a, 800, '#e0a63a'], [P.b, 1160, '#4a7fc0']].forEach(([w, y, col], i) => {
    const f = easeOut(p * 3 - i * .4), s = 1 + Math.sin(T * 4 + i) * .015;
    ctx.save(); ctx.translate(540, y); ctx.scale(f * s, f * s); rrect(-440, -130, 880, 260, 40, col, '#fff', 6); text(w, 0, 6, 96, '#10151f'); ctx.restore();
  });
});

Object.assign(LOOKS, { keeper: { hair: 'short', top: '#2f4a6b', scarf: '#d9a441', skin: C.skin, hairColor: '#2a1c14', cap: true, pants: '#1f2736' } });
