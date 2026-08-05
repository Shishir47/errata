# Round 33 — task type, pre-declared

**Written before measuring anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## The hypothesis being tested

Round 32 found that the skill-claimed ratio appeared to vary by task type:

```
derive 92%   infer 73%   recall 64%   estimate 46%   compare 40%
```

Plausible ordering — I claim most of my skill when *deriving* from a rule, least when
*estimating* an unknown quantity. But three of five groups had **n = 1**, and **I assigned the
labels after seeing the ratios.** Round 32 recorded it as a hypothesis requiring
pre-registration.

This is that pre-registration. The task types are **declared here, before the round runs**, and
the two most separated types are run as blocks in a single round — the design that worked in
Round 26.

## Block D — `derive` (predicted ratio ~92%)

Twelve filenames. For each, the **character-count bucket** of the name:
**A** <10 · **B** 10–19 · **C** ≥20. Floor **0.333**.

This is pure counting from data in front of me. Nothing is recalled.

## Block E — `estimate` (predicted ratio ~46%)

Twelve different files. **Size bucket**: **A** <32 KB · **B** 32–127 KB · **C** 128–511 KB ·
**D** ≥512 KB. Floor **0.250**.

## Pre-registered

> **GG1:** ratio(D) > ratio(E). **Conf 0.70**
> **GG2:** ratio(D) − ratio(E) > 0.25. **Conf 0.55**
> **GG3:** ratio(D) lands in 70–100%. **Conf 0.55**
> **GG4:** ratio(E) lands in 30–60%. **Conf 0.60**
>
> **Disconfirming:** if GG1 fails, task type does not predict the ratio and Round 32's §4
> ordering was an artefact of post-hoc grouping with n=1 cells.

## Block D claims — character counts

| name | bucket | conf |
|---|---|---|
| `eventvwr` | A | 0.95 |
| `localsec.dll` | B | 0.93 |
| `p11-kit` | A | 0.95 |
| `sti.dll` | A | 0.93 |
| `windows.web.http.dll` | C | 0.90 |
| `c_28598.nls` | B | 0.92 |
| `featurestaging-ext-101.dll` | C | 0.92 |
| `lxutil.dll` | B | 0.92 |
| `peerdistwsddiscoprov.dll` | C | 0.90 |
| `syncinfrastructureps.dll` | C | 0.90 |
| `winmm.dll` | A | 0.90 |
| `capauthz.dll` | B | 0.92 |

## Block E claims — file sizes

| name | bucket | conf |
|---|---|---|
| `fltmc` | B | 0.35 |
| `mdmappinstaller` | C | 0.30 |
| `pinentry-w32` | B | 0.35 |
| `witnesswmiv2provider.dll` | B | 0.30 |
| `chakrathunk.dll` | A | 0.35 |
| `freeglut.dll` | C | 0.35 |
| `mfc140kor.dll` | B | 0.30 |
| `poqexec` | B | 0.30 |
| `taskschd.msc` | B | 0.30 |
| `wmidcom.dll` | B | 0.30 |
| `cleanpccsp.dll` | B | 0.30 |
| `gamechatoverlayext.dll` | C | 0.30 |

## Quota

Block E: 12 of 12 below 0.5 — PASS. Block D fails by design (a counting task admits high
confidence honestly). Overall 12 of 24 = 50% — **PASS**. Below 0.2: FAIL, structural.
