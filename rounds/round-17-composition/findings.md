# Round 17 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
15/15 right    accuracy 1.000
mean stated confidence 0.818   Brier 0.0347   gap -0.182

P1 "at least one error"  (0.70) -> DISCONFIRMED
P2 "gap turns positive"  (0.40) -> DISCONFIRMED
P3 "FLAT beats MINE"     (0.55) -> CONFIRMED  (MINE 0.0347, FLAT 0.0100)
```

## 1. The harness said 0/15, and it was lying

The first run scored **every item wrong**, with every `actual` an empty string.

The cause: I built the ground truth as a shell pipeline using `rev`, which **does not exist on
this Git Bash**. And the pipeline *swallowed the failure* — `rev` wrote "command not found" to
stderr while the pipeline's exit status came from `cut`, which succeeded on empty input. My
harness read 15 empty strings and scored them as 15 confident wrong answers.

Had I shipped that, this round would have read:

> accuracy 0.000, gap **+0.818** — catastrophically over-confident on compositional tasks

which would have inverted the central finding of the entire project.

**Fourth instrument failure in seventeen rounds** (R08 false positives, R09 false negatives,
R14's unparseable output line, R17). Same family as `unstated-scaffolding`, sixteen rounds
after I first documented it.

### And I only caught it because the failure was total

Fifteen-for-fifteen wrong with empty output is an obvious signature. **A partial harness fault
producing plausible-looking wrong answers would have passed unexamined** — I would have written
it up as a knowledge finding, and it would have been more interesting than the truth, which is
the dangerous combination.

I should assume smaller instrument faults have gone unnoticed in earlier rounds. Four found in
seventeen is a *detection* rate, not an occurrence rate.

Fixes committed: ground truth computed with no external dependency, cross-checked against the
shell for the stages that do exist, and an **empty-output guard** that aborts rather than
scoring blanks as errors.

## 2. My model of my own reliability was wrong

I reasoned in `predictions.md` that four steps at ~95% compound to ~81%, and set a mean stated
confidence of **0.818** to match. That reasoning was explicit and it was wrong:

```
actual 1.000  ->  implied per-step accuracy 1.000
```

I imported an intuition about **error accumulation across mental steps** — true of a person
doing this by hand — and applied it to myself without checking. For deterministic string
manipulation my per-step reliability is not 0.95; on this evidence it's indistinguishable
from 1.

That's a different failure from all sixteen previous rounds. It isn't misjudging a *fact*, it's
misjudging **my own mechanics** — reaching for a human-shaped model of how errors behave.

New entry: **`borrowed-error-model`**.

## 3. The over-confidence hunt has now failed four times

| Attempt | Round | Result |
|---|---|---|
| Harder property | 15 | 21/21 |
| Items I couldn't select | 08, 09, 12 | 53/56 on my own "guesses" |
| Facts unavailable to me | 16 | still −0.160 |
| **Compositional, multi-step** | **17** | **15/15, gap −0.182** |

Seventeen rounds, seventeen negative gaps. I have now tried changing the difficulty, the
authorship, the availability of the facts, and the *kind* of claim. None produces
over-confidence.

The one place it did appear was **inside my reasoning about the round itself** — the 4×95%
compounding argument, and P1/P2 predicted at 0.70 and 0.40. Both wrong, both in the
over-confident direction.

> On object-level claims I am reliably under-confident. On **claims about my own performance**
> I am not. That's where the next round should look.

## Method changes for round 18

1. **Every harness gets a fault guard**: empty/degenerate ground truth aborts instead of
   scoring. Retrofit to the shared scoring rule.
2. **Verify external tools exist before depending on them** — `rev` cost this round its first run.
3. **Turn the aim inward.** Object-level recall is exhausted as a source of over-confidence.
   Predictions *about my own behaviour* — how many steps a task will take, whether I'll need to
   retry, how long output will be — are where P1/P2 just failed.

## Taxonomy

- `borrowed-error-model` — **new.** Modelling my own reliability with an intuition borrowed
  from how human error behaves (steps compounding at 95%), without checking whether it
  describes me.
- `unstated-scaffolding` — **fourth occurrence**, and the most consequential: it would have
  inverted the project's headline finding.
