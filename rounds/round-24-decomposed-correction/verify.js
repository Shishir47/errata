// Round 24 verification — node verify.js
// Forward test of Round 23's countermeasure: trust the count, inflate the size.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const git = a => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 32e6 });
const tracked = git(['ls-files']).split('\n').filter(Boolean);
if (!tracked.length) { console.error('HARNESS FAULT: no tracked files'); process.exit(1); }

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const mdFiles = tracked.filter(f => f.endsWith('.md'));
const predFiles = tracked.filter(f => /predictions\.md$/.test(f));

const msgs = git(['log', '--format=%B%x00']).split('\0').filter(s => s.trim());
const commitChars = msgs.reduce((s, m) => s + m.length, 0);
const headings = mdFiles.reduce((s, f) => s + (read(f).match(/^## /gm) || []).length, 0);
const predLines = predFiles.reduce((s, f) => s + read(f).split('\n').length, 0);
const quotes = mdFiles.reduce((s, f) => s + (read(f).match(/^>/gm) || []).length, 0);
const links = mdFiles.reduce((s, f) => s + (read(f).match(/\[[^\]]+\]\([^)]+\)/g) || []).length, 0);

// [label, myCount, actualCount, uncorrected, corrected, actual]
const Q = [
  ['1 commit chars',   24, msgs.length,     28800, 36000, commitChars],
  ['2 ## headings',    46, mdFiles.length,    230,   288, headings],
  ['3 predictions ln', 19, predFiles.length, 1615,  2014, predLines],
  ['4 blockquote ln',  46, mdFiles.length,    138,   276, quotes],
  ['5 md links',       46, mdFiles.length,    184,   368, links],
];
if (Q.some(q => !q[5])) { console.error('HARNESS FAULT: a quantity measured 0'); process.exit(1); }

const err = (e, a) => Math.abs(Math.log(e / a));
let corrWins = 0, corrLow = 0, countOk = 0;

console.log('quantity           UNCORR   CORRECTED   ACTUAL   unc-err  cor-err  winner   count(mine/real)');
for (const [label, myC, realC, unc, cor, act] of Q) {
  const eu = err(unc, act), ec = err(cor, act);
  if (ec < eu) corrWins++;
  if (cor < act) corrLow++;
  const cErr = Math.abs(myC - realC) / realC;
  if (cErr <= 0.20) countOk++;
  console.log(`${label.padEnd(18)} ${String(unc).padStart(6)} ${String(cor).padStart(10)} ` +
    `${String(act).padStart(8)}   ${eu.toFixed(3)}   ${ec.toFixed(3)}  ` +
    `${(ec < eu ? 'CORRECTED' : 'uncorr').padEnd(10)} ${myC}/${realC} (${(cErr * 100).toFixed(0)}%)`);
}

const mU = Q.reduce((s, q) => s + err(q[3], q[5]), 0) / Q.length;
const mC = Q.reduce((s, q) => s + err(q[4], q[5]), 0) / Q.length;
console.log(`\nmean log-ratio error  UNCORRECTED ${mU.toFixed(3)}   CORRECTED ${mC.toFixed(3)}`);

console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  X1 "corrected beats uncorrected >=4/5" (0.70): ${corrWins}/5 -> ${corrWins >= 4 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  X2 "corrected STILL low >=3/5"         (0.45): ${corrLow}/5 -> ${corrLow >= 3 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  X3 "counts within 20% >=4/5"           (0.65): ${countOk}/5 -> ${countOk >= 4 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
