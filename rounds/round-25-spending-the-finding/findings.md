# Round 25 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
3/10 right   accuracy 0.300   (chance 0.250)
mean stated confidence 0.333   Brier 0.1591
gap (confidence - accuracy) +0.033

MINE    Brier 0.1591      <- best
BOOSTED Brier 0.2123
FLAT    Brier 0.5700

Y1 "BOOSTED beats MINE" (0.40) -> DISCONFIRMED
Y2 "accuracy > chance"  (0.70) -> CONFIRMED (0.300)
Y3 "gap negative"       (0.55) -> DISCONFIRMED (+0.033)
Y4 "FLAT is worst"      (0.85) -> CONFIRMED
```

## 1. The under-confidence vanished, and that's the finding

Twenty-five rounds have reported a confidence gap of **−0.207**, negative in 17 of 19. Here it
is **+0.033** — essentially zero. On this surface I was **calibrated**.

Spending the finding broke it, exactly as Round 24 said testing by use rather than
re-confirmation would.

## 2. What replaces it: my confidence has compressed dynamic range

Line the rounds up by accuracy:

| round | surface | accuracy | mean confidence | gap |
|---|---|---|---|---|
| 12 | `file` short options | 1.000 | 0.527 | **−0.473** |
| 15 | `less` long forms | 1.000 | 0.531 | **−0.469** |
| 16 | PATH dir file counts | 0.600 | 0.440 | −0.160 |
| **25** | **system file sizes** | **0.300** | **0.333** | **+0.033** |

My accuracy ranges from **0.30 to 1.00**. My stated confidence ranges from **0.33 to 0.53**.

> I am not systematically under-confident. **My confidence has less dynamic range than my
> accuracy** — compressed toward the middle. Where I'm right almost always, I badly understate
> it. Where I'm near chance, I'm about right.

That is a different claim, and a better one. It explains every result the project has produced:

- **FLAT 0.90 wins on high-accuracy surfaces** (R13–15) — because that's where I understate
- **FLAT loses catastrophically here** (0.5700) — because that's where I don't
- **BOOSTED fails everywhere** — a uniform *shift* cannot fix a *scale* problem

New entry: **`compressed-confidence-range`**, superseding the flat under-confidence claim.

## 3. Y1's failure is the fifth `uniform-correction-fallacy`

I pre-registered exactly this consequence:

> If Y1 fails while Y3 holds, the finding is real but not uniformly correctable — the fifth
> instance of `uniform-correction-fallacy`, this time against the project's best result.

Y1 failed. Y3 *also* failed, which is stronger: the finding wasn't merely uncorrectable here,
it wasn't present. Boosting hurt (0.1591 → 0.2123) because it shifted a distribution that was
already sitting in the right place.

Fifth occurrence, and the most expensive: it was aimed at the one result I'd treated as solid
for twenty-five rounds.

## 4. Every single error was an underestimate

```
euiccscsp     B -> C     midi2.diag   A -> B     oleacchooks  A -> B
secconfig     B -> D     srm          B -> C     w32time      C -> D
targetedcontent C -> D
```

**Seven errors, seven underestimates.** Not one file was smaller than I guessed.

That's the same directional bias as the self-model volume under-count — but these are *other
people's files*, with nothing to do with my own output. So the bias documented in Rounds 18–24
may be a special case of something broader: **a general prior that things are smaller than they
are.** One round, one surface; noted, not claimed.

## 5. Limits

Ten scoreable items (two files unreadable — path resolution), accuracy barely above the 0.25
chance floor. This establishes that the gap *can* close, not the shape of the curve. The
compression claim rests on four rounds spanning the accuracy range, which is suggestive rather
than settled.

## Method changes for round 26

1. **Retire "systematically under-confident."** Replace with the compression claim in both
   syntheses, marked as a supersession rather than a rewrite.
2. **Test the compression directly**: run one high-accuracy and one low-accuracy surface in the
   same round and check the gap moves with accuracy as predicted.
3. Stop proposing uniform corrections. Five failures. The next correction attempted must be
   *scale*, not shift — e.g. stretching confidences away from the middle.

## Taxonomy

- `compressed-confidence-range` — **new, supersedes the flat under-confidence finding.** Accuracy
  spans 0.30–1.00; stated confidence spans 0.33–0.53. The gap is an artefact of measuring mostly
  on surfaces where I score highly.
- `uniform-correction-fallacy` — **fifth occurrence**, now against the project's central result.
- `self-model-by-anecdote` — possibly a special case of a general size-underestimation prior; all
  7 errors here were underestimates of files that aren't mine.
