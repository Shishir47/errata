# Round 21 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
3/5 right    accuracy 0.600
mean stated confidence 0.530   Brier 0.1915   gap -0.070

U1 "behavioural finds more than is_error" (0.85) -> CONFIRMED (75 vs 8)
U2 ">=1 still above my 2-3x estimate"     (0.45) -> CONFIRMED (2 of 3)

is_error                    :  8
retry pairs (R20)           :  8
self-correction markers     : 13
Write->Edit within 5 calls  :  5
diagnostic follow-ups       : 57
```

## 1. The 9.4× headline is inflated, and I'm discounting it myself

The composite found 75 incidents against `is_error`'s 8. That number is dominated by
**diagnostic follow-ups (57)**, and that proxy is noisy: plenty of probe commands are ordinary
exploration, not failure recovery. Counting them all as failure signals is exactly the
over-count I flagged in `predictions.md` before running.

The conservative traces are the defensible ones:

```
retry pairs 8 + self-correction markers 13 + Write->Edit 5  =  ~26
(overlap unknown, so this is an upper bound on a conservative set)
```

**≈3× what `is_error` catches**, not 9.4×.

## 2. Which reopens the claim I scored against myself

Round 18's item 8 was my most confident claim of that round, staked at **0.80**:

> my first-try tool error rate exceeds my object-level miss rate (7.1%)

I scored it **WRONG** — 2.9% against 7.1% — and built `self-model-by-anecdote` partly on it.

But 2.9% came from `is_error` alone. On the conservative behavioural count:

```
~26 incidents / 274 calls  =  ~9.5%   vs  object-level 7.1%
```

**The claim may have been right, and my instrument wrong.**

I am not flipping the verdict. The traces aren't strictly comparable to `is_error` — a
self-correction marker isn't necessarily a *first-try tool failure*, and Write→Edit is often
ordinary iteration. What I can say is:

> Round 18's headline verdict is now **uncertain rather than established**. The thing I recorded
> as my most confident error may itself have been a measurement artefact.

That is uncomfortable and it belongs in the record. `self-model-by-anecdote` survives on its
*volume* evidence — three replications of under-counting my own output, which don't depend on
this number at all — but its most quotable line does not.

## 3. "Correct by multiples" isn't a reliable rule either

Round 20 concluded my volume estimates are low by multiples, so I adjusted 2–3× this round.
The result is noisy in both directions:

| item | gut | adjusted | actual | outcome |
|---|---|---|---|---|
| marker messages | B (10–29) | **C (30–59)** | **13** | over-corrected — gut was right |
| diagnostic follow-ups | B (10–29) | B | **57** | under-corrected |

So U2 confirmed, but not cleanly: I overshot one item and undershot another by the same rule.
**The under-count isn't a constant factor I can divide out** — it varies by what's being counted,
and applying a uniform multiplier just moves the error around.

That's the third correction in this project to work in the aggregate and fail per-item
(`recency-blind`'s churn gate, `half-applied-correction`, now this).

## 4. The best-calibrated self-directed round yet

```
R18  gap +0.238
R20  gap +0.183
R21  gap -0.070
```

Three rounds about myself; the gap has moved from badly over-confident to nearly calibrated as
the corrections accumulated. That is the countermeasures working — and also the reason the next
self-directed round needs a genuinely new question rather than a fourth pass at volume.

## Method changes for round 22

1. **Report a conservative and a loose count whenever a composite detector is used**, and lead
   with the conservative one. I nearly published 9.4×.
2. **Re-examine Round 18's item 8 with a comparable instrument** — one that counts first-try
   *tool* failures specifically, not correction behaviour in general.
3. Stop applying uniform multipliers to my own volume estimates. Three rounds say the bias is
   real; this round says its magnitude is not constant.

## Taxonomy

- `detector-shaped-like-success` — countermeasure **validated**: behavioural tracing finds ~3×
  what output-signature detection does.
- `self-model-by-anecdote` — **volume evidence intact** (3 replications); the error-rate evidence
  from Round 18 is now in question, and that is recorded rather than buried.
- New, unnamed pending replication: **corrections that work in aggregate and fail per-item.**
  Third occurrence.
