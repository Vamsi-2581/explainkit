// Procedural sounds made with ffmpeg's generators: nothing to download and no rights to clear, because every sample is
// computed from sine waves and noise at build time. Use them as placeholders or as simple beds under a voice.
//   synth:pad    soft major chord, slow swell
//   synth:drone  low, tense minor second
//   synth:boom   impact hit
//   synth:tick   short click
//   synth:rise   noise riser (about 3 s)
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { ffmpeg } from './util.mjs';

const SR = 48000;
const chord = (freqs, amp, swell) => freqs.map(f => `${amp}*sin(2*PI*${f}*t)`).join('+') + `)*(0.78+0.22*sin(2*PI*${swell}*t))`;
const PRESETS = {
  pad: { dur: true, expr: () => [`(${chord([110, 164.81, 220, 277.18, 329.63], .11, .09)}`, `(${chord([110.4, 165.2, 220.6, 277.9, 330.4], .11, .11)}`] },
  drone: { dur: true, expr: () => [`(${chord([55, 58.27, 110, 116.54], .16, .07)}`, `(${chord([55.3, 58.6, 110.5, 117], .16, .06)}`] },
  boom: { dur: false, len: 2.2, expr: () => ['0.9*sin(2*PI*(52+90*exp(-14*t))*t)*exp(-2.4*t)+0.35*(random(0)*2-1)*exp(-18*t)', '0.9*sin(2*PI*(52+90*exp(-14*t))*t)*exp(-2.4*t)+0.35*(random(1)*2-1)*exp(-18*t)'] },
  tick: { dur: false, len: 0.25, expr: () => ['0.7*sin(2*PI*1800*t)*exp(-60*t)', '0.7*sin(2*PI*1800*t)*exp(-60*t)'] },
  rise: { dur: false, len: 3, expr: () => ['0.5*(random(0)*2-1)*pow(t/3,3)', '0.5*(random(1)*2-1)*pow(t/3,3)'] },
};

export const isSynth = f => typeof f === 'string' && f.startsWith('synth:');

// returns the path of a wav file for "synth:name" (created in cacheDir the first time)
export function synth(spec, cacheDir, seconds = 60) {
  const name = spec.slice(6), p = PRESETS[name];
  if (!p) throw new Error(`unknown synth sound "${name}". Available: ${Object.keys(PRESETS).map(k => 'synth:' + k).join(', ')}`);
  mkdirSync(cacheDir, { recursive: true });
  const len = p.dur ? Math.ceil(seconds) : p.len;
  const file = path.join(cacheDir, `${name}-${len}.wav`);
  if (existsSync(file)) return file;
  const [l, r] = p.expr();
  const lowpass = name === 'tick' || name === 'boom' ? '' : ',lowpass=f=1400';
  ffmpeg(['-f', 'lavfi', '-i', `aevalsrc=${l}|${r}:s=${SR}:d=${len}`, '-af', `alimiter=limit=0.9${lowpass}`, file], `synth:${name}`);
  return file;
}
