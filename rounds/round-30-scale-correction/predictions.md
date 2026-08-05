# Round 30 — the first *scale* correction

**Written before measuring anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.
(Round 29's process failure noted and not repeated — this file exists before `verify.js` runs.)

## Why

Round 29 left the central finding in its strongest form: **I claim ~61% of my above-chance
skill**, across 7 rounds and 4 task types, range 40–92%, none over 100%.

Five corrections have been attempted in this project and all five **failed**:

| round | correction | result |
|---|---|---|
| 09 | recency gate | superstition on a frozen surface |
| 19 | shift estimate one bucket | accuracy up, calibration down |
| 21 | uniform 2–3× multiplier | overshot one item, undershot another |
| 24 | per-unit inflation | mean error worse than none |
| 25 | +0.20 to every confidence | Brier 0.159 → 0.212 |

**Every one was a shift.** The 61% figure describes a *scale* problem — my confidence is
compressed toward the chance floor, not displaced from it. Round 25 said so explicitly: *a
uniform shift cannot fix a scale problem.* This is the first correction that stretches instead.

## The correction

```
SCALED = floor + (MINE − floor) / 0.61,  capped at 0.97
```

with `floor = 0.25` (four size buckets). Three forecasters, all fixed here:

- **MINE** — my natural confidences
- **SCALED** — as above
- **FLAT** — 0.90, the standing baseline

## Items

Sixteen executables drawn from the PATH pool by stride 751, resolved with the Round 29 shared
resolver. Buckets: **A** <32 KB · **B** 32–127 KB · **C** 128–511 KB · **D** ≥512 KB.

## Pre-registered

> **DD1:** SCALED beats MINE under Brier. **Conf 0.60.** Five shift-corrections failed; the
> theory says a scale correction is the right shape. If this fails too, the honest conclusion is
> that **I cannot correct my own calibration at all**, and the 61% figure is a description
> rather than a usable instrument.
>
> **DD2:** SCALED overshoots — mean SCALED confidence exceeds accuracy. **Conf 0.50.**
>
> **DD3:** skill claimed under MINE lands inside 40–92% again, the range from the other seven
> rounds. **Conf 0.70.**
>
> **DD4:** unscoreable items ≤ 2 of 16, now that the resolver is fixed. **Conf 0.80.**

## Claims

| file | bucket | MINE | SCALED |
|---|---|---|---|
| `eventtracingmanagement.dll` | C | 0.30 | 0.33 |
| `kbdmlt48.dll` | A | 0.50 | 0.66 |
| `msg` | B | 0.30 | 0.33 |
| `prncache.dll` | C | 0.30 | 0.33 |
| `ssh-keygen` | D | 0.40 | 0.50 |
| `wiaaut.dll` | C | 0.35 | 0.41 |
| `xwtpw32.dll` | B | 0.28 | 0.30 |
| `cngcredui.dll` | B | 0.30 | 0.33 |
| `kbdnec.dll` | A | 0.50 | 0.66 |
| `mshtmled.dll` | C | 0.35 | 0.41 |
| `professional.xml` | A | 0.40 | 0.50 |
| `sspicli.dll` | C | 0.35 | 0.41 |
| `wiashext.dll` | C | 0.30 | 0.33 |
| `xzegrep` | A | 0.55 | 0.74 |
| `cofiredm.dll` | B | 0.28 | 0.30 |
| `exsmime.dll` | C | 0.30 | 0.33 |

Reasoning available: `kbd*` layout DLLs are consistently tiny; `xzegrep` is a shell script;
`professional.xml` is a config file; `ssh-keygen` is a full crypto binary.

## Quota

Below 0.5 (MINE): 13 of 16 = 81% — **PASS**. Below 0.2: **FAIL**, structural 0.25 floor,
declared in advance as in Rounds 12/14/16/18–20/25.
