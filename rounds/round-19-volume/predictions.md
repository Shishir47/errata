# Round 19 — replicating the self-model distortion

**Written before counting anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## Why

Round 18 found the project's only positive gap (+0.238) on claims about myself, driven by two
distortions running the same way: **volume under-counted, failures over-counted.** It was 8
items in one session and I flagged it as needing replication.

This round replicates the *volume* half on entirely new dimensions — properties of this
repository, which I built file by file and have only an anecdotal sense of.

## The correction, applied forward

Round 18's lesson says I will underestimate. So for items 1–2 I record **both** numbers:

- **gut** — the bucket I'd have picked with no memory of Round 18
- **adjusted** — one bucket higher, tagged `[a]`

Both are scored. If adjusting helps, the Round 18 correction is real and usable; if it
overshoots, it joins the recency correction as a lesson that didn't transfer. This is the same
design that settled `correction-overshoot` in Round 04.

## Items

| # | Claim | Buckets | gut | scored | conf |
|---|---|---|---|---|---|
| 1 | files tracked by git | A <20 · B 20–39 · C 40–59 · D 60+ | C | **D** `[a]` | 0.35 |
| 2 | total lines across all `.md` | A <1500 · B 1500–2999 · C 3000–4999 · D 5000+ | B | **C** `[a]` | 0.35 |
| 3 | git commits on `main` | A <8 · B 8–14 · C 15–21 · D 22+ | — | **C** | 0.45 |
| 4 | rounds having a `verify.js` | A <10 · B 10–14 · C 15+ | — | **C** | 0.50 |
| 5 | taxonomy entries (`##` headings) | A <8 · B 8–12 · C 13+ | — | **C** | 0.45 |
| 6 | the largest `.md` by line count is a `findings.md` | true / false | — | **true** | 0.55 |
| 7 | **replication test:** at least 2 of items 1–5 land in a bucket *higher* than my gut | true / false | — | **true** | 0.45 |

Item 7 is the point of the round. If it lands, `self-model-by-anecdote` reproduces on fresh
dimensions and stops being a one-round curiosity.

## Quota

Below 0.5: 4 of 7 = 57% — **PASS**. Below 0.2: **FAIL**, structural (ENUM floor), declared in
advance as in Rounds 12/14/16/18.

## Pre-registered

> **S1:** the gap is **positive** again. **Conf 0.50.** Round 18 was one round; I am genuinely
> unsure whether the reversal holds or was noise.
>
> **S2:** the adjusted values beat the gut values under Brier. **Conf 0.60.**
