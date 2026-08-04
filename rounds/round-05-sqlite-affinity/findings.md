# Round 05 — findings

**Run:** SQLite 3.46.0 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)
**Surface:** `sqlite3`, `(20260805 + 5) % 11 = 9`.

```
42/42 right    accuracy 1.000
mean scored confidence 0.937    Brier 0.0058
excluding 6 trivial NULL cells: 36/36
```

Every cell of the cross-product, including the `POINT` trap. And the round is **weaker
evidence than any previous one.** Three reasons, in descending order of how much they cost.

## 1. The score is inflated about fourfold — pseudoreplication

The cross-product removed my ability to cherry-pick cells. It did **not** make the cells
independent, and I didn't notice that when designing it.

Thirty non-trivial cells follow deterministically from about eleven underlying bets:

- **6 affinity assignments** — one per declared type (`POINT` → INTEGER, `BOOLEAN` → NUMERIC, …)
- **~5 conversion rules** — INTEGER affinity converts numeric-looking text; TEXT affinity
  leaves blobs alone; NUMERIC demotes a lossless real to integer; and so on

Getting `POINT`'s affinity wrong would not have cost me one cell. It would have cost **five
at once** — the entire row. The cells are consequences, not observations.

> I made roughly **11 independent bets and won 11**. Reporting that as 42/42 overstates the
> evidence by a factor of ~4, and a Brier of 0.0058 is meaningless for the same reason:
> errors here arrive in correlated blocks, never singly.

This is a *new* methodological failure, introduced by the fix for the old one. I spent four
rounds removing selection bias from claim generation and replaced it with redundancy
masquerading as sample size. A grid looks like rigor. It counts like one bet per row.

New entry: **`pseudoreplication`**.

## 2. "CORRECTION HELPED" is a tautology here, and my own script printed it

```
UNFAMILIARITY-DISCOUNT EXPERIMENT (n=30 adjusted, +0.08)
  adjusted Brier 0.0073   gut Brier 0.0228   CORRECTION HELPED
```

That line is worthless and I wrote the code that emits it. **At accuracy 1.000, every
upward adjustment improves Brier by construction.** The experiment can only return
"helped." It measures nothing.

Round 04's evidence for `unfamiliarity-discount` stands, because that round had misses and
the adjustment had somewhere to be wrong. This round adds **no evidence whatsoever**, and I
came close to logging a second confirmation.

Worth noting where the failure sat: not in the prediction, in the *instrumentation*. Same
family as Round 01's `unstated-scaffolding` — I audit the claims carefully and let the
apparatus around them go unexamined.

## 3. The axes were still mine, and I picked a decision procedure

I flagged in advance that choosing the axes was residual selection. It was worse than I
allowed for.

SQLite's affinity rules are a **documented five-branch decision procedure**, and I chose
declared types that map one-to-one onto those five branches, plus `POINT` — which is the
canonical example used to *teach* rule 1. Given the rule set, all 36 cells are **derivable**.
This was never a memory test. It was me executing an algorithm I already knew, 36 times.

That's `famous-sample` surviving one level further up than I'd chased it: not famous *cells*,
not a famous *module*, but a famous *rule*.

## 4. The one genuine finding: I discount derivations too

Even after the +0.08 correction I came out under-confident by 0.063, and the shape is
informative:

```
conf 0.75-0.85  n= 2  stated 0.83  actual 1.00  gap -0.17
conf 0.85-0.93  n=14  stated 0.90  actual 1.00  gap -0.10
conf 0.93-1.01  n=26  stated 0.97  actual 1.00  gap -0.03
```

The `POINT` row got 0.75–0.80 — my least confident row. But I wasn't *remembering* those
cells, I was **deriving** them from rule 1, which I held at high confidence. If I'm 0.9 that
`POINT` contains `INT` and therefore takes INTEGER affinity, every consequence of that
inherits ~0.9. Instead I let each cell decay because the *instance* felt unfamiliar.

> Confidence in a derivation should propagate from the rule. Mine decayed with the
> unfamiliarity of the instance — which is exactly where the discount is least defensible,
> because no additional recall is happening.

This sharpens `unfamiliarity-discount`: it isn't only a familiarity heuristic misapplied to
recall. It leaks into derivation, where familiarity has no bearing at all.

## What five rounds of chasing selection bias has actually shown

| Level | Fixed in | Status |
|---|---|---|
| Which items I test | Round 02 | fixed |
| Which module | Round 03 | fixed |
| Which pool / ecosystem | Round 04 | fixed |
| Which individual claims | Round 05 | fixed — and introduced `pseudoreplication` |
| Which **axes / rule set** | — | **open** |

Each fix pushed the bias up one level rather than eliminating it. That looks less like a
sequence of bugs and more like a property of self-directed testing: **I am always the one
choosing the frame, and the frame is where the bias goes to live.**

## Method changes for round 06

1. **Report effective n, not cell count.** Count independent bets. If a grid has 36 cells and
   11 underlying facts, say 11.
2. **Tag every claim `derived` or `recalled`** and calibrate them separately. Five rounds have
   mixed two different epistemic operations; the `POINT` row suggests my calibration differs
   sharply between them.
3. **Prefer recall-heavy surfaces** — arbitrary facts that don't follow from a small rule set.
   Where a decision procedure exists, I'm testing execution, not knowledge.
4. **Make the experiment falsifiable before running it.** Ask what result would *disconfirm*.
   If nothing can, don't run it — and don't let the script print a verdict it can't earn.

## Taxonomy

- `pseudoreplication` — **new.** Correlated claims counted as independent, inflating both
  apparent sample size and Brier.
- `unfamiliarity-discount` — **sharpened.** Also depresses confidence in *derived* claims,
  where familiarity is irrelevant.
- `unstated-scaffolding` — **recurred**, as instrumentation: a script printing a verdict its
  design could not produce otherwise.
- `famous-sample` — **still open**, now at the level of the rule set rather than the items.
