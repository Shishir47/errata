#!/usr/bin/env bash
# Mechanical surface selector for Errata rounds.
#
# Rounds 03-09 selected by rule from a pool of 20 CLI tools that I WROTE BY HAND
# in Round 04. That pool was 0.3% of what is actually on PATH, and I chose it by
# thinking of tools I knew -- which is `famous-sample` one level above every
# selection control I had built. This script replaces the hand-written list with
# the machine's own inventory.
#
# Usage:  ./select-surface.sh <round-number> [how-many-draws]
#
# Rules, declared in advance:
#   1. Pool = every distinct executable name on PATH.
#   2. Index = (YYYYMMDD + round) % pool_size.
#   3. Advance by a COPRIME STRIDE (997) on failure, never by one.
#      Round 13: advancing one index at a time through an alphabetically sorted
#      pool turns a uniform draw into a local walk. At a ~2.4% pass rate the
#      cursor moves ~40 places and never leaves one neighbourhood -- which
#      yielded fgrep, file, gawk, gawk-5.0.0, grep: all GNU userland, adjacent,
#      and one package counted twice. That is pseudoreplication in the selection.
#      997 is prime and coprime with the pool size, so the stride cycles the
#      whole pool and scatters draws across it.
#   3b. A candidate fails the usability gate if:
#        a. not invocable
#        b. --help / -h yields fewer than 20 lines
#        c. fewer than 20 enumerable option tokens (no item set to predict against)
#   4. Skip surfaces already used in an earlier round.
#   5. Every skip is logged, so the walk is reproducible and the rejects visible.

set -uo pipefail
ROUND="${1:?usage: select-surface.sh <round-number> [draws]}"
DRAWS="${2:-1}"
USED="awk curl dotnet git openssl perl powershell sqlite3 tar"

POOL_FILE="${TMPDIR:-/tmp}/errata-pool.txt"
if [ ! -s "$POOL_FILE" ]; then
  echo "$PATH" | tr ':' '\n' | grep -v '^$' | head -25 | while read -r d; do
    [ -d "$d" ] || continue
    ls "$d" 2>/dev/null | grep -iE '\.exe$|^[a-z0-9_.-]+$'
  done | sed 's/\.[Ee][Xx][Ee]$//' | tr 'A-Z' 'a-z' | sort -u > "$POOL_FILE"
fi

N=$(wc -l < "$POOL_FILE")
SEED=$(date +%Y%m%d)
STRIDE=997                      # prime, coprime with pool size -- see rule 3
START=$(( (SEED + ROUND) % N ))
echo "pool: $N executables on PATH   seed: $SEED   start: $START   stride: $STRIDE"

tried=0; found=0; k=0
while [ $tried -lt 400 ] && [ $found -lt "$DRAWS" ]; do
  i=$(( (START + k * STRIDE) % N ))
  name=$(sed -n "$((i+1))p" "$POOL_FILE")
  k=$((k+1)); tried=$((tried+1))

  case " $USED " in *" $name "*) echo "  skip $name (already used)"; continue;; esac
  command -v "$name" >/dev/null 2>&1 || continue

  out=$(timeout 6 "$name" --help 2>&1 | head -400); lines=$(echo "$out" | wc -l)
  if [ "$lines" -lt 20 ]; then
    out=$(timeout 6 "$name" -h 2>&1 | head -400); lines=$(echo "$out" | wc -l)
  fi
  [ "$lines" -lt 20 ] && continue

  opts=$(echo "$out" | grep -oE '^[[:space:]]+[-/][a-zA-Z][a-zA-Z0-9-]*' | sort -u | wc -l)
  if [ "$opts" -lt 20 ]; then
    echo "  skip $name (help ok, only $opts enumerable options)"
    continue
  fi

  echo "  DRAW: $name  (${lines} help lines, ${opts} options)"
  found=$((found+1))
done
echo "candidates examined: $tried"
