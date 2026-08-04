// Round 06 verification — node verify.js
// Subject: the tar (ustar) header byte layout, GNU tar 1.35.
// Builds a real archive and reads the bytes. Node is only the harness.

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// ---------- build a deterministic archive ----------
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'errata6-'));
fs.writeFileSync(path.join(dir, 'hello.txt'), 'hi\n');           // exactly 3 bytes
execFileSync('tar', ['-cf', 'out.tar', 'hello.txt'], { cwd: dir });
const buf = fs.readFileSync(path.join(dir, 'out.tar'));
const H = buf.subarray(0, 512);

const results = [];
const add = (id, conf, tag, claim, pass, detail) => results.push({ id, conf, tag, claim, pass, detail });
const check = (id, conf, tag, claim, fn) => {
  try { const r = fn(); add(id, conf, tag, claim, r.pass, r.detail); }
  catch (e) { add(id, conf, tag, claim, false, 'threw: ' + e.message); }
};
const str = (off, len) => H.subarray(off, off + len).toString('latin1');
const trimNul = s => s.replace(/\0+$/, '');

// ---------- predicted layout ----------
const FIELDS = [
  //  name          off   size  confOff confSize
  ['name',            0,  100,  0.97,  0.92],
  ['mode',          100,    8,  0.88,  0.88],
  ['uid',           108,    8,  0.85,  0.88],
  ['gid',           116,    8,  0.85,  0.88],
  ['size',          124,   12,  0.88,  0.90],
  ['mtime',         136,   12,  0.85,  0.88],
  ['chksum',        148,    8,  0.85,  0.85],
  ['typeflag',      156,    1,  0.88,  0.92],
  ['linkname',      157,  100,  0.85,  0.88],
  ['magic',         257,    6,  0.88,  0.82],
  ['version',       263,    2,  0.82,  0.82],
  ['uname',         265,   32,  0.80,  0.85],
  ['gname',         297,   32,  0.78,  0.85],
  ['devmajor',      329,    8,  0.75,  0.80],
  ['devminor',      337,    8,  0.75,  0.80],
  ['prefix',        345,  155,  0.72,  0.75],
];

// Ground truth for the layout is established by CONTENT probes: if a field's
// predicted (offset,size) is wrong, the bytes there won't match its semantics.
const PROBE = {
  name:     s => /^hello\.txt\0*$/.test(s),
  mode:     s => /^[0-7]{6,7}\0$/.test(s),
  uid:      s => /^[0-7]{6,7}\0$/.test(s) || /^\0{8}$/.test(s),
  gid:      s => /^[0-7]{6,7}\0$/.test(s) || /^\0{8}$/.test(s),
  size:     s => s === '00000000003\0',
  mtime:    s => /^[0-7]{11}\0$/.test(s),
  chksum:   s => /^[0-7]{6}\0 $/.test(s),
  typeflag: s => s === '0',
  linkname: s => /^\0{100}$/.test(s),
  magic:    s => s === 'ustar ' || s === 'ustar\0',
  version:  s => s === ' \0' || s === '00',
  uname:    s => /^[^\0]*\0*$/.test(s) && s.length === 32,
  gname:    s => /^[^\0]*\0*$/.test(s) && s.length === 32,
  devmajor: s => /^[0-7]{6,7}\0$/.test(s) || /^\0{8}$/.test(s),
  devminor: s => /^[0-7]{6,7}\0$/.test(s) || /^\0{8}$/.test(s),
  prefix:   s => /^\0{155}$/.test(s),
};

for (const [name, off, size, cOff, cSize] of FIELDS) {
  const s = str(off, size);
  const ok = PROBE[name](s);
  add(`R-${name}`, cSize, 'recalled', `${name} size = ${size}`, ok,
      `bytes[${off}..${off + size - 1}] = ${JSON.stringify(trimNul(s).slice(0, 24))}`);
  add(`O-${name}`, cOff, 'recalled', `${name} offset = ${off}`, ok,
      ok ? 'content matches semantics at this offset' : 'content mismatch');
}

// ---------- coherence: do my offsets equal cumsum of my sizes? ----------
let run = 0, coherent = true, firstBreak = null;
for (const [name, off, size] of FIELDS) {
  if (off !== run) { coherent = false; firstBreak = firstBreak || `${name}: stated ${off}, cumsum ${run}`; }
  run = off + size;
}
add('COHERENCE', 0.90, 'derived', 'offsets == cumulative sum of sizes; prefix ends at 500',
    coherent && run === 500, coherent ? `consistent, prefix ends at ${run}` : `BREAK at ${firstBreak}`);

// ---------- Block F ----------
check('F1', 0.97, 'recalled', 'block size is 512', () =>
  ({ pass: buf.length % 512 === 0, detail: `archive ${buf.length} bytes, ${buf.length / 512} blocks` }));
check('F2', 0.65, 'recalled', "GNU default magic+version is 'ustar  \\0'", () => {
  const mv = str(257, 8);
  return { pass: mv === 'ustar  \0', detail: `bytes[257..264] = ${JSON.stringify(mv)}` };
});
check('F3', 0.85, 'recalled', "typeflag for regular file is '0'", () =>
  ({ pass: str(156, 1) === '0', detail: JSON.stringify(str(156, 1)) }));
check('F4', 0.85, 'recalled', 'size is 11 octal digits + NUL', () =>
  ({ pass: str(124, 12) === '00000000003\0', detail: JSON.stringify(str(124, 12)) }));
check('F5', 0.78, 'recalled', 'mode is 7 octal digits + NUL', () =>
  ({ pass: /^[0-7]{7}\0$/.test(str(100, 8)), detail: JSON.stringify(str(100, 8)) }));
check('F6', 0.70, 'recalled', 'chksum is 6 octal digits, NUL, space', () =>
  ({ pass: /^[0-7]{6}\0 $/.test(str(148, 8)), detail: JSON.stringify(str(148, 8)) }));

const stored = parseInt(trimNul(str(148, 8)).trim(), 8);
const sumWith = fill => {
  let t = 0;
  for (let i = 0; i < 512; i++) t += (i >= 148 && i < 156) ? fill : H[i];
  return t;
};
check('F7', 0.85, 'recalled', 'checksum computed with chksum field as 8 spaces', () =>
  ({ pass: sumWith(0x20) === stored, detail: `stored ${stored}, spaces ${sumWith(0x20)}, zeros ${sumWith(0)}` }));
check('F8', 0.85, 'recalled', 'checksum is a plain unsigned byte sum', () =>
  ({ pass: sumWith(0x20) === stored, detail: `unsigned sum ${sumWith(0x20)} vs stored ${stored}` }));
check('F9', 0.90, 'recalled', 'archive ends with two 512-byte zero blocks', () => {
  const tail = buf.subarray(buf.length - 1024);
  return { pass: tail.every(b => b === 0), detail: `last 1024 bytes all zero = ${tail.every(b => b === 0)}` };
});
check('F10', 0.80, 'recalled', 'archive size is a multiple of 10240 (blocking factor 20)', () =>
  ({ pass: buf.length % 10240 === 0, detail: `${buf.length} bytes; ${buf.length}/10240 = ${(buf.length / 10240).toFixed(3)}` }));
check('F11', 0.90, 'derived', 'linkname all-NUL for a regular file', () =>
  ({ pass: /^\0{100}$/.test(str(157, 100)), detail: `nonzero bytes = ${[...H.subarray(157, 257)].filter(Boolean).length}` }));
check('F12', 0.85, 'derived', 'prefix all-NUL for a short filename', () =>
  ({ pass: /^\0{155}$/.test(str(345, 155)), detail: `nonzero bytes = ${[...H.subarray(345, 500)].filter(Boolean).length}` }));
check('F13', 0.62, 'recalled', 'uname is non-empty', () =>
  ({ pass: trimNul(str(265, 32)).length > 0, detail: `uname = ${JSON.stringify(trimNul(str(265, 32)))}` }));

// ---------- report ----------
console.log(execFileSync('tar', ['--version']).toString().split('\n')[0]);
console.log(`archive ${buf.length} bytes\n`);

let right = 0, brier = 0;
const misses = [];
for (const r of results) {
  if (r.pass) right++; else misses.push(r);
  brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  console.log(`${r.id.padEnd(13)} ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${r.conf.toFixed(2)} [${r.tag.padEnd(8)}] ${r.claim}`);
  if (!r.pass) console.log(`              -> ${r.detail}`);
}
const n = results.length, acc = right / n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);
console.log(`\nEFFECTIVE n: ~26 independent bets behind ${n} scored items`);
console.log(`  (the 16 offset claims are recoverable from the 16 size claims — one table, read twice)`);

console.log(`\nMISSES (${misses.length}):`);
if (!misses.length) console.log('  none');
for (const m of misses) console.log(`  ${m.id} [${m.tag}] conf ${m.conf.toFixed(2)} :: ${m.claim}\n     ${m.detail}`);

console.log('\nBY TAG  (the derived-vs-recalled experiment)');
for (const t of ['recalled', 'derived']) {
  const g = results.filter(r => r.tag === t);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${t.padEnd(9)} n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

fs.rmSync(dir, { recursive: true, force: true });
