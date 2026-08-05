// Round 33 verification — node verify.js
// Task type PRE-DECLARED: does 'derive' claim more of its skill than 'estimate'?

const { statOf } = require('../../resolve-path');

const D_FLOOR = 1 / 3, E_FLOOR = 0.25;
const lenBucket = s => s.length < 10 ? 'A' : s.length < 20 ? 'B' : 'C';
const sizeBucket = b => b < 32*1024 ? 'A' : b < 128*1024 ? 'B' : b < 512*1024 ? 'C' : 'D';

const D = [
  ['eventvwr','A',0.95], ['localsec.dll','B',0.93], ['p11-kit','A',0.95],
  ['sti.dll','A',0.93], ['windows.web.http.dll','C',0.90], ['c_28598.nls','B',0.92],
  ['featurestaging-ext-101.dll','C',0.92], ['lxutil.dll','B',0.92],
  ['peerdistwsddiscoprov.dll','C',0.90], ['syncinfrastructureps.dll','C',0.90],
  ['winmm.dll','A',0.90], ['capauthz.dll','B',0.92],
].map(([name, claim, conf]) => ({
  block: 'D', name, claim, conf, actual: lenBucket(name),
  scoreable: true, pass: lenBucket(name) === claim,
}));

const E = [
  ['fltmc','B',0.35], ['mdmappinstaller','C',0.30], ['pinentry-w32','B',0.35],
  ['witnesswmiv2provider.dll','B',0.30], ['chakrathunk.dll','A',0.35],
  ['freeglut.dll','C',0.35], ['mfc140kor.dll','B',0.30], ['poqexec','B',0.30],
  ['taskschd.msc','B',0.30], ['wmidcom.dll','B',0.30], ['cleanpccsp.dll','B',0.30],
  ['gamechatoverlayext.dll','C',0.30],
].map(([name, claim, conf]) => {
  const r = statOf(name);
  return { block: 'E', name, claim, conf, size: r ? r.size : null,
           actual: r ? sizeBucket(r.size) : '(unresolved)',
           scoreable: !!r, pass: !!r && sizeBucket(r.size) === claim };
});

const all = [...D, ...E];
const unscoreable = all.filter(r => !r.scoreable).length;
if (unscoreable / all.length > 0.10)
  console.error(`WARNING: ${(unscoreable/all.length*100).toFixed(0)}% unscoreable — Round 29 rule`);

const stat = (rows, floor) => {
  const S = rows.filter(r => r.scoreable);
  const n = S.length, right = S.filter(r => r.pass).length;
  const acc = right / n, conf = S.reduce((s, r) => s + r.conf, 0) / n;
  const brier = S.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / n;
  const ratio = acc > floor ? (conf - floor) / (acc - floor) : NaN;
  return { n, right, acc, conf, brier, ratio, floor };
};

for (const r of all)
  console.log(`[${r.block}] ${(r.scoreable ? (r.pass ? 'RIGHT' : 'WRONG') : 'SKIP ')} ` +
    `conf ${r.conf.toFixed(2)}  said ${r.claim} actual ${r.actual}` +
    (r.size ? ` (${(r.size/1024).toFixed(0)} KB)` : '') + `  ${r.name}`);

const sd = stat(D, D_FLOOR), se = stat(E, E_FLOOR), sa = stat(all, (D_FLOOR + E_FLOOR) / 2);

console.log(`\n        n   acc     conf    floor   ratio    Brier`);
for (const [nm, s] of [['DERIVE  ', sd], ['ESTIMATE', se]])
  console.log(`${nm} ${String(s.n).padStart(2)}  ${s.acc.toFixed(3)}  ${s.conf.toFixed(3)}  ` +
    `${s.floor.toFixed(3)}   ${Number.isFinite(s.ratio) ? (s.ratio*100).toFixed(0)+'%' : 'n/a'}     ${s.brier.toFixed(4)}`);

console.log(`\n=== ${sa.right}/${sa.n} right   accuracy ${sa.acc.toFixed(3)}`);
console.log(`mean stated confidence ${sa.conf.toFixed(3)}   Brier ${sa.brier.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(sa.conf - sa.acc).toFixed(3)}`);
console.log(`unscoreable: ${unscoreable} of ${all.length}`);

const diff = sd.ratio - se.ratio;
console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  GG1 "ratio(D) > ratio(E)"    (0.70): ${(sd.ratio*100).toFixed(0)}% vs ${(se.ratio*100).toFixed(0)}% -> ${sd.ratio > se.ratio ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  GG2 "difference > 0.25"      (0.55): ${(diff*100).toFixed(0)}pp -> ${diff > 0.25 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  GG3 "ratio(D) in 70-100%"    (0.55): ${sd.ratio >= 0.70 && sd.ratio <= 1.00 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  GG4 "ratio(E) in 30-60%"     (0.60): ${se.ratio >= 0.30 && se.ratio <= 0.60 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`\n  If GG1 fails: task type does not predict the ratio, and Round 32's`);
console.log(`  ordering was an artefact of post-hoc grouping with n=1 cells.`);
