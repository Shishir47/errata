// Round 27 verification — node verify.js
// Binary comparisons: forces confidence into the 0.5-1.0 band, unsampled until now.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const which = n => { try {
  return execFileSync('bash', ['-c', `command -v "$1"`, '_', n], { encoding: 'utf8' }).trim();
} catch { return ''; } };
const winPath = p => p.replace(/^\/([a-z])\//, (_, d) => d.toUpperCase() + ':/');
const sizeOf = n => {
  const p = which(n);
  for (const c of [winPath(p), p]) { try { return fs.statSync(c).size; } catch {} }
  return null;
};

const P = [
  ['eventaggregation.dll','icsigd.dll','A',0.60],
  ['midi2.umpprotocoldownscalertransform.dll','netcfg','B',0.55],
  ['pr','secproc_isv.dll','B',0.60],
  ['sysmon.ocx','vds_ps.dll','A',0.55],
  ['windows.storage.search.dll','xactengine2_0.dll','A',0.65],
  ['bfe.dll','consent','A',0.70],
  ['dolbydecmft.dll','fxscover','A',0.65],
  ['kbdbe.dll','mapistub.dll','B',0.75],
  ['msiscsi.mof','offlinefileswmiprovider.mof','B',0.55],
  ['rdprelaytransport.dll','shutdown','A',0.60],
  ['trie.dll','wfs.mof','A',0.60],
  ['wmdmps.dll','ahost','A',0.55],
  ['c_870.nls','dbgeng.dll','B',0.90],
  ['energytask.dll','html.iec','B',0.55],
  ['kd_02_14e4.dll','microsoft.uev.modernappcore.dll','B',0.65],
  ['ncasvc.dll','scrptadm.dll','A',0.55],
];

const results = P.map(([a, b, claim, conf]) => {
  const sa = sizeOf(a), sb = sizeOf(b);
  const scoreable = sa !== null && sb !== null && sa !== sb;
  const actual = !scoreable ? null : (sa > sb ? 'A' : 'B');
  return { a, b, claim, conf, sa, sb, actual, scoreable, pass: scoreable && actual === claim };
});

const S = results.filter(r => r.scoreable);
if (S.length < 10) { console.error(`HARNESS FAULT: only ${S.length} scoreable pairs`); process.exit(1); }

const n = S.length, right = S.filter(r => r.pass).length, acc = right / n;
const meanConf = S.reduce((s, r) => s + r.conf, 0) / n;
const brier = S.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / n;
const gap = meanConf - acc;

for (const r of results) {
  const mark = !r.scoreable ? 'SKIP ' : r.pass ? 'RIGHT' : 'WRONG';
  const kb = v => v === null ? '?' : (v / 1024).toFixed(0) + 'K';
  console.log(`${mark} conf ${r.conf.toFixed(2)}  said ${r.claim}  actual ${r.actual ?? '-'}   ` +
    `${r.a} (${kb(r.sa)})  vs  ${r.b} (${kb(r.sb)})`);
}

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}   (chance 0.500)`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${brier.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(gap >= 0 ? '+' : '') + gap.toFixed(3)}`);
console.log(`unscoreable: ${results.length - n}`);

const med = [...S.map(r => r.conf)].sort((a, b) => a - b)[Math.floor(n / 2)];
const misses = S.filter(r => !r.pass);
const lowMiss = misses.filter(r => r.conf < med).length;

console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  AA1 "accuracy > 0.5625"        (0.65): ${acc.toFixed(3)} -> ${acc > 0.5625 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  AA2 "-0.20 < gap < 0"          (0.55): ${gap.toFixed(3)} -> ${(gap > -0.20 && gap < 0) ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  AA3 "gap > +0.10 = over-conf"  (disconf): ${gap > 0.10 ? 'FIRED -- over-confident in the 0.5-1.0 band' : 'not fired'}`);
console.log(`  AA4 ">=60% of misses below median conf (${med.toFixed(2)})" (0.60): ` +
  `${misses.length ? (lowMiss / misses.length * 100).toFixed(0) : 'n/a'}% -> ` +
  `${misses.length && lowMiss / misses.length >= 0.6 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log(`\n=== TRACKING IN THE 0.5-1.0 BAND ===`);
console.log(`  chance floor 0.500   accuracy ${acc.toFixed(3)}   mean confidence ${meanConf.toFixed(3)}`);
console.log(`  skill above chance   ${(acc - 0.5).toFixed(3)}   confidence above chance ${(meanConf - 0.5).toFixed(3)}`);
if (acc > 0.5) console.log(`  confidence claimed ${((meanConf - 0.5) / (acc - 0.5) * 100).toFixed(0)}% of the skill actually shown`);
console.log(`\nMISSES (${misses.length}):`);
for (const m of misses) console.log(`  conf ${m.conf.toFixed(2)}  said ${m.claim}: ${m.a} vs ${m.b}`);
