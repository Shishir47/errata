// Round 14 verification — node verify.js
// Subject: cygpath short-option letters. ENUM claims, exact equality (SCORING.md).
// Also scores a PRE-REGISTERED flat 0.90 forecaster against my per-item numbers.

const { spawnSync } = require('node:child_process');
const FLAT = 0.90;   // committed in predictions.md BEFORE any answer was seen

const h = spawnSync('cygpath', ['--help'], { encoding: 'utf8' });
const text = ((h.stdout || '') + (h.stderr || '')).replace(/\r/g, '');

const TRUTH = {};
for (const line of text.split('\n')) {
  const ws = line.match(/^\s*-(\w),?\s*(?:\S*\s+)?--([a-z][a-z0-9-]+)/);
  if (ws) { TRUTH['--' + ws[2]] = '-' + ws[1]; continue; }
  const lo = line.match(/^\s*--([a-z][a-z0-9-]+)/);
  if (lo) TRUTH['--' + lo[1]] = 'none';
}

const P = [
  ['--absolute','-a',0.80], ['--allusers','-A',0.55], ['--close','none',0.30],
  ['--codepage','-C',0.40], ['--desktop','-D',0.50], ['--dos','-d',0.60],
  ['--file','-f',0.65], ['--folder','-F',0.45], ['--help','-h',0.70],
  ['--homeroot','-H',0.50], ['--ignore','-i',0.55], ['--long-name','-l',0.60],
  ['--mixed','-m',0.60], ['--mode','-M',0.40], ['--mydocs','-O',0.25],
  ['--option','-o',0.45], ['--path','-p',0.70], ['--proc-cygdrive','none',0.35],
  ['--short-name','-s',0.65], ['--smprograms','-S',0.40], ['--sysdir','-S',0.30],
  ['--type','-t',0.55], ['--unix','-u',0.75], ['--version','-V',0.60],
  ['--windir','-W',0.40], ['--windows','-w',0.75],
];

const results = P.map(([opt, claim, conf]) => {
  const actual = TRUTH[opt];
  return { opt, claim, conf, actual: actual ?? '(not found)',
           block: conf < 0.5 ? 'L' : 'H',
           scoreable: actual !== undefined,
           pass: actual !== undefined && actual === claim };
});

const S = results.filter(r => r.scoreable);
const n = S.length, right = S.filter(r => r.pass).length, acc = right / n;
const meanConf = S.reduce((s, r) => s + r.conf, 0) / n;
const brierMine = S.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / n;
const brierFlat = S.reduce((s, r) => s + Math.pow(FLAT - (r.pass ? 1 : 0), 2), 0) / n;

console.log(`cygpath — ground truth parsed for ${Object.keys(TRUTH).length} long options\n`);
for (const r of results) {
  const mark = !r.scoreable ? 'SKIP ' : r.pass ? 'RIGHT' : 'WRONG';
  console.log(`${r.opt.padEnd(18)} ${mark} [${r.block}] conf ${r.conf.toFixed(2)}  claimed ${String(r.claim).padEnd(5)} actual ${r.actual}`);
}

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${brierMine.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);
console.log(`unscoreable: ${results.length - n}`);

const noneCount = S.filter(r => r.actual === 'none').length;
console.log(`\nTRIVIAL BASELINE  "none" everywhere = ${noneCount}/${n} = ${(noneCount / n).toFixed(3)}  ` +
  `${acc > noneCount / n ? 'BEATEN' : 'NOT BEATEN'}`);

console.log(`\n=== FORWARD TEST: my confidences vs a pre-registered flat ${FLAT} ===`);
console.log(`  MINE  Brier ${brierMine.toFixed(4)}`);
console.log(`  FLAT  Brier ${brierFlat.toFixed(4)}`);
console.log(`  -> prediction "FLAT beats MINE" (conf 0.75): ` +
  `${brierFlat < brierMine ? 'CONFIRMED' : 'DISCONFIRMED'}`);
const shuf = S.map((r, i) => ({ c: S[(i * 7 + 3) % n].conf, ok: r.pass }));
console.log(`  MINE shuffled Brier ${(shuf.reduce((s, x) => s + Math.pow(x.c - (x.ok ? 1 : 0), 2), 0) / n).toFixed(4)}` +
  `  (close to MINE => ordering carried little signal)`);

const lo = S.filter(r => r.conf < 0.5), vlo = S.filter(r => r.conf < 0.2);
console.log(`\nQUOTA  below 0.5: ${lo.length}/${n} = ${(lo.length / n * 100).toFixed(1)}% ` +
  `${lo.length / n >= 0.25 ? 'PASS' : 'FAIL'}   below 0.2: ${vlo.length} ` +
  `${vlo.length >= 1 ? 'PASS' : 'FAIL (deviation declared in advance)'}`);

console.log('\nDISCRIMINATION');
for (const b of ['L', 'H']) {
  const g = S.filter(r => r.block === b);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${b}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

console.log(`\nMISSES:`);
for (const m of S.filter(r => !r.pass))
  console.log(`  ${m.opt} [${m.block}] conf ${m.conf.toFixed(2)}  claimed ${m.claim}  actual ${m.actual}`);
