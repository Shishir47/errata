// Round 32: is the skill-claimed ratio predictable?
//
// Round 30 showed a crude constant divisor helps. Round 31 showed a per-surface
// ratio anchored to my own accuracy forecast hurts badly. That leaves the
// question: is the ratio predictable from anything I know BEFORE a round runs?
//
// If yes, a conditional correction is possible. If no, the crude constant is the
// ceiling and its value should just be the historical mean.
//
//   node ratio-predictors.js

// round, chanceFloor, accuracy, meanConfidence, itemCount, taskType
const R = [
  ['R05 sqlite typeof',   0.200, 1.000, 0.937, 42, 'derive'],
  ['R12 file shortopts',  0.037, 1.000, 0.527, 30, 'recall'],
  ['R14 cygpath',         0.037, 0.885, 0.529, 26, 'recall'],
  ['R16 dir file counts', 0.250, 0.600, 0.440, 10, 'estimate'],
  ['R25 file sizes',      0.250, 0.417, 0.333, 12, 'estimate'],
  ['R26 mixed blocks',    0.127, 0.692, 0.596, 26, 'recall'],
  ['R27 size comparison', 0.500, 0.813, 0.625, 16, 'compare'],
  ['R30 file sizes',      0.250, 0.563, 0.360, 16, 'estimate'],
  ['R31 file formats',    0.333, 0.933, 0.773, 15, 'infer'],
];

const ratio = r => (r[3] - r[1]) / (r[2] - r[1]);
const rows = R.map(r => ({ name: r[0], floor: r[1], acc: r[2], conf: r[3], n: r[4], type: r[5], ratio: ratio(r) }));

const corr = (xs, ys) => {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  const cov = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const vx = xs.reduce((s, x) => s + (x - mx) ** 2, 0), vy = ys.reduce((s, y) => s + (y - my) ** 2, 0);
  return cov / Math.sqrt(vx * vy);
};

console.log('round                  floor   acc    conf   ratio   type');
for (const r of rows)
  console.log(`${r.name.padEnd(22)} ${r.floor.toFixed(3)}  ${r.acc.toFixed(3)}  ${r.conf.toFixed(3)}  ` +
    `${(r.ratio * 100).toFixed(0).padStart(3)}%   ${r.type}`);

const ratios = rows.map(r => r.ratio);
const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
const sd = Math.sqrt(ratios.reduce((s, x) => s + (x - mean) ** 2, 0) / (ratios.length - 1));

console.log(`\n  n = ${rows.length}   mean ratio ${(mean * 100).toFixed(0)}%   sd ${(sd * 100).toFixed(0)}pp   ` +
  `range ${(Math.min(...ratios) * 100).toFixed(0)}-${(Math.max(...ratios) * 100).toFixed(0)}%`);

const preds = [
  ['accuracy',     rows.map(r => r.acc)],
  ['chance floor', rows.map(r => r.floor)],
  ['item count',   rows.map(r => r.n)],
  ['mean conf',    rows.map(r => r.conf)],
];
console.log('\n  candidate predictor      r');
let best = { name: null, r: 0 };
for (const [name, xs] of preds) {
  const c = corr(xs, ratios);
  if (Math.abs(c) > Math.abs(best.r)) best = { name, r: c };
  console.log(`  ${name.padEnd(22)} ${(c >= 0 ? '+' : '') + c.toFixed(3)}`);
}

// task type: mean ratio per group
const byType = {};
for (const r of rows) (byType[r.type] ||= []).push(r.ratio);
console.log('\n  by task type');
for (const [t, v] of Object.entries(byType))
  console.log(`    ${t.padEnd(10)} n=${v.length}  mean ${(v.reduce((a, b) => a + b, 0) / v.length * 100).toFixed(0)}%`);

console.log(`\n=== PRE-REGISTERED (written before running) ===`);
console.log(`  FF1 "|r(accuracy)| < 0.5"  (0.60): ${Math.abs(corr(rows.map(r=>r.acc), ratios)).toFixed(3)} -> ${Math.abs(corr(rows.map(r=>r.acc), ratios)) < 0.5 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  FF2 "|r(floor)| < 0.5"     (0.65): ${Math.abs(corr(rows.map(r=>r.floor), ratios)).toFixed(3)} -> ${Math.abs(corr(rows.map(r=>r.floor), ratios)) < 0.5 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  FF3 "sd > 15pp"            (0.75): ${(sd*100).toFixed(0)}pp -> ${sd > 0.15 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  FF4 "no predictor |r|>0.6" (0.55): best is ${best.name} at ${best.r.toFixed(3)} -> ${Math.abs(best.r) <= 0.6 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`\n  If FF4 holds: the ratio is not conditionable on anything known in advance,`);
console.log(`  the crude constant is the ceiling, and its value should be the mean above.`);
console.log(`\n  Caveat: n=9, and task type is assigned by me after the fact.`);
