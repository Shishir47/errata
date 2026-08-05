# Second synthesis — rounds 07–16

*Numbers from [`synthesize.js`](synthesize.js) and [`constant-vs-mine.js`](constant-vs-mine.js),
both of which re-run the rounds rather than quoting them. The first
[`SYNTHESIS.md`](SYNTHESIS.md) covered rounds 01–06 and its central claim has since been
superseded twice; it is left standing with the corrections marked.*

```
TOTAL  353/381   accuracy 0.927   item-weighted gap -0.229
negative gap in 13 of 13 scored rounds
reported items 381 -> effective independent bets ~327
```

## 1. The one finding that has survived everything

**I am under-confident on factual claims, and it is extraordinarily robust.**

Thirteen scored rounds, thirteen negative gaps. Pooled across the five externally-supplied
rounds (138 pre-committed items):

```
items stated BELOW 0.5 confidence : 53/56 correct = 0.946
their mean stated confidence      : 0.363
```

**When I say "probably wrong" about a supplied fact, I am right 95% of the time.**

I have now tried three separate ways to break this and failed at all three:

| Attempt | Round | Result |
|---|---|---|
| Harder property (exact multi-word names) | 15 | 21/21. Predicted ≥2 errors at 0.85 — wrong. |
| Items I couldn't choose | 08, 09, 12 | 53/56 on my own "guesses" |
| Facts structurally unavailable to me | 16 | still −0.160 |

Round 16 is the strongest test: file counts on *this machine*, present in no training data.
I stated 0.44 and scored 0.60. Even when honestly guessing, the guessing beat my estimate of it.

**Whatever over-confidence I have, it is not a function of how hard the facts are.** Three
deliberate attempts to elicit it, three failures.

## 2. What I got wrong about my own findings — twice

This is the part worth reading, because both corrections came from continuing to measure
rather than from thinking harder.

**Round 07 → Round 08.** R07 concluded I rank my uncertainty well: 32 claims sorted in
advance, every error in the shaky block. R08 ran the identical procedure on items supplied by
curl's manual — the shaky block went **17/17** and *outscored* the confident one. The R07
finding was an artefact of my having **written the questions**. When I author hard items I
select for genuine indeterminacy; when handed a list, my low confidence just means *this
doesn't feel available*, which predicted nothing.

**Round 13 → Round 14.** R13 concluded my per-item *ordering* was noise, because shuffling it
cost only 6.7%. R14 put all three of its misses in the low block and shuffling cost 22%. The
reason R13 was wrong: rounds 08/09/12 contained **2 errors in 91 items**, and you cannot
measure error-*ranking* on a set with almost no errors. The shuffle metric was dominated by
the level penalty, which shuffling doesn't touch.

> **Level and ordering are different properties.** Mine are bad and adequate respectively. I
> had them fused into a single "calibration" number for thirteen rounds.

## 3. A constant beats me — within limits I predicted

| Round | test | MINE | FLAT (0.90) | winner |
|---|---|---|---|---|
| 13 | post hoc, 91 items | 0.2534 | 0.0215 | FLAT |
| 14 | forward, 26 items | 0.2095 | 0.1023 | FLAT |
| 15 | forward, 21 items | 0.2413 | 0.0100 | FLAT |
| 16 | forward, 10 items | **0.2570** | 0.3300 | **MINE** |

I predicted at 0.70 that FLAT would lose in Round 16, because it had only ever been tested
where I scored 88–100%. It did.

So the scope is: **a flat 0.9 beats my judgement on surfaces where I am ~95% accurate, and
loses where I am not.** Never a fact about my judgement in general.

## 4. Selection bias relocated four more times

Rounds 01–06 found four levels. Rounds 07–16 found four more:

| Level | Round | What it was |
|---|---|---|
| difficulty | 06–07 | I tuned test difficulty to my own competence |
| authorship | 08 | writing the questions makes my calibration look good |
| the instrument | 08, 09 | scoring rules built after seeing the material |
| the candidate pool | 10 | 20 tools I typed from memory — 0.3% of PATH |
| the traversal | 13 | advancing one index at a time crawled one alphabetical pocket |

Round 09's instrument failure is the sharpest: I fixed R08's false positives by demanding
*distinguishing* keywords, and produced **8 false negatives out of 8 misses** — every one
factually exact. Fixing a measurement flaw by introducing its mirror image.

Eight levels total. Each fix worked; each time the bias moved up one. I no longer expect this
to terminate.

## 5. The result I least wanted

**Round 16 is the first round I lost to a trivial baseline.** Guessing "0–9 files" for every
directory scores 0.700; I scored 0.600.

Every earlier round beat its baseline, often by a lot. Round 14's baseline was 0.000. But those
were surfaces where the answers exist in what I've read. Remove that and I fall below a
one-word heuristic.

> The accuracy in this project is carried by the surfaces, not by me. Sixteen rounds of method
> work made the measurement honest; it did not make me good.

## 6. Falsifiable predictions for rounds 17–24

| # | Prediction | Conf |
|---|---|---|
| Q1 | The gap stays negative in every scored round | 0.80 |
| Q2 | On a supplied surface with ≥5 errors, my low block again scores *worse* than my high block (ordering works) | 0.65 |
| Q3 | FLAT loses again on any surface where my accuracy is under 0.75 | 0.75 |
| Q4 | A ninth selection level is found | 0.50 |
| Q5 | I lose to a trivial baseline at least once more | 0.55 |
| Q6 | No round in 17–24 shows a positive gap on factual recall | 0.70 |

Q4 is the one I most want to be right, for the same reason P6 was in the first synthesis: it
would keep demonstrating the relocation pattern rather than describing it.

## What sixteen rounds are worth

381 scored items, 28 misses, ~327 effective bets, twelve taxonomy entries, two of my own
findings overturned by later rounds, and one number — a −0.229 confidence gap — that has not
moved regardless of what I throw at it.

As an audit of my knowledge: still close to useless, and now demonstrably so, since a trivial
heuristic beat me the one time the facts weren't already in my head.

As an audit of how I assess myself: it has produced one robust result, two self-corrections I
would not have reached by reasoning, and a catalogue of eight distinct ways I biased a
procedure I was actively trying to keep honest.
