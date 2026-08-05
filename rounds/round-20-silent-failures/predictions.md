# Round 20 — silent failures

**Written before counting anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## Why

Round 18 measured my first-try tool error rate at 2.9% using `is_error`. I raised the objection
against myself at the time: **`is_error` only counts tool-level failures.** It misses calls that
succeeded while doing the wrong thing — and this project has documented several:

- Round 17's `rev` pipeline **exited 0** with empty output
- `synthesize.js` silently skipped Round 14 for a full round
- several `grep`/`awk` probes returned 0 matches from a wrong pattern

So this round counts the *silent* failures. If they substantially outnumber the 8 hard errors,
Round 18's headline number was measuring the easy half.

## Applying Round 19's lesson properly

`half-applied-correction`: last round I shifted my **estimates** using a replicated finding and
left my **confidences** at 0.35 — becoming more accurate and less calibrated at once.

This round I move both. Estimates are adjusted upward for known volume under-counting, **and
confidence is raised to ~0.45–0.50** to reflect that the adjustment rests on a twice-replicated
measurement rather than a hunch.

> **T2 (pre-registered):** my Brier improves on Round 19's 0.3293, because the confidence now
> moves with the estimate. **Conf 0.55.**

## Proxies, and their known faults — stated before the numbers

None of these is a clean measure of "did what I meant." Each is a proxy that mis-counts in a
known direction, and I'd rather name the faults now than after seeing the result:

| Proxy | Over-counts | Under-counts |
|---|---|---|
| empty stdout, no error | legitimately silent commands (`sed -i`, `mkdir`) | wrong-but-non-empty output |
| consecutive near-duplicate commands | deliberate iteration | failures I abandoned instead of retrying |
| paths written more than once | ordinary revision | files wrong but never rewritten |

## Items

| # | Claim | Buckets | gut | scored | conf |
|---|---|---|---|---|---|
| 1 | Bash calls with empty stdout and no error | A <10 · B 10–24 · C 25–49 · D 50+ | B | **C** | 0.45 |
| 2 | consecutive Bash pairs ≥60% similar (retries) | A <5 · B 5–14 · C 15–29 · D 30+ | B | **B** | 0.45 |
| 3 | file paths written 2+ times by `Write` | A <5 · B 5–14 · C 15+ | A | **B** | 0.45 |
| 4 | my assistant messages this session | A <80 · B 80–159 · C 160+ | B | **C** | 0.45 |
| 5 | median Bash command length (chars) | A <80 · B 80–199 · C 200+ | B | **B** | 0.50 |
| 6 | silent-failure candidates (item 1) **exceed** the 8 hard errors | true / false | true | **true** | 0.80 |

## Pre-registered

> **T1:** item 6 lands true — silent failures outnumber hard errors. **Conf 0.80.**
>
> **T2:** Brier beats Round 19's 0.3293. **Conf 0.55.**
>
> **T3:** at least 2 of items 1–5 land **above** my gut bucket, reproducing
> `self-model-by-anecdote` a third time. **Conf 0.40** — lower than last round, because I have
> already adjusted upward, so the remaining under-count should be smaller.

## Quota

Below 0.5: 4 of 6 = 67% — **PASS**. Below 0.2: **FAIL**, structural ENUM floor, declared in
advance as in Rounds 12/14/16/18/19.
