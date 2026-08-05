# Round 27 — binary comparisons, an unsampled region of the confidence scale

**Written before measuring anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## Why

Round 26 landed on the modest, balanced version of the central finding: **my confidence tracks
accuracy at ~60–80%.** That was measured on 3–4 way ENUMs (chance floor 0.25) and exact-match
tasks (floor ≈0).

**Every round so far has left the 0.5–1.0 confidence band almost unsampled**, because a
task with a 0.25 floor rarely justifies a confidence below 0.3 or a spread above 0.9. A
**binary** task forces the whole distribution into 0.5–1.0.

So this tests whether the tracking result generalises to a region of my own confidence scale
I have never measured. It also uses a different cognitive operation: not recall, not
computation, but **comparative judgement under uncertainty**.

## Items

Sixteen pairs of files, drawn from the PATH pool by stride 443 and paired in draw order — no
selection by me. For each: **which file is larger on disk?**

Chance is exactly **0.500**, and it is the trivial baseline: guessing one side every time scores
~0.5. The round means nothing unless it beats that.

## Pre-registered

> **AA1:** accuracy > 0.5625 (i.e. better than 9/16 — beating chance by more than one item).
> **Conf 0.65.**
>
> **AA2:** the gap is negative but small, `−0.20 < gap < 0`. **Conf 0.55.**
>
> **AA3 (disconfirming condition):** if `gap > +0.10`, then I am **over-confident** in the
> 0.5–1.0 band, and the Round 26 tracking claim does not generalise across the confidence scale.
> I state now that I will report that as a failure of the claim, not as a quirk of the surface.
>
> **AA4:** my errors concentrate in the low-confidence half — at least 60% of misses have
> confidence below my median. **Conf 0.60.**

## Claims

Reasoning available to me: DLL naming conventions, what each component plausibly does, and file
type (`.mof`/`.nls` are usually small data; `dbgeng.dll` is a big debugger engine).

| # | A | B | larger | conf |
|---|---|---|---|---|
| 1 | `eventaggregation.dll` | `icsigd.dll` | A | 0.60 |
| 2 | `midi2.umpprotocoldownscalertransform.dll` | `netcfg` | B | 0.55 |
| 3 | `pr` | `secproc_isv.dll` | B | 0.60 |
| 4 | `sysmon.ocx` | `vds_ps.dll` | A | 0.55 |
| 5 | `windows.storage.search.dll` | `xactengine2_0.dll` | A | 0.65 |
| 6 | `bfe.dll` | `consent` | A | 0.70 |
| 7 | `dolbydecmft.dll` | `fxscover` | A | 0.65 |
| 8 | `kbdbe.dll` | `mapistub.dll` | B | 0.75 |
| 9 | `msiscsi.mof` | `offlinefileswmiprovider.mof` | B | 0.55 |
| 10 | `rdprelaytransport.dll` | `shutdown` | A | 0.60 |
| 11 | `trie.dll` | `wfs.mof` | A | 0.60 |
| 12 | `wmdmps.dll` | `ahost` | A | 0.55 |
| 13 | `c_870.nls` | `dbgeng.dll` | B | 0.90 |
| 14 | `energytask.dll` | `html.iec` | B | 0.55 |
| 15 | `kd_02_14e4.dll` | `microsoft.uev.modernappcore.dll` | B | 0.65 |
| 16 | `ncasvc.dll` | `scrptadm.dll` | A | 0.55 |

Mean stated ≈ 0.63.

## Quota

**Waived, with reasoning** (SCORING.md §7): a binary task has a 0.5 chance floor, so a
confidence below 0.5 would assert I'm worse than guessing — incoherent. The ≥25%-below-0.5 rule
was written for multi-way ENUMs and does not transfer. This is the same category error as
applying a recall quota to a compositional task (Round 17), and I'd rather name it than
manufacture impossible numbers.
