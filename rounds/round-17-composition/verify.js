// Round 17 verification — node verify.js
// Subject: a four-step compositional transform I had to carry out mentally.
// Ground truth is the shell doing it. EQ scoring, exact equality.

const { spawnSync } = require('node:child_process');
const FLAT = 0.90;

// reverse -> delete lowercase vowels -> uppercase -> first 5 chars
//
// HARNESS NOTE (Round 17): this was first written as a shell pipeline using `rev`.
// `rev` does not exist on this Git Bash -- and the pipeline SWALLOWED the failure,
// because the exit status came from `cut` (0) while stdout was empty. The harness
// then scored 15 empty strings as 15 wrong answers, i.e. reported an instrument
// fault as a perfect record of my incompetence. Reimplemented with no external
// dependency, plus an explicit empty-output guard below.
const truth = w =>
  [...w].reverse().join('')
        .replace(/[aeiou]/g, '')
        .toUpperCase()
        .slice(0, 5);

// Cross-check against the shell where the tools exist, so the JS isn't trusted alone.
const crossCheck = w => {
  const r = spawnSync('bash', ['-c',
    `printf '%s' "$1" | tr -d 'aeiou' | tr 'a-z' 'A-Z'`, '_', w], { encoding: 'utf8' });
  return (r.stdout || '').replace(/\r?\n$/, '');
};

const P = [
  ['addins',    'SNDD',  0.88], ['bthprops',  'SPRPH', 0.78], ['compact',   'TCPMC', 0.85],
  ['dispdiag',  'GDPSD', 0.80], ['firmware',  'RWMRF', 0.80], ['gunzip',    'PZNG',  0.88],
  ['logfiles',  'SLFGL', 0.82], ['mountvol',  'LVTNM', 0.78], ['openssh',   'HSSNP', 0.82],
  ['qwinsta',   'TSNWQ', 0.82], ['rstrui',    'RTSR',  0.85], ['spoolsv',   'VSLPS', 0.82],
  ['tstheme',   'MHTST', 0.80], ['wecutil',   'LTCW',  0.85], ['wscollect', 'TCLLC', 0.72],
];

const results = P.map(([w, claim, conf]) => {
  const actual = truth(w);
  // GUARD: empty ground truth means the harness failed, not that I was wrong.
  const scoreable = actual.length > 0;
  return { w, claim, conf, actual, scoreable,
           block: conf < 0.5 ? 'L' : 'H', pass: scoreable && actual === claim };
});
const broken = results.filter(r => !r.scoreable);
if (broken.length) {
  console.error(`HARNESS FAULT: ${broken.length} items produced empty ground truth. Not scored.`);
  process.exit(1);
}
// independent confirmation that the devowel+upper stage matches the shell's
const mismatch = P.filter(([w]) =>
  crossCheck([...w].reverse().join('')) !== truth(w).padEnd(0) &&
  crossCheck([...w].reverse().join('')).slice(0, 5) !== truth(w));
console.log(`cross-check vs shell: ${mismatch.length === 0 ? 'agrees on all items' : mismatch.length + ' disagreements'}\n`);

let right = 0, bMine = 0, bFlat = 0;
for (const r of results) {
  if (r.pass) right++;
  bMine += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  bFlat += Math.pow(FLAT - (r.pass ? 1 : 0), 2);
  console.log(`${r.w.padEnd(11)} ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${r.conf.toFixed(2)}  ` +
    `claimed ${r.claim.padEnd(6)} actual ${r.actual}`);
}
const n = results.length, acc = right / n;
bMine /= n; bFlat /= n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${bMine.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}   ` +
  `${meanConf - acc > 0 ? '<- POSITIVE: OVER-CONFIDENT, first in 17 rounds' : '(under-confident again)'}`);

console.log(`\n=== PREDICTIONS ===`);
console.log(`  P1 "at least one error" (0.70): ${n - right} errors -> ${right < n ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  P2 "gap turns positive" (0.40): ${(meanConf - acc).toFixed(3)} -> ${meanConf - acc > 0 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  P3 "FLAT beats MINE"    (0.55): MINE ${bMine.toFixed(4)} vs FLAT ${bFlat.toFixed(4)} -> ${bFlat < bMine ? 'CONFIRMED' : 'DISCONFIRMED'}`);

// Per-step compounding check: was ~0.81 the right prior?
console.log(`\nCOMPOUNDING  I reasoned "4 steps x ~95% = ~81%" and stated a mean of ${meanConf.toFixed(3)}.`);
console.log(`             actual ${acc.toFixed(3)}  -> implied per-step accuracy ${Math.pow(acc, 1 / 4).toFixed(3)}`);

const misses = results.filter(r => !r.pass);
console.log(`\nMISSES (${misses.length}):`);
for (const m of misses) console.log(`  ${m.w}: claimed ${m.claim}, actual ${m.actual}  (conf ${m.conf.toFixed(2)})`);
