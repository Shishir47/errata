// Round 07 verification — node verify.js
// Subject: awk semantics. Each item is a separate invocation.
// Quota compliance is COMPUTED here, not counted by hand (unverified-narration).

const { spawnSync } = require('node:child_process');

function awk(prog, stdin) {
  const r = spawnSync('awk', [prog], { input: stdin ?? '', encoding: 'utf8' });
  return { code: r.status, out: (r.stdout ?? ''), err: (r.stderr ?? '').trim() };
}

const results = [];
const check = (id, conf, block, claim, fn) => {
  let pass, detail;
  try { const r = fn(); pass = r.pass; detail = r.detail; }
  catch (e) { pass = false; detail = 'threw: ' + e.message; }
  results.push({ id, conf, block, claim, pass, detail });
};
const J = JSON.stringify;
// exact-stdout helper
const out = (id, conf, block, claim, prog, want) =>
  check(id, conf, block, claim, () => {
    const r = awk(prog);
    return { pass: r.out === want, detail: `got ${J(r.out)} want ${J(want)}${r.err ? ' | err: ' + r.err.slice(0, 60) : ''}` };
  });

// ---------- Block L ----------
out('L1', 0.15, 'L', 'for-in order is 1 2 3 x',
    'BEGIN{a["1"];a["2"];a["3"];a["x"]; for(k in a) printf "%s ",k}', '1 2 3 x ');
out('L2', 0.35, 'L', 'substr("hello",1.5,2) == "el"', 'BEGIN{print substr("hello",1.5,2)}', 'el\n');
out('L3', 0.40, 'L', 'index("abc","") == 0',          'BEGIN{print index("abc","")}', '0\n');
out('L4', 0.42, 'L', 'gsub(/x*/,"-") on "abc" -> "-a-b-c-", n=4',
    'BEGIN{s="abc"; n=gsub(/x*/,"-",s); print n, s}', '4 -a-b-c-\n');
check('L5', 0.45, 'L', 'print 1/0 is a fatal error, non-zero exit', () => {
  const r = awk('BEGIN{print 1/0}');
  return { pass: r.code !== 0, detail: `exit=${r.code} out=${J(r.out)} err=${J(r.err.slice(0, 70))}` };
});
out('L6', 0.40, 'L', 'substr("hello",0,2) == "h"', 'BEGIN{print substr("hello",0,2)}', 'h\n');
out('L7', 0.42, 'L', 'printf "%c","65" prints 6',   'BEGIN{printf "%c","65"}', '6');
out('L8', 0.35, 'L', 'srand() first call returns 0', 'BEGIN{print srand()}', '0\n');
check('L9', 0.48, 'L', 'length(array) works', () => {
  const r = awk('BEGIN{A[1];A[2];A[3]; print length(A)}');
  return { pass: r.code === 0 && r.out === '3\n', detail: `exit=${r.code} out=${J(r.out)}${r.err ? ' err=' + J(r.err.slice(0, 60)) : ''}` };
});
out('L10', 0.45, 'L', 'length("héllo") == 5 (UTF-8 aware)', 'BEGIN{print length("héllo")}', '5\n');
out('L11', 0.45, 'L', 'print 2^53 is exact integer',  'BEGIN{print 2^53}', '9007199254740992\n');

// ---------- Block H ----------
check('H1', 0.60, 'H', 'this awk is GNU Awk (gawk)', () => {
  const r = spawnSync('awk', ['--version'], { encoding: 'utf8' });
  const banner = ((r.stdout || '') + (r.stderr || '')).split('\n')[0];
  return { pass: /GNU Awk/i.test(banner), detail: J(banner.slice(0, 70)) };
});
check('H2', 0.85, 'H', 'BEGIN{exit 3} exits 3', () => {
  const r = awk('BEGIN{exit 3}');
  return { pass: r.code === 3, detail: `exit=${r.code}` };
});
out('H3',  0.85, 'H', 'length(12345) == 5',        'BEGIN{print length(12345)}', '5\n');
out('H4',  0.92, 'H', 'split("a:b:c",A,":") == 3', 'BEGIN{print split("a:b:c",A,":")}', '3\n');
out('H5',  0.92, 'H', 'uninitialised x+0 == 0',    'BEGIN{print x+0}', '0\n');
out('H6',  0.88, 'H', 'uninitialised x=="" is 1',  'BEGIN{print (x=="")}', '1\n');
out('H7',  0.80, 'H', '"10" < "9" is 1',           'BEGIN{print ("10" < "9")}', '1\n');
out('H8',  0.88, 'H', '0.1+0.2==0.3 is 0',         'BEGIN{print (0.1+0.2==0.3)}', '0\n');
out('H9',  0.72, 'H', 'OFMT is %.6g',              'BEGIN{print OFMT}', '%.6g\n');
out('H10', 0.70, 'H', 'CONVFMT is %.6g',           'BEGIN{print CONVFMT}', '%.6g\n');
out('H11', 0.75, 'H', 'print 3.14159265 -> 3.14159', 'BEGIN{print 3.14159265}', '3.14159\n');
out('H12', 0.95, 'H', 'toupper("abc1") == ABC1',   'BEGIN{print toupper("abc1")}', 'ABC1\n');
out('H13', 0.92, 'H', 'substr("hello",2) == ello', 'BEGIN{print substr("hello",2)}', 'ello\n');
out('H14', 0.92, 'H', 'substr("hello",2,3) == ell','BEGIN{print substr("hello",2,3)}', 'ell\n');
out('H15', 0.90, 'H', '$0="a b c" -> NF==3',       'BEGIN{$0="a b c"; print NF}', '3\n');
out('H16', 0.90, 'H', 'BEGIN NR == 0',             'BEGIN{print NR}', '0\n');
out('H17', 0.90, 'H', 'substr("hello",2,100) == ello', 'BEGIN{print substr("hello",2,100)}', 'ello\n');
out('H18', 0.85, 'H', 'sub(/l/,"L",s) -> 1 heLlo', 'BEGIN{s="hello"; print sub(/l/,"L",s), s}', '1 heLlo\n');
out('H19', 0.92, 'H', '10%3 == 1',                 'BEGIN{print 10%3}', '1\n');
out('H20', 0.90, 'H', '2^10 == 1024',              'BEGIN{print 2^10}', '1024\n');
out('H21', 0.70, 'H', 'print -0 is "0"',           'BEGIN{print -0}', '0\n');

// ---------- report ----------
let right = 0, brier = 0;
const misses = [];
for (const r of results) {
  if (r.pass) right++; else misses.push(r);
  brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  console.log(`${r.id.padEnd(5)} ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} conf ${r.conf.toFixed(2)}  ${r.claim}`);
  if (!r.pass) console.log(`      -> ${r.detail}`);
}
const n = results.length, acc = right / n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);

// --- QUOTA COMPLIANCE, computed ---
const lo   = results.filter(r => r.conf < 0.5);
const vlo  = results.filter(r => r.conf < 0.2);
console.log(`\nQUOTA (Round 06 rule: >=25% below 0.5, >=1 below 0.2)`);
console.log(`  below 0.5 : ${lo.length}/${n} = ${(lo.length / n * 100).toFixed(1)}%  ` +
            `${lo.length / n >= 0.25 ? 'PASS' : 'FAIL'}`);
console.log(`  below 0.2 : ${vlo.length}  ${vlo.length >= 1 ? 'PASS' : 'FAIL'}`);
console.log(`  min stated confidence: ${Math.min(...results.map(r => r.conf)).toFixed(2)}`);

console.log(`\nMISSES (${misses.length}):`);
if (!misses.length) console.log('  none');
for (const m of misses) console.log(`  ${m.id} conf ${m.conf.toFixed(2)} :: ${m.claim}\n     ${m.detail}`);

console.log('\nBY BLOCK');
for (const b of ['L', 'H']) {
  const g = results.filter(r => r.block === b);
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${b}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

console.log('\nCALIBRATION BY BAND');
for (const [b0, b1] of [[0, 0.2], [0.2, 0.5], [0.5, 0.75], [0.75, 0.9], [0.9, 1.01]]) {
  const g = results.filter(r => r.conf >= b0 && r.conf < b1);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  conf ${b0.toFixed(2)}-${b1.toFixed(2)}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}
