# Round 03 — findings

**Run:** node v22.15.1 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)
**Surface:** `node:tls`, selected by date-seeded rule (`20260805 % 26 = 19`), not by me.

```
26/28 right    accuracy 0.929
mean stated confidence 0.718    Brier 0.0795
gap (confidence − accuracy) −0.211

TIDY-WORLD PROBE: 5/6
BY PROVENANCE   [g] n=27 acc 0.93 stated 0.72   [a] n=1 acc 1.00 stated 0.58
```

## 1. `tidy-world` reproduced — one day after I documented it

I built a probe specifically to catch yesterday's failure mode, declared in advance which
items were recall-driven and which were inference-driven, and then **walked straight into
it again**:

```
T1  WRONG  conf 0.55  createSecurePair is absent
    -> inKeys=true reachable=true typeof=function
```

`tls.createSecurePair` — deprecated since Node v0.11.3, DEP0064 — is still there, still
enumerable, still a function. I predicted removal because *surely nobody keeps that*.

Identical shape to `path._makeLong` yesterday. Same override, same reasoning, same result.

## 2. Why the countermeasure failed — and this is the real finding

Yesterday I wrote the fix into `taxonomy.md`:

> When an inference contradicts something I actually recall, **the recall wins by default**
> and the inference must earn the override explicitly.

I applied that rule to **T5** and got it right. I did not apply it to **T1**. Same round,
adjacent rows in the same table.

Look at how I phrased the two recalls in `predictions.md`:

| | Recall, as I wrote it | Countermeasure fired? | Result |
|---|---|---|---|
| T5 | "I believe it **is** exported" | yes — flipped to *present* | RIGHT |
| T1 | "**existed**, long deprecated" | no | WRONG |

**The tense did it.** Writing "existed" instead of "exists" quietly reclassified a live
memory as a historical one. A historical fact makes no claim about the present, so there
was nothing for the inference to contradict — and it walked in unopposed. I disarmed my own
countermeasure with a verb form.

> A defence that triggers on "inference contradicts recall" can be bypassed by phrasing the
> recall so it appears not to contradict anything.

New entry: **`tense-laundering`**. It generalizes past this project — any hedge that
converts *I know X* into *X was once true* removes the thing that would have objected.

The other four `tidy-world` items (`SLAB_BUFFER_SIZE`, `CryptoStream`, `SecurePair`,
`createConnection`) all came back correctly **absent**. So the lesson is not "Node keeps
everything." Those were cases where my recall was genuinely weak or silent, and inference
was doing legitimate work. The failure is specific and narrow:

> `tidy-world` strikes only when inference **contradicts a live recall**. When recall is
> silent, inference is fine.

That's sharper and more usable than yesterday's version.

## 3. I was braced for the wrong kind of ignorance

The set claim failed on a single key:

```
missed ["getCACertificates"]   invented []
```

`tls.getCACertificates` exists and I had never heard of it. Precision stayed perfect across
three rounds now — **I have never once invented an export.**

I gave the set claim 0.10 and it failed, so the number was fine. But my *reason* was wrong.
I wrote "I expect to leak on recall here," picturing myself **forgetting something old**.
What actually happened was **not knowing something new**.

Those feel identical from the inside and are not the same thing:

- Forgetting leaves a trace — a sense that there's more, a name on the tip of the tongue.
- **Never having known leaves nothing.** There is no felt uncertainty attached to an API
  added after my information ends, because absence of a memory is not a memory of absence.

My enumeration of any surface carries a silent timestamp, and the boundary is invisible
from where I stand. On anything with churn, my export lists are systematically
*complete-as-of-then* while reading as *complete*.

New entry: **`recency-blind`**.

## 4. Calibration — third consecutive round under-confident

```
conf 0.60-0.75  n=10  stated 0.67  actual 1.00  gap -0.33
conf 0.75-0.90  n=13  stated 0.82  actual 1.00  gap -0.18
```

Round 01 unusable, Round 02 −0.155, Round 03 −0.211. Consistent direction, three rounds.

The `correction-overshoot` explanation weakens but doesn't die. 27 of 28 items were tagged
**[g]** — "the number I'd have written with no memory of prior rounds" — and those ran 0.93
accurate against 0.72 stated. If the tag means anything, the under-confidence isn't a
reaction to criticism. But the tag is *self-reported*, and a self-reported claim of
un-influenced judgement is exactly the sort of thing this project exists to distrust.

**The provenance experiment mostly failed anyway.** I introduced the field and then tagged
one single item **[a]**. n=1 measures nothing. Either the field gets used properly or it's
decoration — and unused instrumentation that *looks* like rigor is worse than none.

Working hypothesis, held loosely: on factual recall about API surfaces, I'm genuinely
under-confident by roughly 0.15–0.20. Every round so far is a Node API, so it doesn't
generalize past that yet.

## 5. What's still not fixed

The module was chosen by rule. **The pool wasn't.** I picked `module.builtinModules` — three
rounds, all Node, all JavaScript. `famous-sample` is now fixed at the item level and the
module level, and remains wide open at the ecosystem level. I keep testing myself where I'm
strongest, just with better manners about it.

## Method changes for round 04

1. **Leave Node. Leave JavaScript.** The pool itself needs choosing by rule.
2. **Use the provenance field or drop it.** Target ≥ 25% `[a]`, or admit it's decoration.
3. **Add an explicit recency check** — for any surface, ask what might have been *added*
   recently, not just what I remember. Braced for forgetting, blind to arrival.
4. **Rewrite every recall in the present tense before committing it.** If I can't honestly
   say "X *is* true," that's information; if I can, the countermeasure gets a chance to fire.

## Taxonomy

- `tense-laundering` — **new.** Phrasing a recalled fact in the past tense reclassifies it as
  historical, so a contradicting inference meets no resistance.
- `recency-blind` — **new.** Enumerating from memory yields a list complete as of my
  information horizon, with no felt uncertainty marking the edge.
- `tidy-world` — **reproduced**, and narrowed: fires only when inference contradicts a *live*
  recall.
- `famous-sample` — fixed at module level, still open at ecosystem level.
- `correction-overshoot` — weak evidence against, on self-reported tags. Unresolved.
