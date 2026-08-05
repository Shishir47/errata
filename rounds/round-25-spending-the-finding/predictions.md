# Round 25 — spending the one finding that survived

**Written before measuring anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## Why this design

The object-level under-confidence is the only finding to survive every attempt to break it:
**−0.207 across 18 rounds, negative in 17 of 19.** Round 24's lesson was to test a finding by
**spending** it, not by re-confirming it.

Spending it means: if I'm reliably under-confident by ~0.21, then adding 0.20 to every stated
confidence should *improve* my calibration. Three forecasters, all committed here:

- **MINE** — the per-item confidences below
- **BOOSTED** — `min(0.97, MINE + 0.20)`
- **FLAT** — 0.90, the standing baseline

## Why the surface had to change

The stride selector drew **`sort`** (22 options). I rejected it: predicting its short-option
letters, essentially every confidence came out above 0.5, failing the quota.

That rejection is not optional here. **If accuracy is ~1.0, boosting confidence wins by
construction** and the test proves nothing — the exact tautology I criticised in Round 05 and
walked into again in Round 15. A calibration experiment needs real errors or it is vacuous.

So: 12 executables drawn from the PATH pool by stride 331, and their **file sizes** — facts with
no representation in anything I've read.

```
euiccscsp.dll  kbdcz.dll  licenseprotection.dll  midi2.diagnosticstransport.dll
msys-npth-0.dll  oleacchooks.dll  psr  secconfig.efi  srm.dll  tsallow.mof
w32time.dll  windows.services.targetedcontent.dll
```

Buckets: **A** <32 KB · **B** 32–127 KB · **C** 128–511 KB · **D** ≥512 KB

## The tension I'm pre-registering

The finding says I'm under-confident, so BOOSTED should win. But my read of *this* surface is
that I'll score near chance (0.25), in which case a mean confidence of 0.33 is roughly right and
boosting will hurt.

**Those conflict, and that conflict is the round.** I'm siding slightly with the surface.

> **Y1:** BOOSTED beats MINE. **Conf 0.40** — betting mildly *against* the project's central
> finding on this surface.
>
> **Y2:** accuracy exceeds chance (0.25). **Conf 0.70.**
>
> **Y3:** the gap is negative (under-confident) again. **Conf 0.55.**
>
> **Y4:** FLAT is the worst of the three. **Conf 0.85.**

If Y1 fails while Y3 holds, the finding is real but **not uniformly correctable** — which would
make it the fifth instance of `uniform-correction-fallacy`, this time against the project's
best result.

## Claims

| file | bucket | conf |
|---|---|---|
| `euiccscsp.dll` | B | 0.30 |
| `kbdcz.dll` | A | 0.45 |
| `licenseprotection.dll` | B | 0.30 |
| `midi2.diagnosticstransport.dll` | A | 0.28 |
| `msys-npth-0.dll` | A | 0.40 |
| `oleacchooks.dll` | A | 0.35 |
| `psr` | C | 0.25 |
| `secconfig.efi` | B | 0.25 |
| `srm.dll` | B | 0.25 |
| `tsallow.mof` | A | 0.55 |
| `w32time.dll` | C | 0.30 |
| `windows.services.targetedcontent.dll` | C | 0.30 |

## Quota

Below 0.5: 11 of 12 = 92% — **PASS**. Below 0.2: **FAIL**, structural (a 4-way ENUM has a 0.25
chance floor). Declared in advance, as in Rounds 12/14/16/18/19/20.
