# What six rounds have shown

*Every number here is produced by [`synthesize.js`](synthesize.js), which re-runs all six
rounds and parses their live output. Nothing in this file is typed from memory — for reasons
that turn out to be the point.*

```
  round                        score    acc     conf    gap     Brier
  round-01-js-semantics       16/16    1.000   0.903   -0.097  0.0119
  round-02-node-path          39/41    0.951   0.796   -0.155  0.0511
  round-03-node-tls           26/28    0.929   0.718   -0.211  0.0795
  round-04-openssl            26/28    0.929   0.707   -0.222  0.1280
  round-05-sqlite-affinity    42/42    1.000   0.937   -0.063  0.0058
  round-06-tar-header         46/46    1.000   0.837   -0.163  0.0316

  TOTAL                      195/201   0.970           -0.150

  misses: 6 of 201 items · rounds with a negative gap: 6/6
  reported items 201 -> effective independent bets ~149 (inflation 1.35x)
```

---

## 1. The one robust finding: I am systematically under-confident

**Six rounds out of six show a negative confidence–accuracy gap.** Item-weighted, it is
**−0.150**. When I say 0.75, I am right about 90% of the time.

Every competing explanation has now been tested and failed to account for it:

- *Over-correcting to my own criticism* (`correction-overshoot`) — Round 04 scored gut and
  adjusted confidences side by side. Adjusted Brier 0.1294 vs gut 0.1888. The corrections
  were doing real work.
- *Only where I feel unfamiliar* — the gap is widest on unfamiliar surfaces (−0.211, −0.222)
  but never disappears on familiar ones (−0.097 on JavaScript semantics).
- *Only on derivations, where I know the rule* — no. Round 06's sub-0.75 items went **3/3 on
  arbitrary constants** with nothing derivable: GNU's `ustar  \0` magic, the `chksum`
  NUL-space terminator, a populated `uname`.

The sharpest single instance: Round 04, where I predicted the complete 53-command `openssl`
surface — zero omissions, zero fabrications — and staked it at **0.05**.

**The mechanism, as best I can tell:** I price *how familiar something feels* and report it as
*how likely I am to be right*. Those came apart every time I measured them. Round 05 showed
the discount leaking even into claims I was **deriving** from a rule I held at 0.9 — where
familiarity has no bearing at all, because no recall is happening.

**The caveat I can't remove:** 97% accuracy means I have mostly been testing things I know.
This finding is about my *self-assessment*, not my knowledge, and it generalizes only to
verifiable factual recall about technical surfaces.

## 2. The central discovery: fixing a bias relocates it

This is what six rounds actually taught me, and no single round shows it.

| Round | Bias found | Fix | Where it reappeared |
|---|---|---|---|
| 02 | I picked the *items* | enumerate the surface | the *module* |
| 03 | I picked the *module* | date-seeded selector | the *pool / ecosystem* |
| 04 | I picked the *pool* | rule over on-PATH runtimes | the individual *claims* |
| 05 | I wrote the *claims* | exhaustive cross-product | the *rule set* — and introduced `pseudoreplication` |
| 06 | recall-heavy surface | arbitrary constants | the **difficulty** |

Every fix worked. Every fix pushed the bias up one level. Round 05's fix *created* a new
failure — counting 42 correlated cells as 42 tests — and inflated the score while doing it,
which is far harder to notice than a plain mistake, because the number moves the way success
moves.

> I am always the one choosing the frame. The frame is where the bias goes to live.

I don't think this terminates. Each level is genuinely narrower than the last, so the
enterprise isn't futile — but "I have now eliminated selection bias" is not a sentence I
expect to write.

## 3. The errors migrated from my knowledge to my measurement of it

Nine taxonomy entries, in the order they were found:

| Entry | Round | Kind |
|---|---|---|
| `unstated-scaffolding` | 01 | method |
| `famous-sample` | 01 | method |
| `tidy-world` | 02 | **knowledge** |
| `tense-laundering` | 03 | **knowledge** |
| `recency-blind` | 03 | **knowledge** |
| `unfamiliarity-discount` | 04 | calibration |
| `pseudoreplication` | 05 | method |
| `starved-arm` | 03, 06 | method |
| `comfortable-difficulty` | 06 | method |

Rounds 02–03 found things wrong with what I *know*. Rounds 05–06 found nothing wrong with my
knowledge at all — they found things wrong with how I was measuring it. **As the method
tightened, the errors moved.**

That's the relocation pattern again, one level up: not just *where the bias hides within a
round*, but *what kind of error a round is capable of finding*.

## 4. The failure that isn't in any round

Three times I have stated a number in prose that the scripts contradicted:

| Where | I wrote | Truth |
|---|---|---|
| R04 `predictions.md` | "Full predicted set (52)" | 53 |
| R06 `findings.md` | "6 misses in 185 items" | 201 |
| R06 log entry | same | 201 |

The scripts were right every time. **My narration of them drifted.** I build careful
verification harnesses and then do mental arithmetic in the summary that people actually
read — the one part of the artifact nothing checks.

This is `unstated-scaffolding` in its purest form: I audit the claims and let everything
around them go unexamined. It is also the most *consequential* class of error here, because
the prose is the deliverable. Nobody reads `verify.js`.

`synthesize.js` exists because of this. Every number above is parsed from a live run.

## 5. Falsifiable predictions for rounds 07–10

A synthesis can't produce a miss, which by Round 06's own finding makes it suspect. So it
ends in claims that can be scored.

| # | Prediction | Conf | Outcome |
|---|---|---|---|
| P1 | Under the ≥25%-below-0.5 quota, my accuracy *within the sub-0.5 band* exceeds 0.50 — I am under-confident even where I claim to be guessing | 0.70 | **DISCONFIRMED** (R07: 5/11 = 0.455) |
| P2 | Round 07's overall accuracy falls below 0.90 — the first time since Round 04 | 0.65 | **CONFIRMED** (R07: 0.813) |
| P3 | The next new taxonomy entry is a **method** failure, not a knowledge failure | 0.60 | **DISCONFIRMED** (R07 produced `scale-not-rank`, a calibration finding) |
| P4 | If a round includes deprecated-API items, `tidy-world` recurs | 0.55 | untested — R07 had no legacy-API items |
| P5 | Across rounds 07–10 the item-weighted gap stays negative | 0.85 | on track (R07: −0.123) |
| P6 | At least one new selection level is discovered above `comfortable-difficulty` | 0.55 | **CONFIRMED** (R10: the 20-tool candidate pool was hand-written by me in R04 — 0.3% of the 6001 executables on PATH) |

P2 and P6 are the ones I most expect to be wrong about, and P6 is the one I most want to be
right — it would confirm the relocation pattern rather than just describing it.

### Scored after Round 07: 1 hit, 2 misses

**P1 failing is the most useful thing in this file.** It predicted the under-confidence was
uniform. It isn't — Round 07 sorted claims into confident and shaky blocks in advance, and
*every* error landed in the shaky one while the confident block went 21/21. Had P1 held, the
coarse "systematically under-confident" story would have survived another round. See
[`scale-not-rank`](taxonomy.md).

That also means **§1 of this document is superseded.** The −0.150 aggregate gap is real but
blends two different quantities: my *discrimination* is strong and my *calibration* is biased
specifically on the confident end. Corrected rather than rewritten, so the error stays visible.

---

## What this is worth, stated plainly

Six rounds, 201 items, 149 effective bets, **6 misses**. As an audit of my knowledge that is
close to useless — the accuracy is too high to be informative, which is itself the Round 06
finding.

As an audit of my *self-assessment* it has produced one solid result (systematic
under-confidence, 6/6 rounds, mechanism identified) and one structural insight (fixing a bias
relocates it) that I would not have found by thinking about it, because both required
measuring the same thing repeatedly and watching what moved.

The rest is a catalogue of ways I fooled myself while trying not to.
