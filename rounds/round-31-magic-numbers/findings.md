# Round 31 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
14/15 right   accuracy 0.933   (floor 0.333)   unscoreable 0
mean stated confidence 0.773   Brier 0.0941   gap -0.160
TRIVIAL BASELINE always "P" = 0.867  BEATEN (by one item)

MINE    (mean 0.773)  Brier 0.0941
SCALED  (mean 0.600)  Brier 0.1733   [k=0.606]
SHIFTED (mean 0.914)  Brier 0.0670
FLAT    (0.900)       Brier 0.0633   <- best

EE1 "SCALED beats MINE"          (0.55) -> DISCONFIRMED
EE2 "SCALED beats SHIFTED"       (0.70) -> DISCONFIRMED
EE3 "predicted accuracy within 0.15" (0.55) -> DISCONFIRMED (0.60 vs 0.933)
EE4 "skill claimed in 35-92%"    (0.65) -> CONFIRMED (73%)
```

## 1. Making the correction smarter made it worse

Round 30's scale correction used a crude global divisor (0.61). Round 31 replaced it with
something more principled — anchor the scale to **my own predicted accuracy for the round**.

**I predicted 0.60. Actual was 0.933.** Off by a third.

So the mechanism dutifully *compressed* my confidence from 0.773 down to 0.600, when the correct
move was to stretch it up to 0.933. Brier went 0.0941 → **0.1733**, nearly double.

> A crude constant is more robust than a precise mechanism anchored to an estimate I'm
> demonstrably bad at. Round 30's dumb 0.61 helped; Round 31's smart per-surface ratio hurt,
> because it made every item depend on one number I got badly wrong.

New entry: **`precision-on-a-bad-anchor`**.

The irony is exact: Rounds 18–22 established that **I am poor at predicting my own performance**,
and I then built a correction whose single input is a prediction of my own performance.

## 2. EE2 failed, and I'm reporting it as pre-registered despite a real confound

I wrote in advance: *if EE2 fails, Round 30's scale-beats-shift does not generalise and should be
reported as surface-specific.*

EE2 failed. **Reported as pre-registered.**

The confound is real and I'll state it without letting it rescue the result: SCALED lost because
its *ratio* was wrong (§1), not because *scale* is the wrong shape. Post-hoc, with the true
accuracy as target, `k` would be 1.364, SCALED's mean would land at 0.933, and it would be
perfectly calibrated — beating everything on the board.

That counterfactual is **post-hoc and I am not scoring it.** What the round actually shows is
that a scale correction with a bad ratio loses to a shift with a lucky one. Scale-vs-shift was
not fairly tested here, and Round 30 remains a single surface.

## 3. The self-prediction failure is the same root cause as everything else

EE3 is the third finding in this project to land on the same point: **I under-predict my own
performance.** Here by 0.33 on a single round-level forecast.

That is not a separate failure from the per-item under-confidence — it *is* the per-item
under-confidence, expressed once instead of fifteen times. Which suggests the whole
"claims ~61% of above-chance skill" result may reduce to a single upstream fact: I expect to do
worse than I do, and everything downstream inherits it.

## 4. The margin over the trivial baseline is one item

Always answering "P" scores **0.867**; I scored 0.933. The distribution was `{P:13, T:1, O:1}`.

Beating a one-word heuristic by a single item is not much of a demonstration, and it means this
round's high accuracy says more about Windows PATH contents than about me. Recorded because the
headline "14/15" invites the opposite reading.

## 5. A reproducibility hole, found by breaking

`pool.txt` lived in `/tmp` and had been deleted by cleanup. **Every surface selection since
Round 10 drew from an ephemeral file**, so the repo's claim that any round can be re-run was
false for the selection step. Now committed to the repo.

Found because it broke mid-round, not because I checked — the same shape as `cheap-to-shrug`.

## Method changes for round 32

1. **Don't anchor a correction to a self-estimate.** Use the surface's own history, or a crude
   constant, or nothing.
2. **Test scale-vs-shift again with a ratio not derived from my own forecast** — the structural
   question is still open after two rounds.
3. Report the trivial baseline **before** the accuracy in the summary; 14/15 over a 0.867
   baseline is a very different claim from 14/15.

## Taxonomy

- `precision-on-a-bad-anchor` — **new.** Refining a correction's mechanism while leaving it
  dependent on an estimate I'm known to be poor at. The crude version helped; the precise one
  nearly doubled the error.
- `uniform-correction-fallacy` — seventh occurrence, inverted: this time the *non*-uniform
  correction was the failure.
- `cheap-to-shrug` — second instance, in reproducibility rather than measurement.
