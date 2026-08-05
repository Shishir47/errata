# Round 17 — a compositional task

**Written before running anything.** Scoring: [`SCORING.md`](../../SCORING.md), EQ form.

## Why a different *kind* of claim

Sixteen rounds have failed to find over-confidence in me, across three deliberate attempts
(harder property, unselectable items, facts unavailable to me). Round 16's conclusion was that
if over-confidence exists it **isn't a function of how hard the facts are**.

So this round changes the *kind* of claim rather than the difficulty of the facts. Nothing here
is recall. Every item is a **four-step transformation I must carry out exactly**, where a single
slip fails the whole item:

```
reverse  ->  delete lowercase vowels (aeiou)  ->  uppercase  ->  first 5 characters
```

At 95% per step, four steps compound to ~81%. If my confidence doesn't account for that, this
is where it shows.

## Items — supplied, not chosen

```
rule: pool names, 6-10 chars, letters only, every 37th, first 18
addins bthprops compact dispdiag firmware gunzip logfiles mountvol openssh
qwinsta rstrui spoolsv tstheme wecutil wscollect                      (15)
```

## Quota — deliberately waived, with reasoning

The difficulty quota (≥25% below 0.5) **fails here**, and I'm waiving it rather than
manufacturing low numbers.

The quota exists to stop me choosing *recall* surfaces I already know. A compositional task has
a different failure mode: **high stated confidence and mechanical slips.** Demanding sub-0.5
confidences on arithmetic-like work would be cargo-culting my own rule into a context it wasn't
written for — and would destroy the very thing this round is testing, which is whether my
*high* confidence on multi-step work is earned.

Declared in advance (SCORING.md §7).

## Pre-registered predictions

> **P1:** at least one error — accuracy < 1.00. **Conf 0.70.** The first surface where I
> genuinely expect to slip.
>
> **P2:** the gap turns **positive** (over-confident) for the first time in 17 rounds.
> **Conf 0.40.**
>
> **P3:** FLAT (0.90) beats MINE. **Conf 0.55.**

## Claims

| word | reversed → devowelled → upper → first 5 | conf |
|---|---|---|
| `addins` | `SNDD` | 0.88 |
| `bthprops` | `SPRPH` | 0.78 |
| `compact` | `TCPMC` | 0.85 |
| `dispdiag` | `GDPSD` | 0.80 |
| `firmware` | `RWMRF` | 0.80 |
| `gunzip` | `PZNG` | 0.88 |
| `logfiles` | `SLFGL` | 0.82 |
| `mountvol` | `LVTNM` | 0.78 |
| `openssh` | `HSSNP` | 0.82 |
| `qwinsta` | `TSNWQ` | 0.82 |
| `rstrui` | `RTSR` | 0.85 |
| `spoolsv` | `VSLPS` | 0.82 |
| `tstheme` | `MHTST` | 0.80 |
| `wecutil` | `LTCW` | 0.85 |
| `wscollect` | `TCLLC` | 0.72 |

Mean stated ≈ 0.81 — which is roughly what four 95% steps compound to. Whether that reasoning
survives contact with the answers is the round.
