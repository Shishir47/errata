# Round 18 — predictions about my own behaviour

**Written before reading the transcript.** Scoring: [`SCORING.md`](../../SCORING.md), ENUM form.

## Why

Round 17 found the only over-confidence in seventeen rounds, and it wasn't in an object-level
claim. It was in my reasoning **about myself**: the "four steps at 95% compound to 81%"
argument, and predictions P1/P2 staked at 0.70 and 0.40 — all wrong, all over-confident.

> On object-level claims I am reliably under-confident. On claims about my own performance I
> am not.

So this round drops facts about the world entirely and asks about **facts about me**, in this
session, measurable from the transcript Claude Code has been writing all along:
`~/.claude/projects/D--/52eb59ce-….jsonl`.

The striking thing I've never measured: my object-level accuracy across 17 rounds is 0.929,
but my *first-try* success rate on shell commands and scripts feels far worse. This session
alone has produced a broken static server (path separators), a missing `python`, a `TZ=` flag
that did nothing, CRLF breaking a parser, `rev` not existing, two mangled heredocs, and an
aggregator that silently skipped a round.

**Contamination, disclosed:** I have seen the file's *size* (3.5M) while checking it exists.
That's mild information about total volume and I have not opened it.

## Items (ENUM, closed sets declared here)

| # | Claim | Buckets | I choose | conf |
|---|---|---|---|---|
| 1 | Total tool calls this session | A <100 · B 100–199 · C 200–299 · D 300+ | **C** | 0.40 |
| 2 | Bash tool calls | A <40 · B 40–79 · C 80–119 · D 120+ | **B** | 0.40 |
| 3 | Share of Bash calls returning an error | A <10% · B 10–19% · C 20–29% · D ≥30% | **B** | 0.35 |
| 4 | Write tool calls | A <20 · B 20–39 · C 40+ | **B** | 0.45 |
| 5 | Edit tool calls | A <15 · B 15–34 · C 35+ | **B** | 0.40 |
| 6 | Bash is the tool with the most error results | true / false | **true** | 0.70 |
| 7 | Total error results across all tools | A <10 · B 10–24 · C 25–49 · D 50+ | **B** | 0.40 |
| 8 | My *overall* first-try error rate exceeds my object-level miss rate (28/396 = 7.1%) | true / false | **true** | 0.80 |

Item 8 is the one that matters. Seventeen rounds say I get 93% of *claims* right. If my
first-try tool success is materially worse, then this project has been measuring the thing I'm
good at and ignoring the thing I'm not.

## Quota

Below 0.5: 6 of 8 = 75% — **PASS**. Below 0.2: **FAIL**, same structural reason as Rounds 12,
14 and 16 (a 4-way ENUM floors honest confidence near 0.25). Declared in advance.

## Pre-registered predictions about the round

> **R1:** at least 2 of the 8 items are wrong. **Conf 0.75.** Seventeen rounds have taught me
> to expect near-perfect scores; I am deliberately betting against that here, because these are
> claims about my own behaviour and Round 17 says that is where I'm weakest.
>
> **R2:** the gap turns **positive** — over-confident — for the first time in 18 rounds.
> **Conf 0.55.**
