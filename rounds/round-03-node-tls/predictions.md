# Round 03 — the `node:tls` surface

**Written before running anything.** No introspection of the module, no docs.

## Surface selection — not mine

Round 02's unfixed flaw: I fixed *item* selection and then hand-picked a comfortable
*surface* (`node:path`, which I use weekly). This round the rule was committed first and the
target fell out of it:

```
pool  = module.builtinModules, minus internals (_*), minus submodule paths (a/b),
        minus `sys`, keeping only modules with >= 10 enumerable exports, sorted
seed  = local date as YYYYMMDD
index = seed % pool.length
```

```
date stamp : 20260805      pool size : 26
index      : 20260805 % 26 = 19
SELECTED   : node:tls
```

The selector prints **only the chosen name** — it never emits any module's exports, so
nothing leaked into this file. The machine clock reads 2026-08-05; that's the seed on
record.

I would not have chosen `node:tls`. That is the entire point.

## Confidence provenance

Round 02 couldn't separate genuine calibration from `correction-overshoot` — I may simply
have depressed every number after Round 01's criticism. So each confidence is now tagged:

- **[g]** gut — the number I'd have written with no memory of prior rounds
- **[a]** adjusted — I consciously moved it because of a previous round's lesson

## A. The complete export set

I claim `Object.keys(require('node:tls'))` is **exactly**:

```
connect, createServer, createSecureContext, checkServerIdentity, getCiphers,
rootCertificates, DEFAULT_CIPHERS, DEFAULT_ECDH_CURVE, DEFAULT_MAX_VERSION,
DEFAULT_MIN_VERSION, CLIENT_RENEG_LIMIT, CLIENT_RENEG_WINDOW,
TLSSocket, Server, SecureContext, createSecurePair, convertALPNProtocols
```

**17 keys. Confidence exactly right: 0.10 [g].** I expect to leak on recall here — that's
an honest 1-in-10, not modesty. Scored separately: **missed** (recall failure) vs
**invented** (fabrication).

## B. The `tidy-world` probe — recall vs inference, declared in advance

Yesterday's failure mode: overriding a correct memory with a story that the world is
tidier than it is. This section makes the conflict explicit *before* the answer is known,
and scores the two drivers separately.

| # | Item | Recall says | Inference says | I commit to | Conf | Tag |
|---|---|---|---|---|---|---|
| T1 | `createSecurePair` | existed, long deprecated (DEP0064) | removed by v22 — nobody keeps this | **absent** | 0.55 | [g] |
| T2 | `SLAB_BUFFER_SIZE` | legacy constant I've seen | removed years ago | **absent** | 0.70 | [g] |
| T3 | `CryptoStream` | old streaming wrapper | long gone | **absent** | 0.78 | [g] |
| T4 | `SecurePair` (class) | paired with createSecurePair | gone with it | **absent** | 0.65 | [g] |
| T5 | `convertALPNProtocols` | I believe it *is* exported | looks internal, should be private | **present** | 0.58 | [a] |
| T6 | `createConnection` as alias for `connect` | faint, probably confusing with `net` | tls has no such alias | **absent** | 0.62 | [g] |

T5 is tagged **[a]** and I want that on the record: my gut said "internal, surely not
exported," and I flipped it *because of yesterday*. If T5 is right, I can't tell whether
that's a repaired instinct or overshoot that happened to land. If T1–T4 come back
**present**, `tidy-world` reproduces and the countermeasure did not generalize.

## C. Arity

| Function | Predicted `.length` | Conf | Tag |
|---|---|---|---|
| `connect` | 0 (variadic `...args`) | 0.55 | [g] |
| `createServer` | 2 | 0.70 | [g] |
| `createSecureContext` | 1 | 0.72 | [g] |
| `checkServerIdentity` | 2 | 0.80 | [g] |
| `getCiphers` | 0 | 0.85 | [g] |

## D. Constants

| # | Claim | Conf | Tag |
|---|---|---|---|
| D1 | `DEFAULT_MIN_VERSION === 'TLSv1.2'` | 0.85 | [g] |
| D2 | `DEFAULT_MAX_VERSION === 'TLSv1.3'` | 0.88 | [g] |
| D3 | `DEFAULT_ECDH_CURVE === 'auto'` | 0.80 | [g] |
| D4 | `CLIENT_RENEG_LIMIT === 3` | 0.75 | [g] |
| D5 | `CLIENT_RENEG_WINDOW === 600` | 0.72 | [g] |
| D6 | `typeof DEFAULT_CIPHERS === 'string'` and it contains `'AES256-GCM'` (uppercase OpenSSL style) | 0.60 | [g] |

## E. Types and behaviour

| # | Claim | Conf | Tag |
|---|---|---|---|
| E1 | `typeof tls.TLSSocket === 'function'` (class) | 0.92 | [g] |
| E2 | `typeof tls.Server === 'function'` | 0.88 | [g] |
| E3 | `Array.isArray(rootCertificates)` and `length > 100` | 0.80 | [g] |
| E4 | every entry of `rootCertificates` starts with `'-----BEGIN CERTIFICATE-----'` | 0.85 | [g] |
| E5 | `getCiphers()` returns an array of **lowercase** strings | 0.75 | [g] |
| E6 | `getCiphers()` includes `'aes256-sha'` | 0.62 | [g] |
| E7 | `tls.Server.prototype instanceof require('net').Server` | 0.80 | [g] |
| E8 | `tls.TLSSocket.prototype instanceof require('net').Socket` | 0.85 | [g] |
| E9 | `typeof tls.SecureContext === 'function'` | 0.70 | [g] |
| E10 | `createServer()` with no args returns a `tls.Server` without throwing | 0.72 | [g] |

---

**Items: 1 set + 6 tidy-world + 5 arity + 6 constants + 10 behaviour = 28.**
Mean stated confidence ≈ 0.72 — genuinely lower than Round 02's 0.80, because this is a
module I don't reach for. If the surface-selection fix worked, this round should hurt.
