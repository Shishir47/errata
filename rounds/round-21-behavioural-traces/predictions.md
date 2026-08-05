# Round 21 — detecting failure by behavioural trace

**Written before counting anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## Why

Round 20's detector for silent failures looked for *empty output* — the signature of a **loud**
failure — and found nothing, which I nearly read as absence. The one measure that worked was
behavioural: **retry pairs** (consecutive near-duplicate commands), which found exactly 8,
matching the 8 hard errors.

So this round detects by what I **did next**, not by what output looked like:

1. **self-correction markers** in my own messages
2. **Write → Edit on the same path** within 5 calls (first version wasn't right)
3. **diagnostic follow-ups** — a probe command issued straight after another command

## Correcting by multiples, not by one bucket

Round 20's third replication showed my volume estimates aren't slightly low, they're low by
**multiples** — gut 80–159 against an actual 525. One-bucket adjustment was far too timid.

So estimates here are adjusted **2–3×** above gut, and per Round 19's `half-applied-correction`
the confidence moves with them.

## Detector definitions, fixed in advance

Self-correction marker regex, committed now:

```
/(let me fix|that'?s a bug|harness (lied|fault)|swallowed|mangled|didn'?t (work|fire)|
  my own (script|harness)|broke|caught me|not a finding|before I report)/i
```

**Known over-count, stated before the numbers:** my write-ups *discuss* past failures at length,
so this regex will fire on narration about old rounds as well as on live correction. I report a
strict variant too (marker messages immediately followed by a tool call).

## Items

| # | Claim | Buckets | gut | scored | conf |
|---|---|---|---|---|---|
| 1 | messages containing a self-correction marker | A <10 · B 10–29 · C 30–59 · D 60+ | B | **C** | 0.45 |
| 2 | Write→Edit on same path within 5 calls | A <5 · B 5–14 · C 15+ | A | **B** | 0.45 |
| 3 | diagnostic follow-up commands | A <10 · B 10–29 · C 30+ | B | **B** | 0.45 |
| 4 | composite distinct incidents ≥ 2× hard errors (≥16) | true / false | true | **true** | 0.70 |
| 5 | total Bash calls now | A <100 · B 100–149 · C 150+ | B | **B** | 0.60 |

## Pre-registered

> **U1:** the composite behavioural detector finds **more** incidents than `is_error` does.
> **Conf 0.85.** If it doesn't, behavioural tracing is no better than the signature approach and
> Round 20's conclusion needs withdrawing.
>
> **U2:** at least 1 of items 1–3 still lands **above** my (already 2–3× adjusted) estimate.
> **Conf 0.45** — testing whether correcting by multiples finally overshoots, or still undershoots.

## Quota

Below 0.5: 3 of 5 = 60% — **PASS**. Below 0.2: **FAIL**, structural ENUM floor, declared in
advance.
