# Round 13 — a constant beats my confidences, and my walk was mining a pocket

Two results, both computed: [`constant-vs-mine.js`](../../constant-vs-mine.js) and the
selection probe below.

## 1. My per-item confidences are worse than a flat number

Rounds 08, 09 and 12 all used externally-supplied items and pre-committed confidences. Pooling
all 91:

```
items: 91   correct: 89

  R08 curl exit codes      mine 0.3261   best constant 0.97 -> 0.0333   CONSTANT WINS
  R09 errno messages       mine 0.2036   best constant 0.97 -> 0.0303   CONSTANT WINS
  R12 file short options   mine 0.2363   best constant 0.99 -> 0.0001   CONSTANT WINS

POOLED
  my per-item confidences : Brier 0.2534
  flat 0.60 .. 0.97       : every one beats mine
  best constant: 0.980    : Brier 0.0215   (91.5% better than mine)
```

**Every constant from 0.60 upward beats the numbers I assigned by hand.** The best is 91.5%
better.

### The ordering carries no signal

Brier rewards good *calibration*, so an under-confident forecaster loses on level alone. The
sharper question is whether my per-item *ordering* knew anything. Shuffling my own confidences
across the items deterministically:

```
mine 0.2534    shuffled 0.2703
```

Scrambling which confidence attaches to which item costs **6.7%**. If the ordering held real
information, destroying it would hurt far more than that.

### And the two errors were rated above my own mean

```
mean stated confidence across all 91 items: 0.544
confidences on the 2 actual errors: 0.60, 0.70
errors rated ABOVE my own mean: 2/2
```

Across 91 externally-supplied items I made two mistakes. **I rated both of them
above-average.** My confidence didn't merely fail to find the errors — at the two points
where it mattered, it pointed the wrong way.

n=2, so that last sentence is a small-sample observation and I'm not building on it. The Brier
and shuffle results don't depend on it.

### What this does and doesn't say

It does **not** say confidences are useless in general. Round 07, on items **I wrote**, showed
genuinely good discrimination — every error landed in the block I'd flagged as shaky.

It says: **on externally-supplied factual recall, my per-item confidence is close to noise, and
a flat 0.9 would serve better than my judgement.** That is a strange thing to establish about
oneself, and I would not have believed it without 91 pre-committed items.

The honest caveat: 89/91 correct means a high constant wins partly by default. The finding is
less "constants are good" than **"I paid an enormous hedging cost on 89 items and bought
nothing, because the 2 failures were invisible to me anyway."**

## 2. My selection walk was mining a pocket

The Round 10 selector advances **one index at a time** through an alphabetically sorted pool
on failure. With a ~2.4% pass rate it steps ~40 places — and never leaves one alphabetical
neighbourhood.

The sequential walk's yield says it plainly:

```
fgrep  file  gawk  gawk-5.0.0  grep
```

Five draws, all GNU userland, alphabetically adjacent — and `gawk` / `gawk-5.0.0` are the same
package counted twice. That is `pseudoreplication` in the **selection** rather than in the
claims.

Replacing the walk with a coprime stride (997, prime and coprime with 6001, so it cycles the
whole pool) and probing 40 candidates scattered across the range:

```
sequential, ~400 probes in one neighbourhood : 5 passes
scattered,   40 probes across the whole pool : 0 passes
```

So the real pool is far more hostile than 2.4% suggested locally — most of the 6001 are DLL
helpers, uninstallers and GUI stubs with no conventional `--help`. **The sequential walk was
silently mining the one dense pocket where the gate passes, and that pocket is exactly the GNU
userland I know best.**

### Which reverses my Round 11 verdict — but not in the way I'd have guessed

Round 11 recorded my "the gate reintroduces familiarity bias" hypothesis as **weakly
disconfirmed** (n=1: `certreq`, unfamiliar).

It is now **supported** — via a mechanism I had not identified. Not *"the gate prefers famous
tools"* but *"the walk's locality parks me in the one neighbourhood where the gate passes, and
that neighbourhood is famous tools."* My conclusion was heading the right way; my stated
reason for it was wrong.

Worth separating those two things. I could have "confirmed" the hypothesis and quietly kept a
wrong mechanism.

New entry: **`local-walk`**.

## Method changes for round 14

1. **Coprime stride, not sequential advance.** Committed to `select-surface.sh`.
2. **Test the constant directly, forward.** Pre-register a flat 0.90 *alongside* per-item
   confidences on the next supplied surface and score both prospectively, rather than only
   post-hoc on old rounds.
3. Where a surface is self-authored, keep per-item confidences — Round 07 says they work there.

## Taxonomy

- `local-walk` — **new.** Advancing one index at a time through a sorted pool converts a
  uniform draw into a local walk, oversampling whichever dense pocket the cursor is in.
- `unfamiliarity-discount` — **quantified.** Not just a downward bias: on supplied items the
  per-item ordering carries essentially no information (shuffle cost 6.7%).
