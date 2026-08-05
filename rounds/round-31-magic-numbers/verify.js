// Round 31 verification — node verify.js
// Task: predict a file's binary format from its name. Tests whether Round 30's
// scale-beats-shift result generalises, using a PER-SURFACE ratio (my own
// predicted accuracy for the round) rather than a global divisor.

const fs = require('node:fs');
const { statOf } = require('../../resolve-path');

const FLOOR = 1 / 3, PREDICTED_ACC = 0.60, FLAT = 0.90;

const P = [
  ['eventtracingmanagement.mof','T',0.70], ['kmddsp.tsp','P',0.55],
  ['netbtugc','P',0.60],                   ['secocl64','P',0.55],
  ['vcruntime140.dll','P',0.90],           ['wwansvc.dll','P',0.88],
  ['comsetup.log','T',0.85],               ['fvenotify','P',0.70],
  ['sharemediacpl.dll','P',0.88],          ['wephostsvc.dll','P',0.88],
  ['adhsvc.dll','P',0.88],                 ['d3dx9_43.dll','P',0.90],
  ['helppane','P',0.70],                   ['microsoft.bluetooth.audio.dll','P',0.88],
  ['pinentry-w32','P',0.75],
];

const classify = p => {
  let fd;
  try { fd = fs.openSync(p, 'r'); } catch { return null; }
  const buf = Buffer.alloc(512);
  const nread = fs.readSync(fd, buf, 0, 512, 0);
  fs.closeSync(fd);
  if (nread < 2) return null;
  const head = buf.subarray(0, nread);
  if (head[0] === 0x4d && head[1] === 0x5a) return 'P';                 // "MZ"
  const printable = [...head].filter(b => b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)).length;
  const utf16 = nread > 4 && head[1] === 0 && head[3] === 0;            // UTF-16LE text
  if (printable / nread > 0.90 || utf16) return 'T';
  return 'O';
};

const results = P.map(([name, claim, conf]) => {
  const r = statOf(name);
  const actual = r ? classify(r.path) : null;
  return { name, claim, conf, actual: actual ?? '(unreadable)',
           scoreable: actual !== null, pass: actual === claim };
});

const S = results.filter(r => r.scoreable);
const unscoreable = results.length - S.length;
if (S.length < 10) { console.error(`HARNESS FAULT: only ${S.length} readable`); process.exit(1); }
if (unscoreable / results.length > 0.10)
  console.error(`WARNING: ${(unscoreable / results.length * 100).toFixed(0)}% unscoreable — Round 29 rule: treat as a bug`);

const n = S.length, right = S.filter(r => r.pass).length, acc = right / n;
const meanMine = S.reduce((s, r) => s + r.conf, 0) / n;

// SCALED: rescale so the round's mean confidence equals my predicted accuracy.
const k = (PREDICTED_ACC - FLOOR) / (meanMine - FLOOR);
const scaled = c => Math.max(0.02, Math.min(0.97, FLOOR + (c - FLOOR) * k));
const shifted = c => Math.min(0.97, c + 0.20);

const bs = f => S.reduce((s, r) => s + Math.pow(f(r.conf) - (r.pass ? 1 : 0), 2), 0) / n;
const mean = f => S.reduce((s, r) => s + f(r.conf), 0) / n;
const bMine = bs(c => c), bScaled = bs(scaled), bShift = bs(shifted), bFlat = bs(() => FLAT);

for (const r of results)
  console.log(`${(r.scoreable ? (r.pass ? 'RIGHT' : 'WRONG') : 'SKIP ')} ` +
    `mine ${r.conf.toFixed(2)} scaled ${scaled(r.conf).toFixed(2)}  ` +
    `said ${r.claim} actual ${r.actual}   ${r.name}`);

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}   (floor ${FLOOR.toFixed(3)})`);
console.log(`mean stated confidence ${meanMine.toFixed(3)}   Brier ${bMine.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanMine - acc).toFixed(3)}`);
console.log(`unscoreable: ${unscoreable} of ${results.length}`);

const tally = {}; for (const r of S) tally[r.actual] = (tally[r.actual] || 0) + 1;
const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
console.log(`\nTRIVIAL BASELINE  always "${top[0]}" = ${top[1]}/${n} = ${(top[1] / n).toFixed(3)}  ` +
  `${acc > top[1] / n ? 'BEATEN' : 'NOT BEATEN'}   distribution ${JSON.stringify(tally)}`);

console.log(`\n=== FOUR FORECASTERS ===`);
console.log(`  MINE    (mean ${mean(c=>c).toFixed(3)})  Brier ${bMine.toFixed(4)}`);
console.log(`  SCALED  (mean ${mean(scaled).toFixed(3)})  Brier ${bScaled.toFixed(4)}   [k=${k.toFixed(3)}]`);
console.log(`  SHIFTED (mean ${mean(shifted).toFixed(3)})  Brier ${bShift.toFixed(4)}`);
console.log(`  FLAT    (0.900)         Brier ${bFlat.toFixed(4)}`);
console.log(`  best: ${[['MINE',bMine],['SCALED',bScaled],['SHIFTED',bShift],['FLAT',bFlat]].sort((a,b)=>a[1]-b[1])[0][0]}`);

const skill = acc > FLOOR ? (meanMine - FLOOR) / (acc - FLOOR) : NaN;
console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  EE1 "SCALED beats MINE"      (0.55): ${bScaled < bMine ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  EE2 "SCALED beats SHIFTED"   (0.70): ${bScaled < bShift ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  EE3 "predicted acc within 0.15" (0.55): predicted ${PREDICTED_ACC} vs actual ${acc.toFixed(3)} -> ${Math.abs(PREDICTED_ACC - acc) <= 0.15 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  EE4 "skill claimed in 35-92%"(0.65): ${Number.isFinite(skill) ? (skill*100).toFixed(0)+'%' : 'n/a'} -> ` +
  `${Number.isFinite(skill) && skill >= 0.35 && skill <= 0.92 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`\n  If EE2 fails, Round 30's scale-beats-shift is surface-specific.`);
