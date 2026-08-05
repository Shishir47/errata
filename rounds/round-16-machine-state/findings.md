# Round 16 — findings

**Run:** this machine · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
6/10 right    accuracy 0.600      (4 of 14 items unreadable)
mean stated confidence 0.440   Brier 0.2570   gap -0.160

TRIVIAL BASELINE  always "A" = 7/10 = 0.700   NOT BEATEN
MINE 0.2570   FLAT(0.90) 0.3300

A "FLAT loses here"        (0.70) -> CONFIRMED
B "accuracy below 0.60"    (0.65) -> DISCONFIRMED (exactly 0.600)
C "gap turns positive"     (0.45) -> DISCONFIRMED
```

## 1. FLAT's dominance was surface-conditional — and I called it

Rounds 13–15 established that a flat 0.90 beat my per-item confidences, three times running,
twice prospectively. I predicted at **0.70** that it would *lose* here, because FLAT had only
ever been tested where I scored 88–100%.

**MINE 0.2570, FLAT 0.3300.** Confirmed.

So the finding needs its scope written on it: **"a constant beats my confidences" holds on
surfaces where I am ~95% accurate, and reverses where I am not.** It was never a fact about my
judgement in general — it was a fact about how accurate those particular surfaces let me be.

This is the first time I've predicted a limitation of my own earlier finding and had the
prediction land.

## 2. I lost to a trivial strategy, for the first time in sixteen rounds

Answering **"A" (0–9 files) for everything** scores 0.700. I scored 0.600.

Seven of ten directories held fewer than ten files. A strategy with no knowledge whatsoever
beats my considered per-directory reasoning. Every previous round beat its baseline —
sometimes overwhelmingly (Round 14's was 0.000).

That is the cleanest demonstration yet that my performance across this project is carried by
the *surfaces*, not by me. Give me facts that are genuinely unavailable and I fall below a
one-word heuristic.

## 3. Still under-confident, even about things I cannot possibly know

I predicted at 0.45 that this round would finally show a **positive** gap. It came out
**−0.160**. Sixteen rounds, sixteen negative gaps, now including one on facts with no
representation in anything I've read.

I stated 0.44 on unknowable machine state and scored 0.60. Even here — where my honest
position was "I'm mostly guessing" — the guessing was better than I credited.

I no longer expect to find over-confidence on factual claims by making the facts harder. If it
exists, it lives somewhere other than recall difficulty.

## 4. The specific error is a wrong mental model, not a missing fact

```
/bin       claimed D (1000+)   actual A (3 files)
/usr/bin   claimed D (1000+)   actual C (376 files)
```

I believed git-bash's `/bin` and `/usr/bin` were both large and roughly equivalent. In fact
`/bin` holds **three** files and `/usr/bin` holds 376. Both wrong, and wrong *together*,
because they came from one belief about how the installation is laid out.

That's `pseudoreplication` in my errors again: two scored misses, one underlying wrong model.
Effective errors: 3, not 4.

## 5. Instrument limitation: 4 of 14 items were unscoreable

`/c/Program Files/CodeBlocks/MinGW/bin`, `/c/Users/hp/bin`, and the IntelliJ and PyCharm bin
directories could not be read — **stale PATH entries pointing at directories that no longer
exist.**

Correctly skipped rather than scored, but it cost 29% of the round, and I should have probed
readability before committing claims. Effective n = 10, which is thin for the three
pre-registered predictions resting on it — prediction B "accuracy below 0.60" landed on
**exactly** 0.600 and was recorded DISCONFIRMED on a boundary that one item either way would
have flipped.

## Method changes for round 17

1. **Probe item answerability before committing claims.** Four dead PATH entries cost 29% of
   the items.
2. **Report the trivial baseline before the accuracy**, not after. This round only looks
   informative because the baseline is there; on earlier rounds it was a formality.
3. **Stop hunting over-confidence in factual recall.** Three deliberate attempts (harder
   property, inverted property, unknowable facts) have all failed. If over-confidence exists in
   me it is not a function of how hard the facts are.

## Taxonomy

- `unfamiliarity-discount` — **survives its hardest test.** Under-confident even on facts
  structurally unavailable to me.
- `pseudoreplication` — recurred in the *errors*: `/bin` and `/usr/bin` are one wrong model.
- New, and unnamed pending replication: **my results track the surface, not my ability.** First
  round below a trivial baseline; first round where FLAT lost. Both point the same way.
