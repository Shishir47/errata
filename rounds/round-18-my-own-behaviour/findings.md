# Round 18 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md) · source: this session's
own transcript

```
2/8 right    accuracy 0.250
mean stated confidence 0.488   Brier 0.2369
gap (confidence - accuracy) +0.238   <- POSITIVE. First in 18 rounds.

R1 "at least 2 items wrong" (0.75) -> CONFIRMED (6 wrong)
R2 "gap turns positive"     (0.55) -> CONFIRMED
```

## 1. The bias reverses when the subject is me

Seventeen rounds, 396 items, **seventeen negative gaps**. I tried four separate ways to elicit
over-confidence about the world — harder properties, unselectable items, facts unavailable to
me, compositional multi-step work — and failed every time.

It took one round of claims about **my own behaviour** to produce it.

| Subject | rounds | gap |
|---|---|---|
| facts about the world | 01–17 | **−0.227** (14 of 14 scored rounds negative) |
| facts about myself | 18 | **+0.238** |

That is the cleanest result this project has produced, and I would not have predicted its shape
at the start: **I systematically understate what I know, and systematically overstate what I
know about myself.**

## 2. The specific error: I model myself from anecdotes, not base rates

Item 8 was my headline claim, staked at **0.80**:

> my first-try tool error rate exceeds my object-level miss rate (7.1%)

```
first-try tool error rate : 2.9%   (8 errors in 274 calls)
object-level miss rate    : 7.1%   (28 misses in 396 items)
```

**Wrong, and backwards.** My tool success rate (97.1%) is *better* than my claim accuracy
(92.9%).

I reasoned from a vivid list I could recite: a static server broken by path separators, a
missing `python`, a `TZ=` flag that did nothing, CRLF defeating a parser, `rev` not existing,
two mangled heredocs, an aggregator that silently skipped a round. Every one real. Together
they felt like a pattern of frequent failure.

They are **eight events out of two hundred and seventy-four**. The 266 calls that worked left
no trace to recall, because working is not memorable.

Every quantitative item shows the same two distortions:

| | claimed | actual | direction |
|---|---|---|---|
| Bash calls | 40–79 | **110** | volume underestimated |
| Write calls | 20–39 | **70** | volume underestimated |
| Edit calls | 15–34 | **72** | volume underestimated |
| total errors | 10–24 | **8** | failures overestimated |
| Bash error share | 10–19% | **4.5%** | failures overestimated |

> I under-count what I did and over-count how often it went wrong. Both errors point the same
> way: my self-model is built from the salient episodes, and failures are what's salient.

New entry: **`self-model-by-anecdote`**.

## 3. The strongest objection to my own finding, which I should raise myself

`is_error` counts **tool-level** failures. It does not count calls that succeeded while doing
the wrong thing — and this project has several documented:

- Round 17's `rev` pipeline **exited 0** while producing empty output. Not counted here.
- `synthesize.js` silently skipped Round 14 for a full round. Not counted.
- Several `grep`/`awk` probes returned 0 matches because a pattern was wrong. Not counted.

So **2.9% is a floor on things going wrong, not a measure of "did what I intended."** Adding
the silent failures I can identify (~4–6) puts the true rate near 4–5%.

That still sits below 7.1%, so the direction of the finding survives — but the margin is much
narrower than the headline suggests, and I'd rather say that than let the cleaner number stand.

## 4. What was right

Two of eight: total tool calls (bucket C, 274) and Bash being the tool with the most errors.
Both at my *higher* confidences (0.40 and 0.70). Small n, but the ordering held.

## 5. Limits

Eight items, one session, buckets I chose myself. This establishes that a positive gap is
*possible* and where to find it — not its magnitude. It needs replication on another session's
transcript before it belongs in the synthesis as a headline.

## Method changes for round 19

1. **Replicate on a different transcript** before treating the reversal as established.
2. **Measure silent failures**, not just `is_error` — the gap between "the tool succeeded" and
   "it did what I meant" is where Round 17's near-disaster lived.
3. Self-directed claims are now the productive vein. Object-level recall has yielded one robust
   finding and four failed attempts to break it.

## Taxonomy

- `self-model-by-anecdote` — **new.** I estimate my own behaviour from memorable episodes
  rather than base rates. Failures are memorable; the 266 calls that worked are not. Result:
  error rate overestimated ~2.4×, work volume underestimated across every category.
- `unfamiliarity-discount` — **bounded at last.** It governs claims about the world. It does
  not extend to claims about myself, where the bias runs the other way.
