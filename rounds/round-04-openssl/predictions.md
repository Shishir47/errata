# Round 04 — the `openssl` CLI surface

**Written before running anything.** No `--help`, no docs, no introspection.

## Pool selection — leaving JavaScript

Round 03 fixed *module* selection but I still chose the **pool** (Node builtins). Three
rounds, one ecosystem. This round the candidate list was fixed in advance, filtered to
what's actually on PATH, and indexed by date seed:

```
candidates: awk cmake curl dotnet ffmpeg gcc git go java jq openssl perl php
            powershell python rustc sed sqlite3 ruby tar        (node/npm excluded)
pool (11) : awk curl dotnet git openssl perl powershell python sed sqlite3 tar
seed      : 20260805        index: 20260805 % 11 = 4
SELECTED  : openssl
```

## Two method changes under test

**1. Present-tense rule (`tense-laundering` countermeasure).** Every recall below is written
as a claim about *now* — "X **is** present" — never "X existed." Where writing the present
tense feels wrong, that discomfort is recorded as information rather than smoothed over.

**2. Provenance, done properly.** Round 03's provenance field was decoration — I tagged one
item. Here every **[a]** carries *both* numbers: the gut confidence and the adjusted one.
Scoring both under Brier settles whether adjusting to prior rounds' lessons actually helps
or is just `correction-overshoot` wearing rigor's clothes.

---

## A. Version

| # | Claim (present tense) | Conf | Tag |
|---|---|---|---|
| V1 | `openssl version` output starts with `OpenSSL 3.` | 0.85 | [g] |

## B. Subcommand membership

`openssl list -commands` enumerates the surface. Scored as a set (recall vs precision), and
individually for the interesting rows.

**Full predicted set** (52): `asn1parse ca ciphers cmp cms crl crl2pkcs7 dgst dhparam dsa
dsaparam ec ecparam enc engine errstr fipsinstall gendsa genpkey genrsa help info kdf list
mac nseq ocsp passwd pkcs12 pkcs7 pkcs8 pkey pkeyparam pkeyutl prime rand rehash req rsa
rsautl s_client s_server s_time sess_id smime speed spkac srp storeutl ts verify version
x509`

**Confidence the set is exactly right: 0.05 [g].** Honest — I expect to leak in both
directions on a surface this crufty.

### The `tidy-world` rows — legacy things I'd bet were cleaned up

Round 03's lesson: this fires only when inference contradicts a **live** recall. So each row
below states whether recall is live or silent, in present tense.

| # | Item | Recall (present tense) | Commit | Gut | Adj | Tag |
|---|---|---|---|---|---|---|
| B1 | `engine` | live — I know it's still a subcommand despite providers replacing it in 3.0 | present | 0.60 | **0.78** | [a] |
| B2 | `rsautl` | live — deprecated in favour of `pkeyutl`, but shipping | present | 0.55 | **0.72** | [a] |
| B3 | `genrsa` | live — superseded by `genpkey`, still there | present | 0.70 | **0.85** | [a] |
| B4 | `spkac` | live but faint — Netscape-era, I still expect it present | present | 0.50 | **0.65** | [a] |
| B5 | `nseq` | live but faint — Netscape sequence, obscure | present | 0.48 | **0.62** | [a] |
| B6 | `srp` | live — but I believe this one *was* actually removed in 3.0 | **absent** | 0.55 | 0.55 | [g] |
| B7 | `dsaparam` | live | present | 0.80 | 0.80 | [g] |

B6 is the control: the one legacy item I'm committing to *absent* despite the adjustment
pressure. If everything else is present and B6 is too, that's overshoot being punished
correctly rather than a blanket "legacy survives" rule.

### The `recency-blind` rows — things possibly added after my horizon

Round 03 missed `tls.getCACertificates`: not forgotten, never known. So this asks the
separate question — what may have been **added** here that I wouldn't know?

| # | Item | Claim | Conf | Tag |
|---|---|---|---|---|
| B8 | `kdf` | present (added in 3.0) | 0.72 | [g] |
| B9 | `mac` | present (added in 3.0) | 0.72 | [g] |
| B10 | `storeutl` | present (added in 3.0) | 0.68 | [g] |
| B11 | `fipsinstall` | present (added in 3.0) | 0.70 | [g] |
| B12 | `info` | present (added in 3.0) | 0.65 | [g] |
| B13 | `cmp` | present (added in 3.0) | 0.60 | [g] |
| B14 | At least one command exists that is **not** in my predicted set | 0.60 | [a] (gut 0.40) |

B14 is the direct `recency-blind` probe. My gut says my list is complete; Round 03 says my
lists are complete *as of a date*. Adjusted upward deliberately.

## C. Digest test vectors — external ground truth

All against the 3-byte input `abc` (no trailing newline). These are canonical vectors; I'm
claiming exact hex.

| # | Claim | Conf | Tag |
|---|---|---|---|
| C1 | SHA-256 = `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad` | 0.95 | [g] |
| C2 | MD5 = `900150983cd24fb0d6963f7d28e17f72` | 0.92 | [g] |
| C3 | SHA-1 = `a9993e364706816aba3e25717850c26c9cd0d89d` | 0.93 | [g] |
| C4 | SHA-512 = `ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f` | 0.80 | [g] |
| C5 | SHA3-256 = `3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532` | 0.65 | [g] |
| C6 | `openssl base64` of `abc` is `YWJj` | 0.97 | [g] |

## D. Output-format behaviour

| # | Claim | Conf | Tag |
|---|---|---|---|
| D1 | `openssl dgst -sha256` on stdin labels the line `SHA2-256(stdin)=` — 3.x renamed it from `SHA256(...)` | 0.55 | [g] |
| D2 | `openssl dgst -sha256 -r` emits coreutils style: hex, two spaces, then `*stdin` | 0.55 | [g] |
| D3 | `openssl prime 17` reports it prime, and prints the input in **hex** (`11`) | 0.60 | [g] |
| D4 | `openssl rand -hex 8` emits exactly 16 hex chars + newline | 0.88 | [g] |
| D5 | An unknown subcommand exits **non-zero** and mentions `Invalid command` | 0.70 | [g] |
| D6 | `openssl ciphers` on one line, colon-separated, exit 0 | 0.75 | [g] |

---

**Items: 1 version + 1 set + 14 membership + 6 digest + 6 format = 28.**
**[a] tags: 7 of 28 = 25%** — the target, with gut and adjusted both recorded so the
adjustment itself is scored.

Mean stated confidence ≈ 0.70. This is the furthest from my home ground yet; a high score
here would be the surprise.
