// Round 28: recompute confidence gaps against each round's CHANCE FLOOR.
//
// For 27 rounds this project compared stated confidence against 0. But on an
// ENUM task with k options, stating 1/k asserts nothing -- it is the value a
// coin-flipper reports. The meaningful question is what fraction of the skill
// ABOVE CHANCE I actually claimed:
//
//     skill_claimed = (confidence - floor) / (accuracy - floor)
//
// Only rounds with a homogeneous, explicitly declared closed answer set are
// included. Rounds mixing 2-, 3- and 4-way items have no single well-defined
// floor and are listed as excluded rather than given a fudged one.
//
//   node chance-adjusted.js

const ROUNDS = [
  // round, floor, why, accuracy, meanConfidence   (acc/conf from each verify.js)
  ['round-05-sqlite-affinity', 0.200, '5 storage classes',            1.000, 0.937],
  ['round-12-file-shortopts',  0.037, 'a letter or "none", ~27 ways', 1.000, 0.527],
  ['round-14-cygpath',         0.037, 'a letter or "none", ~27 ways', 0.885, 0.529],
  ['round-16-machine-state',   0.250, '4 size buckets',               0.600, 0.440],
  // R25 and R27 corrected in Round 29 after fixing the path-resolution bug that
  // had silently dropped 8 items between them. Pre-fix figures kept for the record:
  //   R25 was acc 0.300 / conf 0.333 -> 166%   (unstable, denominator 0.05)
  //   R27 was acc 0.800 / conf 0.635 ->  45%   (10 items instead of 16)
  ['round-25-spending',        0.250, '4 size buckets',               0.417, 0.333],
  ['round-26-compression',     0.127, 'weighted: 15 opts + 11 buckets',0.692, 0.596],
  ['round-27-binary',          0.500, 'which of two files is larger',  0.813, 0.625],
];

const EXCLUDED = [
  'rounds 01-04, 06-09, 15, 17 — exact-value claims, floor ~0, no correction needed',
  'rounds 18-22 — items mix 2-, 3- and 4-way ENUMs; no single floor is defensible',
  'rounds 10, 11, 13, 23, 24 — no per-item confidences (analysis rounds)',
];

console.log('round                     floor   acc     conf    raw gap   skill claimed');
let fracs = [];
for (const [name, floor, why, acc, conf] of ROUNDS) {
  const rawGap = conf - acc;
  const frac = (acc - floor) > 0.001 ? (conf - floor) / (acc - floor) : NaN;
  if (Number.isFinite(frac)) fracs.push({ name, frac });
  console.log(`${name.padEnd(26)} ${floor.toFixed(3)}  ${acc.toFixed(3)}  ${conf.toFixed(3)}  ` +
    `${(rawGap >= 0 ? '+' : '') + rawGap.toFixed(3)}    ` +
    (Number.isFinite(frac) ? `${(frac * 100).toFixed(0)}%` : 'n/a (acc at floor)') +
    `   [${why}]`);
}

const mean = fracs.reduce((s, f) => s + f.frac, 0) / fracs.length;
const over = fracs.filter(f => f.frac > 1.0);
const rawMean = ROUNDS.reduce((s, r) => s + (r[4] - r[3]), 0) / ROUNDS.length;

console.log(`\n  rounds with a clean floor : ${ROUNDS.length}`);
console.log(`  mean RAW gap              : ${rawMean.toFixed(3)}`);
console.log(`  mean SKILL CLAIMED        : ${(mean * 100).toFixed(0)}%`);
console.log(`  rounds claiming >100%     : ${over.length}${over.length ? ' (' + over.map(o => o.name).join(', ') + ')' : ''}`);

console.log(`\n=== PRE-REGISTERED (written before running) ===`);
console.log(`  BB1 "mean skill claimed < 70%" (0.65): ${(mean * 100).toFixed(0)}% -> ${mean < 0.70 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  BB2 "at least one round > 100%" (0.45): ${over.length >= 1 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log(`\n  EXCLUDED:`);
for (const e of EXCLUDED) console.log(`    - ${e}`);
console.log(`\n  Note: floors are hand-assigned from each round's declared answer set.`);
console.log(`  That is a judgement call, and it is the weakest link in this analysis.`);
