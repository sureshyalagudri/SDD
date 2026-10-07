// One-off generator: synthesizes 20 distinct ~8s MP3 placeholder clips to public/audio. Output is committed.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
// The package main entry has a missing-global bug; the browser bundle declares a global `lamejs`
// function carrying Mp3Encoder, so evaluate it in an isolated context and read it back.
const ctx = vm.createContext({ console });
vm.runInContext(readFileSync(require.resolve("lamejs/lame.min.js"), "utf8"), ctx);
const { Mp3Encoder } = ctx.lamejs;

const outDir = resolve(process.cwd(), "public/audio");
mkdirSync(outDir, { recursive: true });

const SAMPLE_RATE = 22050;
const SECONDS = 8;
const KBPS = 48;
const COUNT = 20;

// Pentatonic-ish base notes so each clip has a recognisably different pitch.
const notes = [220, 247, 262, 294, 330, 349, 392, 440, 494, 523];

function synth(n) {
  const total = SAMPLE_RATE * SECONDS;
  const pcm = new Int16Array(total);
  const base = notes[(n - 1) % notes.length] * (n > 10 ? 1.5 : 1);
  const pulse = 0.9 + (n % 5) * 0.15; // beats per second
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const env = 0.55 + 0.45 * Math.sin(2 * Math.PI * pulse * t);
    const fade = Math.min(1, t / 0.2, (SECONDS - t) / 0.4);
    const s =
      Math.sin(2 * Math.PI * base * t) * 0.6 +
      Math.sin(2 * Math.PI * base * 2 * t) * 0.25 +
      Math.sin(2 * Math.PI * base * 1.5 * t) * 0.15;
    pcm[i] = Math.round(s * env * fade * 0.6 * 32767);
  }
  return pcm;
}

for (let n = 1; n <= COUNT; n++) {
  const nn = String(n).padStart(2, "0");
  const encoder = new Mp3Encoder(1, SAMPLE_RATE, KBPS);
  const pcm = synth(n);
  const chunks = [];
  const block = 1152;
  for (let i = 0; i < pcm.length; i += block) {
    const buf = encoder.encodeBuffer(pcm.subarray(i, i + block));
    if (buf.length) chunks.push(Buffer.from(buf));
  }
  const tail = encoder.flush();
  if (tail.length) chunks.push(Buffer.from(tail));
  const file = resolve(outDir, `ep-${nn}.mp3`);
  writeFileSync(file, Buffer.concat(chunks));
}
console.log(`Wrote ${COUNT} clips to ${outDir}`);
