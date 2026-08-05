# Round 31 — file format from filename, with a per-surface scale

**Written before measuring anything.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM.

## Two follow-ups from Round 30, in one round

**(a) A different task type.** Round 30's scale-beats-shift result came from one surface. This
is a structurally different inference: **predict a file's binary format from its name alone** —
name → format, not name → size.

**(b) A per-surface ratio.** Round 30 used a global divisor of 0.61 when the round's true ratio
was 0.35, so it under-corrected. The fix: **predict my own accuracy for this round, then set my
mean confidence equal to it.** That converts per-item calibration into a single round-level
self-forecast — which Rounds 18–22 suggest I'm *bad* at, so it is a genuine test rather than a
free win.

> **My predicted accuracy for this round: 0.60.** Mean stated confidence below is set to match.

## A reproducibility fix

The surface pool lived in `/tmp` and had been **deleted** by cleanup. Every round since 10
selected from an ephemeral file, so the repo's claim that any round can be re-run was false for
surface selection. The pool is now committed as [`pool.txt`](../../pool.txt) (6001 entries).

Found because it broke, not because I checked — the same shape as `cheap-to-shrug`.

## Items

Fifteen entries drawn from `pool.txt` by stride 883. For each, the file's **magic-number class**:

- **P** — PE executable/DLL (first bytes `MZ`)
- **T** — text (printable ASCII, e.g. logs, `.mof`, config)
- **O** — other binary (anything else)

Chance floor **0.333**. Trivial baseline (always the commonest class) is computed by `verify.js`.

## Four forecasters

| name | definition |
|---|---|
| **MINE** | the confidences below |
| **SCALED** | `floor + (MINE − floor) × (0.60 − floor)/(meanMINE − floor)`, normalised so mean = 0.60 |
| **SHIFTED** | `MINE + 0.20`, capped 0.97 — the shape that failed five times |
| **FLAT** | 0.90 |

## Pre-registered

> **EE1:** SCALED beats MINE. **Conf 0.55**
> **EE2:** SCALED beats SHIFTED — scale beats shift on a second, different task type. **Conf 0.70**
> **EE3:** my predicted accuracy (0.60) is within 0.15 of actual. **Conf 0.55**
> **EE4:** skill claimed under MINE falls in 35–92%, the eight-round range. **Conf 0.65**
>
> **Disconfirming:** if EE2 fails, Round 30's scale-beats-shift result does not generalise
> beyond one surface and should be reported as surface-specific.

## Claims

| file | class | conf |
|---|---|---|
| `eventtracingmanagement.mof` | T | 0.70 |
| `kmddsp.tsp` | P | 0.55 |
| `netbtugc` | P | 0.60 |
| `secocl64` | P | 0.55 |
| `vcruntime140.dll` | P | 0.90 |
| `wwansvc.dll` | P | 0.88 |
| `comsetup.log` | T | 0.85 |
| `fvenotify` | P | 0.70 |
| `sharemediacpl.dll` | P | 0.88 |
| `wephostsvc.dll` | P | 0.88 |
| `adhsvc.dll` | P | 0.88 |
| `d3dx9_43.dll` | P | 0.90 |
| `helppane` | P | 0.70 |
| `microsoft.bluetooth.audio.dll` | P | 0.88 |
| `pinentry-w32` | P | 0.75 |

Reasoning: `.mof` and `.log` are text; `.tsp` is a telephony service provider (a DLL in
disguise); everything else on a Windows PATH is almost certainly PE.

Mean stated ≈ 0.77 — **above** my predicted accuracy of 0.60, so SCALED will **compress** rather
than stretch here. That's the first time a scale correction has run in that direction, and it
tests whether the mechanism is symmetric or only helps when stretching.

## Quota

Below 0.5: **0 of 15 — FAIL.** Declared and waived: this surface is one where I expect to do
well, and the round's purpose is testing the *correction mechanism*, which needs a case where
my confidence is too **high** relative to my own accuracy forecast. Manufacturing sub-0.5
confidences I don't hold would defeat that.
