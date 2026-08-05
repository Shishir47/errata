// Round 26 verification — node verify.js
// Within-round test of compressed-confidence-range: one high-accuracy block,
// one near-chance block, same instrument and scoring.

const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');

// ---------- Block H : sort long -> short ----------
const help = spawnSync('sort', ['--help'], { encoding: 'utf8' });
const htext = ((help.stdout || '') + (help.stderr || '')).replace(/\r/g, '');
const TRUTH = {};
for (const line of htext.split('\n')) {
  const ws = line.match(/^\s*-(\w),\s*--([a-z][a-z0-9-]+)/);
  if (ws) { TRUTH['--' + ws[2]] = '-' + ws[1]; continue; }
  const lo = line.match(/^\s*--([a-z][a-z0-9-]+)/);
  if (lo && !(('--' + lo[1]) in TRUTH)) TRUTH['--' + lo[1]] = 'none';
}

const H = [
  ['--batch-size','none',0.60], ['--check','-c',0.70], ['--debug','none',0.65],
  ['--field-separator','-t',0.85], ['--general-numeric-sort','-g',0.80],
  ['--human-numeric-sort','-h',0.80], ['--ignore-leading-blanks','-b',0.80],
  ['--key','-k',0.90], ['--month-sort','-M',0.80], ['--output','-o',0.90],
  ['--random-sort','-R',0.65], ['--reverse','-r',0.92], ['--stable','-s',0.85],
  ['--unique','-u',0.90], ['--version-sort','-V',0.75],
].map(([k, claim, conf]) => ({
  block: 'H', label: k, claim, conf, actual: TRUTH[k],
  scoreable: TRUTH[k] !== undefined, pass: TRUTH[k] === claim,
}));

// ---------- Block L : system file sizes ----------
const which = n => { try {
  return execFileSync('bash', ['-c', `command -v "$1"`, '_', n], { encoding: 'utf8' }).trim();
} catch { return ''; } };
const winPath = p => p.replace(/^\/([a-z])\//, (_, d) => d.toUpperCase() + ':/');
const bucket = b => b < 32*1024 ? 'A' : b < 128*1024 ? 'B' : b < 512*1024 ? 'C' : 'D';

const L = [
  ['event.format.ps1xml','B',0.30], ['jscript9diag.dll','C',0.30],
  ['microsoft-windows-mptf-events.dll','A',0.30], ['ngcctnr.dll','C',0.28],
  ['regtest.txt','A',0.45], ['synchostps.dll','B',0.28],
  ['webauthn.dll','C',0.35], ['wsaifabrichost.dll','C',0.28],
  ['browseui.dll','D',0.35], ['defaultprinterprovider.dll','B',0.28],
  ['fsiso','C',0.25], ['kbdru1.dll','A',0.45],
].map(([name, claim, conf]) => {
  const p = which(name); let size = null;
  for (const c of [winPath(p), p]) { try { size = fs.statSync(c).size; break; } catch {} }
  return { block: 'L', label: name, claim, conf, size,
           actual: size === null ? undefined : bucket(size),
           scoreable: size !== null, pass: size !== null && bucket(size) === claim };
});

const all = [...H, ...L].filter(r => r.scoreable);
if (all.length < 18) { console.error(`HARNESS FAULT: only ${all.length} scoreable`); process.exit(1); }

const stat = rows => {
  const n = rows.length, right = rows.filter(r => r.pass).length;
  const acc = right / n, conf = rows.reduce((s, r) => s + r.conf, 0) / n;
  const brier = rows.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / n;
  return { n, right, acc, conf, gap: conf - acc, brier };
};

for (const r of [...H, ...L]) {
  const mark = !r.scoreable ? 'SKIP ' : r.pass ? 'RIGHT' : 'WRONG';
  console.log(`[${r.block}] ${r.label.padEnd(34)} ${mark} conf ${r.conf.toFixed(2)}  ` +
    `claimed ${String(r.claim).padEnd(5)} actual ${String(r.actual ?? '(none)')}` +
    (r.size ? `  (${(r.size/1024).toFixed(0)} KB)` : ''));
}

const sh = stat(all.filter(r => r.block === 'H'));
const sl = stat(all.filter(r => r.block === 'L'));
const sa = stat(all);

console.log(`\n           n   acc     conf    gap      Brier`);
for (const [name, s] of [['BLOCK H', sh], ['BLOCK L', sl], ['OVERALL', sa]])
  console.log(`${name.padEnd(10)} ${String(s.n).padStart(2)}  ${s.acc.toFixed(3)}  ${s.conf.toFixed(3)}  ` +
    `${(s.gap >= 0 ? '+' : '') + s.gap.toFixed(3)}   ${s.brier.toFixed(4)}`);

console.log(`\n=== ${sa.right}/${sa.n} right   accuracy ${sa.acc.toFixed(3)}`);
console.log(`mean stated confidence ${sa.conf.toFixed(3)}   Brier ${sa.brier.toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${sa.gap.toFixed(3)}`);

console.log(`\n=== PRE-REGISTERED ===`);
console.log(`  Z1 "gap(H) < -0.25"              (0.70): ${sh.gap.toFixed(3)} -> ${sh.gap < -0.25 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  Z2 "|gap(L)| < 0.15"             (0.60): ${Math.abs(sl.gap).toFixed(3)} -> ${Math.abs(sl.gap) < 0.15 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  Z3 "gap(H) < gap(L) - 0.20"      (0.75): ${sh.gap.toFixed(3)} vs ${(sl.gap - 0.20).toFixed(3)} -> ${sh.gap < sl.gap - 0.20 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  Z4 "acc(H) - acc(L) > 0.40"      (0.75): ${(sh.acc - sl.acc).toFixed(3)} -> ${sh.acc - sl.acc > 0.40 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`\n  compression signature: confidence range ${(sh.conf - sl.conf).toFixed(3)} vs accuracy range ${(sh.acc - sl.acc).toFixed(3)}`);
console.log(`  -> confidence moved ${((sh.conf - sl.conf) / Math.max(0.001, sh.acc - sl.acc) * 100).toFixed(0)}% as far as accuracy did`);
