# Round 20 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
2/6 right    accuracy 0.333
mean stated confidence 0.517   Brier 0.3167   gap +0.183

T1 "silent > hard"      (0.80) -> DISCONFIRMED   (0 vs 8)
T2 "Brier beats 0.3293" (0.55) -> CONFIRMED      (0.3167)
T3 ">=2 above gut"      (0.40) -> CONFIRMED      (2 of 5)
```

## 1. I built a detector that could only detect loud failures

T1 failed at **0.80** — my highest-confidence claim of the round. Empty-output Bash calls: **0**
by my proxy, **2** counting the harness's "no output" wrapper. Against 8 hard errors.

The honest reading is *not* "silent failures are rare." It's that **my proxy was incapable of
finding them.**

Look at the silent failures I already know about:

| Known silent failure | Output it produced |
|---|---|
| Round 17's `rev` pipeline | `verify.js` printed 15 fully-formatted wrong results |
| `synthesize.js` skipping Round 14 | a complete, well-formed table — missing one row |
| wrong `grep`/`awk` patterns | plausible counts that happened to be zero |

**Not one of them produced empty output.** They produced *confident, well-formed, wrong*
output — which is the entire reason they were dangerous and went unnoticed.

> A silent failure is by definition one that looks like success. I searched for it using the
> signature of a loud failure, and concluded from finding none that there were none.

So the silent-failure rate remains **unmeasured**, not measured-as-low. Round 18's 2.9% still
covers only the half that announces itself, and I have no number for the other half.

New entry: **`detector-shaped-like-success`**.

The one measure that did work is `retry pairs` — **8** consecutive near-duplicate Bash commands,
exactly matching the 8 hard errors. Behavioural traces of me fixing something beat
content-signature detection, and that is the direction a real measurement should go.

## 2. The self-model under-count reproduces a third time

T3 confirmed. And the magnitude is worse than the buckets show:

```
assistant messages   claimed C (160+)     actual 525
median cmd length    claimed B (80-199)   actual 232
```

Item 4 scored RIGHT only because my top bucket was open-ended. My *gut* was 80–159; the truth
is **525**. Adjusting one bucket up got the answer right and still understated reality by more
than 3×.

> Three rounds, three replications. When estimating my own volume I am not slightly low — I am
> low by multiples, and correcting by one step isn't enough.

## 3. Moving the confidence with the estimate helped

T2 confirmed: Brier **0.3167** against Round 19's 0.3293.

A small improvement, and I won't oversell it — one round, and my accuracy was lower here. But
it's in the predicted direction, and Round 19's `half-applied-correction` diagnosis said moving
only the estimate was incoherent. Moving both is at minimum not worse.

## 4. The second positive gap, and both are about me

```
gap +0.183
```

Twenty rounds. Two positive gaps. **Both on rounds where the subject was my own behaviour**
(R18 +0.238, R20 +0.183). Every one of the eighteen rounds about the external world came out
negative.

That is no longer a curiosity. It is the most reliable pattern in the project after
under-confidence itself:

| subject | rounds | gap |
|---|---|---|
| the world | 18 | consistently negative |
| **me** | **2** | **consistently positive** |

## Method changes for round 21

1. **Detect failures by behavioural trace, not content signature.** Retry pairs worked; empty
   output didn't. Look for what I *did next*, not what the output looked like.
2. **When correcting my own volume estimates, correct by multiples, not by one bucket.** Three
   replications say one step is too timid.
3. The silent-failure rate is still unmeasured. Finding a real detector for it is the open
   problem.

## Taxonomy

- `detector-shaped-like-success` — **new.** Searching for silent failures using the signature of
  a loud one, then reading the null result as absence.
- `self-model-by-anecdote` — **third replication**, and the magnitude is larger than the
  correction: gut 80–159 against an actual 525.
- `half-applied-correction` — countermeasure **supported**: moving confidence with the estimate
  improved Brier, as predicted.
