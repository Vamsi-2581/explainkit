import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync, mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare } from '../src/project.mjs';
import { openStage, video } from '../src/render.mjs';
import { mix } from '../src/mix.mjs';
import { duration, run } from '../src/util.mjs';

const EXAMPLES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'examples');

for (const name of readdirSync(EXAMPLES)) {
  test(`example "${name}": every shot renders without page errors, at the start, middle and end of the shot`, async () => {
    const d = prepare(path.join(EXAMPLES, name)), st = await openStage(d);
    try {
      const hashes = new Set();
      for (const s of d.shots) for (const f of [.05, .5, .95]) {
        const t = s.s + (s.e - s.s) * f, buf = await st.frame(Math.min(t, d.fin - .01));
        assert.ok(buf.length > 8000, `${name}: frame at ${t.toFixed(1)} s is nearly empty (${buf.length} bytes)`);
        hashes.add(buf.length + ':' + buf.subarray(2000, 2064).toString('hex'));
      }
      assert.deepEqual(st.errors, [], `${name}: errors in the page`);
      assert.ok(hashes.size > d.shots.length, `${name}: shots look identical to each other`);
    } finally { await st.close(); }
  });
}

test('the same time always gives the same frame (stills are reproducible)', async () => {
  const d = prepare(path.join(EXAMPLES, 'boat')), st = await openStage(d);
  try { const a = await st.frame(20.3), b = await st.frame(20.3); assert.ok(a.equals(b)); } finally { await st.close(); }
});

test('an unknown scene name is reported with its name', async () => {
  const d = prepare(path.join(EXAMPLES, 'boat')); d.shots[0].scene = 'doesNotExist';
  const st = await openStage(d);
  try { await assert.rejects(() => st.frame(0.5), /unknown scene: doesNotExist/); } finally { await st.close(); }
});

test('mix without narration makes an audio track of the video length, near the target loudness', () => {
  const dir = path.join(EXAMPLES, 'lighthouse'), d = prepare(dir);
  const r = mix(dir, { voice: null, total: Math.min(d.fin, 12) });
  assert.ok(Math.abs(duration(r.file) - 12) < 0.2, `duration ${duration(r.file)}`);
  const l = run('ffmpeg', ['-v', 'info', '-i', r.file, '-af', 'ebur128', '-f', 'null', '-'], { stdio: ['ignore', 'pipe', 'pipe'] }).stderr;
  const lufs = Number(/Integrated loudness:\s+I:\s+(-?[\d.]+)/.exec(l)?.[1]);
  assert.ok(lufs > -17 && lufs < -11, `integrated loudness ${lufs} LUFS`);
});

test('a 2 second clip renders to a 1080x1920 H.264 file with sound', async () => {
  const dir = path.join(EXAMPLES, 'boat'), d = prepare(dir), out = mkdtempSync(path.join(tmpdir(), 'ek-'));
  const m = mix(dir, { voice: null, total: d.fin });
  const r = await video(d, out, { audio: m.file, from: 10, to: 12, log: () => {} });
  const p = run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-of', 'csv=p=0', r.file]).stdout;
  assert.match(p, /h264,1080,1920/); assert.match(p, /aac/);
  assert.ok(Math.abs(duration(r.file) - 2) < 0.2);
});
