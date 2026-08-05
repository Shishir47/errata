# Round 15 — long forms of `less` short options

**Written before extracting any long form.** Scoring: [`SCORING.md`](../../SCORING.md).

## Selection

```
scatter search (coprime stride 997) over 6001 PATH executables
  -> only 2 passes in ~360 probes (~0.5% whole-pool rate, vs 2.4% measured locally)
  -> cygpath (used R14), less (this round)
items: less short options, sorted, every 2nd
  -A -D -G -J -L -O -S -V -X -b -d -f -h -j -m -o -q -s -u -x -z   (21)
```

## Property — deliberately inverted

Rounds 12 and 14 both asked *long option → short letter*. Running that a third time would
test the same property on a third surface, and property-level repetition is its own kind of
`pseudoreplication`.

So this round runs it **backwards: short letter → exact long form.** That is genuinely harder —
letters are constrained to 26 choices, long names are arbitrary multi-word strings — and it
should give the round the ≥2 errors that Round 14 showed are needed before discrimination can
be measured at all.

Scored EQ: exact normalised equality against the long form printed by `less --help`. If I
write `--chop-lines` and it is `--chop-long-lines`, that is **wrong**, not a near miss. I
didn't know the name.

## Standing FLAT baseline

Per Round 14, **FLAT = 0.90** on every item, committed now, scored alongside mine.

> **Prediction:** FLAT beats MINE again. **Conf 0.55** — lower than last round's 0.75, because
> a harder property should push my accuracy down toward the 0.90 constant and may even push it
> below, which would flip the result.
>
> **Second prediction:** ≥ 2 errors, so discrimination is measurable. **Conf 0.85.**

## Claims

| short | I claim the long form is | conf |
|---|---|---|
| `-A` | `--SEARCH-SKIP-SCREEN` | 0.25 |
| `-D` | `--color` | 0.20 |
| `-G` | `--HILITE-SEARCH` | 0.40 |
| `-J` | `--status-column` | 0.50 |
| `-L` | `--no-lessopen` | 0.45 |
| `-O` | `--LOG-FILE` | 0.45 |
| `-S` | `--chop-long-lines` | 0.65 |
| `-V` | `--version` | 0.85 |
| `-X` | `--no-init` | 0.60 |
| `-b` | `--buffers` | 0.70 |
| `-d` | `--dumb` | 0.55 |
| `-f` | `--force` | 0.70 |
| `-h` | `--max-back-scroll` | 0.45 |
| `-j` | `--jump-target` | 0.55 |
| `-m` | `--long-prompt` | 0.50 |
| `-o` | `--log-file` | 0.60 |
| `-q` | `--quiet` | 0.65 |
| `-s` | `--squeeze-blank-lines` | 0.60 |
| `-u` | `--underline-special` | 0.40 |
| `-x` | `--tabs` | 0.55 |
| `-z` | `--window` | 0.55 |

`-q` is a known risk: `less` has both `--quiet` and `--silent` as aliases and I don't know
which one `--help` prints. Recorded rather than hedged around.

## Quota

Below 0.5: computed by `verify.js`. Below 0.2: `-D` at 0.20 — **borderline**, and unlike
Rounds 12/14 this property does admit genuine sub-0.2 uncertainty, since the answer space is
unbounded.
