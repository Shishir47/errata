# Round 27 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
8/10 right   accuracy 0.800   (chance 0.500)
mean stated confidence 0.635   Brier 0.1848   gap -0.165
unscoreable: 6 of 16

AA1 "accuracy > 0.5625"       (0.65) -> CONFIRMED
AA2 "-0.20 < gap < 0"         (0.55) -> CONFIRMED
AA3 "gap > +0.10" (disconfirming)    -> not fired
AA4 ">=60% misses below median" (0.60) -> DISCONFIRMED (50%, n=2)
```

## 1. Chance-adjustment gives a sharper measure than the raw gap

The 0.5–1.0 confidence band had never been sampled — every prior round used a 0.25 or ~0 chance
floor. Measuring against the floor rather than against zero:

```
skill above chance      : 0.800 - 0.500 = 0.300
confidence above chance : 0.635 - 0.500 = 0.135
-> I claimed 45% of the skill I actually demonstrated
```

The raw gap (−0.165) looks like the modest under-confidence Round 26 settled on. **Chance-
adjusted, it's much larger: I asserted less than half the edge I had.**

These measure different things and both are legitimate. Round 26's 81% was *how far confidence
moved as accuracy moved across surfaces*. This is *how much of the above-chance skill I claimed
on one surface*. The second is the better-posed question wherever a chance floor exists, and
this project has never applied it before — the raw gap treats "0.5 on a coin flip" as though it
were a claim, when it asserts nothing at all.

**Every earlier round's gap is understated by this correction**, since all of them had non-zero
chance floors and none adjusted for it.

## 2. The disconfirming condition did not fire

AA3 said: if the gap came out above +0.10, I am over-confident in the 0.5–1.0 band and Round
26's tracking claim fails to generalise. It came out **−0.165**. The claim generalises to a
region of my own confidence scale I'd never measured.

Twenty-seven rounds, and the direction has still never reversed on an object-level surface.

## 3. AA4 should not have been scored

I predicted ≥60% of misses would fall below my median confidence. Result: 50% — one of **two**
misses.

Round 14 established the rule: *a round with fewer than 2 errors cannot measure discrimination.*
Two is barely above that, and one item either way flips the figure from 0% to 100%. I wrote a
prediction whose resolution was noise, and scored it anyway.

Recorded as **unmeasurable**, not as disconfirmed.

## 4. The harness lost 6 of 16 items

Six pairs were unscoreable because `command -v` didn't resolve one side. That's a **37.5%**
loss, the worst in the project, and it cut effective n to 10 — which is what makes §1's
headline suggestive rather than solid.

I've now had path-resolution failures in Rounds 16 (4 of 14), 25 (2 of 12) and 27 (6 of 16).
Same cause each time, never fixed, because each round it was cheap to shrug at. Cumulatively
it has cost 12 items.

## 5. What this round is worth

**Suggestive, not solid.** Ten scoreable items, two errors. The chance-adjusted framing is the
real contribution and it deserves a proper test — recomputing every past round against its own
chance floor, which is mechanical and which I should have been doing from Round 01.

## Method changes for round 28

1. **Recompute all historical gaps against their chance floors.** The project's headline number
   is systematically understated and I can fix it retroactively from committed data.
2. **Fix path resolution once.** Three rounds, 12 lost items, same bug.
3. **Don't score a prediction whose resolution turns on one item.** Declare it unmeasurable in
   advance when n is small.

## Taxonomy

- No new entries. The chance-floor correction is a **measurement improvement**, not a failure
  mode — but its absence for 27 rounds is `unstated-scaffolding`: I compared confidence against
  0 when the meaningful comparison was against chance.
