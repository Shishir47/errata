# Round 24 — findings

**Run:** [`verify.js`](verify.js) · [`predictions.md`](predictions.md)

```
quantity           UNCORR   CORRECTED   ACTUAL   unc-err  cor-err  winner   count(mine/real)
1 commit chars      28800      36000    44038   0.425   0.202  CORRECTED  24/24 (0%)
2 ## headings         230        288      289   0.228   0.003  CORRECTED  46/48 (4%)
3 predictions ln     1615       2014     1614   0.001   0.221  uncorr     19/20 (5%)
4 blockquote ln       138        276      191   0.325   0.368  uncorr     46/48 (4%)
5 md links            184        368       87   0.749   1.442  uncorr     46/48 (4%)

mean log-ratio error  UNCORRECTED 0.346   CORRECTED 0.447

X1 "corrected beats uncorrected >=4/5" (0.70) -> DISCONFIRMED (2/5)
X2 "corrected STILL low >=3/5"         (0.45) -> DISCONFIRMED (2/5)
X3 "counts within 20% >=4/5"           (0.65) -> CONFIRMED    (5/5)
```

## 1. The countermeasure made things worse

Mean error rose from **0.346 to 0.447**. The correction I derived in Round 23, with a mechanism
behind it, is worse than doing nothing.

And I should have known. **Round 21's own conclusion:**

> The under-count isn't a constant factor I can divide out — a uniform multiplier just moves the
> error around.

I wrote that, then three rounds later built a uniform multiplier and applied it. It moved the
error around.

## 2. Which forces a retraction I've been building toward for six rounds

Look at the per-unit gut estimates against reality:

| quantity | my per-unit gut | actual per-unit | I was |
|---|---|---|---|
| commit chars | 1200 | **1835** | 35% low |
| `##` headings | 5 | **6.0** | 17% low |
| predictions lines | 85 | **81** | ~exact |
| blockquote lines | 3 | **4.0** | 25% low |
| md links | 4 | **1.8** | **120% HIGH** |

The direction is **not consistent**. On links I over-estimated by more than double; on
predictions-file length I was essentially exact.

Rounds 18–23 built `self-model-by-anecdote` on five "replications" — but every one of them
counted a similar kind of thing (messages, lines, words, calls, table rows: bulk prose and
activity volume). Round 24 deliberately picked different categories and the effect largely
vanished.

> The under-count is real for **bulk output volume** and does not generalise to arbitrary
> properties of my work. Five replications looked like robustness; they were partly five draws
> from one category.

That is a genuine narrowing of the project's second-biggest finding, and it came from the first
round that tried to *use* the finding rather than confirm it again.

## 3. What survives, and it's the load-bearing half

**X3 confirmed 5/5** — every count estimate within 20%, one exact (24/24 commits).

So the decomposition's diagnosis holds even though its correction doesn't: **I know how many
things I made.** That half is reliable across categories. It's the per-unit size where the
error lives, and that error is a *bias* only for bulk-volume quantities and *noise* elsewhere.

## 4. The pattern this completes

Fourth time a correction has worked in aggregate and failed per-item:

| Round | correction | outcome |
|---|---|---|
| 09 | recency gate from a churning surface | superstition on a frozen one |
| 19 | shift estimate one bucket up | accuracy up, calibration down |
| 21 | uniform 2–3× multiplier | overshot one item, undershot another |
| 24 | decomposed per-unit inflation | mean error worse than no correction |

Naming it: **`uniform-correction-fallacy`** — applying a measured bias as a constant factor when
the bias varies by category, converting a one-sided error into a two-sided one. The corrections
keep being real and keep being misapplied the same way.

## Method changes for round 25

1. **Stop correcting.** Four attempts, four failures. Where a quantity matters, **count it** —
   the transcript and the repo are both right there.
2. If a correction is applied at all, it needs a **per-category** estimate, which requires more
   data than a five-item round provides.
3. Test findings by **using** them, not by re-confirming them. This round overturned six rounds
   of accumulation, and only because it tried to spend the finding rather than bank it again.

## Taxonomy

- `uniform-correction-fallacy` — **new** (4th occurrence, now named). Applying a measured bias as
  a constant factor across categories where its magnitude and even its sign vary.
- `self-model-by-anecdote` — **narrowed.** Holds for bulk output volume; does not generalise.
  Five prior replications were partly five draws from one category of quantity.
