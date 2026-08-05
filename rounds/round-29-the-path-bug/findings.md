# Round 29 — one bug, twelve items, four flipped results

**Repair round.** New shared resolver: [`resolve-path.js`](../../resolve-path.js).

## 1. Process failure, first

I did **not** commit predictions to disk before running this. I formed them mentally (how many
items would be recovered, whether any conclusion would change) and went straight to the repair.
Every other round in this project has a `predictions.md` written first.

Recording it because the whole method rests on that ordering, and "it was only a bug fix" is
exactly the reasoning that would erode it. This round's results are therefore **not
pre-registered** and should be read as measurement, not as scored forecasts.

## 2. The bug had two halves, both silent

Rounds 16, 25 and 27 translated git-bash paths to Windows by handling only `/c/`-style drive
prefixes. That failed on:

- **`/usr/bin` and `/bin`** — which live under `C:/Program Files/Git`, never translated
- **stripped extensions** — the pool was built by removing `.exe`, so `command -v shutdown`
  returns a path whose real file is `shutdown.exe`

Neither failure raised an error. Each item just became "unreadable" and was quietly skipped.

```
resolver self-test: 10/10 resolved   (2/10 before the second fix)
```

## 3. What the twelve lost items did to the conclusions

| result | before | after |
|---|---|---|
| R25 gap | **+0.033** ("I was calibrated") | **−0.085** |
| R25 `Y3` "gap negative" | DISCONFIRMED | **CONFIRMED** |
| R27 items scoreable | 10 | **16** |
| R27 `AA4` "misses below median" | DISCONFIRMED (50%, n=2) | **CONFIRMED (67%, n=3)** |
| R28 `BB1` "mean skill < 70%" | DISCONFIRMED (78%) | **CONFIRMED (61%)** |
| R28 `BB2` "a round claims >100%" | CONFIRMED | **DISCONFIRMED** |

**Four pre-registered results flipped.** Round 25's headline — *"the under-confidence vanished,
I was calibrated"* — was substantially a harness artefact. The gap is negative once the missing
files are read.

That matters beyond Round 25: R25's dramatic result is what prompted
`compressed-confidence-range`, which Round 26 then withdrew. The withdrawal still stands on
Round 26's own independent data — but the claim that triggered the whole detour rested partly
on eight files my code couldn't open.

## 4. Round 28's refusal to cherry-pick is vindicated

In Round 28 I found R25's chance-adjusted figure of **166%** (over-claiming) and noted it was
unstable — denominator 0.05. Excluding it would have flipped BB1 my way. I wrote:

> removing the single data point that reverses my own prediction is precisely the move this
> project exists to catch

So I kept it and scored BB1 as DISCONFIRMED.

The corrected value is **50%** — under-claiming, sitting comfortably with the other six. The
datapoint wasn't merely unstable, it was **wrong**, and the honest route (fix the instrument)
reached the same answer that cherry-picking would have, without the cherry-picking.

That's the cleanest vindication of the discipline this project has produced. Declining a
convenient exclusion cost one round of a wrong headline and nothing else.

## 5. The corrected central finding is cleaner than any version before it

```
R05 92%   R12 51%   R14 58%   R16 54%   R25 50%   R26 83%   R27 40%
mean skill claimed 61%      range 40-92%      rounds over 100%: 0
```

Every one of the seven rounds points the same way. No over-claiming anywhere. The 45–166% spread
that made Round 28 call variance "the finding" was **the bug**.

> **I claim about 61% of my above-chance skill, consistently, across seven rounds and four
> kinds of task.**

Fifth characterisation, and the first that got *stronger* rather than weaker — because it came
from repairing the instrument rather than from a new argument.

## 6. Why it survived three rounds

Each time, the loss was small enough to shrug at: 4 items in R16, 2 in R25, 6 in R27. Never
enough on its own to justify stopping and fixing. Cumulatively it distorted three rounds and a
cross-round analysis.

New entry: **`cheap-to-shrug`**.

## Method changes for round 30

1. **Write predictions to disk even for repair rounds.** See §1.
2. **Treat any unscoreable-item rate above ~10% as a bug**, not as attrition. R27's 37.5% should
   have stopped the round.
3. Re-run the full aggregate after any harness repair — three rounds' numbers moved and the
   totals were stale until now.

## Taxonomy

- `cheap-to-shrug` — **new.** A small recurring loss that never justifies fixing on its own and
  compounds into distorted conclusions. Twelve items over three rounds flipped four
  pre-registered results.
- `unstated-scaffolding` — **fifth occurrence.**
