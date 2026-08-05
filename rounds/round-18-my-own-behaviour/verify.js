// Round 18 verification — node verify.js
// Subject: my own behaviour this session, counted from Claude Code's transcript.
// ENUM claims, exact equality. Harness guards per SCORING.md 6b.

const fs = require('node:fs');
const path = require('node:path');

const TRANSCRIPT = path.join(process.env.USERPROFILE || process.env.HOME,
  '.claude', 'projects', 'D--', '52eb59ce-dfed-4c48-9945-7516953ea642.jsonl');

if (!fs.existsSync(TRANSCRIPT)) {
  console.error('HARNESS FAULT: transcript not found at ' + TRANSCRIPT);
  process.exit(1);
}

const lines = fs.readFileSync(TRANSCRIPT, 'utf8').split('\n').filter(Boolean);
const toolUses = [];      // {id, name}
const toolResults = [];   // {id, isError}

for (const line of lines) {
  let o; try { o = JSON.parse(line); } catch { continue; }
  const content = o?.message?.content;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type === 'tool_use') toolUses.push({ id: c.id, name: c.name });
    if (c.type === 'tool_result') toolResults.push({ id: c.tool_use_id, isError: c.is_error === true });
  }
}

if (toolUses.length === 0) { console.error('HARNESS FAULT: parsed 0 tool calls'); process.exit(1); }

const byName = {};
for (const u of toolUses) byName[u.name] = (byName[u.name] || 0) + 1;

const resById = new Map(toolResults.map(r => [r.id, r]));
const errorsByTool = {};
let totalErrors = 0;
for (const u of toolUses) {
  const r = resById.get(u.id);
  if (r?.isError) { errorsByTool[u.name] = (errorsByTool[u.name] || 0) + 1; totalErrors++; }
}

const total = toolUses.length;
const bash = byName['Bash'] || 0;
const bashErr = errorsByTool['Bash'] || 0;
const bashRate = bash ? bashErr / bash : 0;
const write = byName['Write'] || 0;
const edit = byName['Edit'] || 0;
const topErrTool = Object.entries(errorsByTool).sort((a, b) => b[1] - a[1])[0] || ['(none)', 0];
const overallRate = totalErrors / total;
const OBJECT_LEVEL_MISS = 28 / 396;   // from synthesize.js

const b4 = (n, a, b, c) => n < a ? 'A' : n < b ? 'B' : n < c ? 'C' : 'D';
const b3 = (n, a, b) => n < a ? 'A' : n < b ? 'B' : 'C';

const items = [
  ['1 total tool calls',        b4(total, 100, 200, 300),                'C', 0.40, `${total}`],
  ['2 Bash calls',              b4(bash, 40, 80, 120),                   'B', 0.40, `${bash}`],
  ['3 Bash error share',        b4(bashRate * 100, 10, 20, 30),          'B', 0.35, `${(bashRate * 100).toFixed(1)}% (${bashErr}/${bash})`],
  ['4 Write calls',             b3(write, 20, 40),                       'B', 0.45, `${write}`],
  ['5 Edit calls',              b3(edit, 15, 35),                        'B', 0.40, `${edit}`],
  ['6 Bash is top error tool',  topErrTool[0] === 'Bash' ? 'true' : 'false', 'true', 0.70, `${topErrTool[0]} (${topErrTool[1]})`],
  ['7 total error results',     b4(totalErrors, 10, 25, 50),             'B', 0.40, `${totalErrors}`],
  ['8 my error rate > 7.1%',    overallRate > OBJECT_LEVEL_MISS ? 'true' : 'false', 'true', 0.80,
                                `${(overallRate * 100).toFixed(1)}% vs 7.1%`],
];

let right = 0, brier = 0;
for (const [label, actual, claim, conf, detail] of items) {
  const pass = actual === claim;
  if (pass) right++;
  brier += Math.pow(conf - (pass ? 1 : 0), 2);
  console.log(`${label.padEnd(28)} ${(pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${conf.toFixed(2)}  ` +
    `claimed ${claim.padEnd(5)} actual ${actual.padEnd(5)}  [${detail}]`);
}

const n = items.length, acc = right / n;
const meanConf = items.reduce((s, i) => s + i[3], 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}   ` +
  `${meanConf - acc > 0 ? '<- POSITIVE: OVER-CONFIDENT, first in 18 rounds' : '(under-confident again)'}`);

console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  R1 "at least 2 items wrong" (0.75): ${n - right} wrong -> ${n - right >= 2 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  R2 "gap turns positive"     (0.55): ${(meanConf - acc).toFixed(3)} -> ${meanConf - acc > 0 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log(`\n=== THE ASYMMETRY ===`);
console.log(`  object-level claim accuracy (17 rounds) : ${(1 - OBJECT_LEVEL_MISS).toFixed(3)}`);
console.log(`  first-try tool success rate (this session): ${(1 - overallRate).toFixed(3)}`);
console.log(`\n  tool call counts: ${JSON.stringify(byName)}`);
console.log(`  errors by tool  : ${JSON.stringify(errorsByTool)}`);
