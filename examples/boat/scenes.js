// Scenes for the boat example. Plain canvas code on top of the engine globals (background, rrect, circle, text, glow...).
const SEA = 1010; // y of the calm waterline

function wave(x, T, amp) { return SEA + Math.sin(x * .011 + T * 2.1) * amp + Math.sin(x * .027 - T * 1.3) * amp * .5; }
function waterBack() { background('#16345c', '#07111f'); glow(540, 360, 700, 'rgba(255,214,140,.18)'); }
function waterFront(T, amp, tint = 'rgba(40,120,200,.55)') {
  ctx.beginPath(); ctx.moveTo(-10, H + 10);
  for (let x = -10; x <= W + 10; x += 20) ctx.lineTo(x, wave(x, T, amp));
  ctx.lineTo(W + 10, H + 10); ctx.closePath();
  const g = ctx.createLinearGradient(0, SEA, 0, H); g.addColorStop(0, tint); g.addColorStop(1, 'rgba(8,24,52,.92)');
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(190,230,255,.55)'; ctx.beginPath();
  for (let x = -10; x <= W + 10; x += 20) x < 0 ? ctx.moveTo(x, wave(x, T, amp)) : ctx.lineTo(x, wave(x, T, amp));
  ctx.stroke();
}

// Hull in local coordinates: origin = middle of the bottom, front points to +x. o = { wall, keel, bow, cargo }
function hull(o = {}) {
  const w = 440, wall = o.wall ?? 120, bow = o.bow ?? 0;
  ctx.fillStyle = '#8f9db3'; ctx.strokeStyle = '#d7e0ee'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-w / 2, -wall); ctx.lineTo(-w / 2 + 40, 0); ctx.lineTo(w / 2 - 40, 0);
  if (bow) { ctx.lineTo(w / 2 + bow, -wall); } else ctx.lineTo(w / 2, -wall);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5c6a80'; ctx.fillRect(-w / 2 + 20, -wall, w - 40 + (bow ? bow : 0), 18); // rim
  if (o.keel) { ctx.fillStyle = '#b5532f'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(90, 0); ctx.lineTo(30, 150); ctx.lineTo(-30, 150); ctx.closePath(); ctx.fill(); }
  if (o.cargo != null) { rrect(o.cargo - 55, -wall - 100, 110, 100, 10, '#d9a441', '#8a6420', 5); rrect(o.cargo - 55, -wall - 62, 110, 12, 4, '#8a6420'); }
}

ESC.tank = (p, P, T) => {
  waterBack();
  const o = P.obj, amp = o === 'low' ? 26 : 12;
  const ease3 = easeOut(Math.min(1, p * 2.4));
  if (o === 'block') {
    const y = lerp(560, 1520, easeOut(clamp((p - .12) * 1.5)));
    rrect(390, y - 150, 300, 300, 18, '#8f9db3', '#d7e0ee', 6); text('STEEL', 540, y, 80, '#2b3445');
    waterFront(T, 10);
    for (let i = 0; i < 9; i++) { const f = (T * .8 + i * .37) % 1; if (p > .2) circle(430 + (i * 53) % 230, 1500 - f * 500, 5 + (i % 3) * 3, null, 'rgba(210,235,255,.6)', 3); }
  } else if (o === 'bowl' || o === 'ship') {
    const bob = Math.sin(T * 1.8) * 9, cx = 540, cy = SEA + 36 + bob;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(ease3, ease3);
    hull({ wall: 130, bow: o === 'ship' ? 70 : 0, keel: o === 'ship', cargo: o === 'ship' ? -80 : null });
    if (o === 'ship') { rrect(60, -270, 90, 140, 8, '#e9e2d3', '#8a8f99', 4); rrect(80, -300, 50, 36, 6, '#c0392b'); }
    ctx.restore();
    waterFront(T, amp);
    if (P.arrows) { // weight vs push: equal arrows
      const a = easeOut((p - .1) * 3);
      ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(300, 760); ctx.lineTo(300, 760 + 220 * a); ctx.stroke(); text("WEIGHT", 300, 710, 56, C.red);
      ctx.strokeStyle = C.green; ctx.beginPath(); ctx.moveTo(780, 1230); ctx.lineTo(780, 1230 - 220 * a); ctx.stroke(); text("PUSH", 780, 1270, 56, C.green);
    }
  } else if (o === 'low' || o === 'high') {
    const wall = o === 'low' ? 56 : 230, bob = Math.sin(T * 1.8) * 8, cx = 540, cy = SEA + 60 + bob;
    // water that comes over the rim fills the hull (only with low walls)
    ctx.save(); ctx.translate(cx, cy); hull({ wall });
    if (o === 'low') { const lvl = Math.min(wall - 8, p * 150); ctx.fillStyle = 'rgba(40,120,200,.8)'; ctx.fillRect(-190, -lvl, 380, lvl); }
    ctx.restore();
    waterFront(T, amp);
    if (o === 'low') for (let i = 0; i < 5; i++) { const f = (T * 1.4 + i * .2) % 1; ctx.globalAlpha = 1 - f; circle(340 + i * 55 + f * 30, SEA - 30 - Math.sin(f * 3.14) * 150, 10, 'rgba(210,235,255,.9)'); ctx.globalAlpha = 1; }
    if (o === 'high') { ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.setLineDash([16, 14]); ctx.beginPath(); ctx.moveTo(250, cy - 150); ctx.lineTo(830, cy - 150); ctx.stroke(); ctx.setLineDash([]); text("ROOM TO SPARE", 540, cy - 290, 60, '#cfe8ff'); }
  } else if (o === 'flip' || o === 'keel') {
    const keel = o === 'keel';
    // tilt: without a keel the boat keeps rolling over; with one it leans, then comes back
    const lean = keel ? Math.sin(clamp(p * 2.2) * Math.PI) * .32 * (1 - clamp((p - .45) * 2)) : easeOut(clamp(p * 1.1)) * 2.6;
    const cx = 540, cy = SEA + 40 + (keel ? 0 : Math.min(260, lean * 120));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(lean); hull({ wall: 130, keel, cargo: -130 }); ctx.restore();
    waterFront(T, 12);
    if (keel) { const a = easeOut(p * 3); ctx.globalAlpha = a; text("HEAVY PART LOW", 540, 680, 84, '#ffd7a8'); ctx.globalAlpha = 1; }
  } else if (o === 'blunt' || o === 'sharp') {
    const sharp = o === 'sharp', cx = 480, cy = SEA + 40 + Math.sin(T * 1.8) * 6;
    ctx.save(); ctx.translate(cx, cy); hull({ wall: 130, bow: sharp ? 110 : 0 }); ctx.restore();
    waterFront(T, 10);
    const bowX = cx + 220 + (sharp ? 110 : 0);
    if (!sharp) { // water piles up in front of a blunt bow
      for (let i = 0; i < 6; i++) { const f = (T * 1.1 + i / 6) % 1; ctx.globalAlpha = 1 - f; circle(bowX + 10 + f * 70, SEA - 10 - Math.sin(f * 3.1) * 90 - i * 6, 14 - f * 6, '#e8f6ff'); }
      ctx.globalAlpha = 1; text('PILES UP', 760, 700, 74, '#ffb4a8');
    } else { // streamlines slide past a sharp one
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(210,235,255,.8)';
      for (let k = 0; k < 4; k++) { ctx.beginPath(); const yy = SEA + 20 + k * 38; ctx.moveTo(bowX + 160, yy - 8 * k); ctx.quadraticCurveTo(bowX + 40, yy - 40 - k * 6, bowX - 120 + k * 8, yy + 20 + k * 12); ctx.stroke(); }
      text('SLIDES PAST', 760, 700, 74, '#b8f0cf');
    }
    for (let i = 0; i < 6; i++) { const x1 = ((i * 190 - T * 260) % 1200 + 1200) % 1200 - 60; ctx.globalAlpha = .45; ctx.fillStyle = '#fff'; ctx.fillRect(x1, 1320 + (i % 3) * 70, 110, 5); }
    ctx.globalAlpha = 1;
  }
};

ESC.density = (p, P, T) => {
  background('#10243f', '#0a1220');
  const a = easeOut(p * 2.2), b = easeOut((p - .25) * 2.2);
  const base = 1010, unit = 80; // px per g/cm3
  rrect(220, base - 7.85 * unit * a, 260, 7.85 * unit * a, 18, '#8f9db3', '#d7e0ee', 6);
  rrect(600, base - 1 * unit * b, 260, 1 * unit * b, 18, '#3b8fd9', '#9bd0ff', 6);
  text("STEEL", 350, base + 56, 76, C.white); text("WATER", 730, base + 56, 76, C.white);
  if (a > .95) text('7.85', 350, base - 7.85 * unit - 60, 120, '#d7e0ee');
  if (b > .95) text('1.0', 730, base - unit - 60, 120, '#9bd0ff');
  text('DENSITY, g/cm³', 540, 230, 76, '#cfe8ff');
};

ESC.card = (p, P, T) => {
  const fix = P.kind === 'FIX', ac = fix ? '#5fe39b' : '#ff7a6b';
  background(fix ? '#0c2a22' : '#2e1414', '#06090f');
  const f = easeOut(p * 4);
  ctx.save(); ctx.translate(540, 700); ctx.scale(.8 + .2 * f, .8 + .2 * f); ctx.globalAlpha = f;
  rrect(-330, -420, 660, 840, 54, 'rgba(0,0,0,.35)', ac, 10);
  text(P.kind, 0, -300, 120, ac); text(String(P.n), 0, -60, 400, C.white);
  for (let i = 0; i < 4; i++) rrect(-190 + i * 100, 230, 80, 18, 9, i < P.n ? ac : 'rgba(255,255,255,.2)');
  ctx.restore(); ctx.globalAlpha = easeOut(p * 3 - .5);
  text(P.line, 540, 1190, P.line.length > 14 ? 100 : 128, ac);
  ctx.globalAlpha = 1;
};

ESC.vote = (p, P, T) => {
  background('#10243f', '#0a1220');
  text('SOLVE NEXT', 540, 360, 130, C.white); text('COMMENT ONE WORD', 540, 500, 70, '#9bd0ff');
  [[P.a, 780, '#e0a63a'], [P.b, 1180, '#4a7fc0']].forEach(([w, y, col], i) => {
    const f = easeOut(p * 3 - i * .4), s = 1 + (Math.sin(T * 4 + i) * .015);
    ctx.save(); ctx.translate(540, y); ctx.scale(f * s, f * s); rrect(-340, -140, 680, 280, 40, col, '#fff', 6); text(w, 0, 6, 170, '#10151f'); ctx.restore();
  });
};
