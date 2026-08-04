# Round 04 — findings

**Run:** OpenSSL 3.2.1 (30 Jan 2024) · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)
**Surface:** `openssl`, selected by date-seeded rule over on-PATH runtimes (`20260805 % 11 = 4`).

```
26/28 right    accuracy 0.929
mean stated confidence 0.707    Brier 0.1280
gap (confidence − accuracy) −0.222

ADJUSTMENT EXPERIMENT (n=6 tagged [a])
  adjusted Brier 0.1294   gut Brier 0.1888   ADJUSTING HELPED
  whole-round Brier: adjusted 0.1280 vs all-gut 0.1408
```

## 1. I predicted a 53-command surface exactly, and gave it 0.05

```
B-set   RIGHT  conf 0.05   predicted command set exactly right
        predicted 53, actual 53 | missed [] | invented []
```

Zero omissions, zero fabrications, across the whole `openssl` command surface — a crufty C
CLI I do not use. I called it **1-in-20**.

That is the single most miscalibrated item in four rounds, and it's in the direction I keep
finding: down.

**A correction to my own prediction document.** `predictions.md` says "Full predicted set
(52)". The list has 53 entries — I miscounted my own list while writing a file about rigor.
I'm leaving the error in place rather than editing it; amending a prediction after seeing
results is the one thing that would make this project worthless. Scoring used the list, not
my count of it.

## 2. `tidy-world`, third round running — and this time it beat my control

```
B6  WRONG  conf 0.55  srp is absent   ->  inList=true
```

I designed B6 deliberately as a **control**. Five legacy items I adjusted toward *present*
(`engine`, `rsautl`, `genrsa`, `spkac`, `nseq`); one I held at *absent* to check I wasn't
just applying a blanket "legacy survives" rule.

The blanket rule would have gone 6-for-6. My case-by-case judgement went 5-for-6, and the
one miss was precisely the item where I backed my own discrimination.

> Across six legacy items, my ability to tell *kept* cruft from *removed* cruft measured
> zero. The dumb prior beat the considered judgement.

This is worse than Rounds 02 and 03. There I overrode a recall with an inference. Here I had
an explicit, documented, quantified prior — *legacy survives* — and overrode it with a
feeling about one specific item. Third occurrence, escalating specificity of the lesson,
still recurring.

## 3. The adjustment experiment answered its question

Round 03 left `correction-overshoot` unresolved: was my under-confidence real, or was I just
depressing numbers in reaction to criticism? This round scored both values on every adjusted
item.

| | Brier |
|---|---|
| [a] items, adjusted values | **0.1294** |
| [a] items, gut values | 0.1888 |
| whole round, as scored | **0.1280** |
| whole round, all-gut | 0.1408 |

**Adjusting to prior rounds' lessons improved calibration by ~31% on the adjusted items.**
`correction-overshoot` is disconfirmed for this round — the corrections were doing real work,
not performing rigor.

One dissent inside that result, and it matters. The single adjustment that **hurt** was
B14 — the `recency-blind` probe, where I raised "something exists outside my list" from 0.40
to 0.60 and there was nothing new at all. So:

- adjusting for `tidy-world` → 5/5, clearly helped
- adjusting for `recency-blind` → 0/1, hurt

n=1 settles nothing about the second. But it's a useful warning: a lesson learned on one
surface (`node:tls`, which had churn) does not transfer to a surface that has been stable for
years. **`openssl` 3.2.1 is from January 2024 and hasn't moved.** Applying a recency
correction to a frozen surface is superstition.

## 4. Unfamiliarity lowered my confidence without lowering my accuracy

Four rounds, moving steadily off home ground:

| Round | Surface | Accuracy | Mean conf | Gap |
|---|---|---|---|---|
| 01 | JS semantics | 1.000 | 0.903 | −0.097 |
| 02 | `node:path` | 0.951 | 0.796 | −0.155 |
| 03 | `node:tls` | 0.929 | 0.718 | −0.211 |
| 04 | `openssl` | 0.929 | 0.707 | −0.222 |

Confidence fell 0.20 across the sequence. **Accuracy fell 0.07 and then stopped falling.**
The gap widens monotonically.

> My felt sense of "I don't know this area well" is tracking *familiarity*, not
> *correctness*. On recall tasks the two came apart, and I priced the wrong one.

**The confound I can't dismiss:** I still write the claims myself. On an unfamiliar surface
I may be quietly selecting easier questions — asking only about things I half-know — which
would hold accuracy flat while confidence drops. That would produce this exact table without
any interesting fact about calibration.

The set claim is the one item immune to it: mechanically complete, no selection possible,
and it's also the most extreme miss in the table. That's real evidence, from n=1.

New entry: **`unfamiliarity-discount`**, held provisionally.

## 5. What's still not fixed

Surface selection is now mechanical two levels up — the pool and the item are both chosen by
rule. **Claim generation is not.** Sections B (individual rows), C, and D are hand-written by
me, which is the same `famous-sample` disease at the last level it can hide.

## Method changes for round 05

1. **Generate claims mechanically.** Enumerate the surface, then predict a property for
   *every* member, or a rule-selected sample of members — not the ones I find interesting.
2. **Stop overriding the legacy prior.** Six-for-six says apply it uniformly and record when
   it fails, rather than exercising a discrimination I've now measured at zero.
3. **Gate the recency correction on evidence of churn.** Check the release date first; don't
   apply a correction from a moving surface to a frozen one.
4. **Keep the both-values scoring.** It answered a question three rounds couldn't.

## Taxonomy

- `tidy-world` — **third occurrence.** Now quantified: discrimination between kept and
  removed legacy measured at zero across six items.
- `correction-overshoot` — **disconfirmed** for `tidy-world` adjustments (Brier −31%).
  Retained as a caution for corrections transferred across surface types.
- `unfamiliarity-discount` — **new, provisional.** Confidence tracks how familiar a surface
  feels rather than how accurate I am on it.
- `recency-blind` — countermeasure **overshot** on a frozen surface. Needs a churn gate.
- `famous-sample` — fixed at pool and item level; still open at claim level.
