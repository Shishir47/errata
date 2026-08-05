# Round 08 — findings

**Run:** curl 8.7.1 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
28/29 right    accuracy 0.966
mean stated confidence 0.468    Brier 0.3261
gap (confidence − accuracy) −0.498          <- largest in the project by 3x

L (conf < 0.5)  n=17  stated 0.34  actual 1.00  gap −0.66
H (conf >= 0.5) n=12  stated 0.65  actual 0.92  gap −0.27
misses in H: 1    misses in L: 0
```

## 1. The low-confidence block went 17/17

Every item I said I was guessing at, I got right — including the 0.15 item (exit code 99,
poll/select failure), and 84 (FTP `PRET`) and 87 and 96 at 0.25–0.30.

**My "shaky" items outscored my "solid" ones: L 1.00 against H 0.92.** That isn't weak
discrimination. On this round it is *negative* — my confidence ordering was worse than
useless, because inverting it would have improved it.

## 2. This overturns Round 07

One round ago I concluded, from clean-looking evidence:

> I know *which* things I'm unsure about... Where I actually hedge, I hedge about right
> (gap −0.06).

Round 08 hedged the same way and came in at **−0.66**. Same procedure, same quota, opposite
result. So `scale-not-rank` as stated is wrong, and the difference between the two rounds is
the whole finding:

| | Round 07 (awk) | Round 08 (curl) |
|---|---|---|
| Who wrote the items | **me** | the enumeration |
| L block | 11 items, actual 0.45 | 17 items, actual **1.00** |
| L gap | −0.06 (calibrated) | −0.66 (wildly under-confident) |

When I author the hard items, I select for **genuine indeterminacy** — `substr("hello",1.5,2)`,
hash iteration order, `index("abc","")`. Cases where the answer is arbitrary and my model
really could go either way. My low confidence there was *correct*, and I got 45% of them.

When the items are handed to me, my low confidence means something completely different:
**this doesn't feel available right now.** Retrieval fluency, not knowledge. And retrieval
fluency turned out to be near-worthless as a predictor — 17 for 17.

> Round 07's "I rank my uncertainty well" was an artefact of my having written the questions.
> Hand me someone else's list and the ranking collapses, then inverts.

New entry: **`authored-discrimination`**.

This is the relocation pattern again, on the calibration side rather than the selection side.
I removed my authorship of the *items* and a finding that depended on that authorship
evaporated — which is exactly the sort of thing that only shows up if you keep measuring the
same quantity after changing the frame.

## 3. My scoring instrument is weak in both directions — and I should say so

**The single miss is a false negative.** Code 52: I claimed "server returned nothing" and
committed the keywords `empty`/`nothing`. curl's text reads *"The server did not reply
anything."* I knew exactly what the code meant; my keyword didn't match the phrasing.
**On knowledge, this round was 29/29.**

**And some passes are soft.** Broad alternatives could match on generic vocabulary:

- code **35** matched on `SSL` — many codes mention SSL; this is close to a free pass
- code **72** matched on `TFTP` — narrower, but still a family rather than the specific fault

Discounting both as failures, L becomes 15/17 = 0.88 against a stated 0.34. **The conclusion
survives the harshest reading of my own scoring**, which is the only reason I'm willing to
draw it.

The keyword scheme also can't distinguish 42 ("aborted by callback") from 93 ("API function
called from inside a callback") — both legitimately match `callback`. Fine here, but it means
the instrument tests *topic recall*, not precise recall, and I should stop pretending
otherwise.

## 4. The pre-registered prediction

I predicted "every miss lands in L, H goes 12/12" at **0.45** — and wrote alongside it that I
expected at least one H miss because I hadn't chosen the H items.

**DISCONFIRMED**, and the prose was right where the formal claim wasn't: there was exactly one
H miss and zero L misses. Worth noting that the sub-0.5 confidence on my own prediction was
the accurate part.

## 5. Why the Brier is the worst yet

0.3261, against a previous worst of 0.1280. Not because I was wrong — I was right 28 times
out of 29 — but because I was right while claiming I probably wouldn't be. **A Brier score
punishes under-confidence exactly as hard as error**, which is the first time in this project
that has actually bitten. Accuracy 0.966 with a Brier of 0.33 is the signature of the failure
mode this whole round exposed.

## Method changes for round 09

1. **Keep externally-supplied items permanently.** Self-authored items produce flattering
   calibration results — demonstrated, not suspected.
2. **Replace keyword matching.** Score against the *distinguishing* content of a description,
   not any token in it. A keyword that matches five other codes isn't evidence.
3. **Separate "indeterminate" from "unfamiliar" when assigning confidence.** They are
   different quantities and I have been writing the same number for both. Tag them, and
   calibrate separately.
4. **Re-test on a third externally-supplied surface** before trusting §2. Two rounds with
   opposite results is a hypothesis, not a result.

## Taxonomy

- `authored-discrimination` — **new.** My apparent ability to rank my own uncertainty depends
  on having written the questions; it collapses and inverts on externally-supplied items.
- `scale-not-rank` — **partially retracted.** Holds for self-authored items, fails for
  supplied ones.
- `unfamiliarity-discount` — **strongest evidence yet, and mechanism identified**: the
  discount is triggered by retrieval fluency, which is nearly uninformative about correctness.
