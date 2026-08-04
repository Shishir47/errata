// Round 02 verification — run with:  node verify.js
// Mechanical enumeration of the node:path surface. No claim is graded by argument.

const path = require('node:path');
const results = [];
const S = JSON.stringify;
const add = (id, conf, claim, pass, detail) => results.push({ id, conf, claim, pass, detail });
const check = (id, conf, claim, fn) => {
  try { const r = fn(); add(id, conf, claim, r.pass, r.detail); }
  catch (e) { add(id, conf, claim, false, 'threw: ' + e.message); }
};

// ---------- harness assumptions, scored ----------
check('H1', 0.93, 'fn.length stops at first default/rest param', () => {
  const a = ((x, y = 1, z) => {}).length;   // expect 1
  const b = ((...xs) => {}).length;         // expect 0
  return { pass: a === 1 && b === 0, detail: `default-stop=${a} rest=${b}` };
});
check('H2', 0.88, "on Windows require('node:path') is win32 (sep='\\\\', delimiter=';')", () => {
  return { pass: process.platform === 'win32' && path.sep === '\\' && path.delimiter === ';',
           detail: `platform=${process.platform} sep=${S(path.sep)} delim=${S(path.delimiter)}` };
});
check('H3', 0.70, "require('node:path') === path.win32 (strict identity)", () => {
  return { pass: path === path.win32, detail: `identity=${path === path.win32}` };
});
check('H4', 0.85, 'exports are own enumerable props (visible to Object.keys)', () => {
  const k = Object.keys(path);
  return { pass: k.includes('join') && k.includes('sep'), detail: `${k.length} keys enumerable` };
});

// ---------- A. the complete export set ----------
const PREDICTED = ['resolve','normalize','isAbsolute','join','relative','toNamespacedPath',
                   'dirname','basename','extname','format','parse','matchesGlob',
                   'sep','delimiter','win32','posix'];
const ACTUAL = Object.keys(path);
const missing = ACTUAL.filter(k => !PREDICTED.includes(k));   // I failed to recall these
const invented = PREDICTED.filter(k => !ACTUAL.includes(k));  // I made these up

add('A-set', 0.30, 'predicted export set is exactly right',
    missing.length === 0 && invented.length === 0,
    `predicted ${PREDICTED.length}, actual ${ACTUAL.length} | missed: ${S(missing)} | invented: ${S(invented)}`);

check('A-glob', 0.55, 'matchesGlob exists on this Node', () =>
  ({ pass: typeof path.matchesGlob === 'function', detail: `typeof=${typeof path.matchesGlob}` }));
check('A-makeLong', 0.45, '_makeLong is NOT an enumerable own key', () =>
  ({ pass: !ACTUAL.includes('_makeLong'),
     detail: `inKeys=${ACTUAL.includes('_makeLong')} typeof=${typeof path._makeLong}` }));

// ---------- B. arity ----------
const ARITY = { resolve:[0,0.85], join:[0,0.85], normalize:[1,0.90], isAbsolute:[1,0.92],
                relative:[2,0.88], toNamespacedPath:[1,0.85], dirname:[1,0.92],
                basename:[2,0.75], extname:[1,0.92], format:[1,0.88], parse:[1,0.90],
                matchesGlob:[2,0.50] };
for (const [name, [want, conf]] of Object.entries(ARITY)) {
  const fn = path[name];
  if (typeof fn !== 'function') { add('B-' + name, conf, `${name}.length === ${want}`, false, 'not a function'); continue; }
  add('B-' + name, conf, `${name}.length === ${want}`, fn.length === want, `actual=${fn.length}`);
}

// ---------- C. constants ----------
check('C1', 0.88, "sep === '\\\\'", () => ({ pass: path.sep === '\\', detail: S(path.sep) }));
check('C2', 0.88, "delimiter === ';'", () => ({ pass: path.delimiter === ';', detail: S(path.delimiter) }));
check('C3', 0.96, "posix.sep === '/' && posix.delimiter === ':'", () =>
  ({ pass: path.posix.sep === '/' && path.posix.delimiter === ':',
     detail: `${S(path.posix.sep)} ${S(path.posix.delimiter)}` }));
check('C4', 0.95, "win32.sep === '\\\\'", () => ({ pass: path.win32.sep === '\\', detail: S(path.win32.sep) }));
check('C5', 0.95, 'win32 and posix are objects', () =>
  ({ pass: typeof path.win32 === 'object' && typeof path.posix === 'object',
     detail: `${typeof path.win32} ${typeof path.posix}` }));

// ---------- D. behaviour ----------
const D = [
  ['D1', 0.93, "basename('/a/b/c.txt','.txt') -> 'c'", () => path.basename('/a/b/c.txt', '.txt'), 'c'],
  ['D2', 0.75, "extname('.gitignore') -> ''",           () => path.extname('.gitignore'), ''],
  ['D3', 0.60, "extname('index.') -> '.'",              () => path.extname('index.'), '.'],
  ['D4', 0.95, "extname('a.b.c') -> '.c'",              () => path.extname('a.b.c'), '.c'],
  ['D6', 0.85, "isAbsolute('C:/foo') -> true",          () => path.isAbsolute('C:/foo'), true],
  ['D7', 0.70, "isAbsolute('/foo') -> true",            () => path.isAbsolute('/foo'), true],
  ['D8', 0.65, "isAbsolute('C:foo') -> false",          () => path.isAbsolute('C:foo'), false],
  ['D9', 0.70, "join('a','..','..','b') -> '..\\\\b'",  () => path.join('a', '..', '..', 'b'), '..\\b'],
  ['D10',0.70, "normalize('a//b/../c/') -> 'a\\\\c\\\\'", () => path.normalize('a//b/../c/'), 'a\\c\\'],
  ['D11',0.85, "relative('C:\\\\a\\\\b','C:\\\\a\\\\c') -> '..\\\\c'", () => path.relative('C:\\a\\b', 'C:\\a\\c'), '..\\c'],
  ['D12',0.72, "toNamespacedPath('C:\\\\a') -> '\\\\\\\\?\\\\C:\\\\a'", () => path.toNamespacedPath('C:\\a'), '\\\\?\\C:\\a'],
  ['D14',0.85, "format({dir:'C:\\\\a',base:'b.txt'}) -> 'C:\\\\a\\\\b.txt'", () => path.format({ dir: 'C:\\a', base: 'b.txt' }), 'C:\\a\\b.txt'],
  ['D15',0.72, "dirname('C:\\\\') -> 'C:\\\\'",         () => path.dirname('C:\\'), 'C:\\'],
  ['D16',0.80, "join('a','') -> 'a'",                   () => path.join('a', ''), 'a'],
  ['D17',0.78, "normalize('') -> '.'",                  () => path.normalize(''), '.'],
];
for (const [id, conf, claim, fn, want] of D) {
  check(id, conf, claim, () => { const got = fn(); return { pass: got === want, detail: `got ${S(got)} want ${S(want)}` }; });
}
check('D5', 0.90, 'resolve() -> process.cwd()', () =>
  ({ pass: path.resolve() === process.cwd(), detail: `${S(path.resolve())} vs cwd ${S(process.cwd())}` }));
check('D13', 0.80, "parse('C:\\\\a\\\\b.txt') fields", () => {
  const got = path.parse('C:\\a\\b.txt');
  const want = { root: 'C:\\', dir: 'C:\\a', base: 'b.txt', ext: '.txt', name: 'b' };
  const pass = Object.keys(want).every(k => got[k] === want[k]);
  return { pass, detail: S(got) };
});

// ---------- report ----------
console.log(`node ${process.version}  platform=${process.platform}\n`);
console.log(`ACTUAL export keys (${ACTUAL.length}): ${ACTUAL.join(', ')}\n`);
let right = 0, brier = 0;
const wrong = [];
for (const r of results) {
  if (r.pass) right++; else wrong.push(r);
  brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  console.log(`${r.id.padEnd(18)} ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${r.conf.toFixed(2)}  ${r.claim}`);
  if (!r.pass) console.log(`                   -> ${r.detail}`);
}
const n = results.length, acc = right / n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);
console.log(`\nMISSES (${wrong.length}):`);
for (const w of wrong) console.log(`  ${w.id} conf ${w.conf.toFixed(2)} :: ${w.claim}\n     ${w.detail}`);

// calibration by confidence band
console.log('\nCALIBRATION BY BAND');
const bands = [[0.0,0.6],[0.6,0.75],[0.75,0.9],[0.9,1.01]];
for (const [lo,hi] of bands) {
  const g = results.filter(r => r.conf >= lo && r.conf < hi);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s,r)=>s+r.conf,0)/g.length;
  console.log(`  conf ${lo.toFixed(2)}-${hi.toFixed(2)}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c-a>=0?'+':'')}${(c-a).toFixed(2)}`);
}
