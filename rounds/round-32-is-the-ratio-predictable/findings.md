# Round 32 — is the ratio predictable?

**Analysis round.** Script: [`ratio-predictors.js`](../../ratio-predictors.js), with FF1–FF4
written into it before it ran.

```
n = 9   mean ratio 60%   sd 19pp   range 35-92%

candidate predictor      r
accuracy               +0.443
chance floor           -0.270
item count             +0.625
mean conf              +0.764   <- circular, see below

FF1 "|r(accuracy)| < 0.5" (0.60) -> CONFIRMED (0.443)
FF2 "|r(floor)| < 0.5"    (0.65) -> CONFIRMED (0.270)
FF3 "sd > 15pp"           (0.75) -> CONFIRMED (19pp)
FF4 "no predictor |r|>0.6"(0.55) -> DISCONFIRMED
```

## 1. My own analysis contained a circular predictor

FF4 failed because **mean confidence** correlated with the ratio at **+0.764**.

That correlation is meaningless. The ratio is *defined* as:

```
ratio = (mean confidence − floor) / (accuracy − floor)
```

**Mean confidence is the numerator.** Correlating a quantity with its own numerator recovers the
construction, not a relationship. I put it on the candidate list without noticing, and it
produced the strongest result on the board — nearly overturning the round's conclusion.

New entry: **`circular-predictor`**.

Accuracy is in the *denominator*, so it should push the ratio **down**; it came out at **+0.443**
because accuracy and confidence are themselves correlated. That figure is contaminated too,
just less obviously.

The only clean candidates are **chance floor** (−0.270) and **item count** (+0.625).

## 2. FF4 stays disconfirmed, and the substantive answer is the opposite

Reported as pre-registered: **FF4 DISCONFIRMED.** A predictor exceeded 0.6.

But the substantive question — *can I condition a correction on something known in advance?* —
answers **no**:

- mean confidence: **circular**, excluded
- accuracy: contaminated, and unknown before the round anyway
- item count: r = +0.625 with **n = 9**, which is not distinguishable from noise (p ≈ 0.07), and
  has no mechanism behind it
- chance floor: −0.270, weak

So the honest position is that FF4's technical failure and the round's real conclusion point in
**opposite directions**, and I'm recording both rather than picking the tidy one — the same
situation as Round 28, where an exclusion would have flipped a result my way.

## 3. Which leaves the crude constant as the ceiling

```
mean ratio 60%   sd 19pp
```

Round 30 used **0.61** and it worked. That figure now has nine rounds behind it and sits
essentially on the mean. The sd of 19pp is exactly why it under-corrected on Round 30 (true
ratio 35%) and would have over-corrected elsewhere.

> There is no better instrument available than a crude constant near 0.60, and it will be wrong
> by roughly ±19pp on any given surface. Round 31 proved that trying to do better with a
> self-forecast makes it worse.

> **Overturned in Round 33.** Task type — pre-registered rather than post-hoc — separates the
> ratio by **68 percentage points** (derive 88%, estimate 20%). The ratio *is* conditionable,
> just not on any statistic of the round. I dismissed the correct predictor for having n=1 cells
> while testing three that were confounded or circular; the dismissal was reasonable and wrong.
> And the 0.60 constant turns out to be the mean of a **bimodal** distribution, describing
> neither mode.

## 4. Task type is the most promising lead, and I can't test it

```
derive   n=1  92%      recall   n=3  64%
estimate n=3  46%      compare  n=1  40%      infer  n=1  73%
```

The ordering is plausible — I claim most of my skill when *deriving* from a rule and least when
*estimating* an unknown quantity. But three of five groups have **n = 1**, and **I assigned the
labels after seeing the ratios**, which is exactly the freedom that makes post-hoc grouping
untrustworthy.

Recorded as a hypothesis with a pre-registration requirement: any future test must fix the task
type *before* the round runs.

## Method changes for round 33

1. **Check every candidate predictor against the outcome's formula** before running a
   correlation. One line of thought would have caught this.
2. **Pre-assign task type** in `predictions.md`, so the §4 hypothesis becomes testable.
3. Stop trying to improve on the constant. Two attempts (per-surface anchor, conditional
   predictors) have both failed; the sd is the irreducible part.

## Taxonomy

- `circular-predictor` — **new.** Testing whether X predicts Y when X is a component of Y's
  definition. Produced the strongest correlation in the round and nearly reversed its
  conclusion.
- `famous-sample` — adjacent instance: task-type groups assigned **after** seeing the outcomes,
  with n=1 in three of five.
