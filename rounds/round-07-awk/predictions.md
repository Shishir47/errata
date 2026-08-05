# Round 07 — awk semantics, under the confidence quota

**Written before running anything** — including `awk --version`. Which awk this is (gawk,
mawk, busybox, one-true-awk) is claim **H1**, not background knowledge.

```
rule     : (20260805 + 7) % 11 = 0
SELECTED : awk
```

## The quota

Round 06's finding was `comfortable-difficulty`: six rounds, 6 misses in 201 items, and a
minimum stated confidence of 0.62 in a round I had built to be hard. Selection bias, chased
out of items, modules, ecosystems and claims, had reappeared as **difficulty**.

The rule from that round, enforced here:

> **≥25% of items stated below 0.5 confidence, and at least one below 0.2.**

Compliance is **computed by `verify.js`**, not counted by me in prose — that's the
`unverified-narration` countermeasure from the synthesis, where I twice typed a figure my own
scripts contradicted.

This round is a direct test of synthesis prediction **P2**: *Round 07's overall accuracy falls
below 0.90 — the first time since Round 04* (0.65).

## Block L — genuinely uncertain (target band)

These are claims I would not bet on. Several are places where awk implementations diverge, or
where I know a rule exists and can't recall which way it cuts.

| # | Claim | Conf |
|---|---|---|
| L1 | `BEGIN{a["1"];a["2"];a["3"];a["x"]; for(k in a) printf "%s ",k}` prints exactly `1 2 3 x ` | **0.15** |
| L2 | `substr("hello",1.5,2)` is `el` — the start index **rounds** to 2 rather than truncating | 0.35 |
| L3 | `index("abc","")` is `0` | 0.40 |
| L4 | `s="abc"; n=gsub(/x*/,"-",s)` gives `s="-a-b-c-"`, `n=4` — the empty pattern matches at every position | 0.42 |
| L5 | `BEGIN{print 1/0}` is a **fatal error** with a non-zero exit status (not `inf`) | 0.45 |
| L6 | `substr("hello",0,2)` is `h` — positions below 1 consume length | 0.40 |
| L7 | `printf "%c","65"` prints `6` — a string argument yields its first character | 0.42 |
| L8 | `BEGIN{print srand()}` prints `0` on the first call | 0.35 |
| L9 | `length(A)` on an **array** works and returns the element count | 0.48 |
| L10 | `print length("héllo")` is `5` — the build is UTF-8 aware, not byte-counting | 0.45 |
| L11 | `print 2^53` is `9007199254740992` — integral values print exactly, not through `OFMT` | 0.45 |

## Block H — the rest

| # | Claim | Conf |
|---|---|---|
| H1 | This awk is **GNU Awk (gawk)** | 0.60 |
| H2 | `BEGIN{exit 3}` yields exit status `3` | 0.85 |
| H3 | `length(12345)` is `5` — the number is converted to a string first | 0.85 |
| H4 | `split("a:b:c",A,":")` returns `3` | 0.92 |
| H5 | `print x+0` on an uninitialised variable is `0` | 0.92 |
| H6 | `print (x=="")` on an uninitialised variable is `1` | 0.88 |
| H7 | `print ("10" < "9")` is `1` — string literals compare as strings | 0.80 |
| H8 | `print (0.1+0.2==0.3)` is `0` | 0.88 |
| H9 | `print OFMT` is `%.6g` | 0.72 |
| H10 | `print CONVFMT` is `%.6g` | 0.70 |
| H11 | `print 3.14159265` is `3.14159` | 0.75 |
| H12 | `toupper("abc1")` is `ABC1` | 0.95 |
| H13 | `substr("hello",2)` is `ello` | 0.92 |
| H14 | `substr("hello",2,3)` is `ell` | 0.92 |
| H15 | `$0="a b c"; print NF` is `3` | 0.90 |
| H16 | `BEGIN{print NR}` is `0` | 0.90 |
| H17 | `substr("hello",2,100)` is `ello` | 0.90 |
| H18 | `s="hello"; print sub(/l/,"L",s), s` is `1 heLlo` | 0.85 |
| H19 | `print 10%3` is `1` | 0.92 |
| H20 | `print 2^10` is `1024` | 0.90 |
| H21 | `print -0` is `0`, not `-0` | 0.70 |

---

## Independence

Each item is a separate awk invocation testing a distinct behaviour, so `pseudoreplication`
should be minimal — but not zero. **H1 is upstream of much of Block L:** if this isn't gawk,
L5, L9 and L10 could all fall together. That's roughly one shared dependency across three
items, and `verify.js` reports the sub-scores separately so the correlation is visible rather
than buried.

**What would disconfirm the quota's value?** If the sub-0.5 band scores near 1.0, the quota
didn't find hard questions — it just found questions I *label* as hard, which would be
`comfortable-difficulty` surviving one level further up, in the confidences rather than the
claims.
