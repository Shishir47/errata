// Round 19 verification — node verify.js  (run from the repo root or this dir)
// Subject: measurable properties of this repository. ENUM, exact equality.
// Guards per SCORING.md 6b.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });

const tracked = sh('git', ['ls-files']).split('\n').filter(Boolean);
if (tracked.length === 0) { console.error('HARNESS FAULT: git ls-files empty'); process.exit(1); }

const mdFiles = tracked.filter(f => f.endsWith('.md'));
const lineCount = f => fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').length;
const mdLines = mdFiles.reduce((s, f) => s + lineCount(f), 0);

const commits = sh('git', ['rev-list', '--count', 'HEAD']).trim();
const verifyRounds = tracked.filter(f => /^rounds\/.*\/verify\.js$/.test(f)).length;
const taxonomyEntries = fs.readFileSync(path.join(ROOT, 'taxonomy.md'), 'utf8')
  .split('\n').filter(l => /^## /.test(l) && !/^## Watchlist/.test(l)).length;

const biggest = mdFiles
  .map(f => ({ f, n: lineCount(f) }))
  .sort((a, b) => b.n - a.n)[0];

const b4 = (n, a, b, c) => n < a ? 'A' : n < b ? 'B' : n < c ? 'C' : 'D';
const b3 = (n, a, b) => n < a ? 'A' : n < b ? 'B' : 'C';

const items = [
  ['1 tracked files',   b4(tracked.length, 20, 40, 60),   'D', 'C', 0.35, `${tracked.length}`],
  ['2 total .md lines', b4(mdLines, 1500, 3000, 5000),    'C', 'B', 0.35, `${mdLines}`],
  ['3 git commits',     b4(+commits, 8, 15, 22),          'C', 'C', 0.45, `${commits}`],
  ['4 rounds w/ verify',b3(verifyRounds, 10, 15),         'C', 'C', 0.50, `${verifyRounds}`],
  ['5 taxonomy entries',b3(taxonomyEntries, 8, 13),       'C', 'C', 0.45, `${taxonomyEntries}`],
  ['6 biggest md is findings', /findings\.md$/.test(biggest.f) ? 'true' : 'false',
                        'true', 'true', 0.55, `${biggest.f} (${biggest.n} lines)`],
];

// item 7: did at least 2 of items 1-5 land ABOVE my gut bucket?
const order = { A: 0, B: 1, C: 2, D: 3 };
const aboveGut = items.slice(0, 5).filter(([, actual, , gut]) => order[actual] > order[gut]).length;
items.push(['7 >=2 above gut', aboveGut >= 2 ? 'true' : 'false', 'true', 'true', 0.45,
            `${aboveGut} of 5 above gut`]);

let right = 0, brier = 0, brierGut = 0;
for (const [label, actual, claim, gut, conf, detail] of items) {
  const pass = actual === claim;
  if (pass) right++;
  brier += Math.pow(conf - (pass ? 1 : 0), 2);
  brierGut += Math.pow(conf - (actual === gut ? 1 : 0), 2);
  console.log(`${label.padEnd(28)} ${(pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${conf.toFixed(2)}  ` +
    `claimed ${claim.padEnd(5)} gut ${gut.padEnd(5)} actual ${actual.padEnd(5)}  [${detail}]`);
}

const n = items.length, acc = right / n;
const meanConf = items.reduce((s, i) => s + i[4], 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}   ` +
  `${meanConf - acc > 0 ? '<- POSITIVE (over-confident)' : '(under-confident)'}`);

const gutRight = items.filter(([, actual, , gut]) => actual === gut).length;
console.log(`\n=== ADJUSTED vs GUT ===`);
console.log(`  scored (adjusted) ${right}/${n}  Brier ${(brier / n).toFixed(4)}`);
console.log(`  gut               ${gutRight}/${n}  Brier ${(brierGut / n).toFixed(4)}`);
console.log(`  S2 "adjusted beats gut" (0.60): ${brier < brierGut ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  S1 "gap positive again" (0.50): ${meanConf - acc > 0 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`\n  items 1-5 landing above my gut bucket: ${aboveGut}/5` +
  `  -> self-model-by-anecdote ${aboveGut >= 2 ? 'REPRODUCES' : 'does not reproduce'}`);
