# Round 14 — findings

**Run:** cygpath · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
23/26 right    accuracy 0.885
mean stated confidence 0.529    gap -0.356
TRIVIAL BASELINE  "none" everywhere = 0.000   BEATEN

FORWARD TEST   MINE Brier 0.2095    FLAT(0.90) Brier 0.1023   -> FLAT wins, CONFIRMED
               MINE shuffled 0.2557

L (conf<0.5)  n=10  stated 0.37  actual 0.70  gap -0.33
H (conf>=0.5) n=16  stated 0.63  actual 1.00  gap -0.37
```

## 1. The constant beats me prospectively

Round 13 established post hoc that a flat number beat my per-item confidences. This round
committed **FLAT = 0.90** in `predictions.md` before any answer was seen, and scored both
forecasters.

**FLAT 0.1023 vs MINE 0.2095.** The constant wins by half, on a pre-registered test with no
after-the-fact fitting. Prediction confirmed at 0.75.

That result is now solid: **my confidence *level* on externally-supplied factual recall is
badly wrong, and a fixed 0.90 serves better than my judgement.**

## 2. But Round 13's other claim was overstated, and this round shows why

Round 13 also concluded the *ordering* carried no signal — shuffling my confidences cost only
6.7%. This round says otherwise:

- All **three** misses landed in the low-confidence block
- L scored 0.70, H scored **16/16**
- Shuffling costs **22%** here (0.2095 → 0.2557), against 6.7% in Round 13

So discrimination worked. Why the disagreement? **Rounds 08, 09 and 12 had almost no errors to
sort** — 1, 1 and 0 respectively out of 91 items. You cannot measure a forecaster's ability to
rank errors on a set that contains no errors. The shuffle metric there was dominated by the
*level* penalty, which shuffling doesn't change.

> Round 13's "the ordering is noise" was an artefact of near-perfect accuracy. With 3 errors in
> 26 items, the ordering demonstrably works.

The two claims come apart cleanly, and I had them fused:

| | verdict | evidence |
|---|---|---|
| **Level** (calibration) | genuinely bad | FLAT beats MINE prospectively, 4 rounds running |
| **Ordering** (discrimination) | works | 3/3 errors in the low block; shuffle costs 22% |

Correction filed against Round 13 rather than quietly left standing.

## 3. The errors, and a collision I deliberately didn't tidy

```
--close          claimed none   actual -c
--proc-cygdrive  claimed none   actual -U
--smprograms     claimed -S     actual -P
```

**Two of three errors are me predicting `none` where a short form exists.** The failure mode
isn't picking the wrong letter — it's under-predicting that a letter exists at all. Worth
noting because it's directional: on this surface I default to absence.

The third is more interesting. In `predictions.md` I claimed `-S` for **both** `--smprograms`
and `--sysdir`, and wrote:

> at most one can be right, and I've left the collision in rather than tidy it

`--sysdir` → `-S` was right; `--smprograms` → `-P` was wrong. Leaving the inconsistency
visible cost me a point and recorded a true fact about my uncertainty. Tidying it would have
produced a cleaner-looking prediction file and destroyed the information.

## 4. The strided selector delivered

`cygpath` is the first surface drawn under Round 13's coprime stride, and it is **not** GNU
userland — precisely what the fix was for. It also produced the first supplied-surface round
with a meaningful number of errors, which is what made §2 visible at all.

The old one-index walk would very likely have handed me another coreutils tool, another 30/30,
and another round that couldn't measure discrimination.

## Method changes for round 15

1. **Report level and ordering separately, always.** Fusing them produced a wrong conclusion
   that survived a full round.
2. **Keep FLAT as a standing baseline** in every supplied-surface round. It costs nothing and
   it has now won twice.
3. **Treat any round with <2 errors as unable to measure discrimination**, and say so rather
   than drawing a conclusion from it.

## Taxonomy

- `unfamiliarity-discount` — **narrowed and strengthened.** The level error is real and
  reproducible; the ordering is *not* noise. Round 13's stronger claim retracted.
- `local-walk` — countermeasure **validated**: the strided draw left the pocket and produced
  the first informative supplied surface.
- New failure noted, not yet an entry: **defaulting to absence** — 2 of 3 errors predicted
  `none` where a short option existed. One round, one surface; needs replication before it
  earns a name.
