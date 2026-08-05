// Round 23 verification — node verify.js
// Does explicit anchored arithmetic beat gut estimation, or launder the same bias?

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean);
if (!tracked.length) { console.error('HARNESS FAULT: git ls-files empty'); process.exit(1); }

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const verifyFiles  = tracked.filter(f => /verify\.js$/.test(f));
const findingFiles = tracked.filter(f => /findings\.md$/.test(f));
const mdFiles      = tracked.filter(f => f.endsWith('.md'));

const verifyLines = verifyFiles.reduce((s, f) => s + read(f).split('\n').length, 0);
const findingWords = findingFiles.reduce((s, f) => s + read(f).split(/\s+/).filter(Boolean).length, 0);
const fences = mdFiles.reduce((s, f) => s + (read(f).match(/^```/gm) || []).length, 0);
const mdLines = mdFiles.reduce((s, f) => s + read(f).split('\n').length, 0);
const tableRows = mdFiles.reduce((s, f) => s + (read(f).match(/^\s*\|/gm) || []).length, 0);

const Q = [
  ['1 verify.js lines',   1200,  1805, verifyLines],
  ['2 findings words',   12000, 14000, findingWords],
  ['3 code fences',         60,   100, fences],
  ['4 total .md lines',   5500,  5200, mdLines],
  ['5 table rows',         250,   185, tableRows],
];

if (Q.some(q => !q[3])) { console.error('HARNESS FAULT: a quantity measured 0'); process.exit(1); }

const err = (est, act) => Math.abs(Math.log(est / act));

let anchoredWins = 0, gutLow = 0, anchoredLow = 0;
console.log('quantity              GUT      ANCHORED   ACTUAL    gut-err  anch-err  winner');
for (const [label, gut, anch, actual] of Q) {
  const eg = err(gut, actual), ea = err(anch, actual);
  const winner = ea < eg ? 'ANCHORED' : 'gut';
  if (ea < eg) anchoredWins++;
  if (gut < actual) gutLow++;
  if (anch < actual) anchoredLow++;
  console.log(`${label.padEnd(20)} ${String(gut).padStart(7)} ${String(anch).padStart(9)} ` +
    `${String(actual).padStart(9)}   ${eg.toFixed(3)}    ${ea.toFixed(3)}   ${winner}`);
}

const meanG = Q.reduce((s, q) => s + err(q[1], q[3]), 0) / Q.length;
const meanA = Q.reduce((s, q) => s + err(q[2], q[3]), 0) / Q.length;

console.log(`\nmean log-ratio error   GUT ${meanG.toFixed(3)}   ANCHORED ${meanA.toFixed(3)}   ` +
  `${meanA < meanG ? 'ANCHORED better' : 'gut better'}`);

console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  W1 "anchored beats gut on >=4/5" (0.65): ${anchoredWins}/5 -> ${anchoredWins >= 4 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  W2 "gut low on >=4/5"            (0.70): ${gutLow}/5 -> ${gutLow >= 4 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  W3 "anchored ALSO low on >=3/5"  (0.55): ${anchoredLow}/5 -> ${anchoredLow >= 3 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log(`\n  files counted: ${verifyFiles.length} verify.js, ${findingFiles.length} findings.md, ${mdFiles.length} .md`);
console.log(`  (my anchors assumed 19 verify.js and 20 findings.md)`);
