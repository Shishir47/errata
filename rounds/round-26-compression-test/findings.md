# Round 26 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
           n   acc     conf    gap      Brier
BLOCK H    15  0.933  0.791  -0.142   0.0799
BLOCK L    11  0.364  0.329  -0.035   0.2103
OVERALL    26  0.692  0.596  -0.097   0.1351

Z1 "gap(H) < -0.25"         (0.70) -> DISCONFIRMED (-0.142)
Z2 "|gap(L)| < 0.15"        (0.60) -> CONFIRMED    (0.035)
Z3 "gap(H) < gap(L) - 0.20" (0.75) -> DISCONFIRMED   <- the disconfirming condition
Z4 "acc(H) - acc(L) > 0.40" (0.75) -> CONFIRMED    (0.570)

confidence moved 81% as far as accuracy did
```

## 1. The disconfirming condition fired

I wrote in `predictions.md`:

> if Z3 fails, `compressed-confidence-range` does not survive a within-round test and must be
> withdrawn to a cross-round observation only.

Z3 failed. Across a 0.570 swing in accuracy, my confidence moved **0.462** — **81% of the way**.
That is near-proportional tracking, not compression.

## 2. Round 25's table was a cherry-pick, and I should say so plainly

Round 25 built the compression claim on four rounds:

```
accuracy 1.000 / conf 0.527      accuracy 1.000 / conf 0.531
accuracy 0.600 / conf 0.440      accuracy 0.300 / conf 0.333
```

Those are the **two most extreme high-accuracy rounds in the project** (both perfect scores) and
the single lowest. Selected that way, confidence looks pinned near 0.5 while accuracy sweeps the
range. Run a balanced test in one sitting and the effect mostly disappears.

I selected four points from twenty to characterise a relationship — the same error I have
documented five times as `famous-sample`, committed while writing the finding that was supposed
to supersede everything.

## 3. Checking the alternative explanation, and it also fails

I suspected a time trend: that my confidence on familiar task types had risen over the project,
confounding the cross-round comparison. Computed across all parseable rounds:

```
correlation(round number, gap) : 0.283   (weak)
rounds 1-13  : mean gap -0.213   mean confidence 0.721
rounds 14-26 : mean gap -0.094   mean confidence 0.546
```

The gap did halve. But **mean confidence went down, not up** (0.721 → 0.546) — so it isn't
learning. Accuracy fell further than confidence did (0.934 → 0.640), because later rounds moved
onto self-directed and unknowable surfaces. The gap narrowed by the surfaces getting harder.

Across the project's two halves, confidence tracked accuracy at **60%**; within this round,
**81%**.

## 4. Where that leaves the central finding

Three successive characterisations, each weaker and more accurate:

| claim | status |
|---|---|
| "systematically under-confident, −0.207" | true *on the surfaces I happened to test*, which skew high-accuracy |
| "confidence compressed to 0.33–0.53" (R25) | **withdrawn** — cherry-picked four points |
| **"confidence tracks accuracy at ~60–80%"** | what the balanced data supports |

So: **mildly under-confident, mildly compressed, neither dramatic.** The two headline versions I
carried for twenty-five rounds both overstated a real but modest effect.

## 5. A harness limitation I should record

`synthesize.js` reported five rounds it could not include: 10, 11 and 13 have no `verify.js`
(they were analysis rounds), and 23 and 24 print log-ratio errors rather than the expected
Brier line, so they **fail to parse and are silently dropped from every total**.

That means the running "437 items, gap −0.199" excludes two scored rounds. Not fatal — but it's
`unstated-scaffolding` again, and it means the headline totals have been quietly incomplete
since Round 23.

## Method changes for round 27

1. **Fix `synthesize.js` to fail loudly** on unparseable rounds rather than skipping them.
2. Characterise relationships on **all** available data points, never a chosen four. If I need
   to pick, that's a signal the effect is weak.
3. Keep pre-registering disconfirming conditions. This is the third round where one fired and
   forced a retraction I'd otherwise have argued around.

## Taxonomy

- `compressed-confidence-range` — **withdrawn to a weak form.** Real but mild: confidence tracks
  accuracy at ~60–80%, not the near-pinned behaviour Round 25 claimed from four selected points.
- `famous-sample` — **recurred, in my own analysis.** Four points chosen from twenty to
  characterise a relationship.
- `unstated-scaffolding` — the aggregator has been silently dropping two scored rounds.
