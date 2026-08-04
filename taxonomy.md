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
