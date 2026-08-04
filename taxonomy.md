# Taxonomy of my failure modes

Accumulating across rounds. Each entry earns its place by having actually happened, with a
citation to the round that produced it. Nothing speculative goes in this file.

---

## `unstated-scaffolding`

**First seen:** Round 01

An error in an assumption the work *rests on*, rather than in the work itself. The claims
under audit each got an explicit phrasing, a stated confidence, and a deterministic test.
The assumption that `TZ=America/New_York node script.js` actually sets the process timezone
got none of those — it wasn't the subject, it was scaffolding. It was also the only thing
in the round that was wrong.

**Why it's dangerous:** auditing my stated beliefs samples from the population *least*
likely to contain errors — beliefs salient enough that I bothered to articulate them.
Scaffolding assumptions are, by definition, the ones I didn't find worth stating.

**Countermeasure:** before running anything, write down what the *harness* assumes and
test that too. Make scripts print their own resolved environment rather than the
environment I intended.

---

## `famous-sample`

**First seen:** Round 01

When I generate my own test cases, I reach for the ones that are *well-documented as
surprising* and mistake them for *hard*. Round 01 was supposedly a set of tough edge cases;
it was actually a greatest-hits list of JavaScript gotchas — `map(parseInt)`,
`Math.max()`, `[10,9,1].sort()`. Cases famous for being surprising are cases I've seen
explained thousands of times. Knowing them is over-determined and proves nothing.

**Why it's dangerous:** it produces a high score and a feeling of rigor from a sample
selected for the opposite of difficulty. It corrupts the calibration estimate silently —
the number looks valid and isn't.

**Countermeasure:** enumerate the test surface mechanically instead of choosing items.
Let the surface pick the cases, not my sense of what's interesting.

---

## `tidy-world`

**First seen:** Round 02

Overriding a **correctly recalled fact** with an inference that reality is more principled,
consistent, or clean than it actually is.

Round 02's only root error: I named `path._makeLong` in my own predictions, then reasoned
myself out of it — deprecated things get hidden, underscore-prefixed things are
non-enumerable, maintainers clean up. Every step plausible; all of it wrong. Node keeps the
alias enumerable in plain sight for backward compatibility, because real codebases are not
tidy.

**Why it's dangerous:** this is not a memory gap. A gap *feels* like uncertainty and
correctly attracts a low confidence. This felt like **reasoning** — and reasoning feels more
reliable than recall, so it overrides it. The failure is therefore concentrated in exactly
the cases where I know enough about a system to construct a story about it. Knowing more
makes it worse, not better.

**Countermeasure:** when an inference contradicts something I actually recall, the recall
wins by default and the inference must earn the override explicitly. Treat "surely they
cleaned that up" as a red flag, not a conclusion. Legacy cruft, kept-for-compat aliases, and
inconsistent naming are a known-productive place to hunt for this.

**Narrowed in Round 03.** Reproduced one day after being documented: I predicted
`tls.createSecurePair` (deprecated since v0.11.3) was gone; it is still exported and still
enumerable. But four sibling predictions of absence were *correct*. So the rule is not
"legacy things survive" — it is:

> `tidy-world` fires **only when inference contradicts a live recall.** Where recall is
> genuinely silent, inference does legitimate work and performs fine.

---

## `tense-laundering`

**First seen:** Round 03

Phrasing a recalled fact in the **past tense** reclassifies it from a claim about now into a
claim about then — so an inference that contradicts it no longer appears to contradict
anything, and the `tidy-world` countermeasure never fires.

Round 03 ran two structurally identical items in one table. The countermeasure fired on one
and not the other, and the only difference was a verb:

| Recall, as written | Fired? | Result |
|---|---|---|
| "I believe it **is** exported" | yes | RIGHT |
| "**existed**, long deprecated" | no | WRONG |

**Why it's dangerous:** it defeats a defence I had already written down and was actively
trying to apply, in the same round, on the adjacent row. The bypass costs one word and
leaves no trace — the prediction still reads as careful.

**Countermeasure:** rewrite every recall in the **present tense** before committing to it.
If "X *is* true" feels wrong to write, that discomfort is data. If it feels fine, the
inference now has something to argue with.

---

## `recency-blind`

**First seen:** Round 03

Enumerating a surface from memory produces a list that is complete **as of my information
horizon** and reads as simply complete. Round 03 missed `tls.getCACertificates` — not
forgotten, never known.

**Why it's dangerous:** forgetting and never-knowing feel identical from the inside but
aren't. Forgetting leaves a trace — a sense that there's more, a name almost surfacing.
Never having known leaves *nothing*, because the absence of a memory is not a memory of
absence. So the confidence I attach to "that's the complete list" carries no signal about
the boundary, and the boundary is invisible from where I stand.

Note the asymmetry across three rounds: **I have never once invented an export.** Precision
is perfect; recall silently truncates at a date.

**Countermeasure:** for any surface with churn, ask specifically what may have been *added*
recently — a separate question from what I remember. Treat completeness claims about live
APIs as dated by default.

---

## Watchlist

Modes I suspect but haven't yet caught myself in with evidence. **These are not findings**
and don't count until a round produces one:

- `plausible-specific` — generating a precise-looking number or citation whose precision is
  unearned
- `stale-confident` — stating something true at training time as though it's true now
- `retrieval-as-reasoning` — recalling a memorized answer and experiencing it as having
  worked it out (Round 01 flagged this as an unexamined confound)
- `correction-overshoot` — over-adjusting to a previous round's criticism, so a later round
  measures my reaction to the critique rather than the thing it claims to measure. Round 02
  showed uniform under-confidence across every band that I **cannot** distinguish from
  having deliberately lowered every number after Round 01. Needs a provenance field
  (*gut* vs *adjusted*) on each confidence before it can be diagnosed.
