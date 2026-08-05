// Round 12 verification — node verify.js
// Subject: short-option letters of file(1). ENUM claims scored by exact equality
// per SCORING.md. No proxy tokens.

const { spawnSync } = require('node:child_process');

const help = spawnSync('file', ['--help'], { encoding: 'utf8' });
const text = ((help.stdout || '') + (help.stderr || '')).replace(/\r/g, '');

// ground truth: map long option -> short letter or 'none'
const TRUTH = {};
for (const line of text.split('\n')) {
  // forms:  "  -b, --brief   ..."   or   "      --apple   ..."
  const withShort = line.match(/^\s*-(\w|0),\s*--([a-z][a-z0-9-]+)/);
  if (withShort) { TRUTH['--' + withShort[2]] = '-' + withShort[1]; continue; }
  const longOnly = line.match(/^\s*--([a-z][a-z0-9-]+)/);
  if (longOnly) { TRUTH['--' + longOnly[1]] = 'none'; }
}

const P = [
  ['--apple', 'none', 0.40], ['--brief', '-b', 0.80], ['--checking-printout', '-c', 0.45],
  ['--compile', '-C', 0.50], ['--debug', '-d', 0.55], ['--dereference', '-L', 0.55],
  ['--exclude', '-e', 0.55], ['--exclude-quiet', 'none', 0.40], ['--extension', 'none', 0.40],
  ['--files-from', '-f', 0.65], ['--help', 'none', 0.55], ['--keep-going', '-k', 0.60],
  ['--list', '-l', 0.45], ['--magic-file', '-m', 0.70], ['--mime', '-i', 0.60],
  ['--mime-encoding', 'none', 0.45], ['--mime-type', 'none', 0.45], ['--no-buffer', '-n', 0.55],
  ['--no-dereference', '-h', 0.50], ['--no-pad', '-N', 0.40], ['--no-sandbox', '-S', 0.25],
  ['--parameter', '-P', 0.45], ['--preserve-date', '-p', 0.60], ['--print0', '-0', 0.55],
  ['--raw', '-r', 0.60], ['--separator', '-F', 0.50], ['--special-files', '-s', 0.55],
  ['--uncompress', '-z', 0.65], ['--uncompress-noreport', '-Z', 0.45], ['--version', '-v', 0.70],
];

const results = P.map(([opt, claim, conf]) => {
  const actual = TRUTH[opt];
  return {
    opt, claim, conf, actual: actual ?? '(not found)',
    block: conf < 0.5 ? 'L' : 'H',
    pass: actual !== undefined && actual === claim,
    scoreable: actual !== undefined,
  };
});

const scoreable = results.filter(r => r.scoreable);
let right = 0, brier = 0;
for (const r of scoreable) { if (r.pass) right++; brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2); }
const n = scoreable.length, acc = right / n;
const meanConf = scoreable.reduce((s, r) => s + r.conf, 0) / n;

console.log(spawnSync('file', ['--version'], { encoding: 'utf8' }).stdout.split('\n')[0]);
console.log(`ground truth parsed for ${Object.keys(TRUTH).length} long options\n`);
for (const r of results) {
  const mark = !r.scoreable ? 'SKIP ' : r.pass ? 'RIGHT' : 'WRONG';
  console.log(`${r.opt.padEnd(24)} ${mark} [${r.block}] conf ${r.conf.toFixed(2)}  claimed ${String(r.claim).padEnd(5)} actual ${r.actual}`);
}

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);
console.log(`unscoreable (not in help): ${results.length - n}`);

// trivial baseline, per SCORING.md section 5
const noneCount = scoreable.filter(r => r.actual === 'none').length;
console.log(`\nTRIVIAL BASELINE  answering "none" everywhere scores ` +
  `${noneCount}/${n} = ${(noneCount / n).toFixed(3)}   ` +
  `${acc > noneCount / n ? 'BEATEN' : 'NOT BEATEN'}`);

const lo = scoreable.filter(r => r.conf < 0.5), vlo = scoreable.filter(r => r.conf < 0.2);
console.log(`\nQUOTA  below 0.5: ${lo.length}/${n} = ${(lo.length / n * 100).toFixed(1)}% ` +
  `${lo.length / n >= 0.25 ? 'PASS' : 'FAIL'}   below 0.2: ${vlo.length} ` +
  `${vlo.length >= 1 ? 'PASS' : 'FAIL (deviation recorded in predictions.md)'}`);

console.log('\nDISCRIMINATION');
for (const b of ['L', 'H']) {
  const g = scoreable.filter(r => r.block === b);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${b}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

const L = scoreable.filter(r => r.block === 'L');
const lAcc = L.length ? L.filter(r => r.pass).length / L.length : NaN;
console.log(`\nPRE-REGISTERED PREDICTION (conf 0.60)`);
console.log(`  predicted: sub-0.5 block scores >= 0.65 against stated ~0.42`);
console.log(`  actual   : ${lAcc.toFixed(3)}  ->  ${lAcc >= 0.65 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

// Derivable vs non-derivable: is the short form simply the long name's first letter?
// If most are, the round measures derivation rather than recall (Round 05 lesson).
const deriv = r => r.actual !== 'none' &&
  r.actual.slice(1).toLowerCase() === r.opt.replace(/^--/, '')[0].toLowerCase();
const D = scoreable.filter(deriv), ND = scoreable.filter(r => !deriv(r));
console.log('\nDERIVABLE vs NON-DERIVABLE (short form == first letter of long name?)');
for (const [label, g] of [['derivable', D], ['non-derivable', ND]]) {
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${label.padEnd(14)} n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}
const ndL = ND.filter(r => r.block === 'L');
if (ndL.length) {
  const a = ndL.filter(r => r.pass).length / ndL.length;
  console.log(`  non-derivable AND low-confidence: n=${ndL.length}  actual ${a.toFixed(2)}  ` +
    `<- the subset where the finding actually lives`);
}

console.log(`\nMISSES:`);
for (const m of scoreable.filter(r => !r.pass))
  console.log(`  ${m.opt} [${m.block}] conf ${m.conf.toFixed(2)}  claimed ${m.claim}  actual ${m.actual}`);
