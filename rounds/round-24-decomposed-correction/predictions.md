# Round 24 — testing the decomposed correction forward

**Written before counting anything.** Scoring: log-ratio error, as Round 23.

## The countermeasure under test

Round 23 localised the self-model bias: **counts are accurate, per-unit sizes are low.** The
countermeasure it produced was mechanistic rather than a fudge factor:

> decompose into `count × per-unit size`, trust the count, inflate only the size

Round 23 measured the size shortfall at ~1.2× for prose and code (95→115 lines, 700→800 words)
and much larger for structural elements (~3–4× on table rows). So I inflate by **1.25×** for
prose/code and **2×** for structural counts.

Both the corrected and uncorrected products are committed below and scored.

## Pre-registered

> **X1:** corrected beats uncorrected on ≥4 of 5. **Conf 0.70.**
>
> **X2:** corrected is *still low* on ≥3 of 5 — the correction reduces the error without
> eliminating it, as in Round 23. **Conf 0.45.**
>
> **X3:** my **count** estimates are within 20% on ≥4 of 5, validating "trust the count."
> **Conf 0.65.** This is the load-bearing half of the countermeasure; if counts turn out
> unreliable too, the decomposition doesn't help.

## Quantities

| # | Quantity | count | size (gut) | ×factor | UNCORRECTED | CORRECTED |
|---|---|---|---|---|---|---|
| 1 | chars across all commit messages | 24 | 1200 | 1.25 | 28800 | **36000** |
| 2 | `##` headings across all `.md` | 46 | 5 | 1.25 | 230 | **288** |
| 3 | lines across all `predictions.md` | 19 | 85 | 1.25 | 1615 | **2014** |
| 4 | blockquote lines (`^>`) across `.md` | 46 | 3 | 2 (structural) | 138 | **276** |
| 5 | markdown links across `.md` | 46 | 4 | 2 (structural) | 184 | **368** |

## Quota

Not applicable — continuous estimates scored by log-ratio error, as Round 23. The confidences
sit on X1–X3. Deviation declared in advance (SCORING.md §7).
