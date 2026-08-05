# Round 14 — short-option letters of `cygpath`

**Written before extracting any short form.** Scoring rule: [`SCORING.md`](../../SCORING.md).

## Selection

```
rule  : (20260805 + 13) % 6001, advancing by COPRIME STRIDE 997 (Round 13 fix)
draw  : cygpath  (26 long options)
```

First surface drawn under the strided selector. It matters that `cygpath` is **not** GNU
userland: Round 13 showed the old one-index-at-a-time walk was crawling an alphabetical
neighbourhood and mining the coreutils pocket I know best. A scattered draw left it.

## Claim form

ENUM, as in Round 12: each long option's short form is **a single letter or `none`**, scored
by exact equality. Trivial baseline (answer `none` everywhere) computed by `verify.js`.

## The forward test — my confidences vs a constant

Round 13 established *post hoc* that across 91 pre-committed items from supplied surfaces, a
flat constant beat my per-item confidences by 91.5%, and shuffling my confidences cost only
6.7%. That was a re-analysis of old rounds.

**This round tests it prospectively.** Two forecasters, both fixed before any answer is seen:

- **MINE** — the per-item confidences in the table below
- **FLAT** — **0.90 on every item**, declared here in advance

`verify.js` scores both under Brier. No post-hoc constant fitting: 0.90 is committed now, not
chosen afterwards to look good.

> **Prediction:** FLAT beats MINE. **Conf 0.75.**
>
> **Disconfirming condition:** MINE scores a lower Brier — which would mean my per-item
> judgement does carry signal on supplied surfaces after all, and Round 13's finding was an
> artefact of the three particular rounds pooled.

## Claims

| long option | short form | conf |
|---|---|---|
| `--absolute` | `-a` | 0.80 |
| `--allusers` | `-A` | 0.55 |
| `--close` | none | 0.30 |
| `--codepage` | `-C` | 0.40 |
| `--desktop` | `-D` | 0.50 |
| `--dos` | `-d` | 0.60 |
| `--file` | `-f` | 0.65 |
| `--folder` | `-F` | 0.45 |
| `--help` | `-h` | 0.70 |
| `--homeroot` | `-H` | 0.50 |
| `--ignore` | `-i` | 0.55 |
| `--long-name` | `-l` | 0.60 |
| `--mixed` | `-m` | 0.60 |
| `--mode` | `-M` | 0.40 |
| `--mydocs` | `-O` | 0.25 |
| `--option` | `-o` | 0.45 |
| `--path` | `-p` | 0.70 |
| `--proc-cygdrive` | none | 0.35 |
| `--short-name` | `-s` | 0.65 |
| `--smprograms` | `-S` | 0.40 |
| `--sysdir` | `-S` | 0.30 |
| `--type` | `-t` | 0.55 |
| `--unix` | `-u` | 0.75 |
| `--version` | `-V` | 0.60 |
| `--windir` | `-W` | 0.40 |
| `--windows` | `-w` | 0.75 |

Note `--smprograms` and `--sysdir` both claim `-S`; at most one can be right, and I've left
the collision in rather than tidy it — it's an honest record of my uncertainty about which
one owns the letter.

## Quota

Below 0.5: computed by `verify.js`. Below 0.2: expected to **FAIL** for the same structural
reason as Round 12 — an ENUM over a small closed set caps honest uncertainty near 0.25.
Deviation recorded in advance (SCORING.md §7).
