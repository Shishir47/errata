// Round 21 verification — node verify.js
// Subject: detecting my own failures by behavioural trace rather than output signature.

const fs = require('node:fs');
const path = require('node:path');

const T = path.join(process.env.USERPROFILE || process.env.HOME,
  '.claude', 'projects', 'D--', '52eb59ce-dfed-4c48-9945-7516953ea642.jsonl');
if (!fs.existsSync(T)) { console.error('HARNESS FAULT: transcript missing'); process.exit(1); }

const MARKER = /(let me fix|that'?s a bug|harness (lied|fault)|swallowed|mangled|didn'?t (work|fire)|my own (script|harness)|broke|caught me|not a finding|before I report)/i;

const events = [];   // ordered: {kind:'text'|'tool', ...}
for (const line of fs.readFileSync(T, 'utf8').split('\n').filter(Boolean)) {
  let o; try { o = JSON.parse(line); } catch { continue; }
  const content = o?.message?.content;
  if (!Array.isArray(content)) continue;
  for (const c of content) {
    if (c.type === 'text' && o.message.role === 'assistant') events.push({ kind: 'text', text: c.text || '' });
    if (c.type === 'tool_use') events.push({ kind: 'tool', name: c.name, id: c.id, input: c.input || {} });
    if (c.type === 'tool_result') events.push({ kind: 'result', id: c.tool_use_id, isError: c.is_error === true });
  }
}
if (!events.length) { console.error('HARNESS FAULT: nothing parsed'); process.exit(1); }

const tools = events.filter(e => e.kind === 'tool');
const errIds = new Set(events.filter(e => e.kind === 'result' && e.isError).map(e => e.id));
const hardErrors = tools.filter(t => errIds.has(t.id)).length;

// 1. self-correction markers
const texts = events.filter(e => e.kind === 'text');
const markerMsgs = texts.filter(e => MARKER.test(e.text)).length;
// strict: marker text immediately followed by a tool call
let strictMarkers = 0;
for (let i = 0; i < events.length - 1; i++) {
  if (events[i].kind === 'text' && MARKER.test(events[i].text)) {
    const nxt = events.slice(i + 1, i + 3).find(e => e.kind === 'tool');
    if (nxt) strictMarkers++;
  }
}

// 2. Write -> Edit same path within 5 tool calls
let writeThenEdit = 0;
for (let i = 0; i < tools.length; i++) {
  if (tools[i].name !== 'Write') continue;
  const p = String(tools[i].input.file_path || '');
  for (let j = i + 1; j < Math.min(i + 6, tools.length); j++) {
    if (tools[j].name === 'Edit' && String(tools[j].input.file_path || '') === p) { writeThenEdit++; break; }
  }
}

// 3. diagnostic follow-ups: a Bash call right after another Bash call, whose command
//    is a probe (echo/ls/cat/wc/grep -c/command -v/--version) rather than new work
const bashIdx = tools.map((t, i) => ({ t, i })).filter(x => x.t.name === 'Bash');
const PROBE = /(^|\|\s*|&&\s*|;\s*)(echo|ls|cat|wc|head|tail|grep -c|command -v|which)\b|--version/;
let diagnostics = 0;
for (let k = 1; k < bashIdx.length; k++) {
  if (bashIdx[k].i - bashIdx[k - 1].i <= 2 && PROBE.test(String(bashIdx[k].t.input.command || ''))) diagnostics++;
}

const bashTotal = bashIdx.length;
const composite = strictMarkers + writeThenEdit + diagnostics;

const b4 = (n, a, b, c) => n < a ? 'A' : n < b ? 'B' : n < c ? 'C' : 'D';
const b3 = (n, a, b) => n < a ? 'A' : n < b ? 'B' : 'C';

const items = [
  ['1 marker messages',   b4(markerMsgs, 10, 30, 60), 'C', 'B', 0.45, `${markerMsgs} (strict ${strictMarkers})`],
  ['2 Write->Edit pairs',  b3(writeThenEdit, 5, 15),  'B', 'A', 0.45, `${writeThenEdit}`],
  ['3 diagnostic follow',  b3(diagnostics, 10, 30),   'B', 'B', 0.45, `${diagnostics}`],
  ['4 composite >= 2x hard', composite >= 2 * hardErrors ? 'true' : 'false', 'true', 'true', 0.70,
                             `${composite} vs ${2 * hardErrors}`],
  ['5 total Bash calls',   b4(bashTotal, 100, 150, 1e9), 'B', 'B', 0.60, `${bashTotal}`],
];

let right = 0, brier = 0;
const order = { A: 0, B: 1, C: 2, D: 3 };
for (const [label, actual, claim, gut, conf, detail] of items) {
  const pass = actual === claim;
  if (pass) right++;
  brier += Math.pow(conf - (pass ? 1 : 0), 2);
  console.log(`${label.padEnd(24)} ${(pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${conf.toFixed(2)}  ` +
    `claimed ${claim.padEnd(5)} gut ${gut.padEnd(5)} actual ${actual.padEnd(5)}  [${detail}]`);
}
const n = items.length, acc = right / n, B = brier / n;
const meanConf = items.reduce((s, i) => s + i[4], 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${B.toFixed(4)}   gap ${(meanConf - acc).toFixed(3)}`);

const above = items.slice(0, 3).filter(([, a, , g]) => order[a] > order[g]).length;
console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  U1 "behavioural finds more than is_error" (0.85): ${composite} vs ${hardErrors} -> ${composite > hardErrors ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  U2 ">=1 still above my 2-3x estimate"     (0.45): ${above} -> ${above >= 1 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log(`\n=== DETECTOR COMPARISON ===`);
console.log(`  is_error (Round 18 method)        : ${hardErrors}`);
console.log(`  retry pairs (Round 20)            : 8`);
console.log(`  self-correction markers (strict)  : ${strictMarkers}   (loose ${markerMsgs})`);
console.log(`  Write->Edit within 5 calls        : ${writeThenEdit}`);
console.log(`  diagnostic follow-ups             : ${diagnostics}`);
console.log(`  composite behavioural             : ${composite}`);
console.log(`  ratio behavioural / is_error      : ${(composite / Math.max(1, hardErrors)).toFixed(1)}x`);
