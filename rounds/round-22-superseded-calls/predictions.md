# Round 22 — resolving Round 18 with a comparable instrument

**Written before counting anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## The open question

Round 18 scored my most confident claim (0.80) as **wrong**: that my first-try tool error rate
exceeds my 7.1% object-level miss rate. It used `is_error` → 2.9%.

Round 21 showed `is_error` misses silent failures, and that conservative behavioural traces give
~9.5% — *above* 7.1%. So the verdict is currently **uncertain**, and I said the fix was to
measure with an instrument **comparable** to `is_error`: per-call, binary, same denominator.

## The instrument, defined before running

A tool call counts as a **first-try failure** if any of:

- **(a)** `is_error` is true, or
- **(b)** it is a Bash call and another Bash call within the next 3 tool calls has ≥0.5 command
  similarity (I re-ran it), or
- **(c)** it writes/edits path *P* and another Write/Edit to *P* occurs within the next 5 tool
  calls (I immediately revised it)

Each call is counted **once** even if it trips several conditions. Denominator is all tool
calls — identical to Round 18's, so the numbers are directly comparable.

**Known over-count, stated in advance:** (c) catches ordinary iteration — writing a file then
refining it is normal work, not failure. (b) catches deliberate re-runs after an intended edit.
This instrument is therefore an **upper** bound, where `is_error` was a lower one. The truth is
bracketed, which is the most this method can honestly deliver.

## Items

| # | Claim | Buckets | conf |
|---|---|---|---|
| 1 | superseded-call rate | A <5% · B 5–9.9% · C 10–14.9% · D ≥15% | **B** 0.45 |
| 2 | the rate exceeds 7.1% (Round 18's item 8, re-run) | true / false | **true** 0.55 |
| 3 | largest contributing condition | is_error · bash-retry · file-rewrite | **file-rewrite** 0.45 |
| 4 | total superseded calls | A <15 · B 15–34 · C 35+ | **B** 0.50 |
| 5 | this instrument brackets `is_error` from above (rate > 2.9%) | true / false | **true** 0.90 |

Item 5 is near-certain by construction — included deliberately as a **sanity check on the
harness**, per SCORING.md §6b. If it comes out false, the instrument is broken and nothing else
in the round should be read.

## Pre-registered

> **V1:** the bracket is wide — upper bound is at least **3×** the lower (2.9%). **Conf 0.60.**
> A narrow bracket would mean silent failures are a small correction; a wide one means Round
> 18's headline number was measuring a fraction of the picture.
>
> **V2:** whichever way item 2 lands, I state now that I will report it as **bracketed, not
> resolved**, unless the lower and upper bounds fall on the same side of 7.1%.

## Quota

Below 0.5: 3 of 5 = 60% — **PASS**. Below 0.2: **FAIL**, structural ENUM floor, declared.
