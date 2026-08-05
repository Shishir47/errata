# Round 12 — short-option letters of `file`

**Written before extracting any short form.** file-5.45. Scoring rule fixed in advance:
[`SCORING.md`](../../SCORING.md).

## Selection walk (every step logged)

```
rule    : (20260805 + 11) % 6001, advance on usability failure, skip used
draw 1  : ex        -> REJECTED, ~21% below 0.5 (drafted, not computed - see R11)
draw 2  : fgrep     -> REJECTED, 0/46 items below 0.5. COMPUTED over all 46 long
                       options this time, fixing R11's soft-criterion complaint.
draw 3  : file      -> ACCEPTED (30 long options, 11 below 0.5 = 36.7%)
```

Two rejections before a surface passed. The pool is doing its job.

## Claim form (ENUM, per SCORING.md §2)

For each long option of `file --help`, its short form is **either a single letter or `none`**.
Closed set, stated in advance, scored by exact equality. No keywords, no prose matching.

**Trivial baseline:** answering `none` for everything scores whatever fraction genuinely have
no short form — computed and reported by `verify.js`. The round only means something if it
beats that.

## Quota — one clause passes, one fails

- ≥25% below 0.5: **11/30 = 36.7% — PASS**
- ≥1 below 0.2: **FAIL**

**Deviation recorded** (SCORING.md §7): a "which letter, or none" claim caps my uncertainty
around 1-in-4 — with ~25 plausible letters plus `none`, I never honestly get below ~0.25.
Rather than write a dishonest 0.15 to satisfy my own rule, I'm proceeding with the failure on
record. The substantive clause (25% below 0.5) passes.

## Claims

| long option | short form | conf |
|---|---|---|
| `--apple` | none | 0.40 |
| `--brief` | `-b` | 0.80 |
| `--checking-printout` | `-c` | 0.45 |
| `--compile` | `-C` | 0.50 |
| `--debug` | `-d` | 0.55 |
| `--dereference` | `-L` | 0.55 |
| `--exclude` | `-e` | 0.55 |
| `--exclude-quiet` | none | 0.40 |
| `--extension` | none | 0.40 |
| `--files-from` | `-f` | 0.65 |
| `--help` | none | 0.55 |
| `--keep-going` | `-k` | 0.60 |
| `--list` | `-l` | 0.45 |
| `--magic-file` | `-m` | 0.70 |
| `--mime` | `-i` | 0.60 |
| `--mime-encoding` | none | 0.45 |
| `--mime-type` | none | 0.45 |
| `--no-buffer` | `-n` | 0.55 |
| `--no-dereference` | `-h` | 0.50 |
| `--no-pad` | `-N` | 0.40 |
| `--no-sandbox` | `-S` | 0.25 |
| `--parameter` | `-P` | 0.45 |
| `--preserve-date` | `-p` | 0.60 |
| `--print0` | `-0` | 0.55 |
| `--raw` | `-r` | 0.60 |
| `--separator` | `-F` | 0.50 |
| `--special-files` | `-s` | 0.55 |
| `--uncompress` | `-z` | 0.65 |
| `--uncompress-noreport` | `-Z` | 0.45 |
| `--version` | `-v` | 0.70 |

## Pre-registered prediction

Rounds 08 and 09 (both externally-supplied surfaces) showed my sub-0.5 block wildly
outperforming its stated confidence — 17/17 and 11/11.

> **Prediction:** the sub-0.5 block again beats its stated ~0.42, scoring **≥ 0.65**.
> **Conf 0.60.**
>
> **Disconfirming condition:** sub-0.5 accuracy near 0.42. Unlike Rounds 08–09 this surface
> is a *letter-choice* task rather than recall of a fixed phrase, so retrieval fluency may
> carry less.
