// Round 03 verification — node verify.js
// Surface chosen by date-seeded rule (see predictions.md), not by me.

const tls = require('node:tls');
const net = require('node:net');
const results = [];
const S = JSON.stringify;
const add = (id, conf, tag, claim, pass, detail) => results.push({ id, conf, tag, claim, pass, detail });
const check = (id, conf, tag, claim, fn) => {
  try { const r = fn(); add(id, conf, tag, claim, r.pass, r.detail); }
  catch (e) { add(id, conf, tag, claim, false, 'threw: ' + e.message); }
};

// ---------- A. export set ----------
const PREDICTED = ['connect','createServer','createSecureContext','checkServerIdentity','getCiphers',
  'rootCertificates','DEFAULT_CIPHERS','DEFAULT_ECDH_CURVE','DEFAULT_MAX_VERSION','DEFAULT_MIN_VERSION',
  'CLIENT_RENEG_LIMIT','CLIENT_RENEG_WINDOW','TLSSocket','Server','SecureContext',
  'createSecurePair','convertALPNProtocols'];
const ACTUAL = Object.keys(tls);
const missed   = ACTUAL.filter(k => !PREDICTED.includes(k));
const invented = PREDICTED.filter(k => !ACTUAL.includes(k));
add('A-set', 0.10, 'g', 'export set exactly right',
    missed.length === 0 && invented.length === 0,
    `predicted ${PREDICTED.length}, actual ${ACTUAL.length} | missed ${S(missed)} | invented ${S(invented)}`);

// ---------- B. tidy-world probe ----------
const TIDY = [
  ['T1', 0.55, 'g', 'createSecurePair',     'absent'],
  ['T2', 0.70, 'g', 'SLAB_BUFFER_SIZE',     'absent'],
  ['T3', 0.78, 'g', 'CryptoStream',         'absent'],
  ['T4', 0.65, 'g', 'SecurePair',           'absent'],
  ['T5', 0.58, 'a', 'convertALPNProtocols', 'present'],
  ['T6', 0.62, 'g', 'createConnection',     'absent'],
];
for (const [id, conf, tag, name, expect] of TIDY) {
  const onKeys = ACTUAL.includes(name);
  const reachable = tls[name] !== undefined;
  const pass = expect === 'present' ? onKeys : !onKeys;
  add(id, conf, tag, `${name} is ${expect}`, pass,
      `inKeys=${onKeys} reachable=${reachable} typeof=${typeof tls[name]}`);
}

// ---------- C. arity ----------
const ARITY = { connect:[0,0.55], createServer:[2,0.70], createSecureContext:[1,0.72],
                checkServerIdentity:[2,0.80], getCiphers:[0,0.85] };
for (const [name, [want, conf]] of Object.entries(ARITY)) {
  const fn = tls[name];
  if (typeof fn !== 'function') { add('C-' + name, conf, 'g', `${name}.length === ${want}`, false, 'not a function'); continue; }
  add('C-' + name, conf, 'g', `${name}.length === ${want}`, fn.length === want, `actual=${fn.length}`);
}

// ---------- D. constants ----------
check('D1', 0.85, 'g', "DEFAULT_MIN_VERSION === 'TLSv1.2'", () =>
  ({ pass: tls.DEFAULT_MIN_VERSION === 'TLSv1.2', detail: S(tls.DEFAULT_MIN_VERSION) }));
check('D2', 0.88, 'g', "DEFAULT_MAX_VERSION === 'TLSv1.3'", () =>
  ({ pass: tls.DEFAULT_MAX_VERSION === 'TLSv1.3', detail: S(tls.DEFAULT_MAX_VERSION) }));
check('D3', 0.80, 'g', "DEFAULT_ECDH_CURVE === 'auto'", () =>
  ({ pass: tls.DEFAULT_ECDH_CURVE === 'auto', detail: S(tls.DEFAULT_ECDH_CURVE) }));
check('D4', 0.75, 'g', 'CLIENT_RENEG_LIMIT === 3', () =>
  ({ pass: tls.CLIENT_RENEG_LIMIT === 3, detail: String(tls.CLIENT_RENEG_LIMIT) }));
check('D5', 0.72, 'g', 'CLIENT_RENEG_WINDOW === 600', () =>
  ({ pass: tls.CLIENT_RENEG_WINDOW === 600, detail: String(tls.CLIENT_RENEG_WINDOW) }));
check('D6', 0.60, 'g', "DEFAULT_CIPHERS is a string containing 'AES256-GCM'", () =>
  ({ pass: typeof tls.DEFAULT_CIPHERS === 'string' && tls.DEFAULT_CIPHERS.includes('AES256-GCM'),
     detail: `typeof=${typeof tls.DEFAULT_CIPHERS} sample=${S(String(tls.DEFAULT_CIPHERS).slice(0, 60))}` }));

// ---------- E. types & behaviour ----------
check('E1', 0.92, 'g', 'typeof TLSSocket === function', () =>
  ({ pass: typeof tls.TLSSocket === 'function', detail: typeof tls.TLSSocket }));
check('E2', 0.88, 'g', 'typeof Server === function', () =>
  ({ pass: typeof tls.Server === 'function', detail: typeof tls.Server }));
check('E3', 0.80, 'g', 'rootCertificates is array with length > 100', () =>
  ({ pass: Array.isArray(tls.rootCertificates) && tls.rootCertificates.length > 100,
     detail: `isArray=${Array.isArray(tls.rootCertificates)} length=${tls.rootCertificates && tls.rootCertificates.length}` }));
check('E4', 0.85, 'g', 'every rootCertificate starts with PEM header', () => {
  const bad = tls.rootCertificates.filter(c => !c.startsWith('-----BEGIN CERTIFICATE-----'));
  return { pass: bad.length === 0, detail: `nonconforming=${bad.length} first=${S(String(tls.rootCertificates[0]).slice(0, 32))}` };
});
check('E5', 0.75, 'g', 'getCiphers() returns lowercase strings', () => {
  const c = tls.getCiphers();
  const bad = c.filter(x => x !== x.toLowerCase());
  return { pass: bad.length === 0, detail: `n=${c.length} uppercase=${bad.length} sample=${S(c.slice(0, 3))}` };
});
check('E6', 0.62, 'g', "getCiphers() includes 'aes256-sha'", () => {
  const c = tls.getCiphers();
  return { pass: c.includes('aes256-sha'), detail: `found=${c.includes('aes256-sha')} n=${c.length}` };
});
check('E7', 0.80, 'g', 'tls.Server.prototype instanceof net.Server', () =>
  ({ pass: tls.Server.prototype instanceof net.Server, detail: String(tls.Server.prototype instanceof net.Server) }));
check('E8', 0.85, 'g', 'tls.TLSSocket.prototype instanceof net.Socket', () =>
  ({ pass: tls.TLSSocket.prototype instanceof net.Socket, detail: String(tls.TLSSocket.prototype instanceof net.Socket) }));
check('E9', 0.70, 'g', 'typeof SecureContext === function', () =>
  ({ pass: typeof tls.SecureContext === 'function', detail: typeof tls.SecureContext }));
check('E10', 0.72, 'g', 'createServer() with no args returns a tls.Server', () => {
  const s = tls.createServer();
  const ok = s instanceof tls.Server;
  s.close();
  return { pass: ok, detail: `instanceof tls.Server = ${ok}` };
});

// ---------- report ----------
console.log(`node ${process.version}\n`);
console.log(`ACTUAL export keys (${ACTUAL.length}):\n  ${ACTUAL.join(', ')}\n`);
let right = 0, brier = 0;
const misses = [];
for (const r of results) {
  if (r.pass) right++; else misses.push(r);
  brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2);
  console.log(`${r.id.padEnd(22)} ${(r.pass ? 'RIGHT' : 'WRONG').padEnd(5)} [${r.tag}] conf ${r.conf.toFixed(2)}  ${r.claim}`);
  if (!r.pass) console.log(`                       -> ${r.detail}`);
}
const n = results.length, acc = right / n;
const meanConf = results.reduce((s, r) => s + r.conf, 0) / n;
console.log(`\n=== ${right}/${n} right   accuracy ${acc.toFixed(3)}`);
console.log(`mean stated confidence ${meanConf.toFixed(3)}   Brier ${(brier / n).toFixed(4)}`);
console.log(`gap (confidence - accuracy) ${(meanConf - acc).toFixed(3)}`);

console.log(`\nMISSES (${misses.length}):`);
for (const m of misses) console.log(`  ${m.id} [${m.tag}] conf ${m.conf.toFixed(2)} :: ${m.claim}\n     ${m.detail}`);

const tidy = results.filter(r => r.id.startsWith('T'));
console.log(`\nTIDY-WORLD PROBE: ${tidy.filter(r => r.pass).length}/${tidy.length} right`);

console.log('\nBY PROVENANCE');
for (const t of ['g', 'a']) {
  const g = results.filter(r => r.tag === t);
  if (!g.length) continue;
  console.log(`  [${t}] n=${g.length}  accuracy ${(g.filter(r => r.pass).length / g.length).toFixed(2)}  stated ${(g.reduce((s, r) => s + r.conf, 0) / g.length).toFixed(2)}`);
}

console.log('\nCALIBRATION BY BAND');
for (const [lo, hi] of [[0, 0.6], [0.6, 0.75], [0.75, 0.9], [0.9, 1.01]]) {
  const g = results.filter(r => r.conf >= lo && r.conf < hi);
  if (!g.length) continue;
  const a = g.filter(r => r.pass).length / g.length;
  const c = g.reduce((s, r) => s + r.conf, 0) / g.length;
  console.log(`  conf ${lo.toFixed(2)}-${hi.toFixed(2)}  n=${String(g.length).padStart(2)}  stated ${c.toFixed(2)}  actual ${a.toFixed(2)}  gap ${(c - a >= 0 ? '+' : '')}${(c - a).toFixed(2)}`);
}
