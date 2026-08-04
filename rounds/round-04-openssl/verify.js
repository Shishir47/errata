// Round 04 verification — node verify.js
// Subject: the openssl CLI (chosen by date-seeded rule over on-PATH runtimes).
// Node is only the harness here; nothing about JS is under test.

const { execFileSync, spawnSync } = require('node:child_process');

function ssl(args, input) {
  const r = spawnSync('openssl', args, { input: input ?? '', encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}
const results = [];
// conf = scored confidence; gut = what I'd have said unadjusted (equal when [g])
const add = (id, conf, gut, tag, claim, pass, detail) =>
  results.push({ id, conf, gut, tag, claim, pass, detail });
const check = (id, conf, gut, tag, claim, fn) => {
  try { const r = fn(); add(id, conf, gut, tag, claim, r.pass, r.detail); }
  catch (e) { add(id, conf, gut, tag, claim, false, 'threw: ' + e.message); }
};

// ---------- harness assumption, scored (Round 01 lesson) ----------
const ver = ssl(['version']);
check('V1', 0.85, 0.85, 'g', "version starts with 'OpenSSL 3.'", () =>
  ({ pass: ver.out.startsWith('OpenSSL 3.'), detail: ver.out }));

// ---------- B. subcommand surface ----------
let listOut = ssl(['list', '-commands']);
let ACTUAL = listOut.code === 0
  ? listOut.out.split(/\s+/).filter(Boolean).sort()
  : [];
const PREDICTED = ('asn1parse ca ciphers cmp cms crl crl2pkcs7 dgst dhparam dsa dsaparam ec ' +
  'ecparam enc engine errstr fipsinstall gendsa genpkey genrsa help info kdf list mac nseq ' +
  'ocsp passwd pkcs12 pkcs7 pkcs8 pkey pkeyparam pkeyutl prime rand rehash req rsa rsautl ' +
  's_client s_server s_time sess_id smime speed spkac srp storeutl ts verify version x509')
  .split(' ').sort();

const missed   = ACTUAL.filter(k => !PREDICTED.includes(k));
const invented = PREDICTED.filter(k => !ACTUAL.includes(k));
add('B-set', 0.05, 0.05, 'g', 'predicted command set exactly right',
    ACTUAL.length > 0 && missed.length === 0 && invented.length === 0,
    `predicted ${PREDICTED.length}, actual ${ACTUAL.length} | missed ${JSON.stringify(missed)} | invented ${JSON.stringify(invented)}`);

const MEMBER = [
  ['B1','engine',      'present', 0.78, 0.60, 'a'],
  ['B2','rsautl',      'present', 0.72, 0.55, 'a'],
  ['B3','genrsa',      'present', 0.85, 0.70, 'a'],
  ['B4','spkac',       'present', 0.65, 0.50, 'a'],
  ['B5','nseq',        'present', 0.62, 0.48, 'a'],
  ['B6','srp',         'absent',  0.55, 0.55, 'g'],
  ['B7','dsaparam',    'present', 0.80, 0.80, 'g'],
  ['B8','kdf',         'present', 0.72, 0.72, 'g'],
  ['B9','mac',         'present', 0.72, 0.72, 'g'],
  ['B10','storeutl',   'present', 0.68, 0.68, 'g'],
  ['B11','fipsinstall','present', 0.70, 0.70, 'g'],
  ['B12','info',       'present', 0.65, 0.65, 'g'],
  ['B13','cmp',        'present', 0.60, 0.60, 'g'],
];
for (const [id, name, expect, conf, gut, tag] of MEMBER) {
  const there = ACTUAL.includes(name);
  add(id, conf, gut, tag, `${name} is ${expect}`,
      expect === 'present' ? there : !there, `inList=${there}`);
}
add('B14', 0.60, 0.40, 'a', 'at least one command exists outside my predicted set',
    missed.length > 0, `unpredicted commands (${missed.length}): ${JSON.stringify(missed)}`);

// ---------- C. digest vectors ----------
const hex = s => (s.match(/\b([0-9a-f]{32,128})\b/) || [])[1] || null;
const VEC = [
  ['C1', 0.95, '-sha256',   'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
  ['C2', 0.92, '-md5',      '900150983cd24fb0d6963f7d28e17f72'],
  ['C3', 0.93, '-sha1',     'a9993e364706816aba3e25717850c26c9cd0d89d'],
  ['C4', 0.80, '-sha512',   'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'],
  ['C5', 0.65, '-sha3-256', '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532'],
];
for (const [id, conf, flag, want] of VEC) {
  check(id, conf, conf, 'g', `${flag} of "abc" === ${want.slice(0, 16)}…`, () => {
    const r = ssl(['dgst', flag], 'abc');
    const got = hex(r.out);
    return { pass: got === want, detail: `code=${r.code} got=${got} ${r.err ? '| ' + r.err.slice(0, 60) : ''}` };
  });
}
check('C6', 0.97, 0.97, 'g', "base64 of 'abc' is YWJj", () => {
  const r = ssl(['base64'], 'abc');
  return { pass: r.out === 'YWJj', detail: `code=${r.code} out=${JSON.stringify(r.out)}` };
});

// ---------- D. output format ----------
check('D1', 0.55, 0.55, 'g', "dgst -sha256 labels the line 'SHA2-256(stdin)='", () => {
  const r = ssl(['dgst', '-sha256'], 'abc');
  return { pass: r.out.startsWith('SHA2-256(stdin)='), detail: JSON.stringify(r.out.slice(0, 40)) };
});
check('D2', 0.55, 0.55, 'g', "dgst -sha256 -r is coreutils style 'hex  *stdin'", () => {
  const r = ssl(['dgst', '-sha256', '-r'], 'abc');
  return { pass: /^[0-9a-f]{64} \*stdin$/.test(r.out), detail: JSON.stringify(r.out.slice(0, 80)) };
});
check('D3', 0.60, 0.60, 'g', "prime 17 says prime and prints input in hex (11)", () => {
  const r = ssl(['prime', '17']);
  return { pass: /is prime/i.test(r.out) && /\b11\b/.test(r.out), detail: JSON.stringify(r.out) };
});
check('D4', 0.88, 0.88, 'g', 'rand -hex 8 emits exactly 16 hex chars', () => {
  const r = ssl(['rand', '-hex', '8']);
  return { pass: /^[0-9a-f]{16}$/.test(r.out), detail: `len=${r.out.length} out=${JSON.stringify(r.out)}` };
});
check('D5', 0.70, 0.70, 'g', "unknown subcommand exits non-zero mentioning 'Invalid command'", () => {
  const r = ssl(['definitelynotacommand']);
  const blob = r.out + '\n' + r.err;
  return { pass: r.code !== 0 && /Invalid command/i.test(blob),
           detail: `code=${r.code} msg=${JSON.stringify(blob.split('\n')[0].slice(0, 70))}` };
});
check('D6', 0.75, 0.75, 'g', 'ciphers prints one colon-separated line, exit 0', () => {
  const r = ssl(['ciphers']);
  return { pass: r.code === 0 && !r.out.includes('\n') && r.out.includes(':'),
           detail: `code=${r.code} lines=${r.out.split('\n').length} len=${r.out.length}` };
});

// ---------- report ----------
console.log(`${ver.out}\n`);
console.log(`ACTUAL commands (${ACTUAL.length}):\n  ${ACTUAL.join(' ')}\n`);
let right = 0, brier = 0, brierGut = 0;
const misses = [];
for (const r of results) {
  if (r.pass) right++; else misses.push(r);
  brier    += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  brierGut += Math.pow(r.gut  - (r.pass ? 1 : 0), 2);
  console.log(`${r.id.padEnd(7)} ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} [${r.tag}] conf ${r.conf.toFixed(2)}  ${r.claim}`);
  if (!r.pass) console.log(`        -> ${r.detail}`);
}
const n = results.length, acc = right / n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);

console.log(`\nMISSES (${misses.length}):`);
for (const m of misses) console.log(`  ${m.id} [${m.tag}] conf ${m.conf.toFixed(2)} :: ${m.claim}\n     ${m.detail}`);

// THE experiment: did adjusting to prior rounds' lessons help?
const adj = results.filter(r => r.tag === 'a');
console.log(`\nADJUSTMENT EXPERIMENT (n=${adj.length} tagged [a])`);
if (adj.length) {
  const bA = adj.reduce((s, r) => s + Math.pow(r.conf - (r.pass ? 1 : 0), 2), 0) / adj.length;
  const bG = adj.reduce((s, r) => s + Math.pow(r.gut  - (r.pass ? 1 : 0), 2), 0) / adj.length;
  console.log(`  adjusted Brier ${bA.toFixed(4)}   gut Brier ${bG.toFixed(4)}   ` +
              (bA < bG ? 'ADJUSTING HELPED' : bA > bG ? 'ADJUSTING HURT (overshoot)' : 'no difference'));
  console.log(`  [a] accuracy ${(adj.filter(r => r.pass).length / adj.length).toFixed(2)}`);
  console.log(`  whole-round Brier: adjusted ${(brier / n).toFixed(4)} vs all-gut ${(brierGut / n).toFixed(4)}`);
}

console.log('\nCALIBRATION BY BAND');
for (const [lo, hi] of [[0, 0.6], [0.6, 0.75], [0.75, 0.9], [0.9, 1.01]]) {
  const g = results.filter(r => r.conf >= lo && r.conf < hi);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  conf ${lo.toFixed(2)}-${hi.toFixed(2)}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}
