# Round 06 — the tar (ustar) header format

**Written before running anything.** GNU tar 1.35.

```
rule     : (20260805 + 6) % 11 = 10
SELECTED : tar
```

## What this round is testing

Round 05's lesson: a cross-product removed selection bias but produced **correlated** claims,
inflating 11 real bets into a reported 42. This round picks a **recall-heavy** surface — the
byte layout of a tar header is a pile of arbitrary constants. Knowing `name` is 100 bytes
tells you nothing about `chksum` being 8. No decision procedure generates them.

Three things under test:

**1. `derived` vs `recalled`, calibrated separately.** Five rounds have blended two different
epistemic operations. Every claim below carries a tag.

**2. Internal coherence — a test I've never run.** I state field **sizes** and field
**offsets** independently from memory. Offsets are recoverable from sizes by cumulative sum,
so the two must agree. Whether my memory is *self-consistent* is a different question from
whether it's *correct*, and I don't know the answer.

**3. Effective n, honestly reported.** See the accounting at the bottom. The offsets add
almost no independent evidence and I'm not going to pretend otherwise.

**What would disconfirm the derived-vs-recalled hypothesis?** If both tags show a similar
confidence–accuracy gap. The experiment can fail, which is why it's worth running — unlike
Round 05's, which could only return "helped."

## Block R — field sizes (recalled, arbitrary constants)

| # | Field | Size (bytes) | Conf |
|---|---|---|---|
| R1 | `name` | 100 | 0.92 |
| R2 | `mode` | 8 | 0.88 |
| R3 | `uid` | 8 | 0.88 |
| R4 | `gid` | 8 | 0.88 |
| R5 | `size` | 12 | 0.90 |
| R6 | `mtime` | 12 | 0.88 |
| R7 | `chksum` | 8 | 0.85 |
| R8 | `typeflag` | 1 | 0.92 |
| R9 | `linkname` | 100 | 0.88 |
| R10 | `magic` | 6 | 0.82 |
| R11 | `version` | 2 | 0.82 |
| R12 | `uname` | 32 | 0.85 |
| R13 | `gname` | 32 | 0.85 |
| R14 | `devmajor` | 8 | 0.80 |
| R15 | `devminor` | 8 | 0.80 |
| R16 | `prefix` | 155 | 0.75 |

## Block O — field offsets (stated from memory, *not* computed)

Written down as remembered, before checking them against Block R.

| # | Field | Offset | Conf | Tag |
|---|---|---|---|---|
| O1 | `name` | 0 | 0.97 | recalled |
| O2 | `mode` | 100 | 0.88 | recalled |
| O3 | `uid` | 108 | 0.85 | recalled |
| O4 | `gid` | 116 | 0.85 | recalled |
| O5 | `size` | 124 | 0.88 | recalled |
| O6 | `mtime` | 136 | 0.85 | recalled |
| O7 | `chksum` | 148 | 0.85 | recalled |
| O8 | `typeflag` | 156 | 0.88 | recalled |
| O9 | `linkname` | 157 | 0.85 | recalled |
| O10 | `magic` | 257 | 0.88 | recalled |
| O11 | `version` | 263 | 0.82 | recalled |
| O12 | `uname` | 265 | 0.80 | recalled |
| O13 | `gname` | 297 | 0.78 | recalled |
| O14 | `devmajor` | 329 | 0.75 | recalled |
| O15 | `devminor` | 337 | 0.75 | recalled |
| O16 | `prefix` | 345 | 0.72 | recalled |

**Coherence check (declared now, scored later):** these should equal the cumulative sum of
Block R, with `prefix` ending at 500 and 12 bytes of padding to 512.

**Disclosure:** I wrote Block O from memory, then noticed while drafting that it *is*
consistent with Block R. So the coherence test is likely to pass trivially, and I'm recording
that rather than presenting a passed test as a discovery. It still earns its place if any
size turns out wrong — coherent-but-wrong would mean I store a shifted table, incoherent
would mean I store the two independently.

## Block F — format facts (recalled, arbitrary and independent)

| # | Claim | Conf | Tag |
|---|---|---|---|
| F1 | Block size is 512 bytes | 0.97 | recalled |
| F2 | GNU tar's **default** format writes magic+version as `"ustar  \0"` — `ustar`, two spaces, NUL — *not* POSIX `"ustar\0" + "00"` | 0.65 | recalled |
| F3 | `typeflag` for a regular file is ASCII `'0'` | 0.85 | recalled |
| F4 | `size` is octal ASCII, 11 digits + NUL — a 3-byte file reads `00000000003` | 0.85 | recalled |
| F5 | `mode` is octal ASCII, 7 digits + NUL | 0.78 | recalled |
| F6 | `chksum` is 6 octal digits, then NUL, then space | 0.70 | recalled |
| F7 | The checksum is computed with the `chksum` field treated as **8 spaces** | 0.85 | recalled |
| F8 | The checksum is a plain unsigned sum of all 512 header bytes | 0.85 | recalled |
| F9 | Archive ends with **two** 512-byte zero blocks | 0.90 | recalled |
| F10 | Default blocking factor is 20, so archive size is a multiple of 10240 | 0.80 | recalled |
| F11 | `linkname` is all-NUL for a regular file | 0.90 | derived |
| F12 | `prefix` is all-NUL for a short filename | 0.85 | derived |
| F13 | `uname` is non-empty (tar records the owner name) | 0.62 | recalled |

## Effective n — the Round 05 discipline

| Block | Items | Independent bets | Why |
|---|---|---|---|
| R (sizes) | 16 | ~15 | arbitrary constants; one degree of freedom removed by summing to 500 |
| O (offsets) | 16 | **~0** | recoverable from R by cumulative sum |
| F (format) | 13 | ~11 | F11/F12 follow from the record type; rest independent |
| coherence | 1 | ~0 | a consequence of R and O |
| **total** | **46** | **≈ 26** |

**I will report accuracy against 46 and evidence against ~26.** If Block O scores well, that
is not 16 more facts confirmed — it is one table recalled once and read out twice.
