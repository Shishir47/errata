# Round 28 — recomputing 27 rounds against their chance floors

**Analysis round.** Script: [`chance-adjusted.js`](../../chance-adjusted.js). No new claims about
the world; the predictions BB1/BB2 were written into the script before it was run.

```
round                     floor   acc     conf    raw gap   skill claimed
round-05-sqlite-affinity   0.200  1.000  0.937  -0.063     92%
round-12-file-shortopts    0.037  1.000  0.527  -0.473     51%
round-14-cygpath           0.037  0.885  0.529  -0.356     58%
round-16-machine-state     0.250  0.600  0.440  -0.160     54%
round-25-spending          0.250  0.300  0.333  +0.033    166%
round-26-compression       0.127  0.692  0.596  -0.096     83%
round-27-binary            0.500  0.800  0.635  -0.165     45%

mean RAW gap -0.183      mean SKILL CLAIMED 78%
BB1 "mean skill claimed < 70%" (0.65) -> DISCONFIRMED
BB2 "at least one round > 100%"(0.45) -> CONFIRMED
```

## 1. Round 27 generalised from a single round, and was wrong

Round 27 concluded, from its own 45%:

> Every earlier round's gap is understated by this correction.

Computed across all seven rounds with a clean floor, the mean is **78%**, and the range runs
**45% to 166%**. Round 27's figure was the *worst case*, not the typical one. The correction
doesn't systematically deepen the under-confidence — it makes the picture **more variable**.

That's the fourth time in this project I've extrapolated a relationship from one or a few points
(`famous-sample` at R05, R25's four-point table, R26 catching it, now this). I wrote the
correction and the over-generalisation in the same document.

## 2. Round 25's "I was calibrated" reverses — but on an unstable number

Round 25 reported a gap of **+0.033** and concluded I was calibrated on near-chance facts.
Chance-adjusted it reads **166%** — substantial *over*-claiming, because accuracy (0.300) was
barely above the floor (0.250).

**I don't trust that number.** The denominator is `0.300 − 0.250 = 0.05`. A ratio on a 0.05
denominator is wildly unstable; one item either way would swing it by tens of percent. Reported,
flagged, not banked.

The real lesson is narrower and holds: **when accuracy is near chance, the raw gap is
uninformative** — it can read as perfect calibration while the underlying claim asserts an edge
that isn't there.

## 3. The exclusion I am not going to make

Dropping the unstable R25 gives a mean of **64%**, which would flip BB1 from DISCONFIRMED to
CONFIRMED.

I have a defensible reason to exclude it (§2). I am still reporting **BB1 as DISCONFIRMED**,
because *removing the single data point that reverses my own prediction* is precisely the move
this project exists to catch — and the justification would be a great deal less compelling if
the exclusion happened to cost me the result rather than win it.

Both numbers are above. The scored one is the one computed as pre-registered.

## 4. The weakest link, stated in the script itself

Chance floors are **hand-assigned** from each round's declared answer set. "~27 ways" for a
letter-or-none claim is an estimate; the 0.127 weighted floor for Round 26 mixes two blocks.
Fifteen rounds are excluded entirely — exact-value rounds (floor ~0, no correction needed),
mixed-ENUM rounds (no single defensible floor), and analysis rounds (no per-item confidences).

So this covers **7 of 22 scored rounds**. It is a correction to the measurement, not a new
measurement of everything.

## 5. Where the central finding now stands

Four successive characterisations:

| claim | status |
|---|---|
| "systematically under-confident, −0.207" | true of the surfaces tested, which skew high-accuracy |
| "confidence compressed to 0.33–0.53" | withdrawn (R26) — four points from twenty |
| "tracks accuracy at ~60–80%" | holds within-round (R26: 81%) |
| **"claims ~78% of above-chance skill, range 45–166%"** | chance-adjusted, 7 rounds, high variance |

The honest summary after 28 rounds: **I under-claim moderately on most surfaces, by an amount
that varies more than any single number conveys, and the variance is the finding.** Every
attempt to compress it into one figure has been withdrawn within two rounds.

## Method changes for round 29

1. **Never state a ratio without its denominator.** R25's 166% is arithmetically true and
   meaningless.
2. When an exclusion would flip a pre-registered result, report both and score the
   pre-registered one.
3. Stop looking for the single number. Four attempts, four withdrawals.

## Taxonomy

- `famous-sample` — **recurred a fourth time**, in my own analysis: Round 27 characterised a
  seven-round relationship from one round, in the same document that introduced the correction.
- No new entries.
