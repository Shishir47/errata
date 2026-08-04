# Round 01 — findings

**Run:** node v22.15.1 · 2026-08-05 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
scored 16/16   accuracy 1.000
mean stated confidence 0.903   Brier 0.0119
gap (confidence − accuracy) −0.097
```

## The headline is not the score

I got every claim right. That is the least interesting sentence in this document, and
treating it as the result would be the first mistake.

**The round found exactly one error, and it was not among the sixteen things I was auditing.**

I ran the script as `TZ=America/New_York node verify.js`, confident that this set the
process timezone. The script printed:

```
node v22.15.1  TZ=Asia/Dhaka
```

The environment variable did not take effect. My claim C7 survived by luck — Dhaka is
UTC+6, so the local-vs-UTC parsing difference still showed up (`diffMs=-21600000`, exactly
six hours). Had this machine been set to UTC, C7 would have silently reported `SKIP` and
I would have shrugged and moved on, never learning that my invocation was inert.

I only caught it because I'd made the script print its own resolved timezone — a defensive
habit, not an audit I planned.

### The generalization

> **My errors were not in the sixteen claims I was careful enough to write down. My error
> was in the assumption I considered too obvious to state.**

Every one of the sixteen got a stated confidence, an explicit phrasing, and a
deterministic test. The timezone assumption got none of those, because it wasn't the
subject — it was *scaffolding*. And scaffolding is where I was wrong.

This is the most useful thing this round produced, and it reframes the method. Auditing
my stated beliefs samples from precisely the population least likely to contain errors:
beliefs I found salient enough to articulate. The errors live one level down.

## Second finding: the claims were too famous

Mean confidence 0.903 against accuracy 1.000 reads as under-confidence. I don't think
that's the right reading.

Look at what I actually chose: `map(parseInt)`, `[10,9,1].sort()`, `Math.max()`,
`0/-0` in a `Set`, integer-key ordering. These are **canonical gotchas** — the JavaScript
edge cases famous *because* they're surprising. They have been written up thousands of
times. Of course I know them; knowing them is over-determined.

I set out to pick hard cases and instead picked *well-documented* ones. Those are not the
same population, and I substituted one for the other without noticing.

Real errors don't live in the famous corners. They live in the boring combination nobody
ever blogged about.

## Calibration, honestly stated

Brier 0.0119 is excellent, and I'm discarding it. With 16/16 I cannot distinguish
"well-calibrated" from "sampled an easy population," and the selection argument above says
it's the second. **This round produces no usable calibration estimate.** Recording it as
one would be the exact self-flattery this project exists to catch.

## Method changes for round 02

1. **Audit the scaffolding, not just the subject.** Before running anything, write down the
   assumptions the *harness* depends on and test those too. The timezone flag would have
   been caught by one line.
2. **Stop self-selecting the claims.** Generating my own test items samples from what I find
   memorable. Round 02 enumerates a surface mechanically — e.g. take a specific API and
   predict arbitrary argument combinations — so the items are chosen by the surface, not
   by my sense of what's interesting.
3. **Include claims I expect to get wrong.** No claim above sat below 0.80. A round with
   nothing in the 0.4–0.6 band isn't measuring the interesting part of the curve.
4. **Prefer domains where ground truth is external.** JS semantics are checkable by running
   them, which is why I could be rigorous — but it also means the answer is *retrievable*
   rather than *reasoned*. Verifiability and difficulty are different axes and I conflated
   them.

## Taxonomy entries added

- `unstated-scaffolding` — error in an assumption supporting the work rather than in the work
- `famous-sample` — mistaking well-documented cases for hard cases when self-selecting tests
