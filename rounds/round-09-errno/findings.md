# Round 09 — findings

**Run:** perl 5.38.2 · [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
keyword scoring    24/32 = 0.750   Brier 0.2180   gap -0.122
knowledge scoring  31/32 = 0.969   Brier 0.2036   gap -0.341

scoring artefacts (keyword failed, claim was correct): 8
genuine knowledge errors: 1
L block:  keyword 0.636   knowledge 1.000   (stated 0.34)
```

## 1. I fixed Round 08's instrument by breaking it the other way

Round 08's keyword scheme leaked **false positives**: `SSL` matched code 35 but appears all
over curl's descriptions. My fix required each keyword to be **distinguishing** — present in
the target message and absent from all 126 others.

It produced **eight false negatives out of eight misses**:

| errno | I claimed | actual | why it "failed" |
|---|---|---|---|
| EBADE | invalid exchange | Invalid exchange | `exchange` also in EXFULL |
| EBUSY | device or resource busy | Device or resource busy | `busy` also in ETXTBSY |
| ECONNRESET | connection reset by peer | Connection reset by peer | `reset` also in EL3RST, ENETRESET |
| EL3RST | level 3 reset | Level 3 reset | `level 3` also in EL3HLT |
| ELIBEXEC | cannot exec a shared library directly | Cannot exec a shared library directly | `shared library` also in ELIBACC |
| ENOSR | out of streams resources | Out of streams resources | `streams` also in ESTRPIPE |
| ENXIO | no such device or address | No such device or address | `no such device` also in ENODEV |
| EWOULDBLOCK | resource temporarily unavailable | Resource temporarily unavailable | `temporarily unavailable` also in EAGAIN |

Every one is **exactly right**. The uniqueness rule is simply wrong for this surface: errno
messages are a *family* and share vocabulary by design. Demanding a globally unique token is
far stricter than demanding correct knowledge.

> Round 05: fixing selection bias created `pseudoreplication`.
> Round 09: fixing false positives created false negatives.

Same shape, one level down. The relocation pattern applies to **instruments**, not just to
selection. New entry: **`overcorrected-instrument`**.

## 2. The pre-registered test is void, not confirmed — and I want to be careful here

I pre-registered: *the sub-0.5 block scores ≥ 0.70 against a stated ~0.32*, conf 0.65.

- Under keyword scoring: **0.636 → DISCONFIRMED**
- Under knowledge scoring: **1.000 → would confirm emphatically**

**The honest verdict is that the round cannot adjudicate the replication**, because the
instrument the test was registered against turned out to be invalid. I am not going to bank
the reading I prefer.

But the corrected reading isn't a rationalisation, for two specific reasons:

1. **The claim column was committed in `predictions.md` before any message was read.** The
   predictions are fixed; only the *scoring rule* changed.
2. **Knowledge scoring is stricter, not looser.** It requires normalised equality of the whole
   message against substring presence — and it *caught an error keyword scoring had passed*
   (ESTALE, §3). A relaxed standard that rescued my score would be suspect. A tightened one
   that rescues eight items while flagging a ninth is a different animal.

What is genuinely post-hoc is my *decision to score that way*, taken after watching the first
instrument fail. That's worth naming rather than hiding.

## 3. The one real knowledge error

**ESTALE** — I claimed *"stale file handle"*. The actual message is *"Stale **NFS** file
handle"*. Stated at 0.70.

I dropped the qualifier that makes the message specific — a small over-generalisation of the
kind that reads as correct until compared word for word. It **passed** keyword scoring
(`stale` is unique) and **failed** strict scoring, so the two instruments disagree in both
directions: 8 false negatives and 1 false positive between them. Neither is clean, and
"normalised exact match" is itself a choice I made, not a view from nowhere.

## 4. The quota rejected a surface for the first time

The rule selected `dotnet` — on PATH, no SDK, no ground truth. I had **not** declared a
fallback in advance and said so in `predictions.md` rather than presenting the improvised rule
as pre-registered.

Advancing landed on `git`. I enumerated every long option of `git commit`/`git log`, began
assigning confidences, and **every one came out above 0.6** — failing the Round 06 quota. My
own rule says that is the finding, and to move on *before* writing claims. I did.

That's the quota doing the job it was built for: refusing a surface I know too well, before it
could produce another flattering round.

## 5. What reproduces from Round 08

Under the valid instrument, the sub-0.5 block went **11/11** against a stated 0.34 — the same
shape as Round 08's 17/17 against 0.34. Two externally-supplied surfaces, same pattern: **my
low confidence on supplied items tracks retrieval fluency and predicts almost nothing.**

Overall gap under knowledge scoring: **−0.341**. Ninth consecutive negative round.

## Method changes for round 10

1. **Score against the committed claim, not a proxy token.** Keywords were a shortcut and both
   versions of the shortcut failed. The full claim was always the real prediction.
2. **Pre-register the scoring rule as carefully as the predictions.** Two rounds lost to
   instrument design; the instrument now deserves the same scrutiny as the claims.
3. **Declare the fallback selection rule in advance**, so it never has to be improvised again.
4. Keep the quota. It has now rejected a surface, which is worth more than a passing round.

## Taxonomy

- `overcorrected-instrument` — **new.** Fixing a measurement flaw by introducing its mirror
  image. R08 false positives → R09 false negatives.
- `authored-discrimination` — **supported again**, with a mechanism: supplied factual
  enumerations contain no genuinely indeterminate items, so my low confidence on them can only
  mean "unfamiliar."
- `starved-arm` — **avoided before the fact.** The IND/UNF experiment was declared unrunnable
  (32 UNF, 0 IND) rather than run with an empty arm and written up as though it measured
  something.
