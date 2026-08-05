// Round 16 verification — node verify.js
// Subject: file-count buckets of PATH directories on THIS machine.
// Structurally unavailable to me. First round designed so being wrong is likely.

const fs = require('node:fs');
const FLAT = 0.90;

const bucket = n => n < 10 ? 'A' : n < 100 ? 'B' : n < 1000 ? 'C' : 'D';

// git-bash style paths -> Windows paths
const win = p => p
  .replace(/^\/([a-z])\//, (_, d) => d.toUpperCase() + ':/')
  .replace(/^\/(bin|usr)\b/, 'C:/Program Files/Git/$1');

const P = [
  ['/bin', 'D', 0.40],
  ['/c/Program Files/CodeBlocks/MinGW/bin', 'C', 0.45],
  ['/c/Program Files/dotnet', 'A', 0.45],
  ['/c/Users/hp/.local/bin', 'A', 0.45],
  ['/c/Users/hp/AppData/Local/Microsoft/WindowsApps', 'B', 0.40],
  ['/c/Users/hp/bin', 'A', 0.50],
  ['/c/WINDOWS/System32/OpenSSH', 'B', 0.50],
  ['/c/WINDOWS/System32/WindowsPowerShell/v1.0', 'B', 0.35],
  ['/c/sqlite3', 'A', 0.55],
  ['/d/IntelliJ IDEA Community Edition 2024.1/bin', 'B', 0.45],
  ['/d/PyCharm/PyCharm Community Edition 2024.1.1/bin', 'B', 0.45],
  ['/d/cursor/resources/app/bin', 'A', 0.40],
  ['/usr/bin', 'D', 0.50],
  ['/usr/bin/vendor_perl', 'B', 0.40],
];

const results = P.map(([dir, claim, conf]) => {
  let count = null;
  for (const cand of [win(dir), dir]) {
    try {
      count = fs.readdirSync(cand, { withFileTypes: true }).filter(e => e.isFile()).length;
      break;
    } catch { /* try next form */ }
  }
  return {
    dir, claim, conf, count,
    actual: count === null ? '(unreadable)' : bucket(count),
    block: conf < 0.5 ? 'L' : 'H',
    scoreable: count !== null,
    pass: count !== null && bucket(count) === claim,
  };
});

const S = results.filter(r => r.scoreable);
const n = S.length, right = S.filter(r => r.pass).length, acc = right / n;
const meanConf = S.reduce((s, r) => s + r.conf, 0) / n;
const bMine = S.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / n;
const bFlat = S.reduce((s, r) => s + Math.pow(FLAT - (r.pass ? 1 : 0), 2), 0) / n;

for (const r of results) {
  const mark = !r.scoreable ? 'SKIP ' : r.pass ? 'RIGHT' : 'WRONG';
  console.log(`${mark} [${r.block}] conf ${r.conf.toFixed(2)}  claimed ${r.claim}  actual ${r.actual}` +
    (r.count === null ? '' : ` (${r.count} files)`) + `  ${r.dir}`);
}

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${bMine.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}   ` +
  `${meanConf - acc > 0 ? '<- POSITIVE: over-confident, a first' : '(still under-confident)'}`);
console.log(`unreadable: ${results.length - n}`);

// trivial baseline: always guess the most common actual bucket
const tally = {};
for (const r of S) tally[r.actual] = (tally[r.actual] || 0) + 1;
const bestB = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
console.log(`\nTRIVIAL BASELINE  always "${bestB[0]}" = ${bestB[1]}/${n} = ${(bestB[1] / n).toFixed(3)}  ` +
  `${acc > bestB[1] / n ? 'BEATEN' : 'NOT BEATEN'}`);
console.log(`  actual bucket distribution: ${JSON.stringify(tally)}`);

console.log(`\n=== PREDICTIONS ===`);
console.log(`  A "FLAT loses here" (conf 0.70): MINE ${bMine.toFixed(4)} vs FLAT ${bFlat.toFixed(4)} -> ` +
  `${bFlat > bMine ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  B "accuracy below 0.60" (conf 0.65): ${acc.toFixed(3)} -> ${acc < 0.60 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  C "gap turns positive" (conf 0.45): ${(meanConf - acc).toFixed(3)} -> ` +
  `${meanConf - acc > 0 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log('\nLEVEL vs ORDERING');
for (const b of ['L', 'H']) {
  const g = S.filter(r => r.block === b);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${b}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}
