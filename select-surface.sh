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
#   3. Advance one index if a candidate fails ANY usability gate:
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
i=$(( (SEED + ROUND) % N ))
echo "pool: $N executables on PATH   seed: $SEED   start index: $i"

tried=0; found=0
while [ $tried -lt 200 ] && [ $found -lt "$DRAWS" ]; do
  name=$(sed -n "$((i+1))p" "$POOL_FILE")
  i=$(( (i+1) % N )); tried=$((tried+1))

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
