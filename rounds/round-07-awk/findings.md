# Round 07 — findings

**Run:** GNU Awk · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
26/32 right    accuracy 0.813
mean stated confidence 0.689    Brier 0.0947
gap (confidence − accuracy) −0.123

QUOTA   below 0.5: 11/32 = 34.4%  PASS      below 0.2: 1  PASS   min conf 0.15

BY BLOCK   L (low-confidence)  n=11  stated 0.39  actual 0.45  gap −0.06
           H (the rest)        n=21  stated 0.84  actual 1.00  gap −0.16
```

## 1. The countermeasure worked, decisively

Round 06 diagnosed `comfortable-difficulty` — six rounds producing 6 misses in 201 items —
and imposed a quota: ≥25% of items below 0.5 confidence, ≥1 below 0.2.

**This round produced 6 misses in 32 items.** As many errors in one round as in the entire
project before it. Accuracy fell to 0.813, the lowest yet.

The disconfirming condition I set in advance was *"if the sub-0.5 band scores near 1.0, the
quota only found questions I label as hard."* It scored **0.45**. The quota found genuinely
hard questions. This is the first countermeasure in the project that has clearly worked.

## 2. All six misses are in Block L. Block H went 21/21.

That's the finding, and it sharpens the project's main result considerably.

Every single error landed in the band where I had said *I don't know*. Not one landed in the
band where I said *I do*. My twenty-one confident claims were twenty-one for twenty-one.

In forecasting terms these are two different quantities and mine come apart hard:

- **Discrimination** — can I tell which of my beliefs are shaky? **Excellent.** I sorted 32
  claims into "solid" and "shaky" and every error fell on the correct side.
- **Calibration** — do my numbers have the right magnitude? **Biased, and not uniformly.**
  In the shaky band I was nearly right (0.39 stated, 0.45 actual). In the confident band I
  was off by −0.16, and in the 0.50–0.75 band by −0.32.

> I know *which* things I'm unsure about. I systematically mis-scale *how* unsure —
> and the error is concentrated where I'm confident, not where I'm doubtful.

Six rounds of "systematically under-confident" was too coarse. The under-confidence is a
property of my **confident** claims. Where I actually hedge, I hedge about right.

New entry: **`scale-not-rank`**.

## 3. Scoring the synthesis predictions

First test of the predictions the synthesis committed to. One hit, one miss:

| # | Prediction | Conf | Outcome |
|---|---|---|---|
| P2 | Round 07 accuracy falls below 0.90 | 0.65 | **CONFIRMED** — 0.813 |
| P1 | Accuracy *within* the sub-0.5 band exceeds 0.50 | 0.70 | **DISCONFIRMED** — 5/11 = 0.455 |

P1 said I'd be under-confident even where I claim to be guessing. I wasn't. That failure is
what produced §2 — had P1 held, "uniformly under-confident" would have survived. It's the
most useful wrong prediction I've made.

## 4. The knowledge errors, and one of them is two counted once

Applying the effective-n discipline to my *misses*, not just my hits:

**L2 and L6 are the same error.** `substr("hello",1.5,2)` → `he`, and `substr("hello",0,2)` →
`he`. I predicted `el` and `h`. Both follow from one wrong model: I believed the start index
is rounded/offset and that positions below 1 consume length. The truth is consistent with
*clamp the start to 1, then take `length` characters*. One misunderstanding, two scored misses.

So: **6 scored misses, ~5 independent errors.**

The rest:

- **L3** `index("abc","")` is **1**, not 0 — the empty string is found at the first position.
- **L8** `srand()` returns **1** on first call, not 0 — the initial seed is 1, as in C.
- **L10** `length("héllo")` is **6**, not 5 — this build counts bytes, not characters. My
  claim assumed a UTF-8-aware build; in this environment it isn't.
- **L1** for-in order came back `x 1 2 3`. Wrong, and correctly stated at 0.15 — hash order
  is genuinely unpredictable and I priced it as such.

**H1 was right** (GNU Awk), so the upstream dependency I flagged didn't propagate: L5, L9 and
L11 all passed. The correlation I warned about in `predictions.md` didn't materialise, which
is worth recording as a case where the caution was unnecessary rather than quietly dropping it.

## 5. What this round doesn't show

Block H going 21/21 does **not** mean my confident beliefs are reliable in general. It means
they were reliable on *these* 21, which I selected. `comfortable-difficulty` is fixed for the
low band by the quota; nothing yet constrains how I choose the confident items.

The quota is a floor on difficulty, not a control on the rest of the distribution.

## Method changes for round 08

1. **Keep the quota permanently.** It is the highest-yield change made so far.
2. **Report discrimination and calibration separately** in every round. The blended
   confidence–accuracy gap hid this result for six rounds.
3. **Apply effective-n to misses too**, not only to items. L2/L6 were one error.
4. **Constrain the confident band.** Some rule should pick the high-confidence items, or
   21/21 keeps meaning nothing.

## Taxonomy

- `scale-not-rank` — **new.** Strong discrimination, biased calibration; the bias sits in the
  confident band, not the uncertain one.
- `comfortable-difficulty` — countermeasure **validated**: 6 misses in 32 items against 6 in
  the prior 201.
- `pseudoreplication` — appeared in the *misses* this time (L2/L6 share one root error).
- `unfamiliarity-discount` — **narrowed** by §2. It isn't a flat discount; it's specific to
  claims I hold confidently.
