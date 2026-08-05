# Round 16 — this machine's state

**Written before listing a single directory.** Scoring: [`SCORING.md`](../../SCORING.md).

## Why this surface

Fifteen rounds, 371 items, and I have never once been shown to be **over**-confident. Every
round could only ever demonstrate one direction, because every surface was a documented fact
that I usually knew.

This round asks about facts that are **structurally unavailable to me**: how many files sit in
particular directories on this specific machine. No training data contains them. If I am
appropriately humble I will state low confidence and score low, and be calibrated. If I state
0.45 and score 0.15, this project will finally have caught me claiming more than I have.

That is the point. **It is the first round designed so that being wrong is the likely outcome.**

## Items

PATH directories, sorted unique, every 2nd — 14 of them. For each I predict a **bucket**
(ENUM, closed set declared here):

```
A = 0-9 files    B = 10-99    C = 100-999    D = 1000+
```

Counted as regular files at depth 1. Trivial baseline (always guess the most common bucket)
computed by `verify.js`.

## Two forecasters, both fixed now

- **MINE** — the per-item confidences below
- **FLAT** — 0.90 on every item, the standing baseline that has won three rounds running

> **Prediction A:** FLAT **loses** here. **Conf 0.70.** FLAT has only ever been tested on
> surfaces where I was 88–100% accurate. If my accuracy collapses on unknowable facts, a
> confident constant should be punished hard. This tests whether "FLAT beats MINE" was a real
> finding or an artefact of easy surfaces.
>
> **Prediction B:** my accuracy lands **below 0.60**. **Conf 0.65.**
>
> **Prediction C:** for the first time, my gap comes out **positive** (over-confident).
> **Conf 0.45.**

## Claims

| # | directory | bucket | conf |
|---|---|---|---|
| 1 | `/bin` | D | 0.40 |
| 2 | `/c/Program Files/CodeBlocks/MinGW/bin` | C | 0.45 |
| 3 | `/c/Program Files/dotnet` | A | 0.45 |
| 4 | `/c/Users/hp/.local/bin` | A | 0.45 |
| 5 | `/c/Users/hp/AppData/Local/Microsoft/WindowsApps` | B | 0.40 |
| 6 | `/c/Users/hp/bin` | A | 0.50 |
| 7 | `/c/WINDOWS/System32/OpenSSH` | B | 0.50 |
| 8 | `/c/WINDOWS/System32/WindowsPowerShell/v1.0` | B | 0.35 |
| 9 | `/c/sqlite3` | A | 0.55 |
| 10 | `/d/IntelliJ IDEA Community Edition 2024.1/bin` | B | 0.45 |
| 11 | `/d/PyCharm/PyCharm Community Edition 2024.1.1/bin` | B | 0.45 |
| 12 | `/d/cursor/resources/app/bin` | A | 0.40 |
| 13 | `/usr/bin` | D | 0.50 |
| 14 | `/usr/bin/vendor_perl` | B | 0.40 |

## Quota

Below 0.5: 11 of 14 = 78.6% — **PASS**. Below 0.2: **FAIL** — a 4-way ENUM has a 0.25 chance
floor, so honest confidence cannot go much below it. Structural, declared in advance, same as
Rounds 12 and 14.
