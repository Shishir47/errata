// Round 05 verification — node verify.js
// Subject: SQLite type affinity. Claims are a complete cross-product, so no
// cell can be skipped, softened, or cherry-picked. Node is only the harness.

const { spawnSync } = require('node:child_process');

function sql(script) {
  const r = spawnSync('sqlite3', ['-batch', ':memory:'], { input: script, encoding: 'utf8' });
  if (r.status !== 0) throw new Error((r.stderr || '').trim() || 'sqlite3 exit ' + r.status);
  return (r.stdout || '').trim().split(/\r?\n/).map(s => s.trim());
}

const TYPES  = ['INTEGER', 'VARCHAR(10)', 'BLOB', 'REAL', 'BOOLEAN', 'POINT'];
const VALUES = ['1', '1.0', "'1'", "'abc'", "X'61'", 'NULL'];

// Block A predictions: [typeof, gutConfidence] in TYPES x VALUES order.
const A = {
  'INTEGER':     [['integer',0.95], ['integer',0.85], ['integer',0.85], ['text',0.90], ['blob',0.85], ['null',0.97]],
  'VARCHAR(10)': [['text',0.90],    ['text',0.85],    ['text',0.95],    ['text',0.96], ['blob',0.80], ['null',0.97]],
  'BLOB':        [['integer',0.90], ['real',0.90],    ['text',0.92],    ['text',0.94], ['blob',0.95], ['null',0.97]],
  'REAL':        [['real',0.88],    ['real',0.94],    ['real',0.82],    ['text',0.88], ['blob',0.82], ['null',0.97]],
  'BOOLEAN':     [['integer',0.90], ['integer',0.78], ['integer',0.82], ['text',0.88], ['blob',0.80], ['null',0.97]],
  'POINT':       [['integer',0.80], ['integer',0.75], ['integer',0.75], ['text',0.80], ['blob',0.78], ['null',0.95]],
};

const B = [
  ['typeof(1)',      'integer', 0.96], ['typeof(1.0)',   'real', 0.94],
  ['typeof(\'1\')',  'text',    0.96], ['typeof(\'abc\')','text', 0.97],
  ['typeof(X\'61\')','blob',    0.92], ['typeof(NULL)',  'null', 0.97],
];

const results = [];
const ADJ = g => Math.min(0.97, g + 0.08);   // the unfamiliarity-discount correction

// ---------- Block A ----------
for (const t of TYPES) {
  const script = `CREATE TABLE t(c ${t});\n` +
    VALUES.map(v => `INSERT INTO t VALUES (${v});`).join('\n') +
    `\nSELECT typeof(c) FROM t ORDER BY rowid;`;
  let got;
  try { got = sql(script); }
  catch (e) { got = VALUES.map(() => 'ERROR:' + e.message.slice(0, 40)); }

  A[t].forEach(([want, gut], i) => {
    const trivial = VALUES[i] === 'NULL';
    const conf = trivial ? gut : ADJ(gut);
    results.push({
      id: `A ${t} << ${VALUES[i]}`, block: 'A', trivial,
      tag: trivial ? 'g' : 'a', gut, conf,
      claim: `typeof -> ${want}`, pass: got[i] === want,
      detail: `got ${JSON.stringify(got[i])} want ${JSON.stringify(want)}`,
    });
  });
}

// ---------- Block B ----------
const bOut = sql('SELECT ' + B.map(b => b[0]).join(', ') + ';')[0].split('|');
B.forEach(([expr, want, gut], i) => {
  results.push({
    id: `B ${expr}`, block: 'B', trivial: false, tag: 'g', gut, conf: gut,
    claim: `-> ${want}`, pass: bOut[i] === want,
    detail: `got ${JSON.stringify(bOut[i])} want ${JSON.stringify(want)}`,
  });
});

// ---------- report ----------
console.log('sqlite ' + sql('SELECT sqlite_version();')[0] + '\n');

// the grid, as rendered reality
console.log('ACTUAL typeof GRID');
console.log('  ' + 'declared'.padEnd(13) + VALUES.map(v => v.padEnd(9)).join(''));
for (const t of TYPES) {
  const row = results.filter(r => r.id.startsWith(`A ${t} <<`));
  console.log('  ' + t.padEnd(13) +
    row.map(r => (r.detail.match(/got "([^"]*)"/) || [, '?'])[1].padEnd(9)).join('') +
    '  ' + row.map(r => r.pass ? '.' : 'X').join(''));
}

let right = 0, brier = 0, brierGut = 0;
const misses = [];
for (const r of results) {
  if (r.pass) right++; else misses.push(r);
  brier    += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  brierGut += Math.pow(r.gut  - (r.pass ? 1 : 0), 2);
}
const n = results.length, acc = right / n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;

console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean scored confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);

const nt = results.filter(r => !r.trivial);
console.log(`\nexcluding ${n - nt.length} trivial NULL cells: ` +
  `${nt.filter(r => r.pass).length}/${nt.length} = ${(nt.filter(r => r.pass).length / nt.length).toFixed(3)}`);

console.log(`\nMISSES (${misses.length}):`);
if (!misses.length) console.log('  none');
for (const m of misses) console.log(`  ${m.id.padEnd(26)} conf ${m.conf.toFixed(2)} :: ${m.claim}\n     ${m.detail}`);

const adj = results.filter(r => r.tag === 'a');
console.log(`\nUNFAMILIARITY-DISCOUNT EXPERIMENT (n=${adj.length} adjusted, +0.08)`);
const bA = adj.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / adj.length;
const bG = adj.reduce((s, r) => s + Math.pow(r.gut  - (r.pass ? 1 : 0), 2), 0) / adj.length;
console.log(`  adjusted Brier ${bA.toFixed(4)}   gut Brier ${bG.toFixed(4)}   ` +
  (bA < bG ? 'CORRECTION HELPED' : bA > bG ? 'CORRECTION HURT' : 'no difference'));
console.log(`  whole round: scored ${(brier / n).toFixed(4)} vs all-gut ${(brierGut / n).toFixed(4)}`);

console.log('\nCALIBRATION BY BAND (scored)');
for (const [lo, hi] of [[0, 0.75], [0.75, 0.85], [0.85, 0.93], [0.93, 1.01]]) {
  const g = results.filter(r => r.conf >= lo && r.conf < hi);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  conf ${lo.toFixed(2)}-${hi.toFixed(2)}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}
