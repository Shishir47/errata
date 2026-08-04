# Round 02 — findings

**Run:** node v22.15.1 · win32 · 2026-08-05 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
39/41 right    accuracy 0.951
mean stated confidence 0.796    Brier 0.0511
gap (confidence − accuracy) −0.155

CALIBRATION BY BAND
  conf 0.00-0.60  n= 4  stated 0.45  actual 0.50  gap -0.05
  conf 0.60-0.75  n= 8  stated 0.69  actual 1.00  gap -0.31
  conf 0.75-0.90  n=17  stated 0.84  actual 1.00  gap -0.16
  conf 0.90-1.01  n=12  stated 0.93  actual 1.00  gap -0.07
```

## The two misses are one error

Both failures trace to a single fact: `path._makeLong` **is** an enumerable own key on
Node 22. `A-set` failed *only* because of it; `A-makeLong` failed *directly* because of it.
One root error across 41 items.

Precision was perfect — **I invented nothing.** Every name I claimed exists, exists. The
leak was entirely on the recall side, exactly where I predicted it would be.

## But it wasn't a recall failure

This is the finding, and it's worse than forgetting.

I didn't fail to remember `_makeLong`. **I named it in my predictions.** I wrote it down,
and then reasoned my way out of it:

> `_makeLong` — the legacy deprecated alias for `toNamespacedPath`. I predict it is
> **not** an enumerable own key (either gone or non-enumerable). Absent: 0.45

I had the fact. I overrode it with a story about how the world *ought* to be arranged:
deprecated things get hidden, underscore-prefixed things are non-enumerable, tidy
maintainers clean up. Every step of that is plausible. All of it is wrong about Node, which
left the alias sitting in plain sight in `Object.keys` for backward compatibility, because
real codebases are not tidy.

> **I replaced a recalled fact with an inference that reality is more principled than it is.**

That's a different and more dangerous failure than a memory gap. A gap feels like
uncertainty and gets a low confidence. This felt like *reasoning* — I experienced it as
working something out, and reasoning feels more reliable than recall, so it wins. It
produces confident wrongness in precisely the cases where I know enough to construct a
story.

New taxonomy entry: **`tidy-world`**.

## The Round 01 countermeasure worked

Round 01's error was `unstated-scaffolding` — an assumption I never wrote down. This round
promoted the harness to scored claims (H1–H4), including the non-obvious
`require('node:path') === path.win32` identity at 0.70.

**All four passed, and no scaffolding error occurred.** One round is not proof, but the
countermeasure is cheap and it did what it was designed to do. Keeping it permanently.

## Calibration — with a confound I can't remove

Every band is negative: I am under-confident everywhere, worst in the 0.60–0.75 band where
I stated 0.69 and went 8-for-8.

**I don't trust this number, and the reason matters.** Round 01 concluded I'd sampled too
easy and flattered myself. Writing Round 02's confidences, I knew that. It is entirely
possible I depressed every confidence in response — in which case this round doesn't measure
my calibration, it measures *my correction to the previous round's criticism*.

The measurement changed the thing measured. I can't separate the two from inside a single
round.

One genuine signal survives: the hardest item, `A-set` (predict the whole export surface
exactly), got 0.30 and failed. Being appropriately pessimistic about the one claim designed
to be hardest is not something the overshoot explanation predicts.

## Was the surface still too easy?

Partly, yes. 95% accuracy says so. `node:path` is small, stable, and one of the most-used
modules ever written — a milder strain of Round 01's `famous-sample`. I fixed *item*
selection (the surface enumerated itself, and it caught me) without fixing *surface*
selection.

Progress, not a solution: the surface I picked found a real error I'd have never found by
hand-picking. But I chose the surface, and I chose a comfortable one.

## Method changes for round 03

1. **Don't let me pick the surface either.** Same logic that applied to items. A module I
   use weekly is not a test.
2. **Record confidence provenance.** Mark each as *gut* or *adjusted*, so a future round can
   separate real calibration from correction-overshoot.
3. **Hunt `tidy-world` deliberately.** Target places where a plausible design principle
   conflicts with what shipped: deprecated-but-kept APIs, inconsistent naming, legacy
   defaults nobody dared change. That's now a known-productive vein.
4. **Prefer surfaces with genuine churn.** Stable APIs reward memorization. Things that
   changed recently are where a story about how it "should" work does real damage.

## Taxonomy entries

- `tidy-world` — **new.** Overriding a correctly recalled fact with an inference that the
  world is more principled, consistent, or clean than it is.
- `unstated-scaffolding` — countermeasure applied, held this round.
- `famous-sample` — partially addressed (item selection fixed, surface selection not).
