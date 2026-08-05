# Round 08 — curl exit codes

**Written before reading a single description.** curl 8.7.1 (Schannel).

```
rule     : (20260805 + 8) % 11 = 1  ->  curl
items    : EXIT CODES section of `curl --manual`, sorted, drop 0, take every 3rd
selected : 1 4 7 10 13 16 19 23 27 31 35 38 42 47 52 55 59 63 66 69 72 77 80 84 87 90 93 96 99
```

## What this round fixes

Round 07's quota worked — 6 misses in 32 items — but left one hole, which I flagged at the
time: **nothing constrained how I picked the *confident* items**, so the high block going
21/21 proved very little. I wrote both blocks.

Here I write **neither**. The item set is the enumeration plus a fixed rule. My only input is
an honest confidence per item and a predicted keyword.

**The result of taking the pen away:** 17 of 29 items land below 0.5. Not because I engineered
difficulty, but because the enumeration handed me codes I don't know. Compare Round 06, where
I *chose* the items and the minimum confidence I could manufacture was 0.62.

Ground truth is curl's own manual, which is external to me and was not read before writing
this file — only the *numbers* were extracted.

## Scoring

For each code I commit a keyword that must appear (case-insensitive) in curl's official
description. Where a concept could reasonably be worded several ways I commit **alternatives
in advance**; any one matching counts. That's a fairness allowance, not a loophole — if I
don't know what a code means I can't produce a matching keyword at all.

| code | I claim it means | keyword(s) that must appear | conf |
|---|---|---|---|
| 1 | unsupported protocol | `protocol` | 0.85 |
| 4 | feature/option not compiled in | `built`, `not enabled`, `feature` | 0.55 |
| 7 | failed to connect to host | `connect` | 0.90 |
| 10 | FTP accept failed | `accept` | 0.45 |
| 13 | FTP weird PASV reply | `PASV` | 0.40 |
| 16 | HTTP/2 framing/protocol error | `HTTP/2`, `HTTP2` | 0.50 |
| 19 | FTP couldn't RETR the file | `RETR`, `download` | 0.40 |
| 23 | write error | `write` | 0.80 |
| 27 | out of memory | `memory` | 0.70 |
| 31 | FTP couldn't use REST | `REST` | 0.35 |
| 35 | SSL connect error | `SSL`, `TLS` | 0.65 |
| 38 | LDAP bind failed | `LDAP`, `bind` | 0.45 |
| 42 | aborted by callback | `callback`, `abort` | 0.50 |
| 47 | too many redirects | `redirect` | 0.72 |
| 52 | server returned nothing | `empty`, `nothing` | 0.60 |
| 55 | failed sending network data | `send` | 0.55 |
| 59 | couldn't use the specified cipher | `cipher` | 0.45 |
| 63 | maximum file size exceeded | `size` | 0.45 |
| 66 | failed to initialise SSL engine | `engine` | 0.35 |
| 69 | TFTP permission problem | `permission`, `TFTP` | 0.30 |
| 72 | TFTP illegal reply / unknown transfer ID | `TFTP`, `transfer id` | 0.30 |
| 77 | problem reading the SSL CA certificate | `CA cert`, `CA ` | 0.50 |
| 80 | failed to shut down the SSL connection | `shut`, `SSL` | 0.35 |
| 84 | FTP PRET command failed | `PRET` | 0.25 |
| 87 | unable to parse the FTP file list | `list`, `parse` | 0.25 |
| 90 | pinned public key mismatch | `pinned`, `public key` | 0.35 |
| 93 | API function called from inside a callback | `callback` | 0.20 |
| 96 | QUIC connection error | `QUIC` | 0.30 |
| 99 | unrecoverable poll/select error | `poll`, `select` | **0.15** |

## Blocks, declared in advance

Round 07's finding (`scale-not-rank`) was that my errors sort perfectly by confidence, so
each round now reports **discrimination** and **calibration** separately. The split is at 0.5,
fixed before scoring:

- **L** = conf < 0.5 (17 items)
- **H** = conf ≥ 0.5 (12 items)

**Prediction, scored below:** every miss lands in L, and H goes 12/12 — the Round 07 pattern
repeating. Confidence **0.45**. I expect at least one H miss this time, because unlike Round
07 I did not choose the H items.

**What would disconfirm the round's design?** If the enumeration produced a confidence spread
no wider than my hand-picked rounds. It didn't — min 0.15, max 0.90, 59% below 0.5.
