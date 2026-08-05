# Scoring rule — pre-registered, surface-independent

**Written before drawing the Round 11 surface.** Rounds 08 and 09 were both lost to
instruments designed *after* seeing the material, which let the instrument be shaped by what
happened to be convenient to score. R08 leaked false positives; R09's fix produced false
negatives. This file fixes the rule in advance so a third variant can't be improvised.

## 1. No proxy tokens. Ever.

A claim is scored against **the claim**, never against a keyword standing in for it. Both
failed versions of the shortcut are retired.

## 2. Every claim must take one of three exactly-checkable forms

If a claim can't be phrased in one of these, it doesn't go in the round.

| Form | Scored by | Example |
|---|---|---|
| **EQ** — exact string | normalised equality against a mechanically extracted string | `errno ESTALE message == "Stale NFS file handle"` |
| **ENUM** — choice from a closed set stated in advance | equality on the chosen member | `flag --foo takes an argument: yes / no` |
| **BOOL** — a property the harness computes | the harness's boolean | `exit status is non-zero` |

Normalisation for EQ: lowercase, collapse non-alphanumerics to single spaces, trim. This is
**stricter** than substring matching, and that direction is deliberate — a rule that can only
tighten is a rule I can't quietly relax when it's inconvenient.

## 3. Free text is not scoreable

Where ground truth is a prose description, the claim must be recast as ENUM or BOOL. I do not
attempt to match my phrasing against someone else's prose — that is what broke R08 and R09.

## 4. Quota (from Round 06, unchanged)

≥25% of items stated below 0.5 confidence, ≥1 below 0.2. **If the drawn surface cannot produce
that, reject it and advance** — before writing any claims.

## 5. Reporting (from Rounds 05–07, unchanged)

- **Effective n**, not item count. If one wrong belief takes out a block, say so.
- **Discrimination** (L: conf < 0.5 vs H: conf ≥ 0.5) and **calibration** reported separately.
- **Trivial baseline**: what a no-knowledge strategy scores. An ENUM round with two options has
  a 0.5 baseline and must beat it to mean anything.
- Any pre-registered prediction is scored, including when it fails.

## 6. Surface selection

By [`select-surface.sh`](select-surface.sh) — pool is every executable on PATH, index is
`(YYYYMMDD + round) % pool_size`, advance on usability failure, skip used surfaces, log every
skip. The hand-written 20-tool pool retired in Round 10 is not to be used again.

## 6b. Harness fault guards (added after Round 17)

Round 17's first run scored **15/15 wrong** because the ground-truth pipeline used `rev`, which
doesn't exist here — and the pipeline swallowed the failure, returning empty strings with exit
status 0. Shipped, it would have reported a gap of **+0.818** and inverted the project's central
finding.

Every harness must therefore:

1. **Abort on degenerate ground truth.** Empty, blank or uniformly-identical answers mean the
   instrument failed. Never score them as my errors.
2. **Verify external tools exist** before depending on them.
3. **Not trust a pipeline's exit status.** A failing stage upstream of a succeeding one exits 0.
4. **Cross-check** the computation by a second route where one is available.

And the standing assumption: four instrument faults found in seventeen rounds is a *detection*
rate, not an occurrence rate. A partial fault producing plausible wrong answers would not have
been caught — and would have been more interesting than the truth.

## 7. Deviations

Any departure from this file gets recorded in that round's `findings.md`, with a note of
whether it was declared before or after seeing the data. Improvised rules are not to be
presented as pre-registered ones.
