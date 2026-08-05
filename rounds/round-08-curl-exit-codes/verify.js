// Round 08 verification — node verify.js
// Subject: curl exit codes. Item set is rule-selected from curl's own manual;
// ground truth is curl's own descriptions. Node is only the harness.

const { spawnSync } = require('node:child_process');

// ---------- pull the EXIT CODES section ----------
const man = spawnSync('curl', ['--manual'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
if (man.status !== 0 && !man.stdout) { console.error('curl --manual unavailable'); process.exit(1); }
const lines = man.stdout.replace(/\r/g, '').split('\n');

let inSec = false;
const desc = {};           // code -> description text
let cur = null;
for (const raw of lines) {
  if (/^EXIT CODES/.test(raw)) { inSec = true; continue; }
  if (!inSec) continue;
  if (/^[A-Z][A-Z ]+$/.test(raw)) break;           // next top-level heading
  const m = raw.match(/^ *([0-9]+) *$/);
  if (m) { cur = m[1]; desc[cur] = ''; continue; }
  if (cur) desc[cur] += ' ' + raw.trim();
}

// ---------- predictions (committed in predictions.md) ----------
const P = [
  [1,  0.85, ['protocol']],
  [4,  0.55, ['built', 'not enabled', 'feature']],
  [7,  0.90, ['connect']],
  [10, 0.45, ['accept']],
  [13, 0.40, ['PASV']],
  [16, 0.50, ['HTTP/2', 'HTTP2']],
  [19, 0.40, ['RETR', 'download']],
  [23, 0.80, ['write']],
  [27, 0.70, ['memory']],
  [31, 0.35, ['REST']],
  [35, 0.65, ['SSL', 'TLS']],
  [38, 0.45, ['LDAP', 'bind']],
  [42, 0.50, ['callback', 'abort']],
  [47, 0.72, ['redirect']],
  [52, 0.60, ['empty', 'nothing']],
  [55, 0.55, ['send']],
  [59, 0.45, ['cipher']],
  [63, 0.45, ['size']],
  [66, 0.35, ['engine']],
  [69, 0.30, ['permission', 'TFTP']],
  [72, 0.30, ['TFTP', 'transfer id']],
  [77, 0.50, ['CA cert', 'CA ']],
  [80, 0.35, ['shut', 'SSL']],
  [84, 0.25, ['PRET']],
  [87, 0.25, ['list', 'parse']],
  [90, 0.35, ['pinned', 'public key']],
  [93, 0.20, ['callback']],
  [96, 0.30, ['QUIC']],
  [99, 0.15, ['poll', 'select']],
];

const results = [];
for (const [code, conf, keys] of P) {
  const text = (desc[String(code)] || '').trim();
  const hit = keys.find(k => text.toLowerCase().includes(k.toLowerCase()));
  results.push({
    code, conf, block: conf < 0.5 ? 'L' : 'H',
    pass: Boolean(hit) && text.length > 0,
    hit: hit || null,
    text: text.replace(/\s+/g, ' ').slice(0, 96),
    keys,
  });
}

// ---------- report ----------
console.log(spawnSync('curl', ['--version'], { encoding: 'utf8' }).stdout.split('\n')[0]);
console.log(`parsed ${Object.keys(desc).length} exit-code descriptions from curl --manual\n`);

let right = 0, brier = 0;
const misses = [];
for (const r of results) {
  if (r.pass) right++; else misses.push(r);
  brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  console.log(`${String(r.code).padStart(3)}  ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} [${r.block}] conf ${r.conf.toFixed(2)}  ` +
              (r.pass ? `matched "${r.hit}"` : `wanted ${JSON.stringify(r.keys)}`));
  if (!r.pass) console.log(`     actual: ${r.text}`);
}

const n = results.length, acc = right / n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);

const lo = results.filter(r => r.conf < 0.5), vlo = results.filter(r => r.conf < 0.2);
console.log(`\nQUOTA  below 0.5: ${lo.length}/${n} = ${(lo.length / n * 100).toFixed(1)}% ` +
            `${lo.length / n >= 0.25 ? 'PASS' : 'FAIL'}   below 0.2: ${vlo.length} ` +
            `${vlo.length >= 1 ? 'PASS' : 'FAIL'}   min ${Math.min(...results.map(r => r.conf)).toFixed(2)}`);

// --- discrimination vs calibration, reported separately (Round 07 rule) ---
console.log('\nDISCRIMINATION (do errors sort by block?)');
for (const b of ['L', 'H']) {
  const g = results.filter(r => r.block === b);
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${b}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}
const hMiss = misses.filter(m => m.block === 'H').length;
console.log(`  misses in H: ${hMiss}   misses in L: ${misses.length - hMiss}`);
console.log(`  -> prediction "all misses in L, H goes 12/12" (conf 0.45): ` +
            `${hMiss === 0 ? 'CONFIRMED' : 'DISCONFIRMED'}`);

console.log('\nCALIBRATION BY BAND');
for (const [b0, b1] of [[0, 0.2], [0.2, 0.35], [0.35, 0.5], [0.5, 0.7], [0.7, 1.01]]) {
  const g = results.filter(r => r.conf >= b0 && r.conf < b1);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  conf ${b0.toFixed(2)}-${b1.toFixed(2)}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

console.log(`\nMISSES (${misses.length}):`);
for (const m of misses) console.log(`  ${m.code} [${m.block}] conf ${m.conf.toFixed(2)} wanted ${JSON.stringify(m.keys)}\n     ${m.text}`);
