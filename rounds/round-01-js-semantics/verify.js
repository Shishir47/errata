// Round 01 verification — run with:  TZ=America/New_York node verify.js
// Every claim resolves to a boolean by execution, not by argument.

const results = [];
const check = (id, conf, claim, fn) => {
  let pass, detail;
  try { const r = fn(); pass = r.pass; detail = r.detail; }
  catch (e) { pass = false; detail = 'threw: ' + e.message; }
  results.push({ id, conf, claim, pass, detail });
};
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

check('C1', 0.99, '[10,9,1].sort() -> [1,10,9]', () => {
  const got = [10, 9, 1].sort();
  return { pass: eq(got, [1, 10, 9]), detail: JSON.stringify(got) };
});

check('C2', 0.95, "Object.keys({b,2,a,1}) -> ['1','2','b','a']", () => {
  const got = Object.keys({ b: 1, 2: 2, a: 3, 1: 4 });
  return { pass: eq(got, ['1', '2', 'b', 'a']), detail: JSON.stringify(got) };
});

check('C3', 0.96, "'👍'.length===2 && [...'👍'].length===1", () => {
  const a = '👍'.length, b = [...'👍'].length;
  return { pass: a === 2 && b === 1, detail: `length=${a} spread=${b}` };
});

check('C4', 0.95, 'Math.max()===-Infinity && Math.min()===Infinity', () => {
  return { pass: Math.max() === -Infinity && Math.min() === Infinity,
           detail: `max=${Math.max()} min=${Math.min()}` };
});

check('C5', 0.92, '[1,2,3].map(parseInt) -> [1,NaN,NaN]', () => {
  const got = [1, 2, 3].map(parseInt);
  return { pass: got[0] === 1 && Number.isNaN(got[1]) && Number.isNaN(got[2]),
           detail: String(got) };
});

check('C6', 0.88, 'MAX_SAFE+1 === MAX_SAFE+2', () => {
  const M = Number.MAX_SAFE_INTEGER;
  return { pass: (M + 1 === M + 2), detail: `${M + 1} vs ${M + 2}` };
});

check('C7', 0.90, "new Date('2026-08-05') is UTC, '...T00:00:00' is local -> differ", () => {
  const a = new Date('2026-08-05').getTime();
  const b = new Date('2026-08-05T00:00:00').getTime();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const off = new Date('2026-08-05T00:00:00').getTimezoneOffset();
  return { pass: off === 0 ? null : a !== b,
           detail: `tz=${tz} offsetMin=${off} diffMs=${b - a}` };
});

check('C8', 0.93, 'JSON.stringify undefined behaviours', () => {
  const a = JSON.stringify({ a: undefined });
  const b = JSON.stringify([undefined]);
  const c = JSON.stringify(undefined);
  return { pass: a === '{}' && b === '[null]' && c === undefined,
           detail: `obj=${a} arr=${b} bare=${String(c)} (typeof ${typeof c})` };
});

check('C9', 0.85, 'process.nextTick beats an earlier-queued queueMicrotask', () => {
  const order = [];
  queueMicrotask(() => order.push('micro'));
  process.nextTick(() => order.push('nextTick'));
  // resolved synchronously below via deferred report
  global.__c9 = order;
  return { pass: 'deferred', detail: 'see async section' };
});

check('C10', 0.80, 'await null resolves before a later .then (1 tick, not 3)', () => {
  return { pass: 'deferred', detail: 'see async section' };
});

check('C11', 0.85, "/a/g .test('aa') x3 -> true,true,false", () => {
  const r = /a/g;
  const got = [r.test('aa'), r.test('aa'), r.test('aa')];
  return { pass: eq(got, [true, true, false]), detail: String(got) };
});

check('C12', 0.92, 'Set dedupes NaN and treats 0/-0 as same', () => {
  const a = new Set([NaN, NaN]).size, b = new Set([0, -0]).size;
  return { pass: a === 1 && b === 1, detail: `NaN=${a} zeros=${b}` };
});

check('C13', 0.90, '[,,].length === 2', () => {
  const n = [, ,].length;
  return { pass: n === 2, detail: `length=${n}` };
});

check('C14', 0.93, 'Array.prototype.sort is stable', () => {
  const input = Array.from({ length: 20 }, (_, i) => ({ k: i % 3, i }));
  const out = input.slice().sort((x, y) => x.k - y.k);
  let stable = true;
  for (let j = 1; j < out.length; j++)
    if (out[j].k === out[j - 1].k && out[j].i < out[j - 1].i) stable = false;
  return { pass: stable, detail: stable ? 'order preserved within equal keys' : 'reordered' };
});

check('C15', 0.90, 'structuredClone: Map deep-clones, function throws DataCloneError', () => {
  const m = structuredClone(new Map([[1, { a: 1 }]]));
  const deep = m.get(1).a === 1 && m instanceof Map;
  let threw = false, name = '';
  try { structuredClone(() => {}); } catch (e) { threw = true; name = e.name; }
  return { pass: deep && threw && name === 'DataCloneError',
           detail: `mapOk=${deep} threw=${threw} name=${name}` };
});

check('C16', 0.82, "{'01':1,'1':2} -> entries [['1',2],['01',1]]", () => {
  const got = Object.entries({ '01': 1, '1': 2 });
  return { pass: eq(got, [['1', 2], ['01', 1]]), detail: JSON.stringify(got) };
});

// ---- async claims ----
const asyncOrder = [];
(async () => { await null; asyncOrder.push('A'); })();
Promise.resolve().then(() => asyncOrder.push('B'));

setTimeout(() => {
  const c9 = results.find(r => r.id === 'C9');
  c9.pass = eq(global.__c9, ['nextTick', 'micro']);
  c9.detail = 'order=' + JSON.stringify(global.__c9);

  const c10 = results.find(r => r.id === 'C10');
  c10.pass = eq(asyncOrder, ['A', 'B']);
  c10.detail = 'order=' + JSON.stringify(asyncOrder);

  report();
}, 0);

function report() {
  console.log('node ' + process.version + '  TZ=' + Intl.DateTimeFormat().resolvedOptions().timeZone + '\n');
  let right = 0, scored = 0, brier = 0;
  for (const r of results) {
    const mark = r.pass === null ? 'SKIP' : r.pass ? 'RIGHT' : 'WRONG';
    if (r.pass !== null) { scored++; if (r.pass) right++; brier += Math.pow(r.conf - (r.pass ? 1 : 0), 2); }
    console.log(`${r.id}  ${mark.padEnd(5)} conf ${r.conf.toFixed(2)}  ${r.claim}`);
    console.log(`      ${r.detail}`);
  }
  const meanConf = results.filter(r => r.pass !== null).reduce((s, r) => s + r.conf, 0) / scored;
  console.log(`\nscored ${right}/${scored}  accuracy ${(right / scored).toFixed(3)}`);
  console.log(`mean stated confidence ${meanConf.toFixed(3)}  Brier ${(brier / scored).toFixed(4)}`);
  console.log(`gap (confidence - accuracy) ${(meanConf - right / scored).toFixed(3)}`);
}
