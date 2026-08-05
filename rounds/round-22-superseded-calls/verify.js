// Round 22 verification — node verify.js
// Per-call "first-try failure" instrument, comparable to Round 18's is_error count.

const fs = require('node:fs');
const path = require('node:path');

const T = path.join(process.env.USERPROFILE || process.env.HOME,
  '.claude', 'projects', 'D--', '52eb59ce-dfed-4c48-9945-7516953ea642.jsonl');
if (!fs.existsSync(T)) { console.error('HARNESS FAULT: transcript missing'); process.exit(1); }

const tools = [];
const errIds = new Set();
for (const line of fs.readFileSync(T, 'utf8').split('\n').filter(Boolean)) {
  let o; try { o = JSON.parse(line); } catch { continue; }
  const content = o?.message?.content;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type === 'tool_use') tools.push({ id: c.id, name: c.name, input: c.input || {} });
    if (c.type === 'tool_result' && c.is_error === true) errIds.add(c.tool_use_id);
  }
}
if (!tools.length) { console.error('HARNESS FAULT: 0 tool calls'); process.exit(1); }

const sim = (a, b) => {
  const A = new Set(a.split(/\s+/)), B = new Set(b.split(/\s+/));
  return [...A].filter(x => B.has(x)).length / Math.max(1, Math.max(A.size, B.size));
};

const reason = new Array(tools.length).fill(null);
for (let i = 0; i < tools.length; i++) {
  const t = tools[i];
  if (errIds.has(t.id)) { reason[i] = 'is_error'; continue; }

  if (t.name === 'Bash') {
    const cmd = String(t.input.command || '');
    for (let j = i + 1; j < Math.min(i + 4, tools.length); j++) {
      if (tools[j].name === 'Bash' && cmd && sim(cmd, String(tools[j].input.command || '')) >= 0.5) {
        reason[i] = 'bash-retry'; break;
      }
    }
    if (reason[i]) continue;
  }

  if (t.name === 'Write' || t.name === 'Edit') {
    const p = String(t.input.file_path || '');
    for (let j = i + 1; j < Math.min(i + 6, tools.length); j++) {
      if ((tools[j].name === 'Write' || tools[j].name === 'Edit') &&
          String(tools[j].input.file_path || '') === p) { reason[i] = 'file-rewrite'; break; }
    }
  }
}

const failed = reason.filter(Boolean).length;
const total = tools.length;
const rate = failed / total * 100;
const byReason = {};
for (const r of reason) if (r) byReason[r] = (byReason[r] || 0) + 1;
const top = Object.entries(byReason).sort((a, b) => b[1] - a[1])[0] || ['(none)', 0];

const OBJ = 7.1, LOWER = errIds.size / total * 100;

const b4 = (n, a, b, c) => n < a ? 'A' : n < b ? 'B' : n < c ? 'C' : 'D';
const b3 = (n, a, b) => n < a ? 'A' : n < b ? 'B' : 'C';

const items = [
  ['1 superseded rate',   b4(rate, 5, 10, 15),                  'B', 0.45, `${rate.toFixed(1)}%`],
  ['2 exceeds 7.1%',      rate > OBJ ? 'true' : 'false',        'true', 0.55, `${rate.toFixed(1)}% vs 7.1%`],
  ['3 top condition',     top[0],                               'file-rewrite', 0.45, `${JSON.stringify(byReason)}`],
  ['4 total superseded',  b3(failed, 15, 35),                   'B', 0.50, `${failed}`],
  ['5 rate > 2.9% (sanity)', rate > LOWER ? 'true' : 'false',   'true', 0.90, `${rate.toFixed(1)}% vs ${LOWER.toFixed(1)}%`],
];

if (items[4][1] !== 'true') { console.error('HARNESS FAULT: sanity check failed, instrument broken'); process.exit(1); }

let right = 0, brier = 0;
for (const [label, actual, claim, conf, detail] of items) {
  const pass = actual === claim;
  if (pass) right++;
  brier += Math.pow(conf - (pass ? 1 : 0), 2);
  console.log(`${label.padEnd(24)} ${(pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${conf.toFixed(2)}  ` +
    `claimed ${String(claim).padEnd(13)} actual ${String(actual).padEnd(13)} [${detail}]`);
}
const n = items.length, acc = right / n;
const meanConf = items.reduce((s, i) => s + i[3], 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}   gap ${(meanConf - acc).toFixed(3)}`);

const ratio = rate / LOWER;
console.log(`\n=== THE BRACKET ===`);
console.log(`  lower bound (is_error, Round 18)     : ${LOWER.toFixed(1)}%`);
console.log(`  upper bound (superseded, this round) : ${rate.toFixed(1)}%`);
console.log(`  object-level miss rate               : ${OBJ}%`);
console.log(`  bracket width                        : ${ratio.toFixed(1)}x`);
console.log(`  V1 "bracket >= 3x wide" (0.60): ${ratio >= 3 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
const bothSide = (LOWER > OBJ && rate > OBJ) || (LOWER < OBJ && rate < OBJ);
console.log(`  V2: bounds ${bothSide ? 'AGREE -> Round 18 item 8 RESOLVED' : 'STRADDLE 7.1% -> reported as BRACKETED, not resolved'}`);
