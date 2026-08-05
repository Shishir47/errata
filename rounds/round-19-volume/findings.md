# Round 19 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
6/7 right    accuracy 0.857
mean stated confidence 0.443   Brier 0.3293   gap -0.414

ADJUSTED (scored) 6/7  Brier 0.3293
GUT               4/7  Brier 0.2436
S1 "gap positive again"    (0.50) -> DISCONFIRMED
S2 "adjusted beats gut"    (0.60) -> DISCONFIRMED
item 7: 2 of 5 above gut   -> self-model-by-anecdote REPRODUCES
```

## 1. The distortion reproduces

Two of five volume estimates landed a full bucket **above** my gut:

```
tracked files    gut C (40-59)      actual D  -> 64
total .md lines  gut B (1500-2999)  actual C  -> 4438
```

Round 18's `self-model-by-anecdote` was one round on one session. It now reproduces on entirely
different dimensions — properties of a repository I built file by file. **I under-count what
I've made.** Item 7 confirmed.

## 2. The correction worked, and made my calibration worse

This is the interesting part, and I didn't see it coming.

Applying Round 18's lesson — shift the estimate one bucket up — moved me from **4/7 to 6/7**.
The correction is real and it works.

Yet the adjusted forecaster scored a **worse Brier**: 0.3293 against gut's 0.2436.

Not a bug. Brier scores calibration, not accuracy. Look at item 1: I adjusted the answer from C
to D and was right — while leaving confidence at **0.35**. Being right at 0.35 is badly
calibrated. Meanwhile the gut forecaster was *wrong* at 0.35, which Brier rewards.

> I applied the correction to my **answer** and not to my **confidence**. If a lesson is good
> enough to change what I predict, it is good enough to change how sure I am of it. Moving the
> point estimate while leaving the uncertainty untouched is incoherent — and it produced the
> worst of both: more accurate, less calibrated.

New entry: **`half-applied-correction`**.

The right move was to adjust to D *and* raise confidence to ~0.55, because the adjustment was
grounded in a measured, replicated bias rather than a hunch. I treated my own finding as a
tiebreaker instead of as evidence.

## 3. Round 18's positive gap did not reproduce — for a coherent reason

S1 predicted another positive gap at 0.50. Actual: **−0.414**, firmly back to under-confidence.

That isn't a contradiction of Round 18. The two rounds differ in exactly one way: **here I had
already corrected the estimates.** The over-confidence in Round 18 came from wrong estimates
held at high confidence; correcting the estimates removed it, and left the familiar
under-confidence behind.

So the picture holds together:

| | Round 18 | Round 19 |
|---|---|---|
| estimates | uncorrected | corrected upward |
| accuracy | 0.250 | 0.857 |
| gap | **+0.238** | **−0.414** |

The self-model bias is in the *estimates*. The confidence attached to them is under-stated
either way — which is why Round 18 looked over-confident (bad estimates, ordinary confidence)
and Round 19 looks under-confident (good estimates, same confidence).

## 4. The miss

Item 6: I claimed the largest markdown file would be a `findings.md`. It's **`taxonomy.md`, 541
lines** — the accumulating file, now longer than any single round's write-up. Fitting, given
the taxonomy was always meant to be the actual product and the rounds just the way it gets fed.

## Method changes for round 20

1. **When applying a measured correction, correct the confidence too.** A replicated bias is
   evidence, not a tiebreaker.
2. Report **accuracy and Brier separately** when a correction is under test — this round they
   pointed in opposite directions and either alone would have misled.
3. `self-model-by-anecdote` is replicated; it can enter the synthesis as a finding rather than a
   curiosity.

## Taxonomy

- `half-applied-correction` — **new.** Applying a lesson to the point estimate while leaving
  the confidence unchanged, becoming more accurate and less calibrated at once.
- `self-model-by-anecdote` — **replicated** on new dimensions (2 of 5 volume estimates a full
  bucket low).
