# Round 30 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
9/16 right   accuracy 0.563   (floor 0.250)   unscoreable 0

MINE   (mean 0.360)  Brier 0.2642
SCALED (mean 0.430)  Brier 0.2334   <- best
FLAT   (0.90)        Brier 0.3600

skill claimed (MINE): 35%

DD1 "SCALED beats MINE"       (0.60) -> CONFIRMED
DD2 "SCALED overshoots"       (0.50) -> DISCONFIRMED
DD3 "skill claimed in 40-92%" (0.70) -> DISCONFIRMED (35%)
DD4 "unscoreable <= 2"        (0.80) -> CONFIRMED (0)
```

## 1. The first correction in thirty rounds that worked

Five previous attempts, all failures:

| round | correction | shape | result |
|---|---|---|---|
| 09 | recency gate | shift | superstition on a frozen surface |
| 19 | one bucket up | shift | accuracy up, calibration down |
| 21 | uniform 2–3× multiplier | shift | overshot one, undershot another |
| 24 | per-unit inflation | shift | worse than no correction |
| 25 | +0.20 confidence | shift | Brier 0.159 → 0.212 |
| **30** | **stretch from the chance floor** | **scale** | **0.2642 → 0.2334** |

**Every failure was a shift. The one success is a scale.** That was predicted — Round 25 wrote
*"a uniform shift cannot fix a scale problem"* — and it took five more rounds to actually build
the other shape and test it.

## 2. It worked while still being wrong about the magnitude

DD2 predicted SCALED would overshoot. It **undershot**:

```
mean SCALED confidence 0.430    accuracy 0.563
```

Perfect calibration here means a mean confidence of 0.563. I stated 0.360; the correction moved
me to 0.430. **It closed about a third of the gap**, and the remaining two thirds are still open.

The reason is DD3: this round's raw skill-claimed was **35%**, not the 61% the divisor was built
from. Dividing by 0.61 when the true figure was 0.35 under-corrects by exactly the ratio you'd
expect.

> Getting the **shape** right made even a badly-calibrated constant helpful. Getting the
> constant right with the wrong shape (five attempts) always hurt.

That's the generalisable lesson, and it's worth more than the 61% number itself: **when a
correction fails, check whether it's the wrong size or the wrong kind.** I spent five rounds
adjusting the size of a correction whose kind was wrong.

## 3. The ratio is not constant, and the range widens

DD3 disconfirmed. 35% falls outside the 40–92% band from the other seven rounds, so the range is
now **35–92%** across eight rounds.

That is the `uniform-correction-fallacy` again in a mild form — a fixed divisor applied to a
varying quantity. But this time it **still helped**, because the shape was right. Previous
instances of that fallacy were fatal; here it merely left value on the table.

## 4. The resolver fix is validated

**0 of 16 unscoreable**, against 37.5% in Round 27 and 25% in Round 16. DD4 confirmed. Round
29's repair holds on a fresh draw.

## 5. Honest limits

Sixteen items, one surface, one task type. DD1's margin (0.2642 → 0.2334) is real but not large,
and a single round cannot establish that scale corrections work in general — only that this one
did, where five shifts did not.

## Method changes for round 31

1. **Estimate the ratio per-surface, not globally.** A fixed divisor under-corrects wherever the
   local ratio is lower. The obvious approach: state confidences, then scale by the ratio implied
   by *that round's own* chance floor and expected accuracy.
2. **Replicate DD1 on a different task type.** Scale-vs-shift is a structural claim and deserves
   more than one surface.
3. Keep the shape/size distinction. It explains five failures retrospectively and should be the
   first question asked of any future correction.

## Taxonomy

- `uniform-correction-fallacy` — **sixth occurrence, first non-fatal one.** A fixed divisor
  under-corrected, but the correction still helped because its *shape* was right. New sub-lesson:
  when a correction fails, ask whether it is the wrong size or the wrong kind — five rounds were
  spent resizing something whose kind was wrong.
- `cheap-to-shrug` — countermeasure **validated**: 0 unscoreable on a fresh 16-item draw.
