// Round 09 verification — node verify.js
// Subject: errno message text. Items rule-selected from perl's %! ; ground truth
// is the system's own strerror. Keywords must be DISTINGUISHING (Round 08 fix).

const { spawnSync } = require('node:child_process');

// ---------- ground truth: every errno name -> its strerror text ----------
const p = spawnSync('perl', ['-MErrno', '-e', `
  my @k = sort keys %!;
  for my $n (@k) { $! = 0; eval "\\$! = Errno::\${n}()"; my $m = "$!"; print "$n\\t$m\\n"; }
`], { encoding: 'utf8' });
if (p.status !== 0) { console.error(p.stderr); process.exit(1); }

const MSG = {};
for (const line of p.stdout.replace(/\r/g, '').split('\n')) {
  const [n, ...rest] = line.split('\t');
  if (n && rest.length) MSG[n] = rest.join('\t').trim();
}
const ALL = Object.keys(MSG);

// ---------- predictions (committed in predictions.md) ----------
const P = [
  ['E2BIG',           0.80, 'argument list'],
  ['EADV',            0.35, 'advertise'],
  ['EBADE',           0.30, 'exchange'],
  ['EBADR',           0.18, 'request descriptor'],
  ['EBUSY',           0.88, 'busy'],
  ['ECHRNG',          0.40, 'channel'],
  ['ECONNRESET',      0.90, 'reset'],
  ['EDOM',            0.80, 'domain'],
  ['EFAULT',          0.82, 'bad address'],
  ['EHOSTUNREACH',    0.75, 'route to host'],
  ['EINTR',           0.88, 'interrupted'],
  ['EISDIR',          0.88, 'is a directory'],
  ['EL3RST',          0.35, 'level 3'],
  ['ELIBEXEC',        0.30, 'shared library'],
  ['ELOOP',           0.82, 'symbolic links'],
  ['EMULTIHOP',       0.45, 'multihop'],
  ['ENETUNREACH',     0.85, 'network is unreachable'],
  ['ENOBUFS',         0.80, 'buffer space'],
  ['ENOENT',          0.95, 'no such file'],
  ['ENOMEDIUM',       0.55, 'medium'],
  ['ENOPKG',          0.35, 'package'],
  ['ENOSR',           0.35, 'streams'],
  ['ENOTCONN',        0.75, 'not connected'],
  ['ENOTSOCK',        0.72, 'non-socket'],
  ['ENXIO',           0.70, 'no such device'],
  ['EPERM',           0.92, 'not permitted'],
  ['EPROTO',          0.65, 'protocol error'],
  ['EREMCHG',         0.30, 'remote address'],
  ['ESOCKTNOSUPPORT', 0.60, 'socket type'],
  ['ESTALE',          0.70, 'stale'],
  ['ETOOMANYREFS',    0.40, 'references'],
  ['EWOULDBLOCK',     0.65, 'temporarily unavailable'],
];

// The plain-English claim committed in predictions.md, scored independently of
// keywords. Normalised equality: stricter than keyword matching, not looser.
const CLAIM = {
  E2BIG: 'argument list too long', EADV: 'advertise error', EBADE: 'invalid exchange',
  EBADR: 'invalid request descriptor', EBUSY: 'device or resource busy',
  ECHRNG: 'channel number out of range', ECONNRESET: 'connection reset by peer',
  EDOM: 'numerical argument out of domain', EFAULT: 'bad address',
  EHOSTUNREACH: 'no route to host', EINTR: 'interrupted system call',
  EISDIR: 'is a directory', EL3RST: 'level 3 reset',
  ELIBEXEC: 'cannot exec a shared library directly',
  ELOOP: 'too many levels of symbolic links', EMULTIHOP: 'multihop attempted',
  ENETUNREACH: 'network is unreachable', ENOBUFS: 'no buffer space available',
  ENOENT: 'no such file or directory', ENOMEDIUM: 'no medium found',
  ENOPKG: 'package not installed', ENOSR: 'out of streams resources',
  ENOTCONN: 'transport endpoint is not connected',
  ENOTSOCK: 'socket operation on non-socket', ENXIO: 'no such device or address',
  EPERM: 'operation not permitted', EPROTO: 'protocol error',
  EREMCHG: 'remote address changed', ESOCKTNOSUPPORT: 'socket type not supported',
  ESTALE: 'stale file handle', ETOOMANYREFS: 'too many references cannot splice',
  EWOULDBLOCK: 'resource temporarily unavailable',
};
const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const results = [];
for (const [name, conf, key] of P) {
  const target = (MSG[name] || '').toLowerCase();
  const k = key.toLowerCase();
  const inTarget = target.includes(k);
  // DISTINGUISHING: the keyword must appear in no OTHER errno's message
  const others = ALL.filter(n => n !== name && (MSG[n] || '').toLowerCase().includes(k));
  const unique = others.length === 0;
  results.push({
    name, conf, key,
    block: conf < 0.5 ? 'L' : 'H',
    pass: inTarget && unique,
    inTarget, unique, others,
    actual: MSG[name] || '(none)',
    knew: norm(CLAIM[name] || '') === norm(MSG[name] || ''),
  });
}

// ---------- report ----------
console.log(`perl ${spawnSync('perl', ['-e', 'print $]'], { encoding: 'utf8' }).stdout}`);
console.log(`ground truth: ${ALL.length} errno messages from strerror\n`);

let right = 0, brier = 0;
const misses = [];
for (const r of results) {
  if (r.pass) right++; else misses.push(r);
  brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  const why = r.pass ? '' : (!r.inTarget ? ' [keyword absent]' : ` [not distinguishing: also in ${r.others.slice(0, 3).join(',')}]`);
  console.log(`${r.name.padEnd(16)} ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} [${r.block}] conf ${r.conf.toFixed(2)}  "${r.key}"${why}`);
  if (!r.pass) console.log(`                 actual: ${r.actual}`);
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

console.log('\nDISCRIMINATION');
for (const b of ['L', 'H']) {
  const g = results.filter(r => r.block === b);
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  ${b}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

// --- pre-registered replication test ---
const L = results.filter(r => r.block === 'L');
const lAcc = L.filter(r => r.pass).length / L.length;
console.log(`\nREPLICATION OF ROUND 08 (pre-registered, conf 0.65)`);
console.log(`  predicted: sub-0.5 block scores >= 0.70 against stated ~0.32`);
console.log(`  actual   : ${lAcc.toFixed(3)}  ->  ${lAcc >= 0.70 ? 'CONFIRMED' : 'DISCONFIRMED'}`);
console.log(`  R08 comparison: L block was 1.00 (17/17) against stated 0.34`);

console.log('\nCALIBRATION BY BAND');
for (const [b0, b1] of [[0, 0.2], [0.2, 0.4], [0.4, 0.6], [0.6, 0.8], [0.8, 1.01]]) {
  const g = results.filter(r => r.conf >= b0 && r.conf < b1);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  conf ${b0.toFixed(2)}-${b1.toFixed(2)}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}

// --- SECOND SCORING PASS: knowledge, judged on the committed claim text ---
const knew = results.filter(r => r.knew).length;
let brierK = 0;
for (const r of results) brierK += Math.pow(r.conf - (r.knew ? 1 : 0), 2);
console.log(`\n=== SECOND PASS: knowledge (committed claim text vs actual, normalised) ===`);
console.log(`  ${knew}/${n} = ${(knew / n).toFixed(3)}   Brier ${(brierK / n).toFixed(4)}   ` +
            `gap ${(meanConf - knew / n).toFixed(3)}`);
const artifacts = results.filter(r => !r.pass && r.knew);
console.log(`  scoring artefacts (keyword failed, claim was correct): ${artifacts.length}`);
console.log(`  genuine knowledge errors: ${results.filter(r => !r.knew).length}`);
const Lk = L.filter(r => r.knew).length / L.length;
console.log(`  L block under knowledge scoring: ${Lk.toFixed(3)} ` +
            `(keyword scoring said ${lAcc.toFixed(3)})`);
for (const r of results.filter(x => !x.knew)) {
  console.log(`  KNOWLEDGE ERROR ${r.name} [${r.block}] conf ${r.conf.toFixed(2)}`);
  console.log(`     claimed: ${CLAIM[r.name]}`);
  console.log(`     actual : ${r.actual}`);
}

console.log(`\nMISSES (${misses.length}):`);
for (const m of misses) {
  console.log(`  ${m.name} [${m.block}] conf ${m.conf.toFixed(2)} key "${m.key}" ` +
    (!m.inTarget ? '(absent)' : `(also matches ${m.others.length} others)`));
  console.log(`     actual: ${m.actual}`);
}
