# Round 02 — the `node:path` surface, on Windows

**Written 2026-08-05, before running anything.** No code executed, no docs consulted, no
introspection of the module.

## Why this domain

Round 01's two failures drove the design:

- **`famous-sample`** — I hand-picked celebrated gotchas and mistook them for hard cases.
  Here the *surface picks the items*: I must account for the module's entire export list,
  including exports I fail to remember. Arities and edge-case return values are boring
  facts nobody writes blog posts about, which is the point.
- **`unstated-scaffolding`** — the harness assumptions get audited **as scored claims**
  this time (H1–H4 below), not left implicit.

Ground truth here is **external**: facts about V8/Node's implementation that I cannot
derive by reasoning, only recall. Round 01 was executable-and-therefore-retrievable, which
conflated verifiability with difficulty.

**This round scores recall and precision, not just accuracy.** Naming the complete export
set means a forgotten export counts against me and an invented one counts against me —
neither is possible when you grade yourself on items you selected.

---

## Harness assumptions (scored, not assumed)

| # | Assumption | Conf |
|---|---|---|
| H1 | `fn.length` counts parameters before the first default-valued or rest parameter | 0.93 |
| H2 | On Windows, `require('node:path')` is the **win32** implementation → `sep === '\\'`, `delimiter === ';'` | 0.88 |
| H3 | `require('node:path') === require('node:path').win32` (strict identity, not a copy) | 0.70 |
| H4 | The public API is reachable via `Object.keys()` — i.e. exports are own **enumerable** properties | 0.85 |

---

## A. The complete export set

I claim `Object.keys(require('node:path'))` is **exactly** this set — no more, no fewer:

```
resolve, normalize, isAbsolute, join, relative, toNamespacedPath,
dirname, basename, extname, format, parse, matchesGlob,
sep, delimiter, win32, posix
```

**16 keys. Confidence that this set is exactly right: 0.30.**

Low because two items are shaky and recall over a whole surface is where I expect to leak:

- `matchesGlob` — I believe it landed around Node 22.5. Exists: **0.55**
- `_makeLong` — the legacy deprecated alias for `toNamespacedPath`. I predict it is
  **not** an enumerable own key (either gone or non-enumerable). Absent from `Object.keys`: **0.45**

Scored separately: **missing keys** (recall failure) and **invented keys** (fabrication).

## B. Arity of each exported function

| Function | Predicted `.length` | Conf |
|---|---|---|
| `resolve` | 0 (rest param) | 0.85 |
| `join` | 0 (rest param) | 0.85 |
| `normalize` | 1 | 0.90 |
| `isAbsolute` | 1 | 0.92 |
| `relative` | 2 | 0.88 |
| `toNamespacedPath` | 1 | 0.85 |
| `dirname` | 1 | 0.92 |
| `basename` | 2 | 0.75 |
| `extname` | 1 | 0.92 |
| `format` | 1 | 0.88 |
| `parse` | 1 | 0.90 |
| `matchesGlob` | 2 | 0.50 |

## C. Non-function exports

| Claim | Conf |
|---|---|
| `path.sep === '\\'` | 0.88 |
| `path.delimiter === ';'` | 0.88 |
| `path.posix.sep === '/'` and `path.posix.delimiter === ':'` | 0.96 |
| `path.win32.sep === '\\'` | 0.95 |
| `typeof path.win32 === 'object'` and `typeof path.posix === 'object'` | 0.95 |

## D. Behaviour — the unfamous corners

| # | Claim (win32 semantics) | Conf |
|---|---|---|
| D1 | `basename('/a/b/c.txt', '.txt')` → `'c'` | 0.93 |
| D2 | `extname('.gitignore')` → `''` (leading dot is not an extension) | 0.75 |
| D3 | `extname('index.')` → `'.'` | 0.60 |
| D4 | `extname('a.b.c')` → `'.c'` | 0.95 |
| D5 | `resolve()` with no arguments → `process.cwd()` | 0.90 |
| D6 | `isAbsolute('C:/foo')` → `true` | 0.85 |
| D7 | `isAbsolute('/foo')` → `true` on win32 (root-relative counts as absolute) | 0.70 |
| D8 | `isAbsolute('C:foo')` → `false` (drive-relative, no separator) | 0.65 |
| D9 | `join('a','..','..','b')` → `'..\\b'` | 0.70 |
| D10 | `normalize('a//b/../c/')` → `'a\\c\\'` (trailing separator preserved) | 0.70 |
| D11 | `relative('C:\\a\\b','C:\\a\\c')` → `'..\\c'` | 0.85 |
| D12 | `toNamespacedPath('C:\\a')` → `'\\\\?\\C:\\a'` | 0.72 |
| D13 | `parse('C:\\a\\b.txt')` → `{root:'C:\\', dir:'C:\\a', base:'b.txt', ext:'.txt', name:'b'}` | 0.80 |
| D14 | `format({dir:'C:\\a', base:'b.txt'})` → `'C:\\a\\b.txt'` | 0.85 |
| D15 | `dirname('C:\\')` → `'C:\\'` (root is its own parent) | 0.72 |
| D16 | `join('a', '')` → `'a'` (empty segments dropped) | 0.80 |
| D17 | `normalize('')` → `'.'` | 0.78 |

---

**Item count: 4 harness + 1 set + 2 existence + 12 arity + 5 constants + 17 behaviour = 41.**

Mean stated confidence ≈ 0.80. Unlike Round 01, the spread now reaches down into the
0.30–0.60 band, so the round can actually measure the interesting part of the curve. If I'm
calibrated I should get roughly 32–34 of 41. **A perfect score here would be evidence the
design failed again**, not evidence that I'm good.
