// Round 15 verification — node verify.js
// Subject: long forms of less short options. EQ, normalised equality (SCORING.md).
// Scores a pre-registered FLAT 0.90 alongside my per-item confidences.

const { spawnSync } = require('node:child_process');
const FLAT = 0.90;

const h = spawnSync('less', ['--help'], { encoding: 'utf8' });
const text = ((h.stdout || '') + (h.stderr || '')).replace(/\r/g, '');

// less --help prints e.g.  "  -b [_N]  --buffers=[_N]"  or  "  -S  --chop-long-lines"
const TRUTH = {};
for (const line of text.split('\n')) {
  const m = line.match(/^\s*(-[a-zA-Z~])\s.*?(--[A-Za-z][A-Za-z0-9-]*)/);
  if (m && !(m[1] in TRUTH)) TRUTH[m[1]] = m[2];
}

const P = [
  ['-A','--SEARCH-SKIP-SCREEN',0.25], ['-D','--color',0.20], ['-G','--HILITE-SEARCH',0.40],
  ['-J','--status-column',0.50], ['-L','--no-lessopen',0.45], ['-O','--LOG-FILE',0.45],
  ['-S','--chop-long-lines',0.65], ['-V','--version',0.85], ['-X','--no-init',0.60],
  ['-b','--buffers',0.70], ['-d','--dumb',0.55], ['-f','--force',0.70],
  ['-h','--max-back-scroll',0.45], ['-j','--jump-target',0.55], ['-m','--long-prompt',0.50],
  ['-o','--log-file',0.60], ['-q','--quiet',0.65], ['-s','--squeeze-blank-lines',0.60],
  ['-u','--underline-special',0.40], ['-x','--tabs',0.55], ['-z','--window',0.55],
];

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const results = P.map(([sh, claim, conf]) => {
  const actual = TRUTH[sh];
  return { sh, claim, conf, actual: actual ?? '(not found)',
           block: conf < 0.5 ? 'L' : 'H',
           scoreable: actual !== undefined,
           pass: actual !== undefined && norm(actual) === norm(claim) };
});

const S = results.filter(r => r.scoreable);
const n = S.length, right = S.filter(r => r.pass).length, acc = right / n;
const meanConf = S.reduce((s, r) => s + r.conf, 0) / n;
const bMine = S.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / n;
const bFlat = S.reduce((s, r) => s + Math.pow(FLAT - (r.pass ? 1 : 0), 2), 0) / n;

console.log(`less — ground truth parsed for ${Object.keys(TRUTH).length} short options\n`);
for (const r of results) {
  const mark = !r.scoreable ? 'SKIP ' : r.pass ? 'RIGHT' : 'WRONG';
  console.log(`${r.sh.padEnd(4)} ${mark} [${r.block}] conf ${r.conf.toFixed(2)}  claimed ${r.claim.padEnd(24)} actual ${r.actual}`);
}

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${bMine.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);
console.log(`unscoreable: ${results.length - n}`);

console.log(`\n=== FORWARD TEST vs pre-registered FLAT ${FLAT} ===`);
console.log(`  MINE Brier ${bMine.toFixed(4)}    FLAT Brier ${bFlat.toFixed(4)}`);
console.log(`  -> "FLAT beats MINE" (conf 0.55): ${bFlat < bMine ? 'CONFIRMED' : 'DISCONFIRMED'}`);

const errs = n - right;
console.log(`\n  errors: ${errs}  -> "at least 2 errors" (conf 0.85): ${errs >= 2 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  ${errs >= 2 ? 'discrimination IS measurable this round' : 'too few errors to measure discrimination (Round 14 rule)'}`);

if (errs >= 2) {
  const shuf = S.map((r, i) => ({ c: S[(i * 7 + 3) % n].conf, ok: r.pass }));
  const bShuf = shuf.reduce((s, x) => s + Math.pow(x.c - (x.ok ? 1 : 0), 2), 0) / n;
  console.log(`  MINE shuffled Brier ${bShuf.toFixed(4)}  (cost of destroying my ordering: ` +
    `${((bShuf / bMine - 1) * 100).toFixed(1)}%)`);
}

const lo = S.filter(r => r.conf < 0.5), vlo = S.filter(r => r.conf < 0.2);
console.log(`\nQUOTA  below 0.5: ${lo.length}/${n} = ${(lo.length / n * 100).toFixed(1)}% ` +
  `${lo.length / n >= 0.25 ? 'PASS' : 'FAIL'}   below 0.2: ${vlo.length} ` +
  `${vlo.length >= 1 ? 'PASS' : 'FAIL'}   min ${Math.min(...S.map(r => r.conf)).toFixed(2)}`);

console.log('\nLEVEL vs ORDERING (reported separately, Round 14 rule)');
for (const b of ['L', 'H']) {
  const g = S.filter(r => r.block === b);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${b}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

console.log(`\nMISSES:`);
for (const m of S.filter(r => !r.pass))
  console.log(`  ${m.sh} [${m.block}] conf ${m.conf.toFixed(2)}  claimed ${m.claim}  actual ${m.actual}`);
