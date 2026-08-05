// Cross-round aggregator. Re-runs every round's verify.js and parses its real
// output, so the synthesis can never drift from what the scripts actually produce.
//   node synthesize.js
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const roundsDir = path.join(__dirname, 'rounds');
const rounds = fs.readdirSync(roundsDir).filter(d => /^round-/.test(d)).sort();

const rows = [];
const unparseable = [];
for (const r of rounds) {
  const dir = path.join(roundsDir, r);
  let out;
  try {
    out = execFileSync('node', ['verify.js'], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    console.error(`  !! ${r} failed to run: ${String(e.message).slice(0, 80)}`);
    continue;
  }
  const score = out.match(/(?:scored|===)\s+(\d+)\/(\d+)/);
  const conf  = out.match(/mean (?:stated|scored) confidence\s+([\d.]+)\s+Brier\s+([\d.]+)/);
  // Round 26: unparseable rounds were being SILENTLY dropped from every total.
  // Fail loudly instead -- a missing round is a wrong denominator, not a warning.
  if (!score || !conf) {
    console.error(`  !! ${r}: COULD NOT PARSE -- excluded from totals (fix its output or add it here)`);
    unparseable.push(r);
    continue;
  }
  const [, right, n] = score.map(Number);
  const [, meanConf, brier] = conf.map(Number);
  rows.push({ round: r, right, n, acc: right / n, meanConf, brier, gap: meanConf - right / n });
}

const tot   = rows.reduce((s, r) => s + r.n, 0);
const hits  = rows.reduce((s, r) => s + r.right, 0);
const wtGap = rows.reduce((s, r) => s + r.gap * r.n, 0) / tot;

console.log('\nROUND-BY-ROUND (parsed from live runs)\n');
console.log('  round                        score    acc     conf    gap     Brier');
for (const r of rows) {
  console.log('  ' + r.round.padEnd(28) +
    `${r.right}/${r.n}`.padEnd(9) +
    r.acc.toFixed(3).padEnd(8) +
    r.meanConf.toFixed(3).padEnd(8) +
    (r.gap >= 0 ? '+' : '') + r.gap.toFixed(3).padEnd(7) +
    r.brier.toFixed(4));
}
console.log('\n  ' + 'TOTAL'.padEnd(28) + `${hits}/${tot}`.padEnd(9) +
  (hits / tot).toFixed(3).padEnd(8) + ''.padEnd(8) +
  (wtGap >= 0 ? '+' : '') + wtGap.toFixed(3));

console.log(`\n  misses: ${tot - hits} of ${tot} items across ${rows.length} rounds`);
console.log(`  item-weighted confidence gap: ${wtGap.toFixed(3)}`);
console.log(`  rounds with a negative gap: ${rows.filter(r => r.gap < 0).length}/${rows.length}`);

// Effective n, hand-audited per round (see each findings.md). The honest denominator.
const EFFECTIVE = {
  'round-01-js-semantics':    16,
  'round-02-node-path':       41,
  'round-03-node-tls':        28,
  'round-04-openssl':         28,
  'round-05-sqlite-affinity': 11,   // 30 cells collapse to ~11 bets
  'round-06-tar-header':      25,   // duplicated R/O scoring + a self-consistency item
  'round-07-awk':             31,   // L2 and L6 share one root error
  'round-08-curl-exit-codes': 29,   // independent arbitrary facts
  'round-09-errno':           32,   // independent arbitrary facts
  'round-12-file-shortopts':  30,   // independent arbitrary facts
  'round-14-cygpath':         26,   // independent arbitrary facts
  'round-15-less-longforms':  21,   // independent arbitrary facts
  'round-16-machine-state':    9,   // /bin and /usr/bin share one wrong model
  'round-17-composition':     15,   // independent per-word transforms
  'round-18-my-own-behaviour': 8,   // independent counts
  'round-19-volume':           7,   // independent counts
  'round-20-silent-failures':  6,   // independent counts
  'round-21-behavioural-traces': 5, // independent counts
  'round-22-superseded-calls': 5,   // independent counts
  'round-25-spending-the-finding': 10, // independent unknowable facts
  'round-26-compression-test': 26,  // two blocks, independent items
};
const eff = rows.reduce((s, r) => s + (EFFECTIVE[r.round] ?? r.n), 0);
console.log(`\n  reported items ${tot}  ->  effective independent bets ~${eff}` +
            `  (inflation ${(tot / eff).toFixed(2)}x)`);

// Caveats that a parsed headline number cannot carry on its own.
console.log('\n  CAVEATS');
console.log('    round-09: the parsed 24/32 is KEYWORD scoring. Under the committed-claim');
console.log('              scoring it is 31/32 -- 8 of the 9 "misses" were instrument');
console.log('              artefacts, not knowledge errors. See its findings.md.');
console.log('    round-05: 42 cells collapse to ~11 independent bets (pseudoreplication).');

if (unparseable.length) {
  console.log(`\n  !! ${unparseable.length} round(s) EXCLUDED from all totals above:`);
  for (const r of unparseable) console.log(`       ${r}`);
  console.log('     Totals are therefore incomplete. (Found in Round 26.)');
}
