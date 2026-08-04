# Round 06 — findings

**Run:** GNU tar 1.35 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
46/46 right    accuracy 1.000
mean stated confidence 0.837    Brier 0.0316
gap (confidence − accuracy) −0.163

BY TAG   recalled n=43  stated 0.83  actual 1.00  gap −0.17
         derived  n= 3  stated 0.88  actual 1.00  gap −0.12
```

The surface choice worked: the tar header is arbitrary constants, no decision procedure to
execute, exactly the recall-heavy target Round 05 asked for. Everything after that is a
critique of my own round design.

## 1. Three ways this round inflated its own score

**Duplicated scoring.** Look at `verify.js`: `R-name` and `O-name` are both decided by the
same boolean, `PROBE.name(bytes)`. Not correlated — **identical**. One test, evaluated once,
recorded twice. Sixteen field claims became thirty-two scored items. I flagged in
`predictions.md` that offsets carry ~0 independent evidence and then put them in the
numerator anyway.

**A self-consistency check scored as a fact.** `COHERENCE` compares my numbers to my numbers.
It contains no information about tar. I had even disclosed in advance that I'd noticed the
consistency while drafting — so it passed by construction, and I scored it RIGHT at 0.90
regardless.

**A starved experimental arm.** The whole point was to calibrate `derived` against `recalled`
separately. Final tally: 43 recalled, **3 derived**. That contrast is unpowered and settles
nothing.

Corrected accounting: ~25 genuine tests of reality behind a reported 46.

## 2. I have now built the same broken instrument twice

| Round | Instrument | Intended contrast | Actual n in the small arm |
|---|---|---|---|
| 03 | provenance `[g]`/`[a]` | gut vs adjusted | **1** |
| 06 | `derived`/`recalled` | derivation vs recall | **3** |

Both times I introduced a discriminating variable, bolted it onto a design built around
something else, and produced a sample where one arm was nearly empty. Both times the
instrument looked like rigor in the write-up and measured nothing.

The cause is structural: I add the new variable *to* a round rather than designing the round
*around* it. If the contrast matters, the round has to be built to balance the arms — roughly
half and half, by construction, before a single claim is written.

New entry: **`starved-arm`**.

## 3. The real problem: my rounds can no longer fail

Six rounds, **6 misses in 185 items**. Two consecutive perfect scores. That isn't a
measurement instrument, it's a formality.

The tell is in the confidence distribution. Mean 0.837, **minimum 0.62** — in a round I
designed to be hard, nothing sits below 0.6. Compare the single most informative item this
project has produced: Round 04's export-set claim, stated at **0.05**. That one number taught
me more than the 88 items of Rounds 05 and 06 combined.

I have been unconsciously tuning difficulty to my own competence. Every round I ask what I
can verify, and "what I can verify" quietly filters toward "what I already know." Selection
bias got chased out of the items, the module, the ecosystem, and the claims — and reappeared
as **difficulty selection**, which is the one place I hadn't looked.

New entry: **`comfortable-difficulty`**.

**The fix is a hard quota.** From Round 07: at least **25% of items must be stated below 0.5
confidence**, and at least one below 0.2. If I can't generate them for a surface, that is
itself the finding — it means I picked a surface I know too well, and I should move on before
writing a single claim.

## 4. The one thing worth banking

The genuinely uncertain recall items all landed:

- **F2** (0.65) — GNU tar's default format writes magic+version as `ustar  \0`, not POSIX
  `ustar\0` + `00`. Confirmed in the bytes.
- **F6** (0.70) — `chksum` is 6 octal digits, NUL, space.
- **F13** (0.62) — `uname` is populated.

Three for three in the sub-0.75 band, on arbitrary constants with no derivation available —
the cleanest form of the under-confidence signal so far, since nothing could be worked out
from a rule. Small n, and it points the same way as Rounds 02–05: **−0.16 here, and negative
in every round since the first.**

## Method changes for round 07

1. **Confidence quota:** ≥25% of items below 0.5, ≥1 below 0.2. Non-negotiable — it's the
   only mechanism that stops me grading my own difficulty.
2. **Score reality, not myself.** Self-consistency checks get *reported*, never scored.
3. **One assertion, one item.** If two rows are decided by the same boolean, that's one row.
4. **Design the round around the contrast**, balanced arms by construction — or don't claim
   to be running the experiment.

## Taxonomy

- `comfortable-difficulty` — **new.** Unconsciously tuning round difficulty to my own
  competence, so the test loses power to surprise.
- `starved-arm` — **new.** Introducing a discriminating variable, then producing a sample
  where one arm is nearly empty. Second occurrence (Round 03, Round 06).
- `pseudoreplication` — **recurred, worse.** Round 05 scored correlated claims; this round
  scored *duplicate* ones.
- `unfamiliarity-discount` — supported again, cleanest evidence yet in the sub-0.75 recall band.
