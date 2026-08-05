# Round 26 — testing the compression claim directly

**Written before measuring anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## The claim under test

Round 25 replaced "systematically under-confident" with **`compressed-confidence-range`**: my
accuracy spans 0.30–1.00 while my stated confidence spans 0.33–0.53, so the gap is large and
negative where I'm accurate and ~zero where I'm not.

That evidence came from four rounds run weeks apart on different instruments. This round tests
it in the cleanest available way: **two blocks in one round**, same instrument, same scoring,
same session — one where I expect to be accurate, one where I expect to be near chance.

If compression is real, the gaps must differ sharply. If it's an artefact of comparing across
rounds, they won't.

## Block H — expected high accuracy

`sort` long options → short letter or `none`. I rejected this surface in Round 25 for failing the
difficulty quota; here that failure is **the point**, and it's declared rather than worked around.

## Block L — expected near-chance

Twelve more rule-selected system files (stride 617) → size bucket.
**A** <32 KB · **B** 32–127 KB · **C** 128–511 KB · **D** ≥512 KB

## Pre-registered

> **Z1:** gap(H) < −0.25. **Conf 0.70**
> **Z2:** |gap(L)| < 0.15. **Conf 0.60**
> **Z3:** gap(H) < gap(L) − 0.20 — the compression signature. **Conf 0.75**
> **Z4:** accuracy(H) − accuracy(L) > 0.40. **Conf 0.75**
>
> **Disconfirming condition:** if Z3 fails, `compressed-confidence-range` does not survive a
> within-round test and must be withdrawn to a cross-round observation only.

## Block H claims

| long option | short | conf |
|---|---|---|
| `--batch-size` | none | 0.60 |
| `--check` | `-c` | 0.70 |
| `--debug` | none | 0.65 |
| `--field-separator` | `-t` | 0.85 |
| `--general-numeric-sort` | `-g` | 0.80 |
| `--human-numeric-sort` | `-h` | 0.80 |
| `--ignore-leading-blanks` | `-b` | 0.80 |
| `--key` | `-k` | 0.90 |
| `--month-sort` | `-M` | 0.80 |
| `--output` | `-o` | 0.90 |
| `--random-sort` | `-R` | 0.65 |
| `--reverse` | `-r` | 0.92 |
| `--stable` | `-s` | 0.85 |
| `--unique` | `-u` | 0.90 |
| `--version-sort` | `-V` | 0.75 |

## Block L claims

Round 25 finding applied: **all seven errors there were underestimates**, so I bias these
upward one bucket from instinct. That is a *scale* adjustment on the estimates, not on
confidence — and per five failed uniform corrections, I expect it to help only marginally.

| file | bucket | conf |
|---|---|---|
| `event.format.ps1xml` | B | 0.30 |
| `jscript9diag.dll` | C | 0.30 |
| `microsoft-windows-mptf-events.dll` | A | 0.30 |
| `ngcctnr.dll` | C | 0.28 |
| `regtest.txt` | A | 0.45 |
| `synchostps.dll` | B | 0.28 |
| `webauthn.dll` | C | 0.35 |
| `wsaifabrichost.dll` | C | 0.28 |
| `browseui.dll` | D | 0.35 |
| `defaultprinterprovider.dll` | B | 0.28 |
| `fsiso` | C | 0.25 |
| `kbdru1.dll` | A | 0.45 |

## Quota

Block L: 12 of 12 below 0.5 — **PASS**. Block H fails by design, as declared above. Overall
12 of 27 = 44% below 0.5 — **PASS**. Below 0.2: **FAIL**, structural ENUM floor.
