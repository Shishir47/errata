// Round 30 verification — node verify.js
// First SCALE correction: stretch confidence away from the chance floor, rather
// than shifting it. All five previous corrections were shifts, and all failed.

const { statOf } = require('../../resolve-path');

const FLOOR = 0.25, RATIO = 0.61, FLAT = 0.90;
const scale = c => Math.min(0.97, FLOOR + (c - FLOOR) / RATIO);
const bucket = b => b < 32*1024 ? 'A' : b < 128*1024 ? 'B' : b < 512*1024 ? 'C' : 'D';

const P = [
  ['eventtracingmanagement.dll','C',0.30], ['kbdmlt48.dll','A',0.50],
  ['msg','B',0.30],                        ['prncache.dll','C',0.30],
  ['ssh-keygen','D',0.40],                 ['wiaaut.dll','C',0.35],
  ['xwtpw32.dll','B',0.28],                ['cngcredui.dll','B',0.30],
  ['kbdnec.dll','A',0.50],                 ['mshtmled.dll','C',0.35],
  ['professional.xml','A',0.40],           ['sspicli.dll','C',0.35],
  ['wiashext.dll','C',0.30],               ['xzegrep','A',0.55],
  ['cofiredm.dll','B',0.28],               ['exsmime.dll','C',0.30],
];

const results = P.map(([name, claim, conf]) => {
  const r = statOf(name);
  return { name, claim, conf, size: r ? r.size : null,
           actual: r ? bucket(r.size) : '(unresolved)',
           scoreable: !!r, pass: !!r && bucket(r.size) === claim };
});

const S = results.filter(r => r.scoreable);
const unscoreable = results.length - S.length;
if (S.length < 10) { console.error(`HARNESS FAULT: only ${S.length} resolved`); process.exit(1); }
if (unscoreable / results.length > 0.10)
  console.error(`WARNING: ${(unscoreable/results.length*100).toFixed(0)}% unscoreable — Round 29 says treat >10% as a bug`);

const n = S.length, right = S.filter(r => r.pass).length, acc = right / n;
const mean = f => S.reduce((s, r) => s + f(r.conf), 0) / n;
const bs = f => S.reduce((s, r) => s + Math.pow(f(r.conf) - (r.pass ? 1 : 0), 2), 0) / n;
const bMine = bs(c => c), bScaled = bs(scale), bFlat = bs(() => FLAT);

for (const r of results)
  console.log(`${(r.scoreable ? (r.pass ? 'RIGHT' : 'WRONG') : 'SKIP ')} ` +
    `mine ${r.conf.toFixed(2)} scaled ${scale(r.conf).toFixed(2)}  ` +
    `said ${r.claim} actual ${r.actual}` +
    (r.size ? `  (${(r.size/1024).toFixed(0)} KB)` : '') + `  ${r.name}`);

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}   (floor ${FLOOR})`);
console.log(`unscoreable: ${unscoreable} of ${results.length}`);

console.log(`\n=== THREE FORECASTERS ===`);
console.log(`  MINE   (mean ${mean(c => c).toFixed(3)})  Brier ${bMine.toFixed(4)}`);
console.log(`  SCALED (mean ${mean(scale).toFixed(3)})  Brier ${bScaled.toFixed(4)}`);
console.log(`  FLAT   (0.90)         Brier ${bFlat.toFixed(4)}`);
const ranked = [['MINE',bMine],['SCALED',bScaled],['FLAT',bFlat]].sort((a,b)=>a[1]-b[1]);
console.log(`  best: ${ranked[0][0]}`);

const skill = acc > FLOOR ? (mean(c => c) - FLOOR) / (acc - FLOOR) : NaN;
console.log(`\n=== CHANCE-ADJUSTED ===`);
console.log(`  skill above chance ${(acc - FLOOR).toFixed(3)}   confidence above chance ${(mean(c=>c) - FLOOR).toFixed(3)}`);
console.log(`  skill claimed (MINE): ${Number.isFinite(skill) ? (skill*100).toFixed(0) + '%' : 'n/a (accuracy at floor)'}`);

console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  DD1 "SCALED beats MINE"        (0.60): ${bScaled < bMine ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  DD2 "SCALED overshoots"        (0.50): mean ${mean(scale).toFixed(3)} vs acc ${acc.toFixed(3)} -> ${mean(scale) > acc ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  DD3 "skill claimed in 40-92%"  (0.70): ${Number.isFinite(skill) ? ((skill>=0.40&&skill<=0.92) ? 'CONFIRMED' : 'DISCONFIRMED') : 'unmeasurable'}`);
console.log(`  DD4 "unscoreable <= 2"         (0.80): ${unscoreable} -> ${unscoreable <= 2 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`\n  If DD1 fails: five shifts and a scale have all failed, and the honest`);
console.log(`  conclusion is that I cannot correct my own calibration -- 61% is a`);
console.log(`  description, not a usable instrument.`);
