```
  ██████╗ ██╗████████╗ █████╗ ██████╗ ████████╗
 ██╔════╝ ██║╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝
 ██║  ███╗██║   ██║   ███████║██████╔╝   ██║   
 ██║   ██║██║   ██║   ██╔══██║██╔══██╗   ██║   
 ╚██████╔╝██║   ██║   ██║  ██║██║  ██║   ██║   
  ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
```

> **Paint your GitHub contribution graph with pixel art.**  
> Draw it. Pick a template. Run the script. Flex on everyone.

A fun side project by **[AxZyzz](https://github.com/AxZyzz)** · [a2b.services](https://a2b.services)

---

## ⚠️ Ethics & Intended Use

**This is a creative toy, not a cheat tool.**

- ✅ Use it for fun, art, decoration, memes
- ✅ Use it on a clearly labeled "GitArt canvas" repo
- ❌ **Do NOT use it to fake contributions and misrepresent your skills in job interviews or on your portfolio**
- ❌ Do NOT use it to deceive recruiters or hiring managers
- ❌ Do NOT use it on repos that contain real code to inflate numbers

Recruiters and engineers who know git can spot backdated empty commits in seconds — `git log --format="%ai %s"` reveals everything. Using this to fake activity will backfire and damage your credibility.

**To revert:** Delete the dedicated repo on GitHub. Contributions disappear from your graph within minutes.

---

## What is this?

Your GitHub contribution graph is secretly a **53×7 pixel canvas**.

Each square = one day. Color intensity = how many commits you made that day.
GitArt lets you **design** that canvas — hearts, text, patterns, pixel art — then generates a Node.js script that creates the exact commits on the exact dates using git's backdating mechanism.

No bots. No third-party access. No credentials stored. Pure git.

---

## Quick Start

```bash
git clone https://github.com/AxZyzz/GitArt
cd GitArt
npm install
npm run dev
# → http://localhost:5173
```

1. Pick a template or draw on the pixel grid
2. Set your GitHub email + target year
3. Download the generated `.mjs` script
4. Create a **fresh empty repo** on GitHub
5. Run `node gitart-2025.mjs https://github.com/YOU/your-art-repo.git`
6. Wait ~5 minutes for GitHub to update your graph

> **To revert:** Delete the repo. GitHub removes those contributions automatically.

---

## How It Actually Works — Deep Technical Walkthrough

This section explains the mechanism in full detail so you can understand (and replicate) it yourself.

### The Core Trick: `GIT_AUTHOR_DATE`

Git stores two timestamps per commit:

| Variable | Meaning |
|---|---|
| `GIT_AUTHOR_DATE` | When the code change was authored |
| `GIT_COMMITTER_DATE` | When the commit object was created |

GitHub's contribution graph uses **`GIT_AUTHOR_DATE`** exclusively. It does not care when you actually ran `git commit` — only what date is baked into the commit object.

This means you can create a commit today and have it appear on GitHub as March 15th, 1999 if you want:

```bash
GIT_AUTHOR_DATE="2025-03-15T12:00:00Z" \
GIT_COMMITTER_DATE="2025-03-15T12:00:00Z" \
git commit --allow-empty -m "this shows up on march 15"
```

### Why `--allow-empty`?

Normally git refuses to commit when nothing has changed. `--allow-empty` bypasses this check and creates a commit with no tree diff. The commit object exists with a valid SHA, a parent pointer, and the author date — but has zero file changes.

### Why UTC noon (`T12:00:00Z`)?

Two reasons:
1. GitHub's contribution cutoff is midnight UTC. A commit at `T00:00:00Z` on the boundary day can shift depending on GitHub's cache timing.
2. Users in UTC+ timezones: midnight local time = previous day UTC, which would shift the commit to the wrong day on the graph. Noon UTC (12:00Z) is safe for all timezones from UTC−11 to UTC+11.

### The Grid → Date Mapping

GitHub renders the contribution graph as a 53-column × 7-row grid:

```
Col 0   Col 1   Col 2  ...  Col 52
Sun                              Sun
Mon                              Mon
Tue      ← each cell = 1 day →  Tue
Wed                              Wed
Thu                              Thu
Fri                              Fri
Sat                              Sat
```

Column 0 always starts on the **Sunday on or before January 1st** of the target year:

```javascript
const jan1 = new Date(year, 0, 1);
const startOffset = jan1.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
const graphStart = new Date(jan1);
graphStart.setDate(jan1.getDate() - startOffset); // rewind to Sunday
```

The cell at `[row][col]` maps to:
```
date = graphStart + (col * 7 + row) days
```

The first `startOffset` cells of column 0 belong to the previous year (greyed out). The last cells of column 52 belong to the next year. GitArt skips those automatically.

### Color Intensity

GitHub doesn't use fixed commit thresholds — it uses **relative quartiles** across all your activity for that year. GitArt uses high commit counts to dominate the scale:

| Intensity | Commits/day | Appearance |
|---|---|---|
| 0 | 0 | Grey (empty) |
| 1 | 2 | Light green |
| 2 | 8 | Medium green |
| 3 | 25 | Dark green |
| 4 | 50 | Maximum green |

50 commits/day means your real work contributions (typically 1–10/day) become noise in the scale, keeping the art uniform.

### `git fast-import` — Bulk Commit Generation

Naive approach: spawn `git commit` N times. For 365 days × 50 commits = 18,250 process spawns — takes 5–10 minutes.

GitArt uses `git fast-import`, a plumbing command that reads a stream format and creates commits in bulk at C speed:

```
blob
mark :1
data 22
# GitArt Canvas 2025

commit refs/heads/main
mark :2
author GitArt <you@email.com> 1735732800 +0000
committer GitArt <you@email.com> 1735732800 +0000
data 27
init: gitart canvas 2025
M 100644 :1 README.md

commit refs/heads/main
mark :3
author GitArt <you@email.com> 1735732800 +0000
committer GitArt <you@email.com> 1735732800 +0000
data 20
art: 2025-01-01 [1/50]
from :2

...
```

Key fields:
- `mark :N` — internal ID for cross-referencing (`:2` is the init commit, `:3` references it via `from :2`)
- `data N` — byte length of the following blob/message (must be exact UTF-8 byte count, not character count)
- `from :N` — parent commit mark (creates the chain)
- No `from` = root commit (only the very first)

The entire stream is piped into one `spawnSync('git', ['fast-import'])` call. 18,000+ commits generate in ~2 seconds.

After fast-import, the working tree is not updated automatically. You need:
```bash
git checkout main -q  # or: git reset --hard HEAD
```

### Force Push

The art repo is always force-pushed because:
1. It may already have commits from a previous GitArt run
2. Fast-import rewrites history (orphaned commits get GC'd)
3. The repo is a dedicated art canvas — no real history to protect

```bash
git push -u origin main --force
```

### Replicating This Yourself (Without GitArt)

You only need these tools: `git`, `node` (for the date math). Here's the minimal version:

```javascript
// minimal-gitart.mjs
import { spawnSync, execSync } from 'child_process';
import { mkdirSync } from 'fs';

const year = 2025;
const email = 'you@github-email.com';
const repo = 'https://github.com/YOU/canvas.git';

mkdirSync('canvas', { recursive: true });
process.chdir('canvas');
execSync('git init -q');
spawnSync('git', ['config', 'user.email', email]);
spawnSync('git', ['config', 'user.name', 'GitArt']);

// Build fast-import stream
const enc = new TextEncoder();
const byteLen = s => enc.encode(s).length;

const jan1 = new Date(year, 0, 1);
const startSunday = new Date(jan1);
startSunday.setDate(jan1.getDate() - jan1.getDay());

const lines = [];
let mark = 1;

// Root blob
const readme = `# Canvas ${year}\n`;
lines.push(`blob\nmark :${mark}\ndata ${byteLen(readme)}\n${readme}`);
const blobMark = mark++;

// Root commit
const initMsg = `init: canvas ${year}`;
const initTs = Math.floor(new Date(`${year}-01-01T12:00:00Z`).getTime() / 1000);
lines.push(`commit refs/heads/main\nmark :${mark}\nauthor GitArt <${email}> ${initTs} +0000\ncommitter GitArt <${email}> ${initTs} +0000\ndata ${byteLen(initMsg)}\n${initMsg}\nM 100644 :${blobMark} README.md\n`);
let prev = mark++;

// Art commits — change this loop to paint whatever pattern you want
for (let col = 0; col < 53; col++) {
  for (let row = 0; row < 7; row++) {
    const date = new Date(startSunday);
    date.setDate(startSunday.getDate() + col * 7 + row);
    if (date.getFullYear() !== year) continue;

    const dateStr = date.toISOString().slice(0, 10);
    const ts = Math.floor(new Date(`${dateStr}T12:00:00Z`).getTime() / 1000);
    const commitsToday = 10; // change per cell for patterns

    for (let i = 1; i <= commitsToday; i++) {
      const msg = `art: ${dateStr} [${i}/${commitsToday}]`;
      lines.push(`commit refs/heads/main\nmark :${mark}\nauthor GitArt <${email}> ${ts} +0000\ncommitter GitArt <${email}> ${ts} +0000\ndata ${byteLen(msg)}\n${msg}\nfrom :${prev}\n`);
      prev = mark++;
    }
  }
}

spawnSync('git', ['fast-import', '--quiet', '--force'], {
  input: lines.join('\n'),
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
});
execSync('git checkout main -q');
spawnSync('git', ['remote', 'add', 'origin', repo]);
spawnSync('git', ['push', '-u', 'origin', 'main', '--force']);
console.log('Done — check your GitHub profile in 5 minutes.');
```

---

## Templates

| Name | Description |
|---|---|
| ♥ Heart | Classic heart |
| 👋 HI | Pixel greeting |
| </> CODE | Because yes |
| ● Pac-Man | Chomp |
| 〜 Wave | Sine wave |
| ★ Star | 8-point burst |
| ⊞ Checkerboard | High contrast |
| /// Diagonal Stripes | Flowing bands |
| ▓ Matrix Rain | Falling columns |
| ♡ Heartbeat | ECG pulse |
| ⌇ DNA Helix | Double helix |
| ▲ Mountains | Silhouette |
| ↑ Rocket | Pixel rocket |

Plus: **Text Generator** — type any name or phrase, rendered as pixel art using a full A–Z 0–9 font.

---

## Stack

Vite · React · CSS Modules · Zero backend · No auth · No tracking

```bash
npm install && npm run dev   # localhost:5173
npm run build                # production build
```

---

## License

MIT. Do whatever you want with it — just don't use it to lie about your skills.

---

```
 A fun project by AxZyzz · A2B AI TECHNOLOGIES
 made with ♥ and way too less commits
```
