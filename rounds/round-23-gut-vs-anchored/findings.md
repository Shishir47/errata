# Round 23 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
quantity              GUT      ANCHORED   ACTUAL    gut-err  anch-err  winner
1 verify.js lines       1200      1805      2187   0.600    0.192   ANCHORED
2 findings words       12000     14000     17599   0.383    0.229   ANCHORED
3 code fences             60       100       158   0.968    0.457   ANCHORED
4 total .md lines       5500      5200      5147   0.066    0.010   ANCHORED
5 table rows             250       185       705   1.037    1.338   gut

mean log-ratio error   GUT 0.611   ANCHORED 0.445

W1 "anchored beats gut on >=4/5" (0.65) -> CONFIRMED (4/5)
W2 "gut low on >=4/5"            (0.70) -> CONFIRMED (4/5)
W3 "anchored ALSO low on >=3/5"  (0.55) -> CONFIRMED (4/5)
```

## 1. Reasoning helps — and doesn't fix it

Anchored arithmetic beat gut on 4 of 5 and cut mean log-ratio error by **27%**. So explicit
reasoning is genuinely better than intuition here.

But **W3 is the result.** The anchored estimates were low on 4 of 5 too — the *same direction*,
just less far. Explicit arithmetic didn't correct the bias; it **laundered it through a
multiplication** and produced a smaller error of the same sign.

> The bias isn't intuition-versus-reasoning. It's in the **inputs to both**. My anchors came out
> of the same under-counting well as my gut.

That answers the question Round 22 left open — why awareness doesn't transfer. Knowing I
under-count doesn't help, because the correction has to be applied to numbers I generate, and
those are already low before I start multiplying them.

## 2. And the localisation is sharper than I expected

Compare the two halves of each anchor:

| anchor | unit **count** assumed | actual | per-unit **size** assumed | actual |
|---|---|---|---|---|
| verify.js lines | 19 files | **19** ✓ | ~95 lines | **115** |
| findings words | 20 files | **22** | ~700 words | **800** |

**My counts were nearly exact — one of them perfect.** The per-unit sizes were all low.

> I know how many things I made. I underestimate how big each one is.

That is a much more precise statement of `self-model-by-anecdote` than four rounds of bucket
estimates produced, and it fell out of separating the two factors rather than estimating the
product.

## 3. The one gut win is the most instructive miss

Table rows: gut 250, anchored **185**, actual **705**.

The only quantity where anchoring made things *worse*, and both estimates were low by ~3–4×. My
anchor assumed ~5 table rows per findings file. The truth is more than triple that — I have been
writing far more tables than I realised, in a project whose whole output is tables.

Same shape as §2, at its extreme: the unit count was fine, the per-unit rate was badly wrong,
and being *more* systematic about a wrong rate made the estimate worse, not better.

## 4. What this means for the countermeasure

Round 19's `half-applied-correction` said move the confidence with the estimate. Round 20 said
correct by multiples. Round 21 showed a uniform multiplier just moves the error around. Now:

**Correct the per-unit rate, not the total.** When I estimate my own output, decompose into
count × size, trust the count, and multiply the size by ~1.2–3× depending on how structural the
unit is. That's a countermeasure with a mechanism behind it rather than a fudge factor.

## Method changes for round 24

1. **Always decompose self-estimates into count × per-unit size.** The error lives entirely in
   the second factor.
2. Test the decomposed correction forward: estimate a new quantity both ways and see whether
   inflating only the per-unit rate lands it.
3. Note that anchoring made one estimate *worse* — being systematic about a wrong rate amplifies
   it. Systematicity is not safety.

## Taxonomy

- `self-model-by-anecdote` — **fifth replication, and now localised.** The under-count is not in
  how many things I remember making; it's in how big I think each one is. Explicit anchored
  arithmetic reduces the error 27% without changing its sign, because the anchors carry the same
  bias.
