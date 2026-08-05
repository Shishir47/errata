# Round 33 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
        n   acc     conf    floor   ratio    Brier
DERIVE  12  1.000   0.920   0.333    88%     0.0067
ESTIMATE 12 0.583   0.317   0.250    20%     0.3092

GG1 "ratio(D) > ratio(E)" (0.70) -> CONFIRMED (88% vs 20%)
GG2 "difference > 0.25"   (0.55) -> CONFIRMED (68pp)
GG3 "ratio(D) in 70-100%" (0.55) -> CONFIRMED
GG4 "ratio(E) in 30-60%"  (0.60) -> DISCONFIRMED (20%)
```

## 1. Round 32's conclusion is overturned — by a test, not an argument

Round 32 concluded:

> the ratio is not conditionable on anything known in advance, the crude constant is the
> ceiling

That was wrong, and the reason is instructive: Round 32 tested *accuracy*, *chance floor*,
*item count* and *mean confidence* — and dismissed **task type** because its groups had n=1 and
were labelled post-hoc. It never actually tested the one candidate that was both known in
advance and mechanistically plausible.

Pre-registered and run properly, task type separates the ratio by **68 percentage points**.

**The ratio is conditionable.** Not on any statistic of the round, but on what *kind of thinking*
the task requires — which I know before writing a single claim.

## 2. Which explains Round 30's under-correction mechanically

Round 30 applied the global 0.61 divisor to a **file-size** task — an `estimate` task — and
under-corrected, closing only a third of the gap. Its true ratio was 35%.

Now the reason is visible: **0.61 is the average of two populations that barely overlap.**

```
derive-type rounds   ~88%
estimate-type rounds ~20-35%
global mean          ~61%   <- describes neither
```

A constant built from the mean of a bimodal distribution is wrong for every case. That is
`uniform-correction-fallacy` at the level of the *constant's derivation*, and it went unnoticed
for three rounds because the mean looked like a summary rather than an average of unlike things.

## 3. GG4 failed in the informative direction

I predicted the estimate-ratio would land in 30–60%. It came in at **20%** — below the range,
and below the 46% that Round 32's post-hoc grouping suggested.

So even when explicitly forecasting *my own ratio*, I over-estimated how much of my skill I
claim. The effect is stronger than the post-hoc data implied.

> On tasks that require estimating an unknown quantity, I assert about **one fifth** of the edge
> I actually have.

## 4. What is now actionable

For the first time in 33 rounds there is a usable, conditional instrument:

| task type | ratio | correction |
|---|---|---|
| **derive** — the answer follows from data or a rule in front of me | ~88% | barely needed |
| **estimate** — the answer is an unknown magnitude | ~20% | stretch hard from the floor |

And a diagnostic for which one I'm in: *is the answer determined by something I can see, or am I
reaching for a magnitude?* That's answerable before writing any claim.

## 5. Limits

Two types, twelve items each, one round. `recall`, `infer` and `compare` remain untested under
pre-registration — Round 32's post-hoc figures for them (64%, 73%, 40%) are still just
hypotheses. And the derive block scored 1.000, so its 88% rests on a perfect run, which no
single round should be trusted to reproduce.

## Method changes for round 34

1. **Declare task type in every `predictions.md` from now on**, so the remaining three types
   accumulate pre-registered data.
2. **Retire the global constant.** Use ~0.85 for derive, ~0.25 for estimate, and don't average
   across types.
3. Test a `recall` block against a pre-registered ~64% — the type most of this project's early
   rounds actually were.

## Taxonomy

- `uniform-correction-fallacy` — **eighth occurrence, and located one level deeper**: the
  constant itself was the mean of a bimodal distribution, so it described no case. Averaging
  across unlike populations is how a "summary" becomes a fiction.
- `famous-sample` — Round 32 dismissed the correct predictor for having n=1 cells while testing
  three predictors that were confounded or circular. The dismissal was reasonable and wrong.
