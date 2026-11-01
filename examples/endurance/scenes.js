// Silhouette scenes for the Endurance example: flat shapes, one color grade per shot, the protagonist always in frame.
const INK = '#080b12';

function sky(P, T) {
  const [a, b] = P.sky || ['#0b1730', '#e8926a'];
  background(a, b); stars(7, 60, T, 700);
  glow(780, 1050, 520, 'rgba(255,214,150,.35)');
}
// A person as a silhouette. o = { hat, walk, arm: 'up'|'down' }; (x, y) = feet.
function man(x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round';
  const w = o.walk != null ? Math.sin(o.walk * 7) * 14 : 0;
  rrect(-26 + w, -110, 22, 112, 8, INK); rrect(4 - w, -110, 22, 112, 8, INK);
  rrect(-40, -270, 80, 170, 30, INK);
  ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(-34, -250); ctx.lineTo(-46 - w * .4, -150); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(34, -250); if (o.arm === 'up') ctx.lineTo(64, -340); else ctx.lineTo(46 + w * .4, -150); ctx.stroke();
  circle(0, -300, 32, INK);
  if (o.hat) { ctx.beginPath(); ctx.ellipse(0, -326, 52, 10, 0, 0, 7); ctx.fill(); rrect(-30, -358, 60, 36, 10, INK); }
  ctx.restore();
}
function ice(y, T, drift = 0) {
  ctx.fillStyle = '#0e1626'; ctx.beginPath(); ctx.moveTo(-20, y);
  for (let x = -20; x <= W + 20; x += 60) ctx.lineTo(x, y + Math.sin(x * .02 + drift) * 12 - (x % 180 === 0 ? 24 : 0));
  ctx.lineTo(W + 20, H + 20); ctx.lineTo(-20, H + 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(190,215,255,.1)'; ctx.fillRect(-20, y + 14, W + 40, 6);
}
function ship(cx, y, tilt, sunk = 0) {
  ctx.save(); ctx.translate(cx, y + sunk); ctx.rotate(tilt); ctx.fillStyle = INK;
  ctx.beginPath(); ctx.moveTo(-250, -70); ctx.lineTo(250, -70); ctx.lineTo(190, 30); ctx.lineTo(-200, 30); ctx.closePath(); ctx.fill();
  rrect(-90, -150, 170, 80, 8, INK); ctx.lineWidth = 12; ctx.strokeStyle = INK;
  for (const mx of [-170, 10, 170]) { ctx.beginPath(); ctx.moveTo(mx, -70); ctx.lineTo(mx, -420); ctx.stroke(); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(mx - 90, -330); ctx.lineTo(mx + 90, -330); ctx.moveTo(mx - 70, -240); ctx.lineTo(mx + 70, -240); ctx.stroke(); ctx.lineWidth = 12; }
  ctx.restore();
}
function dateTag(s) { if (!s) return; ctx.font = `bold 84px ${FONT}`; const w = ctx.measureText(s).width + 70; rrect(540 - w / 2, 200, w, 120, 20, 'rgba(8,11,18,.78)', 'rgba(255,255,255,.7)', 4); text(s, 540, 262, 84, C.white); }

ESC.polar = (p, P, T) => {
  sky(P, T); const iceY = 1240;
  if (P.ship === 'sail' || P.ship === 'trapped' || P.ship === 'tilt') {
    const tilt = P.ship === 'tilt' ? .1 + .5 * easeOut(p) : P.ship === 'trapped' ? .02 : Math.sin(T * 1.2) * .012;
    ship(P.ship === 'sail' ? 420 + (p - .5) * 160 : 420, iceY - 20 + (P.ship === 'tilt' ? 80 * p : 0), tilt, 0);
    if (P.ship !== 'sail') ice(iceY + 8, T);
    else { ctx.fillStyle = '#0d1a30'; ctx.fillRect(-20, iceY, W + 40, H); }
  } else ice(iceY, T);
  if (P.boats) for (let i = 0; i < 3; i++) { const bx = 160 + i * 250 + ((T * 20) % 40), by = iceY + 2; ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(bx - 90, by - 50); ctx.lineTo(bx + 100, by - 50); ctx.lineTo(bx + 60, by); ctx.lineTo(bx - 60, by); ctx.closePath(); ctx.fill(); }
  if (P.crowd) { const n = Math.min(P.crowd, Math.floor(easeOut(p * 2) * P.crowd)); for (let i = 0; i < n; i++) { const r = rng(i * 7 + 3); man(80 + (i % 14) * 68 + r() * 10, iceY + 80 + Math.floor(i / 14) * 130, .42 + Math.floor(i / 14) * .08); } man(540, iceY + 260, 1.1, { hat: true }); }
  else man(P.boats ? 860 : 740, iceY + 150, 1.15, { hat: true, walk: P.boats ? T : null });
  if (P.snow) snow(11, 90, T, .5, -80);
  dateTag(P.date);
};

ESC.ocean = (p, P, T) => {
  sky(P, T); const sea = 1150, amp = 24;
  const wy = x => sea + Math.sin(x * .008 + T * 1.7) * amp + Math.sin(x * .02 - T * 1.1) * amp * .4;
  ctx.fillStyle = '#0a1426'; ctx.beginPath(); ctx.moveTo(-10, H + 10); for (let x = -10; x <= W + 10; x += 20) ctx.lineTo(x, wy(x) + 40); ctx.lineTo(W + 10, H + 10); ctx.fill();
  // lifeboat with six silhouettes, rolling on the swell
  const bx = P.rescue ? 380 + 380 * easeOut(p) : 540, by = wy(bx) + 20, roll = Math.sin(T * 1.7) * .09;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(roll);
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-230, -70); ctx.lineTo(230, -70); ctx.lineTo(150, 40); ctx.lineTo(-150, 40); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, -380); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -370); ctx.lineTo(150, -120); ctx.lineTo(0, -120); ctx.fill();
  for (let i = 0; i < 6; i++) man(-170 + i * 66, -60, .38, { hat: i === 0 });
  ctx.restore();
  ctx.fillStyle = 'rgba(14,30,56,.9)'; ctx.beginPath(); ctx.moveTo(-10, H + 10); for (let x = -10; x <= W + 10; x += 20) ctx.lineTo(x, wy(x + 60) + 80 + Math.sin(T * 2 + x) * 4); ctx.lineTo(W + 10, H + 10); ctx.fill();
  if (P.days) { const d = Math.min(P.days, 1 + Math.floor(p * P.days)); text('DAY ' + d + ' / ' + P.days, 540, 330, 130, C.white, { outline: 12 }); }
};

ESC.mountains = (p, P, T) => {
  sky(P, T);
  const ridge = (base, amp, seed, col) => { const r = rng(seed); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-20, H); let y = base; for (let x = -20; x <= W + 20; x += 60) { y = base - amp * (.4 + r() * .9); ctx.lineTo(x, y); } ctx.lineTo(W + 20, H); ctx.fill(); };
  ridge(1000, 520, 21, '#26324e'); ridge(1180, 440, 22, '#161f35'); ridge(1360, 360, 23, '#232f4d');
  ctx.fillStyle = '#3d4d72'; ctx.fillRect(-20, 1420, W + 40, H);
  const base = 100 + 800 * p;
  for (let i = 0; i < 3; i++) man(base - i * 150, 1560 - i * 12, 1.0 - i * .08, { hat: i === 0, walk: T + i * .4 });
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(base - 30, 1330); ctx.lineTo(base - 160, 1330); ctx.lineTo(base - 300, 1330); ctx.stroke();
  snow(13, 70, T, .4, -60);
};

ESC.stat = (p, P, T) => {
  sky(P, T); ice(1300, T);
  const f = easeOut(p * 3); ctx.save(); ctx.translate(540, 760); ctx.scale(.85 + .15 * f, .85 + .15 * f); ctx.globalAlpha = f;
  text(P.big, 0, 0, P.big.length > 2 ? 520 : 640, C.white, { outline: 18 }); text(P.small, 0, 330, 150, '#ffd7a8', { outline: 12 });
  ctx.restore(); ctx.globalAlpha = 1; man(860, 1450, 1.15, { hat: true });
};

ESC.finale = (p, P, T) => {
  sky(P, T); ice(1300, T);
  const n = Math.min(28, Math.floor(p * 40));
  for (let i = 0; i < 28; i++) { const x = 120 + (i % 7) * 140, y = 520 + Math.floor(i / 7) * 150; circle(x, y, 48, i < n ? '#ffd7a8' : 'rgba(255,255,255,.12)'); if (i < n) { circle(x, y - 8, 14, INK); rrect(x - 22, y + 8, 44, 30, 14, INK); } }
  text('28 / 28', 540, 1160, 200, C.white, { outline: 14 }); man(900, 1500, 1.0, { hat: true, arm: 'up' });
};
