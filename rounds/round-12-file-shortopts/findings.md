# Round 12 — findings

**Run:** file-5.45 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md) ·
scoring rule fixed in advance in [`SCORING.md`](../../SCORING.md)

```
30/30 right    accuracy 1.000
mean stated confidence 0.527    Brier 0.2363
gap (confidence − accuracy) −0.473

TRIVIAL BASELINE  "none" everywhere = 0.200   BEATEN
L (conf<0.5) n=11  stated 0.41  actual 1.00  gap −0.59
H (conf>=0.5) n=19  stated 0.59  actual 1.00  gap −0.41
```

## 1. Two rejections before a surface passed

- **`ex`** — rejected, ~21% below 0.5. Drafted, not computed (flagged in R11).
- **`fgrep`** — rejected, **0 of 46** long options below 0.5. **Computed across every option**,
  which fixes the soft-criterion complaint I raised against myself in Round 11.
- **`file`** — accepted, 11/30 below 0.5.

The pool is doing its job: two surfaces I know too well, refused before a claim was written.

## 2. Third replication, and it survives every cut I could apply

| Round | Surface | Items supplied by | L block |
|---|---|---|---|
| 08 | curl exit codes | curl's manual | **17/17** (stated 0.34) |
| 09 | errno messages | perl's `%!` | **11/11** (stated 0.34) |
| 12 | `file` short options | `file --help` | **11/11** (stated 0.41) |

> **Thirty-nine consecutive correct predictions on items I stated below 0.5 confidence.**
> (Round 08's figure under committed-claim scoring; its keyword instrument was invalid.)

The obvious objection is that short options are *derivable* — `--brief` → `-b` — making this a
derivation task rather than recall, which Round 05 warned about. So I computed the split:

```
derivable      n=16  stated 0.57  actual 1.00  gap -0.43
non-derivable  n=14  stated 0.48  actual 1.00  gap -0.52
non-derivable AND low-confidence: n=7  actual 1.00
```

`--dereference`→`-L`, `--mime`→`-i`, `--no-dereference`→`-h`, `--no-sandbox`→`-S`,
`--separator`→`-F`, `--uncompress`→`-z`, `--print0`→`-0`. Not derivable, low confidence,
**7/7**. The finding lives in exactly the subset where the objection doesn't reach.

And the trivial baseline — answering `none` everywhere — scores 0.200. Beaten by 0.8.

## 3. My three lowest-confidence items ever were all correct

| Round | Item | Stated | Result |
|---|---|---|---|
| 08 | curl exit code 99 → poll/select | **0.15** | right |
| 09 | `EBADR` → invalid request descriptor | **0.18** | right |
| 12 | `--no-sandbox` → `-S` | **0.25** | right |

Every time I have said "this is close to a guess" about an externally-supplied fact, I have
been right. Not once has the bottom of my confidence range located an actual error.

## 4. The compression isn't confined to the low band

The H block was **19/19 at a stated 0.59** — gap −0.41. So this isn't "under-confident where
uncertain"; the *entire distribution* is shifted down. Mean stated 0.527 against accuracy
1.000.

A flat 0.95 on every item would have scored a far better Brier than my careful
per-item confidences did. That is a blunt way of saying my confidences carried **negative
information** on this round.

## 5. Deviation recorded

The quota's ≥1-below-0.2 clause **failed**. A "which letter, or none" claim caps my honest
uncertainty near 0.25 — with ~25 letters plus `none`, nothing goes lower. I proceeded with the
failure on record rather than writing a dishonest 0.15 to satisfy my own rule (SCORING.md §7).

Worth noting as a limitation of the quota itself: **it assumes claim forms that admit extreme
uncertainty.** ENUM claims over a small closed set structurally cannot.

## Method changes for round 13

1. **Stop hand-assigning per-item confidences on supplied factual surfaces.** Three rounds say
   they're worse than a constant. Test that directly: pre-register a flat 0.90 alongside my
   per-item numbers and score both. If the constant wins again, that's the result.
2. The quota needs a clause for ENUM claim forms, where sub-0.2 is structurally unreachable.
3. Keep computing rejections rather than drafting them — it worked here.

## Taxonomy

- `unfamiliarity-discount` — **third replication**, and now with the derivability objection
  ruled out by computation. On externally-supplied recall my stated confidence is not merely
  low, it is close to uninformative.
- `authored-discrimination` — supported again: this pattern appears only on supplied items,
  never on the ones I write myself.
