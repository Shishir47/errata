# Round 01 — JavaScript / Node semantics

**Written 2026-08-05, before running anything.** No code executed, no docs consulted.
Confidence is my honest prior that the claim is exactly right as stated.

I chose this domain because I feel *confident* here — I write JS constantly. A domain where
I already expect to be shaky would be a soft target. The interesting question is whether
felt-confidence tracks accuracy.

Deliberately weighted toward edge cases. A round I score 16/16 on teaches me nothing.

| # | Claim | Confidence |
|---|---|---|
| C1 | `[10, 9, 1].sort()` → `[1, 10, 9]` (default comparator is lexicographic) | 0.99 |
| C2 | `Object.keys({ b:1, 2:2, a:3, 1:4 })` → `['1','2','b','a']` — integer-like keys ascending first, then strings in insertion order | 0.95 |
| C3 | `'👍'.length === 2` and `[...'👍'].length === 1` | 0.96 |
| C4 | `Math.max()` → `-Infinity` and `Math.min()` → `Infinity` | 0.95 |
| C5 | `[1,2,3].map(parseInt)` → `[1, NaN, NaN]` | 0.92 |
| C6 | `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2` → `true` | 0.88 |
| C7 | `new Date('2026-08-05')` parses as **UTC**, `new Date('2026-08-05T00:00:00')` parses as **local** — so their `getTime()` differ in any non-UTC zone | 0.90 |
| C8 | `JSON.stringify({a:undefined})` → `'{}'`; `JSON.stringify([undefined])` → `'[null]'`; `JSON.stringify(undefined)` → the *value* `undefined`, not a string | 0.93 |
| C9 | In Node, a `process.nextTick` callback runs **before** a `queueMicrotask` callback that was queued **earlier** — nextTick has its own higher-priority queue | 0.85 |
| C10 | `(async()=>{ await null; log('A') })(); Promise.resolve().then(()=>log('B'))` logs **A then B** — `await` of a non-promise costs one microtask tick, not three | 0.80 |
| C11 | `const r=/a/g;` then `r.test('aa')` three times → `true, true, false` (lastIndex is stateful and resets on failure) | 0.85 |
| C12 | `new Set([NaN,NaN]).size === 1` and `new Set([0,-0]).size === 1` (SameValueZero) | 0.92 |
| C13 | `[,,].length === 2` (trailing comma is not an element) | 0.90 |
| C14 | `Array.prototype.sort` is **guaranteed stable** since ES2019, verifiable on a 20-element list | 0.93 |
| C15 | `structuredClone(new Map([[1,{a:1}]]))` deep-clones fine; `structuredClone(()=>{})` throws `DataCloneError` | 0.90 |
| C16 | For `{'01':1, '1':2}`: `'1'` is a canonical array index and sorts first, `'01'` is **not** and stays in string insertion order → `Object.entries` gives `[['1',2],['01',1]]` | 0.82 |

**Mean stated confidence: 0.90.** If I'm calibrated, I should get roughly 14–15 of 16 right.
Materially better than that means I'm under-confident; materially worse means over-confident.
