# Round 05 — SQLite type affinity, exhaustive cross-product

**Written before running anything.** SQLite 3.46.0.

## Selection

```
pool (11): awk curl dotnet git openssl perl powershell python sed sqlite3 tar
rule     : (seed + round) % N = (20260805 + 5) % 11 = 9
SELECTED : sqlite3
```

## What this round fixes

Rounds 03–04 made the *pool* and the *item* rule-chosen. The individual claims were still
mine — the last place `famous-sample` can hide. Here the claims are a **complete
cross-product**: 6 declared types × 6 inserted values = 36 cells, every one predicted.

I cannot cherry-pick easy cells, skip the ones I'm unsure about, or quietly drop a case that
turns out inconvenient. The grid decides what gets asked.

**Honest about what's still mine:** I chose the two *axes*. They span all five of SQLite's
affinity rules and include one deliberate trap. That's a weaker form of selection than
picking cells, but it isn't zero, and I'm not going to claim otherwise.

**Also honest:** 6 of the 36 cells are `NULL` inserts, which are trivially `null` under every
affinity. A mechanical design includes the easy cells — removing them because they'd inflate
the score would be selection creeping back in through the exit. Accuracy is reported both
with and without them.

## The affinity rules I'm predicting from

SQLite assigns affinity from the declared type name, first match wins:

1. contains `INT` → **INTEGER**
2. contains `CHAR`, `CLOB`, `TEXT` → **TEXT**
3. contains `BLOB`, or empty → **BLOB** (none)
4. contains `REAL`, `FLOA`, `DOUB` → **REAL**
5. otherwise → **NUMERIC**

| Declared type | Predicted affinity | Note |
|---|---|---|
| `INTEGER` | INTEGER | rule 1 |
| `VARCHAR(10)` | TEXT | rule 2 |
| `BLOB` | BLOB/none | rule 3 |
| `REAL` | REAL | rule 4 |
| `BOOLEAN` | NUMERIC | rule 5 — no keyword matches |
| `POINT` | **INTEGER** | rule 1 — contains `INT`. The trap. |

## Confidence and the `unfamiliarity-discount` experiment

Round 04 measured me under-confident by 0.15–0.22 and filed it provisionally. This round
tests the correction: every **non-trivial** cell carries a gut confidence and a scored value
of `min(0.97, gut + 0.08)`, tagged **[a]**. The NULL cells and Block B are left at gut, **[g]**.

Both values are scored under Brier. If the correction helps, `unfamiliarity-discount` gets
support. If it hurts, it joins the recency probe as a lesson that didn't transfer.

## Block A — `typeof(c)` after insert (36 cells)

Format: **predicted typeof** · *gut confidence*

| declared ↓ / value → | `1` | `1.0` | `'1'` | `'abc'` | `X'61'` | `NULL` |
|---|---|---|---|---|---|---|
| `INTEGER` | integer ·0.95 | integer ·0.85 | integer ·0.85 | text ·0.90 | blob ·0.85 | null ·0.97 |
| `VARCHAR(10)` | text ·0.90 | text ·0.85 | text ·0.95 | text ·0.96 | blob ·0.80 | null ·0.97 |
| `BLOB` | integer ·0.90 | real ·0.90 | text ·0.92 | text ·0.94 | blob ·0.95 | null ·0.97 |
| `REAL` | real ·0.88 | real ·0.94 | real ·0.82 | text ·0.88 | blob ·0.82 | null ·0.97 |
| `BOOLEAN` | integer ·0.90 | integer ·0.78 | integer ·0.82 | text ·0.88 | blob ·0.80 | null ·0.97 |
| `POINT` | integer ·0.80 | integer ·0.75 | integer ·0.75 | text ·0.80 | blob ·0.78 | null ·0.95 |

The claims I'd flag as genuinely uncertain, stated in the present tense per the
`tense-laundering` countermeasure:

- **NUMERIC affinity converts a lossless real to integer** — so `BOOLEAN` + `1.0` **is**
  `integer`, not `real`. 0.78.
- **TEXT affinity does not convert a blob** — `VARCHAR(10)` + `X'61'` **is** `blob`. 0.80.
- **INTEGER affinity converts a numeric-looking string** — `'1'` **is** stored `integer`. 0.85.
- **`POINT` has INTEGER affinity** because the substring `INT` appears in it. The whole row
  hangs on that, which is why it's the least confident row. 0.75–0.80.

## Block B — `typeof()` of bare literals (6 cells)

No table, no affinity involved. Tests literal storage class directly.

| expression | predicted | conf | tag |
|---|---|---|---|
| `typeof(1)` | integer | 0.96 | [g] |
| `typeof(1.0)` | real | 0.94 | [g] |
| `typeof('1')` | text | 0.96 | [g] |
| `typeof('abc')` | text | 0.97 | [g] |
| `typeof(X'61')` | blob | 0.92 | [g] |
| `typeof(NULL)` | null | 0.97 | [g] |

---

**42 items: 36 cross-product cells + 6 literals.**
**[a]: 30 of 42 (71%)** — the 30 non-trivial Block A cells.
Mean gut confidence ≈ 0.88; mean scored ≈ 0.93.

If `unfamiliarity-discount` is real, the scored values beat the gut values. If it's an
artifact of me having picked easy claims on unfamiliar ground, this round — where I couldn't
pick — is where it should fail.
