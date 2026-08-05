# Round 11 — what the corrected selector actually costs

**Scoring rule pre-registered before the surface was drawn** — see [`SCORING.md`](../../SCORING.md).
That was the Round 09 lesson (two rounds lost to instruments designed after seeing the
material), and it is the first thing this round got right.

## 1. I overstated Round 10's fix, and here is the measurement

Round 10's headline: the hand-written pool held 20 tools; PATH holds **6001**. A 300×
correction, and I reported it as such.

Sampling every 150th entry of the pool and applying the selector's own usability gate:

```
sampled: 41    passed usability gate: 1    (~2.4%)
```

The gate requires an invocable command, ≥20 lines of `--help`/`-h`, and ≥20 enumerable option
tokens. Almost nothing clears it. **The effective pool is roughly 145 tools, not 6001** — an
expansion of about **7×**, not 300×.

I published the raw number because it was the dramatic one and I hadn't yet measured what
survived the gate. Same family as the arithmetic slips under `unverified-narration`, but worse
in kind: those were miscounts, this was a figure that **flattered the fix I had just made**.
Corrected in Round 10's own findings rather than only here.

## 2. A hypothesis of mine, weakly disconfirmed

I suspected the usability gate would reintroduce familiarity bias — that demanding
conventional `--help` formatting would select for mainstream, well-documented tools, i.e. the
ones I already know. That would have been the ninth relocation, and I was ready to write it up
as one.

The single tool that passed the sample was **`certreq`**, a Windows certificate utility I know
almost nothing about.

n=1, so this is weak. But it points **against** my hypothesis, and I'm recording it that way
rather than quietly dropping a prediction that didn't land. The gate is *severe*, but severity
and familiarity-bias are different things and I had conflated them.

## 3. `ex` rejected — on a soft criterion, and that matters

The rule's first valid draw was **`ex`** (vim in ex mode). I drafted confidences for its 33
flags and got roughly **21% below 0.5** — marginally under the 25% quota.

Two honest qualifications:

- **21% was my own estimate, not a computed figure.** Every other quota decision in this
  project was computed by a script from a committed list. This one was a mental draft, which
  is exactly the operation that has misfired before.
- **The rejection is convenient**, because `ex` is vim and I know vim well. A soft criterion
  that happens to reject the surface I'd have found least comfortable to be tested on deserves
  suspicion, not a pass.

Recorded as a rejection *with* that caveat rather than as a clean application of the rule.

## 4. The walk is compute-bound

At a 2.4% pass rate with per-candidate timeouts, finding the next valid draw costs ~40
candidate probes ≈ several minutes of subprocess time — more than a single foreground command
allows. The walk now runs as a background job writing a cached gate-pass list, so future
rounds draw instantly.

That is a real constraint on the method worth stating plainly: **the corrected selector is
~40× more expensive per draw than the hand-written pool it replaced.** The hand-written pool
wasn't only biased, it was *cheap*, and cheapness is part of why it survived seven rounds
without being questioned.

## Standing

No claims were scored in Rounds 10 or 11. Two consecutive rounds of pure method work is worth
flagging as a risk in its own right: method work cannot produce a miss, and a project that
drifts into it stops being able to surprise me — the exact failure diagnosed as
`comfortable-difficulty` in Round 06.

**Round 12 must score claims**, on whatever the cached walk returns, or the drift becomes the
finding.

## Taxonomy

- `unverified-narration` — **recurred, and worse.** Previous instances were miscounts; this one
  was a headline figure that flattered a fix I had just shipped.
- No new entries. The familiarity-bias hypothesis for the usability gate was **not** supported.
