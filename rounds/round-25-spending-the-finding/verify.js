// Round 25 verification — node verify.js
// Spends the under-confidence finding: scores MINE, BOOSTED (+0.20), FLAT (0.90).

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const P = [
  ['euiccscsp.dll', 'B', 0.30], ['kbdcz.dll', 'A', 0.45],
  ['licenseprotection.dll', 'B', 0.30], ['midi2.diagnosticstransport.dll', 'A', 0.28],
  ['msys-npth-0.dll', 'A', 0.40], ['oleacchooks.dll', 'A', 0.35],
  ['psr', 'C', 0.25], ['secconfig.efi', 'B', 0.25],
  ['srm.dll', 'B', 0.25], ['tsallow.mof', 'A', 0.55],
  ['w32time.dll', 'C', 0.30], ['windows.services.targetedcontent.dll', 'C', 0.30],
];

const which = n => {
  try { return execFileSync('bash', ['-c', `command -v "$1"`, '_', n], { encoding: 'utf8' }).trim(); }
  catch { return ''; }
};
const winPath = p => p.replace(/^\/([a-z])\//, (_, d) => d.toUpperCase() + ':/');
const bucket = b => b < 32 * 1024 ? 'A' : b < 128 * 1024 ? 'B' : b < 512 * 1024 ? 'C' : 'D';

const results = P.map(([name, claim, conf]) => {
  const p = which(name);
  let size = null;
  for (const cand of [winPath(p), p]) {
    try { size = fs.statSync(cand).size; break; } catch { /* next */ }
  }
  return { name, claim, conf, size,
           actual: size === null ? '(unreadable)' : bucket(size),
           scoreable: size !== null,
           pass: size !== null && bucket(size) === claim };
});

const S = results.filter(r => r.scoreable);
if (S.length < 6) { console.error(`HARNESS FAULT: only ${S.length} files readable`); process.exit(1); }

const BOOST = c => Math.min(0.97, c + 0.20), FLAT = 0.90;
const n = S.length, right = S.filter(r => r.pass).length, acc = right / n;
const meanConf = S.reduce((s, r) => s + r.conf, 0) / n;
const bs = f => S.reduce((s, r) => s + Math.pow(f(r.conf) - (r.pass ? 1 : 0), 2), 0) / n;
const bMine = bs(c => c), bBoost = bs(BOOST), bFlat = bs(() => FLAT);

for (const r of results) {
  const mark = !r.scoreable ? 'SKIP ' : r.pass ? 'RIGHT' : 'WRONG';
  console.log(`${r.name.padEnd(36)} ${mark} conf ${r.conf.toFixed(2)}  claimed ${r.claim}  actual ${r.actual}` +
    (r.size === null ? '' : `  (${(r.size / 1024).toFixed(0)} KB)`));
}

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}   (chance 0.250)`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${bMine.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);
console.log(`unreadable: ${results.length - n}`);

console.log(`\n=== THREE FORECASTERS ===`);
console.log(`  MINE    (mean ${meanConf.toFixed(2)})  Brier ${bMine.toFixed(4)}`);
console.log(`  BOOSTED (mean ${(S.reduce((s, r) => s + BOOST(r.conf), 0) / n).toFixed(2)})  Brier ${bBoost.toFixed(4)}`);
console.log(`  FLAT    (0.90)      Brier ${bFlat.toFixed(4)}`);
const best = [['MINE', bMine], ['BOOSTED', bBoost], ['FLAT', bFlat]].sort((a, b) => a[1] - b[1])[0][0];
console.log(`  best: ${best}`);

console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  Y1 "BOOSTED beats MINE" (0.40): ${bBoost < bMine ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  Y2 "accuracy > chance"  (0.70): ${acc.toFixed(3)} -> ${acc > 0.25 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  Y3 "gap negative"       (0.55): ${(meanConf - acc).toFixed(3)} -> ${meanConf - acc < 0 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  Y4 "FLAT is worst"      (0.85): ${bFlat > bMine && bFlat > bBoost ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`\n  If Y1 fails while Y3 holds: the finding is real but NOT uniformly correctable`);
console.log(`  -> 5th instance of uniform-correction-fallacy, against the project's best result.`);
