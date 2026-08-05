// Round 20 verification — node verify.js
// Subject: silent failures in this session (calls that succeeded while doing the
// wrong thing). ENUM, exact equality. Guards per SCORING.md 6b.

const fs = require('node:fs');
const path = require('node:path');

const T = path.join(process.env.USERPROFILE || process.env.HOME,
  '.claude', 'projects', 'D--', '52eb59ce-dfed-4c48-9945-7516953ea642.jsonl');
if (!fs.existsSync(T)) { console.error('HARNESS FAULT: transcript missing'); process.exit(1); }

const lines = fs.readFileSync(T, 'utf8').split('\n').filter(Boolean);

const uses = [];              // ordered tool_use
const results = new Map();    // id -> {isError, text}
let assistantMsgs = 0;

for (const line of lines) {
  let o; try { o = JSON.parse(line); } catch { continue; }
  const role = o?.message?.role;
  const content = o?.message?.content;
  if (role === 'assistant') assistantMsgs++;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type === 'tool_use') uses.push({ id: c.id, name: c.name, input: c.input || {} });
    if (c.type === 'tool_result') {
      const txt = typeof c.content === 'string' ? c.content
        : Array.isArray(c.content) ? c.content.map(x => x?.text || '').join('') : '';
      results.set(c.tool_use_id, { isError: c.is_error === true, text: txt });
    }
  }
}
if (uses.length === 0) { console.error('HARNESS FAULT: 0 tool calls parsed'); process.exit(1); }

const bash = uses.filter(u => u.name === 'Bash');
const hardErrors = uses.filter(u => results.get(u.id)?.isError).length;

// 1. empty stdout, no error
const emptyOk = bash.filter(u => {
  const r = results.get(u.id);
  return r && !r.isError && r.text.trim() === '';
}).length;

// 2. consecutive near-duplicate Bash commands (retries)
const sim = (a, b) => {
  const A = new Set(a.split(/\s+/)), B = new Set(b.split(/\s+/));
  const inter = [...A].filter(x => B.has(x)).length;
  return inter / Math.max(1, Math.max(A.size, B.size));
};
let retries = 0;
for (let i = 1; i < bash.length; i++) {
  const a = String(bash[i - 1].input.command || ''), b = String(bash[i].input.command || '');
  if (a && b && sim(a, b) >= 0.6) retries++;
}

// 3. paths written more than once
const writes = uses.filter(u => u.name === 'Write').map(u => String(u.input.file_path || ''));
const wcount = {};
for (const p of writes) wcount[p] = (wcount[p] || 0) + 1;
const rewritten = Object.values(wcount).filter(n => n >= 2).length;

// 5. median Bash command length
const lens = bash.map(u => String(u.input.command || '').length).sort((a, b) => a - b);
const median = lens.length ? lens[Math.floor(lens.length / 2)] : 0;

const b4 = (n, a, b, c) => n < a ? 'A' : n < b ? 'B' : n < c ? 'C' : 'D';
const b3 = (n, a, b) => n < a ? 'A' : n < b ? 'B' : 'C';

const items = [
  ['1 empty-stdout Bash',  b4(emptyOk, 10, 25, 50),  'C', 'B', 0.45, `${emptyOk}`],
  ['2 retry pairs',        b4(retries, 5, 15, 30),   'B', 'B', 0.45, `${retries}`],
  ['3 paths rewritten',    b3(rewritten, 5, 15),     'B', 'A', 0.45, `${rewritten}`],
  ['4 assistant messages', b3(assistantMsgs, 80, 160), 'C', 'B', 0.45, `${assistantMsgs}`],
  ['5 median cmd length',  b3(median, 80, 200),      'B', 'B', 0.50, `${median}`],
  ['6 silent > hard',      emptyOk > hardErrors ? 'true' : 'false', 'true', 'true', 0.80,
                           `${emptyOk} vs ${hardErrors}`],
];

let right = 0, brier = 0;
const order = { A: 0, B: 1, C: 2, D: 3 };
for (const [label, actual, claim, gut, conf, detail] of items) {
  const pass = actual === claim;
  if (pass) right++;
  brier += Math.pow(conf - (pass ? 1 : 0), 2);
  console.log(`${label.padEnd(22)} ${(pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${conf.toFixed(2)}  ` +
    `claimed ${claim.padEnd(5)} gut ${gut.padEnd(5)} actual ${actual.padEnd(5)}  [${detail}]`);
}

const n = items.length, acc = right / n, B = brier / n;
const meanConf = items.reduce((s, i) => s + i[4], 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${B.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);

const aboveGut = items.slice(0, 5).filter(([, actual, , gut]) => order[actual] > order[gut]).length;
console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  T1 "silent > hard"        (0.80): ${emptyOk} vs ${hardErrors} -> ${emptyOk > hardErrors ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  T2 "Brier beats 0.3293"   (0.55): ${B.toFixed(4)} -> ${B < 0.3293 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  T3 ">=2 above gut"        (0.40): ${aboveGut} -> ${aboveGut >= 2 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log(`\n=== THE SILENT/HARD RATIO ===`);
console.log(`  hard errors (is_error)      : ${hardErrors}`);
console.log(`  empty-output candidates     : ${emptyOk}`);
console.log(`  retry pairs                 : ${retries}`);
console.log(`  paths written 2+ times      : ${rewritten}`);
console.log(`  total Bash calls            : ${bash.length}`);
console.log(`  Round 18 reported error rate: ${(hardErrors / uses.length * 100).toFixed(1)}%`);
