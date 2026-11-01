import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', 'out', 'package-lock.json']);
const BINARY = /\.(woff2|gif|png|jpg|mp3|m4a|wav|mp4)$/;

function* files(dir) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) yield* files(p); else if (!BINARY.test(e)) yield p;
  }
}

test('no personal paths or credentials are committed', () => {
  const bad = [];
  for (const f of files(ROOT)) {
    if (f.endsWith('hygiene.test.mjs')) continue;
    const text = readFileSync(f, 'utf8');
    for (const re of [/\/Users\/[A-Za-z]/, /\/home\/[a-z]+\//, /C:\\Users\\/, /\bsk-[A-Za-z0-9]{20,}/, /\bghp_[A-Za-z0-9]{20,}/, /\bgho_[A-Za-z0-9]{20,}/, /AIza[0-9A-Za-z_-]{30,}/, /-----BEGIN [A-Z ]*PRIVATE KEY/])
      if (re.test(text)) bad.push(`${path.relative(ROOT, f)} matches ${re}`);
  }
  assert.deepEqual(bad, []);
});

test('no recorded audio is shipped: sounds are generated or supplied by the user', () => {
  const audio = [];
  const walk = d => { for (const e of readdirSync(d)) { if (SKIP.has(e)) continue; const p = path.join(d, e); if (statSync(p).isDirectory()) walk(p); else if (/\.(mp3|m4a|wav|ogg|flac|aiff)$/i.test(e)) audio.push(path.relative(ROOT, p)); } };
  walk(ROOT);
  assert.deepEqual(audio, []);
});

test('only open-licensed fonts are bundled, each with its license file', () => {
  const dir = path.join(ROOT, 'fonts'), names = readdirSync(dir);
  for (const f of names.filter(n => n.endsWith('.woff2'))) {
    const family = f.startsWith('barlow-condensed') ? 'Barlow-Condensed' : f.startsWith('barlow') ? 'Barlow' : f.startsWith('jetbrains') ? 'JetBrains-Mono' : null;
    assert.ok(family, `unexpected font file ${f}`);
    assert.ok(names.includes(`OFL-${family}.txt`), `${f} has no OFL license file`);
  }
});
