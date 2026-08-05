// Would a flat constant have beaten my per-item confidences?
//
// Rounds 08, 09 and 12 all used EXTERNALLY-SUPPLIED items, and in all three my
// sub-0.5 block scored 100%. This asks the blunt question directly: across those
// rounds, does any single constant confidence beat the numbers I assigned by hand?
//
// The confidences below were committed in each round's predictions.md BEFORE the
// answers were seen. The comparison is post-hoc; the predictions are not.
//
//   node constant-vs-mine.js

// [confidence, correct?] per item. Correctness under committed-claim scoring
// (Round 09's keyword instrument was invalid -- see its findings.md).
const ROUNDS = {
  'R08 curl exit codes': [
    [0.85,1],[0.55,1],[0.90,1],[0.45,1],[0.40,1],[0.50,1],[0.40,1],[0.80,1],
    [0.70,1],[0.35,1],[0.65,1],[0.45,1],[0.50,1],[0.72,1],[0.60,0],[0.55,1],
    [0.45,1],[0.45,1],[0.35,1],[0.30,1],[0.30,1],[0.50,1],[0.35,1],[0.25,1],
    [0.25,1],[0.35,1],[0.20,1],[0.30,1],[0.15,1],
  ],
  'R09 errno messages': [
    [0.80,1],[0.35,1],[0.30,1],[0.18,1],[0.88,1],[0.40,1],[0.90,1],[0.80,1],
    [0.82,1],[0.75,1],[0.88,1],[0.88,1],[0.35,1],[0.30,1],[0.82,1],[0.45,1],
    [0.85,1],[0.80,1],[0.95,1],[0.55,1],[0.35,1],[0.35,1],[0.75,1],[0.72,1],
    [0.70,1],[0.92,1],[0.65,1],[0.30,1],[0.60,1],[0.70,0],[0.40,1],[0.65,1],
  ],
  'R12 file short options': [
    [0.40,1],[0.80,1],[0.45,1],[0.50,1],[0.55,1],[0.55,1],[0.55,1],[0.40,1],
    [0.40,1],[0.65,1],[0.55,1],[0.60,1],[0.45,1],[0.70,1],[0.60,1],[0.45,1],
    [0.45,1],[0.55,1],[0.50,1],[0.40,1],[0.25,1],[0.45,1],[0.60,1],[0.55,1],
    [0.60,1],[0.50,1],[0.55,1],[0.65,1],[0.45,1],[0.70,1],
  ],
};

const brier = (items, f) =>
  items.reduce((s, [c, ok]) => s + Math.pow(f(c) - ok, 2), 0) / items.length;

const all = Object.values(ROUNDS).flat();
console.log(`items: ${all.length}   correct: ${all.filter(x => x[1]).length}\n`);

console.log('PER ROUND: my Brier vs the best constant');
for (const [name, items] of Object.entries(ROUNDS)) {
  const mine = brier(items, c => c);
  let best = null;
  for (let k = 0.50; k <= 0.995; k += 0.005) {
    const b = brier(items, () => k);
    if (!best || b < best.b) best = { k, b };
  }
  console.log(`  ${name.padEnd(24)} mine ${mine.toFixed(4)}   best constant ${best.k.toFixed(2)} -> ${best.b.toFixed(4)}   ` +
              `${best.b < mine ? 'CONSTANT WINS' : 'mine wins'}`);
}

console.log('\nPOOLED');
const mine = brier(all, c => c);
console.log(`  my per-item confidences : Brier ${mine.toFixed(4)}`);
for (const k of [0.60, 0.70, 0.80, 0.90, 0.95, 0.97]) {
  const b = brier(all, () => k);
  console.log(`  flat ${k.toFixed(2)}                : Brier ${b.toFixed(4)}  ${b < mine ? '(beats mine)' : ''}`);
}
let best = null;
for (let k = 0.50; k <= 0.995; k += 0.005) {
  const b = brier(all, () => k);
  if (!best || b < best.b) best = { k, b };
}
console.log(`\n  best constant: ${best.k.toFixed(3)} -> Brier ${best.b.toFixed(4)} ` +
            `(${((1 - best.b / mine) * 100).toFixed(1)}% better than mine)`);

// Does my ordering carry ANY signal? Compare against my own confidences shuffled
// deterministically -- if shuffling doesn't hurt, the ordering was noise.
const shuffled = all.map(([c], i) => [all[(i * 7 + 3) % all.length][0], all[i][1]]);
console.log(`  my confidences, deterministically shuffled: Brier ${brier(shuffled, c => c).toFixed(4)}`);
console.log('  (if shuffling barely changes it, the per-item ordering carried no signal)');

// Where did the errors actually sit in my confidence ordering?
const mean = all.reduce((s, [c]) => s + c, 0) / all.length;
const errs = all.filter(([, ok]) => !ok).map(([c]) => c);
console.log(`\n  mean stated confidence across all ${all.length} items: ${mean.toFixed(3)}`);
console.log(`  confidences attached to the ${errs.length} actual errors: ${errs.map(c => c.toFixed(2)).join(', ')}`);
console.log(`  errors rated ABOVE my own mean: ${errs.filter(c => c > mean).length}/${errs.length}`);
