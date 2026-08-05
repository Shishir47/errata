# Round 09 — errno names (replication of Round 08)

**Written before reading a single message.** perl 5.38.2, Windows.

## Selection, including two honest deviations

```
rule     : (20260805 + 9) % 11 = 2  ->  dotnet
```

**`dotnet` was unusable** — on PATH but with no SDK installed, so it can supply no ground
truth. I had not declared a fallback in advance. Declaring it now, *after* seeing the failure,
which is worth flagging rather than presenting as pre-registered: **if the selected tool
cannot supply ground truth, advance one index.**

→ index 3 = **`git`**. I enumerated all long options of `git commit` / `git log` and started
assigning confidences — and every one landed above 0.6. **That surface fails the Round 06
quota** (≥25% of items below 0.5). My own rule says what to do:

> If a surface can't produce them, that is the finding — I picked something I know too well,
> and should move on before writing a claim.

So I moved on before writing claims. **First time the quota has rejected a surface**, which
is the mechanism working as designed rather than a mishap.

→ advancing past already-used surfaces → **`perl`**.

```
items : sorted keys of %! (127 errno names), take every 4th
        E2BIG EADV EBADE EBADR EBUSY ECHRNG ECONNRESET EDOM EFAULT EHOSTUNREACH
        EINTR EISDIR EL3RST ELIBEXEC ELOOP EMULTIHOP ENETUNREACH ENOBUFS ENOENT
        ENOMEDIUM ENOPKG ENOSR ENOTCONN ENOTSOCK ENXIO EPERM EPROTO EREMCHG
        ESOCKTNOSUPPORT ESTALE ETOOMANYREFS EWOULDBLOCK        (32 items)
truth : the system's own strerror text, read only after this file was written
```

## The scoring fix

Round 08's keyword scheme leaked: `SSL` matched code 35 but appears in many descriptions.
Here a keyword only counts if it is **distinguishing** — it must appear in the target errno's
message **and in none of the other 126**. `verify.js` checks that automatically and reports
any keyword that fails uniqueness.

Trivial baseline is effectively **zero**: no guessing strategy produces "Invalid exchange."
That was the other thing Round 08's design lacked.

## The IND/UNF experiment cannot run here — and that's informative

I intended to tag each item *indeterminate* (the fact is genuinely arbitrary) versus
*unfamiliar* (a determinate fact that doesn't feel available), and calibrate separately.

**Every item on this list is UNF.** Each errno has one correct message; none is indeterminate.

That isn't a defect of the list — it's a property of supplied factual enumerations in
general. **Genuine indeterminacy is something I go looking for when I author items; it does
not occur naturally in a list of facts.** Which is a mechanism for `authored-discrimination`:
the reason my self-authored rounds calibrate well is that I stock them with IND items, and
supplied rounds contain none.

Rather than run a 32-vs-0 comparison and dress it up, I'm declaring the experiment
unrunnable here. That's the `starved-arm` lesson applied before the fact instead of after.

## Pre-registered replication test

Round 08: low-confidence block went 17/17 against a stated 0.34.

> **Prediction:** the sub-0.5 block scores **≥ 0.70** against a stated ~0.32. **Conf 0.65.**
>
> **Disconfirming condition:** if the sub-0.5 block scores near its stated 0.32, Round 08 was
> surface-specific and `authored-discrimination` needs withdrawing.

## Claims

| errno | I claim the message says | distinguishing keyword | conf |
|---|---|---|---|
| E2BIG | argument list too long | `argument list` | 0.80 |
| EADV | advertise error | `advertise` | 0.35 |
| EBADE | invalid exchange | `exchange` | 0.30 |
| EBADR | invalid request descriptor | `request descriptor` | **0.18** |
| EBUSY | device or resource busy | `busy` | 0.88 |
| ECHRNG | channel number out of range | `channel` | 0.40 |
| ECONNRESET | connection reset by peer | `reset` | 0.90 |
| EDOM | numerical argument out of domain | `domain` | 0.80 |
| EFAULT | bad address | `bad address` | 0.82 |
| EHOSTUNREACH | no route to host | `route to host` | 0.75 |
| EINTR | interrupted system call | `interrupted` | 0.88 |
| EISDIR | is a directory | `is a directory` | 0.88 |
| EL3RST | level 3 reset | `level 3` | 0.35 |
| ELIBEXEC | cannot exec a shared library directly | `shared library` | 0.30 |
| ELOOP | too many levels of symbolic links | `symbolic links` | 0.82 |
| EMULTIHOP | multihop attempted | `multihop` | 0.45 |
| ENETUNREACH | network is unreachable | `network is unreachable` | 0.85 |
| ENOBUFS | no buffer space available | `buffer space` | 0.80 |
| ENOENT | no such file or directory | `no such file` | 0.95 |
| ENOMEDIUM | no medium found | `medium` | 0.55 |
| ENOPKG | package not installed | `package` | 0.35 |
| ENOSR | out of streams resources | `streams` | 0.35 |
| ENOTCONN | transport endpoint is not connected | `not connected` | 0.75 |
| ENOTSOCK | socket operation on non-socket | `non-socket` | 0.72 |
| ENXIO | no such device or address | `no such device` | 0.70 |
| EPERM | operation not permitted | `not permitted` | 0.92 |
| EPROTO | protocol error | `protocol error` | 0.65 |
| EREMCHG | remote address changed | `remote address` | 0.30 |
| ESOCKTNOSUPPORT | socket type not supported | `socket type` | 0.60 |
| ESTALE | stale file handle | `stale` | 0.70 |
| ETOOMANYREFS | too many references, cannot splice | `references` | 0.40 |
| EWOULDBLOCK | resource temporarily unavailable | `temporarily unavailable` | 0.65 |

Quota compliance is computed by `verify.js`, not counted here.
