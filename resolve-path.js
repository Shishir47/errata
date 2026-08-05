// Shared git-bash -> Windows path resolver. Added in Round 29.
//
// Rounds 16, 25 and 27 each lost items (4, 2 and 6 = 12 total) because their
// path translation only handled /c/ style drive prefixes and silently failed on
// /usr/bin and /bin, which live under the Git installation root. Same bug, three
// rounds, never fixed because each round it was cheap to shrug at.
//
//   node resolve-path.js     # self-test

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

let GITROOT = null;
try {
  const sh = execFileSync('bash', ['-c', 'cygpath -w / 2>/dev/null || true'],
    { encoding: 'utf8' }).trim();
  if (sh) GITROOT = sh.split('\\').join('/').replace(/\/$/, '');
} catch { /* leave null */ }

function toWindows(p) {
  if (!p) return [];
  const out = [];
  const drive = p.replace(/^\/([a-z])\//i, (_, d) => d.toUpperCase() + ':/');
  if (drive !== p) out.push(drive);
  if (GITROOT && /^\/(usr|bin|etc|tmp|mingw64|mingw32)\b/.test(p)) out.push(GITROOT + p);
  out.push(p);
  return out;
}

function statOf(name) {
  let p = '';
  try {
    p = execFileSync('bash', ['-c', 'command -v "$1"', '_', name], { encoding: 'utf8' }).trim();
  } catch { return null; }
  // Second half of the bug: the pool was built by stripping ".exe", so
  // `command -v shutdown` reports a path whose real file is shutdown.exe.
  const EXT = ['', '.exe', '.com', '.dll', '.cpl', '.scr'];
  for (const cand of toWindows(p)) {
    for (const e of EXT) {
      try { return { size: fs.statSync(cand + e).size, path: cand + e }; } catch { /* next */ }
    }
  }
  return null;
}

module.exports = { toWindows, statOf, GITROOT };

if (require.main === module) {
  console.log('GITROOT =', GITROOT);
  const names = ['fsiso', 'msys-npth-0.dll', 'psr', 'pr', 'ahost', 'consent',
                 'shutdown', 'netcfg', 'fxscover', 'html.iec'];
  let ok = 0;
  for (const n of names) {
    const r = statOf(n);
    if (r) ok++;
    console.log(`  ${n.padEnd(20)} ${r ? (r.size / 1024).toFixed(0) + ' KB' : 'UNRESOLVED'}`);
  }
  console.log(`\nresolved ${ok}/${names.length}`);
}
