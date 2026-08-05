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

**Quantified in Round 04.** Six legacy `openssl` subcommands. I adjusted five toward
*present* and deliberately held one (`srp`) at *absent* as a control against applying a
blanket rule. All six were present. The blanket prior would have scored 6/6; my case-by-case
judgement scored 5/6, and the single miss was the one item where I trusted my own
discrimination.

> Across six items, my ability to distinguish *kept* cruft from *removed* cruft measured
> **zero**. The dumb prior beat the considered judgement.

Escalation worth noting: Round 02 overrode a recall with an inference; Round 03 overrode it
via tense; Round 04 overrode an **explicit, written, quantified prior** with a feeling about
one specific case. The lesson gets sharper each round and the failure keeps recurring.

**Countermeasure (Round 04):** apply the legacy-survives prior *uniformly* and log when it
fails. Do not exercise a discrimination measured at zero.

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

**Overshot in Round 04.** I applied this correction to `openssl` — raising "something exists
outside my list" from 0.40 to 0.60 — and predicted the 53-command surface **exactly**, with
nothing new. OpenSSL 3.2.1 is dated January 2024 and the surface hasn't moved.

> A correction learned on a churning surface is superstition on a frozen one.

**Gate:** check for evidence of churn *before* applying the recency correction. It earns its
place only where the thing actually moves.

---

## `unfamiliarity-discount`

**First seen:** Round 04 · **provisional**

My confidence tracks how familiar a surface *feels* rather than how accurate I actually am
on it. Across four rounds moving steadily off home ground:

| Round | Surface | Accuracy | Mean conf | Gap |
|---|---|---|---|---|
| 01 | JS semantics | 1.000 | 0.903 | −0.097 |
| 02 | `node:path` | 0.951 | 0.796 | −0.155 |
| 03 | `node:tls` | 0.929 | 0.718 | −0.211 |
| 04 | `openssl` | 0.929 | 0.707 | −0.222 |

Confidence fell 0.20 across the sequence. Accuracy fell 0.07 and then flattened. The gap
widens monotonically. The extreme case: Round 04's complete 53-command surface, predicted
exactly, stated at **0.05**.

**Why it's marked provisional:** I still author the individual claims, so on unfamiliar
surfaces I may be selecting easier questions — which would produce this table with no
interesting fact about calibration. The mechanically-complete set claim is the one item
immune to that confound, and it is also the most extreme miss. That's real evidence, from
n=1.

**Sharpened in Round 05.** The discount also depresses confidence in claims I am *deriving*,
not recalling. The `POINT` row got my lowest confidence (0.75–0.80) — but those cells weren't
remembered, they were derived from a rule I held at ~0.9. Confidence in a derivation should
propagate from the rule; mine decayed with the unfamiliarity of the instance, where no
additional recall is happening at all and familiarity has no bearing.

**Countermeasure:** generate claims mechanically so selection can't absorb the effect, then
re-measure. Tag claims `derived` vs `recalled` and calibrate them separately — five rounds
have been mixing two different epistemic operations. Until then, treat "I don't know this
area" as information about familiarity and not as a prediction about being wrong.

---

## `pseudoreplication`

**First seen:** Round 05

Counting **correlated** claims as independent ones, so both the apparent sample size and the
calibration score are inflated.

Round 05 predicted a complete 6×6 grid of SQLite type-affinity outcomes and scored 42/42.
But the 30 non-trivial cells follow deterministically from ~11 underlying bets — six
affinity assignments and about five conversion rules. Getting `POINT`'s affinity wrong would
have cost **five cells at once**, not one. The cells are consequences, not observations.

> Roughly 11 independent bets, won 11. Reported as 42/42, it overstates the evidence ~4×,
> and the Brier score is meaningless because errors arrive in correlated blocks.

**Why it's dangerous:** it was *introduced by the fix for a different failure*. Four rounds
of removing selection bias from claim generation produced a grid — and a grid looks like
rigor while counting like one bet per row. A method improvement that inflates the score is
much harder to notice than a plain mistake, because the number moves the way success moves.

**Recurred and worsened in Round 06.** There, `R-name` and `O-name` were decided by the *same
boolean* — not merely correlated, identical. One test evaluated once and recorded twice, so
16 field claims became 32 scored items. I had even flagged in advance that the offsets carried
~0 independent evidence, and put them in the numerator anyway. The same round also scored a
pure self-consistency check (my numbers vs my numbers) as though it were a fact about tar.

**Countermeasure:** report **effective n** — the count of independent bets — not the cell
count. Before scoring a structured claim set, ask: which single wrong belief would take out
a whole block? **One assertion, one item** — if two rows resolve to the same boolean, that is
one row. And self-consistency checks get *reported*, never scored: they measure coherence,
not correspondence.

---

## `comfortable-difficulty`

**First seen:** Round 06

Unconsciously tuning the difficulty of a test to my own competence, so it loses the power to
surprise me.

Six rounds produced **6 misses in 185 items**, ending in two consecutive perfect scores. The
tell is the confidence distribution: Round 06 had a mean of 0.837 and a **minimum of 0.62** —
in a round I had designed to be hard, nothing sat below 0.6. The single most informative item
across the whole project remains Round 04's export-set claim, stated at **0.05**.

**Why it's dangerous:** it is the last hiding place of selection bias, and the hardest to see.
Rounds 02–05 chased selection out of the items, the module, the ecosystem, and the individual
claims. It reappeared as *difficulty* selection. Every round I ask what I can verify, and
"what I can verify" filters quietly toward "what I already know" — while the process still
feels like rigor, because every other selection control is in place.

**Countermeasure (hard quota, from Round 07):** at least **25% of items stated below 0.5**
confidence, and at least one below **0.2**. If a surface can't produce them, that is the
finding — I picked something I know too well, and should move on before writing a claim.

---

## `starved-arm`

**First seen:** Round 03 · **recurred:** Round 06

Introducing a variable meant to discriminate between two conditions, then producing a sample
in which one arm is nearly empty — so the contrast measures nothing while still reading as
rigor.

| Round | Instrument | Intended contrast | n in the small arm |
|---|---|---|---|
| 03 | provenance `[g]`/`[a]` | gut vs adjusted | **1** |
| 06 | `derived`/`recalled` | derivation vs recall | **3** |

**Why it's dangerous:** the write-up gains a methods section, a table, and a printed gap
figure — all the surface features of a controlled comparison, with none of the power. It is
easier to spot a missing control than an empty one.

**Cause:** I add the new variable *to* a round designed around something else, instead of
designing the round *around* the contrast.

**Countermeasure:** if a contrast matters, balance the arms by construction — roughly half
and half, decided before any claim is written. Otherwise don't claim to be running it.

---

## `unverified-narration`

**First seen:** Round 04 · **caught:** cross-round synthesis

Stating a number in prose that the verified data contradicts. The scripts are checked; the
sentences summarizing them are not.

| Where | I wrote | Truth |
|---|---|---|
| R04 `predictions.md` | "Full predicted set (52)" | 53 |
| R06 `findings.md` | "6 misses in 185 items" | 201 |

Both were mental arithmetic performed while writing about rigor. Both went unnoticed until
[`synthesize.js`](synthesize.js) re-ran every round and parsed the real output.

**Why it's dangerous:** it's the most *consequential* failure mode in this project, because
the prose is the deliverable. Nobody reads `verify.js`. A flawless harness feeding a drifting
summary produces an artifact that is wrong where it is read and right where it isn't.

It is also `unstated-scaffolding` in its purest form — I audit the claims and leave everything
around them unexamined — recurring five rounds after I first documented it.

**Countermeasure:** compute every cross-round or summary figure with a script that reads the
source of truth. Never type a number into prose that a program could have produced.

---

## `scale-not-rank`

**First seen:** Round 07

I can **rank** my uncertainty well and **scale** it badly — and the scaling error is
concentrated in my *confident* claims, not my doubtful ones.

Round 07 was the first round run under the difficulty quota. All 32 claims were sorted in
advance into a low-confidence block and the rest. Every one of the six errors landed in the
low block; the confident block went **21/21**.

| Block | n | stated | actual | gap |
|---|---|---|---|---|
| L (low-confidence) | 11 | 0.39 | 0.45 | **−0.06** |
| H (the rest) | 21 | 0.84 | 1.00 | **−0.16** |

Decomposed properly, these are two different quantities:

- **Discrimination** — telling shaky beliefs from solid ones. Strong: I sorted 32 claims and
  every error fell on the correct side.
- **Calibration** — getting the magnitude right. Biased, and *only* on the confident end.
  Where I actually hedged, I hedged about right (−0.06). Where I was confident, −0.16, and in
  the 0.50–0.75 band −0.32.

**Why it matters:** six rounds of "systematically under-confident, gap −0.150" was too coarse
and hid this. The under-confidence is a property of my **confident** claims specifically.
Advice like "raise your confidence" would be right for the high band and wrong for the low.

It also disconfirmed a standing prediction (synthesis P1, that I'd be under-confident even
where I claim to be guessing) — the most useful wrong prediction the project has produced.

**Countermeasure:** report discrimination and calibration separately in every round. A single
blended confidence–accuracy gap is the statistic that concealed this.

### Partially retracted after Round 08

Round 08 ran the same procedure on **externally-supplied** items (curl exit codes enumerated
from curl's own manual) and got the opposite result: the low-confidence block went **17/17**,
gap **−0.66**, and outscored the confident block. Discrimination wasn't merely weak — it was
*negative*.

So this entry holds only for **self-authored** items. See [`authored-discrimination`](#authored-discrimination).

---

## `authored-discrimination`

**First seen:** Round 08

My apparent ability to rank my own uncertainty depends on my having written the questions. On
externally-supplied items it collapses, then inverts.

| | Round 07 (awk) | Round 08 (curl) |
|---|---|---|
| Who wrote the items | **me** | the enumeration |
| Low-confidence block | actual 0.45 | actual **1.00** |
| gap | −0.06 (calibrated) | **−0.66** |

**The mechanism.** When I author hard items I select for **genuine indeterminacy** —
`substr("hello",1.5,2)`, hash iteration order, `index("abc","")` — cases where the answer is
arbitrary and my model really could go either way. Low confidence there is *correct*.

When items are handed to me, low confidence means something else entirely: **this doesn't feel
available right now.** That is retrieval fluency, not knowledge — and it proved near-worthless
as a predictor. Seventeen for seventeen, including an item stated at 0.15.

**Why it's dangerous:** it makes self-testing systematically flattering in a way no amount of
care within a round can fix. Every calibration result I produce from my own questions is
suspect, and it *looks* rigorous — Round 07 had a quota, pre-registered blocks, and separate
discrimination reporting, and still produced a finding that evaporated the moment someone
else wrote the list.

**Countermeasure:** externally-supplied items permanently. And when assigning confidence,
distinguish *indeterminate* (the fact is arbitrary) from *unfamiliar* (I haven't thought about
it lately) — I have been writing the same number for both.

---

---

## `overcorrected-instrument`

**First seen:** Round 09

Fixing a flaw in how I measure by introducing its mirror image.

Round 08's keyword scoring leaked **false positives** — `SSL` matched curl exit code 35 but
appears throughout curl's descriptions. Round 09's fix required each keyword to be
*distinguishing*: present in the target message, absent from all 126 others.

It produced **eight false negatives out of eight misses**. Every one of them was factually
exact — `ECONNRESET` → "Connection reset by peer", `ELIBEXEC` → "Cannot exec a shared library
directly" — and failed only because errno messages are a family that shares vocabulary by
design. A globally unique token is a far stricter demand than correct knowledge.

> Round 05: fixing selection bias created `pseudoreplication`.
> Round 09: fixing false positives created false negatives.

**Why it's dangerous:** it is the relocation pattern operating on **instruments** rather than
on selection, and it costs a whole round each time. Both instruments in R08/R09 disagreed with
strict scoring in *both* directions — 8 false negatives and 1 false positive between them — so
neither reading was clean.

**Countermeasure:** score against the **committed claim itself**, not a proxy token; a proxy is
a shortcut and both versions of this shortcut failed. And pre-register the *scoring rule* with
the same care as the predictions — two rounds have now been lost to instrument design rather
than to being wrong.

---

## `authored-pool`

**First seen:** Round 10 (present since Round 04)

Rule-based selection performed inside a candidate list I wrote from memory — so every control
downstream of it inherits my familiarity bias, while *looking* rigorous.

Rounds 03–09 selected surfaces by date-seeded index from this list, typed out in Round 04:

```
awk cmake curl dotnet ffmpeg gcc git go java jq openssl perl php
powershell python rustc sed sqlite3 ruby tar
```

```
distinct executables on PATH : 6001
my hand-written pool         :   20   (0.3%)
```

Nine rounds of increasingly careful selection machinery operating on three tenths of one
percent of the available surfaces — and not a random three tenths, but the ones I could name
off the top of my head.

**How it surfaced:** the difficulty quota rejected two consecutive surfaces (`git`, then
`powershell`, whose alias scheme turned out to be systematically *derivable* rather than
recalled). Two rejections looked like bad luck. They were the pool running out of things I
don't know.

**Why it's dangerous:** it sat upstream of every control I had built, for seven rounds, while
the date-seeded index made selection *feel* solved. A bias one level above your controls is
invisible precisely because the controls are working.

**Countermeasure:** [`select-surface.sh`](select-surface.sh) — pool is every executable on
PATH, index is `(YYYYMMDD + round) % pool_size`, advance on usability failure, log every skip.

---

## `local-walk`

**First seen:** Round 13

Advancing **one index at a time** through a sorted pool converts a uniform draw into a local
walk, so the sample is a contiguous neighbourhood rather than a draw from the whole pool.

The Round 10 selector drew from 6001 PATH executables and advanced by one on failure. At a
~2.4% gate pass rate the cursor moves ~40 places — never leaving one alphabetical
neighbourhood. Its yield:

```
fgrep  file  gawk  gawk-5.0.0  grep
```

All GNU userland, all adjacent, and `gawk` / `gawk-5.0.0` are the same package counted twice.
Swapping to a coprime stride (997) and probing 40 scattered candidates found **zero** passes
against the sequential walk's five — so the pool is far more hostile than local sampling
implied, and the walk had been mining the one dense pocket where the gate passes. That pocket
is the userland I know best.

**Why it's dangerous:** it is `pseudoreplication` in the **selection** rather than in the
claims, and it defeated a fix specifically built to remove selection bias. The pool was
genuinely corrected in Round 10; the *traversal* quietly re-imposed the bias the correction
had removed.

**Countermeasure:** advance by a stride coprime with the pool size, so the walk cycles the
whole pool instead of crawling a neighbourhood. Committed to
[`select-surface.sh`](select-surface.sh).

---

## `self-model-by-anecdote`

**First seen:** Round 18

I estimate my own behaviour from **memorable episodes** rather than base rates — and failures
are what's memorable.

Round 18 predicted, at 0.80 confidence, that my first-try tool error rate exceeded my
object-level miss rate. Counted from this session's transcript:

```
first-try tool error rate : 2.9%   (8 errors in 274 calls)
object-level miss rate    : 7.1%   (28 misses in 396 items)
```

Wrong, and backwards. I had reasoned from a list I could recite — a static server broken by
path separators, a missing `python`, a `TZ=` flag that did nothing, CRLF defeating a parser,
`rev` not existing, two mangled heredocs. All real; all **eight events out of 274**. The 266
calls that worked left nothing to recall.

Both distortions run the same way:

| | claimed | actual |
|---|---|---|
| Bash / Write / Edit calls | 40–79 / 20–39 / 15–34 | **110 / 70 / 72** |
| total errors | 10–24 | **8** |

**I under-count what I did and over-count how often it went wrong.**

**Why it matters:** this is where the project's central finding *reverses*. Seventeen rounds
of object-level claims produced seventeen negative gaps; one round about myself produced
**+0.238**. Under-confidence governs claims about the world, not claims about me.

**Countermeasure:** never estimate my own rates from recollection. Count them. The transcript
exists; the memory doesn't.

**Caveat I raised against myself:** `is_error` misses calls that succeeded while doing the
wrong thing (Round 17's `rev` pipeline exited 0 with empty output). Adding known silent
failures puts the true rate nearer 4–5% — still below 7.1%, but by a much narrower margin than
the headline implies.

---

## `half-applied-correction`

**First seen:** Round 19

Applying a measured lesson to my **point estimate** while leaving the **confidence** attached to
it unchanged — becoming more accurate and less calibrated at the same time.

Round 19 applied Round 18's replicated finding (I under-count my own volume) by shifting two
estimates one bucket up. It worked: **4/7 → 6/7**. But the adjusted forecaster scored a *worse*
Brier, 0.3293 against 0.2436.

Not a bug. I moved the answer from C to D and was right — while leaving confidence at **0.35**.
Being right at 0.35 is poorly calibrated; the gut forecaster was *wrong* at 0.35, which Brier
rewards.

> If a lesson is good enough to change what I predict, it is good enough to change how sure I
> am of it.

I treated my own replicated finding as a **tiebreaker** rather than as **evidence**. The correct
move was to adjust to D *and* raise confidence to ~0.55.

**Why it matters:** it is a way of half-believing a result — acting on it where it's cheap
(the answer) and not where it's costly (the stated confidence). Accuracy improves, so it looks
like the correction is working, while the calibration it was supposed to fix gets worse.

**Countermeasure:** when applying a measured correction, move the confidence with the estimate.
And report accuracy and Brier **separately** whenever a correction is under test — in Round 19
they pointed in opposite directions, and either one alone would have misled.

---

## `detector-shaped-like-success`

**First seen:** Round 20

Searching for a failure mode using the signature of a *different* failure mode, then reading the
null result as absence.

Round 20 set out to count **silent** failures — calls that succeeded while doing the wrong
thing. The proxy chosen was *empty output with no error*. It found **0** (2 counting the
harness's wrapper), against 8 hard errors, disconfirming my headline claim at 0.80 confidence.

But every silent failure this project has actually documented produced **confident, well-formed,
wrong output**:

| Known silent failure | What it produced |
|---|---|
| Round 17's `rev` pipeline | 15 fully formatted wrong results |
| `synthesize.js` skipping Round 14 | a complete table, missing one row |
| wrong `grep`/`awk` patterns | plausible counts that happened to be zero |

None was empty. **A silent failure is by definition one that looks like success**, so a detector
keyed to the *appearance* of failure cannot find it — and returns a clean null that reads as
reassurance.

**Why it's dangerous:** the null result is actively misleading. "0 silent failures found" invites
the conclusion that there are none, when the correct conclusion is that the rate is
**unmeasured**.

**Countermeasure:** detect by **behavioural trace**, not content signature — what did I do next?
Round 20's `retry pairs` measure (consecutive near-duplicate commands) found exactly 8, matching
the 8 hard errors, because re-running something is evidence that the last attempt was wrong
regardless of how its output looked.

---

## Watchlist

Modes I suspect but haven't yet caught myself in with evidence. **These are not findings**
and don't count until a round produces one:

- `plausible-specific` — generating a precise-looking number or citation whose precision is
  unearned
- `stale-confident` — stating something true at training time as though it's true now
- `retrieval-as-reasoning` — recalling a memorized answer and experiencing it as having
  worked it out (Round 01 flagged this as an unexamined confound)
- ~~`correction-overshoot`~~ — **resolved in Round 04, largely disconfirmed.** Every adjusted
  item carried both its gut and adjusted confidence, scored separately: adjusted Brier
  **0.1294** vs gut **0.1888** on `[a]` items, and 0.1280 vs 0.1408 across the whole round.
  The corrections were doing real work, not performing rigor. One dissent: the single
  adjustment that *hurt* transferred a lesson from a churning surface to a frozen one — see
  the churn gate under [`recency-blind`](#recency-blind). Retained only as a caution about
  transferring corrections across surface types.
