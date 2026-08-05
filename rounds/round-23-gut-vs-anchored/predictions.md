# Round 23 — gut versus anchored estimation

**Written before counting anything.** Scoring: [`SCORING.md`](../../SCORING.md).

## The open question

`self-model-by-anecdote` has now replicated four times, and Round 22 showed something odd: **I
under-counted while writing a round about my tendency to under-count.** Knowing about the bias
did not move the number.

So: is the bias in my *intuition*, or deeper? If it's intuition, then reasoning explicitly from
anchors should fix it. This round tests exactly that.

## Design

For each quantity I record **two** estimates, both committed here:

- **GUT** — the first number that comes to mind, no arithmetic
- **ANCHORED** — derived by explicit arithmetic from stated anchors

Scored by **log-ratio error** `|ln(estimate / actual)|` — scale-free, so a 2× overshoot and a 2×
undershoot cost the same. Lower wins.

> **W1 (pre-registered):** ANCHORED beats GUT on **at least 4 of 5** quantities. **Conf 0.65.**
> If reasoning from anchors fixes it, the bias lives in intuition and has a cheap countermeasure.
>
> **W2:** GUT is low on **at least 4 of 5**. **Conf 0.70.** Four replications say the direction
> is reliable even when the magnitude isn't.
>
> **W3 (the interesting one):** ANCHORED is *also* low on at least 3 of 5. **Conf 0.55.** If the
> anchors themselves are drawn from the same under-counting well, explicit arithmetic won't save
> me — it will just launder the same bias through a multiplication.

W3 is why this round exists. Round 22's lesson was that awareness doesn't transfer; W3 asks
whether *method* does.

## Quantities and both estimates

| # | Quantity | GUT | ANCHORED (with its arithmetic) |
|---|---|---|---|
| 1 | total lines across all `verify.js` | 1200 | 19 files × ~95 lines = **1805** |
| 2 | total words across all `findings.md` | 12000 | 20 files × ~700 words = **14000** |
| 3 | ``` fences across all `.md` | 60 | 20 findings × 4 + 20 elsewhere = **100** |
| 4 | total lines across all `.md` | 5500 | 4438 (measured R19) + 4 rounds × 120 + taxonomy growth = **5200** |
| 5 | markdown table rows (lines starting with `\|`) | 250 | 20 findings × 5 + README 25 + taxonomy 30 + syntheses 30 = **185** |

Quantity 4 is the control: its anchor is a **measured** value from Round 19, not a recalled one.
If anchoring works anywhere, it should work there.

## Quota

Not applicable — this round scores continuous estimates by log-ratio error rather than ENUM
items, so there are no per-item confidences to bucket. Deviation declared in advance
(SCORING.md §7); the pre-registered predictions W1–W3 carry the confidences instead.
