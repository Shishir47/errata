# Round 15 — findings

**Run:** `less` · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
21/21 right    accuracy 1.000
mean stated confidence 0.531    Brier 0.2413    gap -0.469

FORWARD TEST   MINE 0.2413    FLAT(0.90) 0.0100   -> FLAT wins, CONFIRMED (conf 0.55)
"at least 2 errors"  -> DISCONFIRMED (conf 0.85)
L n=7  stated 0.37 actual 1.00      H n=14  stated 0.61 actual 1.00
```

## 1. I set out to build a hard round and failed, at 0.85 confidence

Round 14 showed discrimination can only be measured when errors exist. So this round
deliberately **inverted the property** — short letter → *exact long form*, an unbounded answer
space instead of 26 letters — and I predicted **≥2 errors at 0.85**.

Zero errors. Including `-D → --color` at 0.20 and `-A → --SEARCH-SKIP-SCREEN` at 0.25, my two
lowest-confidence items in the whole project.

> I tried to make a task hard for myself, staked 0.85 on having succeeded, and was wrong.

That is the same failure one level up. It isn't only that I misjudge whether I'll get an item
right — I misjudge whether a *task I designed to be difficult* will actually be difficult.
`comfortable-difficulty` again, now surviving a deliberate attempt to defeat it.

## 2. The constant wins a third time

`FLAT 0.0100` vs `MINE 0.2413` — a 24× difference, pre-registered.

| Round | test | MINE | FLAT | winner |
|---|---|---|---|---|
| 13 | post hoc, 91 items | 0.2534 | 0.0215 (best-fit 0.98) | FLAT |
| 14 | **forward**, 26 items | 0.2095 | 0.1023 | FLAT |
| 15 | **forward**, 21 items | 0.2413 | 0.0100 | FLAT |

## 3. The pooled record, computed

Across all five externally-supplied rounds (138 pre-committed items,
[`constant-vs-mine.js`](../../constant-vs-mine.js)):

```
items stated BELOW 0.5 confidence: 53/56 correct = 0.946
their mean stated confidence     : 0.363
best constant 0.965 -> Brier 0.0349  (85.6% better than mine)
```

**When I say "probably wrong" about an externally-supplied fact, I am right 95% of the time.**
Stated 0.36, actual 0.95 — off by nearly six tenths, over 56 items, across five different
tools.

The errors sit differently now that Round 14 supplied some:

```
confidences on the 5 errors: 0.60, 0.70, 0.30, 0.35, 0.40
errors rated ABOVE my own mean (0.539): 2/5
```

Consistent with Round 14's correction — the ordering carries *some* signal (3 of 5 errors below
mean), while the level is badly wrong. Both facts, held separately, as they should have been
from the start.

## 4. What this round can't tell me

Zero errors means **discrimination is unmeasurable here**, exactly as the Round 14 rule
requires me to say rather than infer. Round 14 remains the only supplied round with enough
errors to test ranking.

Five supplied rounds, 138 items, **5 errors**. The binding constraint on this project is no
longer method — it's that I can't find questions I get wrong.

## Method changes for round 16

1. **Stop trying to hand-design difficulty.** Two attempts, two failures. If I want errors, the
   task has to be *structurally* beyond me, not merely something I judge hard.
2. Candidate structural sources: facts that postdate my training; facts about *this specific
   machine's* state; compositional tasks with many joint steps where a single slip fails the item.
3. Keep FLAT. Three for three.

## Taxonomy

- `comfortable-difficulty` — **survives a deliberate attempt to defeat it.** I inverted the
  property specifically to generate errors, predicted ≥2 at 0.85, and got none.
- `unfamiliarity-discount` — **strongest statement yet**: 53/56 correct on items stated at a
  mean of 0.363.
