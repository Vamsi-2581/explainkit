// The built-in articulated character. s = 1 means a head radius of 90 px; (cx, by) is the point between the feet.
// o = { expr: normal|surprised|scared|sad|crying|determined|relieved|asleep, view: front|back, coats (0-3, each one puffs the body up),
//       arms: down|up|typing|hug|cover, walk (0..1 phase, makes it step), gaze (-1..1), T (time, for blinking), look }
// look = { hair: long|short, top, scarf, skin, hairColor, cap, pants, hood, glasses, badge } (see LOOKS in scenes.js)
function hero(cx, by, s, o = {}) {
  const T = o.T || 0, coats = o.coats || 0, L = Object.assign({ hair: 'long', top: C.sweater, scarf: C.scarf, skin: C.skin, hairColor: C.hair, cap: false, pants: C.pants }, o.look || {});
  ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
  const bob = o.walk != null ? Math.abs(Math.sin(o.walk * 6)) * 6 : Math.sin(T * 2) * 2;
  // legs
  const stride = o.walk != null ? Math.sin(o.walk * 6) * 18 : 0;
  rrect(-46 + stride, -120, 36, 120, 14, L.pants); rrect(10 - stride, -120, 36, 120, 14, L.pants);
  rrect(-52 + stride, -14, 46, 18, 8, '#1a1d24'); rrect(8 - stride, -14, 46, 18, 8, '#1a1d24');
  ctx.translate(0, -bob);
  // body and coats (each coat inflates the silhouette)
  const layers = [L.top, '#6b4f3a', '#3e5c76', '#7a3b3b'];
  for (let i = coats; i >= 0; i--) { const e = i * 16; rrect(-78 - e, -300 - e * .4, 156 + e * 2, 200 + e * .8, 50 + e, layers[i]); }
  // arms
  const arms = o.arms || 'down', halfWidth = 78 + coats * 16;
  ctx.lineCap = 'round'; ctx.lineWidth = 34 + coats * 4; ctx.strokeStyle = layers[coats];
  const arm = (side, ang, len = 120) => { ctx.beginPath(); ctx.moveTo(side * (halfWidth - 12), -270); ctx.lineTo(side * (halfWidth - 12) + Math.sin(ang) * len * side, -270 + Math.cos(ang) * len); ctx.stroke(); circle(side * (halfWidth - 12) + Math.sin(ang) * len * side, -270 + Math.cos(ang) * len, 20, L.skin); };
  if (arms === 'typing') { arm(-1, 1.2, 100); arm(1, 1.2, 100); }
  if (arms === 'down') { arm(-1, .25); arm(1, .25); }
  else if (arms === 'up') { arm(-1, 2.6 + Math.sin(T * 8) * .1); arm(1, 2.6 - Math.sin(T * 8) * .1); }
  else if (arms === 'hug') { ctx.beginPath(); ctx.moveTo(-halfWidth + 10, -260); ctx.quadraticCurveTo(0, -170, halfWidth - 10, -260); ctx.stroke(); }
  else if (arms === 'cover') { arm(-1, 2.9, 100); arm(1, 2.9, 100); }
  // scarf
  if (L.scarf) { rrect(-62 - coats * 6, -318 - coats * 4, 124 + coats * 12, 40, 18, L.scarf); if (o.view !== 'back' && L.hair === 'long') rrect(22, -296, 30, 80, 12, L.scarf); }
  if (L.badge && o.view !== 'back') { circle(-40, -250, 12, C.red); }
  // head
  const hy = -400 - coats * 4;
  const CP = L.hairColor;
  if (o.view === 'back') {
    circle(0, hy, 96, CP);
    if (L.hair === 'long') { rrect(-96, hy, 192, 90, 40, CP); circle(-40, hy - 70, 34, '#3d2c22'); } else { rrect(-90, hy, 180, 50, 30, CP); }
    if (L.hood) { circle(0, hy + 10, 104, L.top); circle(0, hy - 6, 90, CP); }
  } else {
    if (L.hood) circle(0, hy + 6, 112, L.top);
    if (L.hair === 'long') rrect(-100, hy - 10, 200, 120, 50, CP);
    circle(0, hy, 90, L.skin);
    ctx.fillStyle = CP; ctx.beginPath();
    if (L.hair === 'long') { ctx.arc(0, hy - 6, 96, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(40, hy - 50, 0, hy - 30); ctx.quadraticCurveTo(-50, hy - 60, -95, hy - 10); ctx.fill(); circle(-40, hy - 92, 30, '#3d2c22'); }
    else { ctx.arc(0, hy - 4, 94, Math.PI * 1.0, Math.PI * 2.0); ctx.lineTo(92, hy - 20); ctx.quadraticCurveTo(30, hy - 46, -20, hy - 34); ctx.quadraticCurveTo(-60, hy - 40, -92, hy - 14); ctx.fill(); }
    if (L.cap) { ctx.fillStyle = '#3d4a2e'; ctx.beginPath(); ctx.ellipse(0, hy - 70, 112, 46, 0, Math.PI, 0); ctx.fill(); rrect(-120, hy - 76, 240, 26, 12, '#2c3621'); circle(0, hy - 92, 14, C.red); }
    drawFace(0, hy, o.expr || 'normal', T, o.gaze || 0);
    if (L.glasses) { ctx.lineWidth = 6; circle(-34, hy + 6, 26, null, '#222', 6); circle(34, hy + 6, 26, null, '#222', 6); ctx.beginPath(); ctx.moveTo(-8, hy + 6); ctx.lineTo(8, hy + 6); ctx.stroke(); }
  }
  ctx.restore();
}
function drawFace(cx, cy, expr, T, gaze) {
  const eyes = { normal: [17, 9], surprised: [24, 7], scared: [25, 6], sad: [16, 8], crying: [16, 8], determined: [16, 9], relieved: [0, 0], asleep: [0, 0] }[expr] || [17, 9];
  const blink = (T % 3.7) < .12 ? .15 : 1;
  for (const side of [-1, 1]) {
    const ex = cx + side * 34, ey = cy + 6;
    if (expr === 'relieved' || expr === 'asleep') { ctx.lineWidth = 6; ctx.strokeStyle = C.black; ctx.beginPath(); ctx.arc(ex, ey + (expr === 'relieved' ? 6 : 0), 13, Math.PI * 1.1, Math.PI * 1.9, expr === 'asleep'); ctx.stroke(); continue; }
    ctx.save(); ctx.translate(ex, ey); ctx.scale(1, blink);
    circle(0, 0, eyes[0], C.white); circle(gaze * 6, 0, eyes[1], C.black); circle(gaze * 6 + 3, -3, 3, '#fff');
    ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = C.hair; ctx.lineCap = 'round'; ctx.beginPath();
    if (expr === 'sad' || expr === 'crying' || expr === 'scared') { ctx.moveTo(ex - 16 * side, ey - 34); ctx.lineTo(ex + 14 * side, ey - 42); }
    else if (expr === 'determined') { ctx.moveTo(ex - 16 * side, ey - 42); ctx.lineTo(ex + 14 * side, ey - 32); }
    else { ctx.moveTo(ex - 14, ey - 38); ctx.quadraticCurveTo(ex, ey - 46, ex + 14, ey - 38); }
    ctx.stroke();
  }
  circle(cx - 58, cy + 34, 15, C.cheek); circle(cx + 58, cy + 34, 15, C.cheek);
  ctx.lineWidth = 6; ctx.strokeStyle = C.black; ctx.fillStyle = '#7a2f2f'; ctx.beginPath();
  const my = cy + 52;
  if (expr === 'surprised' || expr === 'scared') { ctx.ellipse(cx, my + 4, 12, expr === 'scared' ? 14 + Math.sin(T * 20) * 2 : 18, 0, 0, 7); ctx.fill(); ctx.stroke(); }
  else if (expr === 'sad' || expr === 'crying') { ctx.arc(cx, my + 18, 18, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else if (expr === 'determined') { ctx.moveTo(cx - 16, my + 4); ctx.lineTo(cx + 16, my + 4); ctx.stroke(); }
  else if (expr === 'relieved') { ctx.arc(cx, my - 6, 20, Math.PI * .15, Math.PI * .85); ctx.stroke(); }
  else { ctx.arc(cx, my - 4, 14, Math.PI * .2, Math.PI * .8); ctx.stroke(); }
  if (expr === 'crying' || expr === 'relieved') {
    ctx.fillStyle = 'rgba(120,190,255,.9)';
    for (const side of [-1, 1]) for (let k = 0; k < 2; k++) { const f = ((T * .9 + k * .5) % 1); ctx.beginPath(); ctx.ellipse(cx + side * 40, cy + 24 + f * 70, 6, 9, 0, 0, 7); ctx.fill(); }
  }
}
