# Round 22 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
3/5 right    accuracy 0.600
mean stated confidence 0.570   Brier 0.1935   gap -0.030

lower bound (is_error)        :  2.7%
upper bound (superseded)      : 14.0%
object-level miss rate        :  7.1%
bracket width                 :  5.3x
V1 "bracket >= 3x wide" (0.60) -> CONFIRMED
V2  bounds STRADDLE 7.1%       -> BRACKETED, not resolved
```

## 1. The pre-commitment did its job

I wrote in `predictions.md`, before running:

> **V2:** whichever way item 2 lands, I will report it as **bracketed, not resolved**, unless
> the lower and upper bounds fall on the same side of 7.1%.

They straddle it. So Round 18's item 8 — *does my first-try failure rate exceed my
object-level miss rate?* — is **not answerable with these instruments**, and I'm recording that
instead of the answer.

Without that clause I would have had a tempting result available: the upper bound is 14.0%,
comfortably above 7.1%, and I could have written "Round 18's verdict overturned." The rule I
set in advance is the only thing standing between me and that sentence.

## 2. And the honest middle estimate probably vindicates Round 18 after all

Breaking the 42 superseded calls down:

```
file-rewrite : 24      bash-retry : 10      is_error : 8
```

`file-rewrite` dominates — and it is precisely the condition I flagged in advance as catching
**ordinary iteration**. Writing a file and then refining it is normal work, not failure.

Discount it entirely and the rate is `18/422 = 4.3%`, below 7.1%. And `bash-retry` still
includes deliberate re-runs, so the defensible figure is lower still — perhaps 3–4%.

> **Round 18's original verdict most likely stands: my first-try tool failure rate is below my
> object-level miss rate.** What has changed is that I now have a bracket instead of a point
> estimate that was quietly measuring only the loud half.

That is a less exciting conclusion than "I was right all along," and it's the one the numbers
support.

## 3. Under-counting myself, a fourth time

```
item 1  superseded rate   claimed B (5-9.9%)   actual C (14.0%)
item 4  total superseded  claimed B (15-34)    actual 42
```

Both low, again. Four rounds, four replications. Notably I under-counted here *even while
writing a round about my own tendency to under-count* — the awareness doesn't transfer to the
estimate.

## 4. The self-directed gap has converged

```
R18  +0.238      R20  +0.183      R21  -0.070      R22  -0.030
```

Four rounds about myself, and the calibration has walked from badly over-confident to
essentially correct as the corrections accumulated. The countermeasures work on the
*confidence*; the point estimates are still low (§3). Those two things are separable, which is
the whole content of `half-applied-correction`.

## Method changes for round 23

1. **Keep writing the interpretation rule before the result.** V2 is the most useful clause
   I've written in twenty-two rounds.
2. **Separate "ordinary iteration" from "failure" at definition time**, not after — the
   `file-rewrite` condition was doing most of the work and measuring the least.
3. The self-model volume bias is now four-times replicated and resists my own awareness of it.
   That resistance is the next thing worth studying.

## Taxonomy

- `self-model-by-anecdote` — **fourth replication**, and newly interesting: it persisted in a
  round explicitly *about* the bias, so knowing about it doesn't fix the estimate.
- `detector-shaped-like-success` — countermeasure holds; the bracket is 5.3× wide, so the
  original single number was measuring a fraction of the picture.
- No new entries. The round's value is a pre-committed refusal to over-claim.
