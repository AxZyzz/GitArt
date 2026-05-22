export const INTENSITY_TO_COMMITS = { 0: 0, 1: 2, 2: 8, 3: 25, 4: 50 };

function getYearStart(year) {
  // GitHub graph starts on the Sunday of/before Jan 1
  const jan1 = new Date(year, 0, 1);
  const dayOfWeek = jan1.getDay(); // 0=Sun
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - dayOfWeek);
  return start;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISO(date) {
  // Use local date parts — toISOString() gives UTC which is wrong for UTC+ timezones
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function gridToCommitDates(grid, year) {
  // grid[row][col], row=day-of-week(0=Sun), col=week
  const start = getYearStart(year);
  const schedule = [];

  for (let col = 0; col < grid[0].length; col++) {
    for (let row = 0; row < grid.length; row++) {
      const intensity = grid[row][col];
      if (intensity === 0) continue;
      const count = INTENSITY_TO_COMMITS[intensity] ?? 0;
      if (count === 0) continue;
      const date = addDays(start, col * 7 + row);
      if (date.getFullYear() !== year) continue; // skip overflow into other years
      schedule.push({ date: toISO(date), count });
    }
  }

  return schedule;
}

export function generateBashScript(grid, year, repoUrl, authorEmail = 'gitart@example.com') {
  const schedule = gridToCommitDates(grid, year);

  if (schedule.length === 0) {
    return '# No commits to generate. Draw something on the grid first!';
  }

  const totalCommits = schedule.reduce((s, d) => s + d.count, 0);

  return `#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════╗
# ║              GitArt — Commit Schedule Script             ║
# ║          https://github.com/your-org/gitart              ║
# ╚══════════════════════════════════════════════════════════╝
#
# Year    : ${year}
# Commits : ${totalCommits} across ${schedule.length} days
# Repo    : ${repoUrl || '<your-repo-url>'}
#
# HOW TO USE:
#   1. Create a NEW empty repo on GitHub (don't init with README)
#   2. Run: bash gitart-${year}.sh https://github.com/YOUR/REPO.git
#   3. Wait for it to finish, then check your profile!
#
# WARNING: This rewrites history on the target repo.
#          Use a dedicated empty repo — not an existing one.

set -euo pipefail

REPO_URL="\${1:-${repoUrl || ''}}"

if [ -z "\$REPO_URL" ]; then
  echo "Usage: bash gitart-${year}.sh <repo-url>"
  echo "Example: bash gitart-${year}.sh https://github.com/you/gitart-canvas.git"
  exit 1
fi

WORK_DIR="gitart-canvas-${year}"

echo "🎨 GitArt — Setting up your contribution art..."
echo "📁 Working directory: \$WORK_DIR"

mkdir -p "\$WORK_DIR"
cd "\$WORK_DIR"

git init -q
git checkout -b main 2>/dev/null || git checkout main

# Configure git author if not set
git config --local user.email "\${GIT_AUTHOR_EMAIL:-${authorEmail}}"
git config --local user.name "\${GIT_AUTHOR_NAME:-GitArt}"

# Create initial commit
echo "# GitArt Canvas ${year}" > README.md
git add README.md
GIT_AUTHOR_DATE="${year}-01-01T00:00:00" \\
GIT_COMMITTER_DATE="${year}-01-01T00:00:00" \\
git commit -q -m "init: gitart canvas ${year}"

make_commits() {
  local date="\$1"
  local count="\$2"
  for i in \$(seq 1 "\$count"); do
    GIT_AUTHOR_DATE="\${date}T12:00:00" \\
    GIT_COMMITTER_DATE="\${date}T12:00:00" \\
    git commit -q --allow-empty -m "art: \${date} [\${i}/\${count}]"
  done
}

echo "⏳ Generating ${totalCommits} commits across ${schedule.length} days..."
echo ""

${schedule.map(({ date, count }) => `make_commits "${date}" ${count}`).join('\n')}

echo ""
echo "✅ Done! Pushing to \$REPO_URL..."
git remote add origin "\$REPO_URL"
git push -u origin main --force

echo ""
echo "🚀 Your GitHub art is live!"
echo "   Visit: https://github.com/\$(echo \$REPO_URL | sed 's|.*github.com/||;s|.git||')"
echo "   Note: GitHub may take a few minutes to update your graph."
`;
}

function sanitizeEmail(email) {
  // Strip anything not valid in an email address — prevents shell metacharacter injection
  return (email || '').replace(/[^a-zA-Z0-9@._+\-]/g, '');
}

function sanitizeRepoUrl(url) {
  // Must be a GitHub HTTPS URL — strip any shell metacharacters as a second defence
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') return '';
    return url.replace(/['"`;$&|<>\\]/g, '');
  } catch {
    return '';
  }
}

export function generateNodeScript(grid, year, repoUrl, authorEmail = 'gitart@example.com') {
  const safeEmail = sanitizeEmail(authorEmail);
  const safeRepoUrl = sanitizeRepoUrl(repoUrl || '');

  // Use sanitized values everywhere from here on
  authorEmail = safeEmail || 'gitart@example.com';
  repoUrl = safeRepoUrl;

  const schedule = gridToCommitDates(grid, year);
  const totalCommits = schedule.reduce((s, d) => s + d.count, 0);

  // Build fast-import stream at generation time so the script is self-contained
  // Use TextEncoder for browser-compatible UTF-8 byte length
  const byteLen = (str) => new TextEncoder().encode(str).length;

  const readme = `# GitArt Canvas ${year}\n`;
  const initTs = Math.floor(new Date(`${year}-01-01T12:00:00Z`).getTime() / 1000);

  const lines = [];
  let mark = 1;

  // README blob
  lines.push(`blob`);
  lines.push(`mark :${mark}`);
  lines.push(`data ${byteLen(readme)}`);
  lines.push(readme);
  const readmeMark = mark++;

  // GITART.md disclosure blob
  const disclosure = `# GitArt Canvas\n\nThis repository was generated by [GitArt](https://github.com/your-org/gitart).\n\nThe contribution graph art on this profile is **decorative** and does not represent real code contributions.\nCommit history was created using backdated empty commits for artistic purposes.\n\n> Made with GitArt — paint your GitHub contribution graph.\n`;
  lines.push(`blob`);
  lines.push(`mark :${mark}`);
  lines.push(`data ${byteLen(disclosure)}`);
  lines.push(disclosure);
  const disclosureMark = mark++;

  // Initial commit with README + GITART.md
  const initMsg = `init: gitart canvas ${year}`;
  lines.push(`commit refs/heads/main`);
  lines.push(`mark :${mark}`);
  lines.push(`author GitArt <${authorEmail}> ${initTs} +0000`);
  lines.push(`committer GitArt <${authorEmail}> ${initTs} +0000`);
  lines.push(`data ${byteLen(initMsg)}`);
  lines.push(initMsg);
  lines.push(`M 100644 :${readmeMark} README.md`);
  lines.push(`M 100644 :${disclosureMark} GITART.md`);
  lines.push('');
  let prevMark = mark++;

  // Art commits — each one chains from previous, no file changes = empty commit
  for (const { date, count } of schedule) {
    const ts = Math.floor(new Date(`${date}T12:00:00Z`).getTime() / 1000);
    for (let i = 1; i <= count; i++) {
      const msg = `art: ${date} [${i}/${count}]`;
      lines.push(`commit refs/heads/main`);
      lines.push(`mark :${mark}`);
      lines.push(`author GitArt <${authorEmail}> ${ts} +0000`);
      lines.push(`committer GitArt <${authorEmail}> ${ts} +0000`);
      lines.push(`data ${byteLen(msg)}`);
      lines.push(msg);
      lines.push(`from :${prevMark}`);
      lines.push('');
      prevMark = mark++;
    }
  }

  const fastImportData = lines.join('\n');

  const ghMatch = (repoUrl || '').match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  const ghOwner = ghMatch ? ghMatch[1] : null;
  const ghRepo = ghMatch ? ghMatch[2] : null;

  return `#!/usr/bin/env node
// GitArt — Commit Schedule (Node.js, fast-import mode)
// Year    : ${year}
// Commits : ${totalCommits}
// Email   : ${authorEmail}
// Run     : node gitart-${year}.mjs <repo-url>

import { execSync, spawnSync } from 'child_process';
import { mkdirSync } from 'fs';
import { get } from 'https';

const repoUrl = process.argv[2] || '${repoUrl || ''}';
if (!repoUrl) {
  console.error('Usage: node gitart-${year}.mjs <repo-url>');
  process.exit(1);
}

// Validate URL before doing anything — must be a GitHub HTTPS URL
try {
  const u = new URL(repoUrl);
  if (u.protocol !== 'https:' || u.hostname !== 'github.com') {
    console.error('❌ Repo URL must be a GitHub HTTPS URL (https://github.com/...)');
    process.exit(1);
  }
} catch {
  console.error('❌ Invalid repo URL:', repoUrl);
  process.exit(1);
}

const workDir = 'gitart-canvas-${year}';
mkdirSync(workDir, { recursive: true });
process.chdir(workDir);

// exec: for hardcoded commands only (no user input)
const exec = (cmd) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
// spawn: for commands that include user-supplied values (array args = no shell injection)
const git = (...args) => {
  const r = spawnSync('git', args, { stdio: 'pipe', encoding: 'utf8' });
  if (r.status !== 0) throw Object.assign(new Error(r.stderr || r.stdout || 'git failed'), { stderr: r.stderr });
  return r.stdout;
};

const check = (label, ok, detail = '') => {
  const icon = ok ? '✅' : '❌';
  console.log(\`  \${icon} \${label}\${detail ? ' — ' + detail : ''}\`);
  return ok;
};

// ── Step 1: Init repo ────────────────────────────────────────────
console.log('\\n[1/4] Setting up local repo...');
exec('git init -q');
try { exec('git checkout -b main'); } catch { exec('git checkout main'); }
git('config', 'user.email', '${authorEmail}');
git('config', 'user.name', 'GitArt');
check('Repo initialized', true);
check('Author email set', true, '${authorEmail}');

// ── Step 2: Fast-import all commits ─────────────────────────────
console.log('\\n[2/4] Importing ${totalCommits} commits via git fast-import...');
const stream = ${JSON.stringify(fastImportData)};

const result = spawnSync('git', ['fast-import', '--quiet', '--force'], {
  input: stream,
  encoding: 'utf8',
  maxBuffer: 256 * 1024 * 1024,
});

if (result.status !== 0) {
  console.error('❌ fast-import failed:', result.stderr);
  process.exit(1);
}

exec('git checkout main -q');
const localCount = parseInt(exec('git rev-list --count HEAD').trim(), 10);
check('Commits created locally', localCount === ${totalCommits + 1}, \`\${localCount} commits (expected ${totalCommits + 1})\`);

// ── Step 3: Push ────────────────────────────────────────────────
console.log('\\n[3/4] Pushing to GitHub...');
try { git('remote', 'add', 'origin', repoUrl); } catch { git('remote', 'set-url', 'origin', repoUrl); }
let pushOk = false;
try {
  git('push', '-u', 'origin', 'main', '--force');
  pushOk = true;
  check('Push to GitHub', true, repoUrl);
} catch (e) {
  const errDetail = (e.stderr || e.message || '').trim().split('\\n').filter(l => l.trim()).pop() || 'push failed';
  check('Push to GitHub', false, errDetail);
  console.error('\\n❌ Push failed. Check the repo URL and your git credentials.');
  process.exit(1);
}

// ── Step 4: Verify via GitHub API ───────────────────────────────
console.log('\\n[4/4] Verifying on GitHub API...');
const match = repoUrl.match(/github\\.com[\\/:]([^\\/]+)\\/([^\\/\\.]+)/);
if (!match) {
  console.log('  ⚠️  Skipping API check — not a GitHub URL');
} else {
  const [, owner, repo] = match;
  const apiCheck = (path) => new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path,
      headers: { 'User-Agent': 'GitArt/1.0' },
    };
    get(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: {} }); }
      });
    }).on('error', () => resolve({ status: 0, body: {} }));
  });

  const repoInfo = await apiCheck(\`/repos/\${owner}/\${repo}\`);
  check('Repo accessible on GitHub', repoInfo.status === 200, \`github.com/\${owner}/\${repo}\`);
  if (repoInfo.status === 200) {
    check('Repo is public', !repoInfo.body.private, repoInfo.body.private ? 'make it public or contributions won\\'t count' : 'contributions will count');
    check('Default branch is main', repoInfo.body.default_branch === 'main', repoInfo.body.default_branch);

    const commitsInfo = await apiCheck(\`/repos/\${owner}/\${repo}/commits?per_page=1\`);
    check('Commits visible via API', commitsInfo.status === 200 && Array.isArray(commitsInfo.body) && commitsInfo.body.length > 0);

    if (commitsInfo.status === 200 && commitsInfo.body[0]) {
      const latestEmail = commitsInfo.body[0]?.commit?.author?.email;
      check('Author email on commits', latestEmail === '${authorEmail}', latestEmail || 'unknown');
    }
  }
}

console.log(\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 GitArt ${year} — Done!
   Repo   : https://github.com/\${match ? match[1] + '/' + match[2] : '?'}
   Profile: https://github.com/\${match ? match[1] : '?'}

   GitHub updates the contribution graph within 5–10 minutes.
   If commits don't show: ensure the repo is public and the
   author email matches your verified GitHub account email.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`);
`;
}

export function generateRevertScript(year, repoUrl, authorEmail = 'gitart@example.com') {
  const safeEmail = sanitizeEmail(authorEmail);
  const safeRepoUrl = sanitizeRepoUrl(repoUrl || '');
  authorEmail = safeEmail || 'gitart@example.com';
  repoUrl = safeRepoUrl;

  const byteLen = (str) => new TextEncoder().encode(str).length;
  const nowTs = Math.floor(Date.now() / 1000);

  const readmeContent = `# Repository cleared by GitArt revert.\n`;
  const commitMsg = `revert: cleared gitart canvas ${year}`;

  // Build the fast-import stream at generation time with correct byte lengths
  const streamLines = [
    `blob`,
    `mark :1`,
    `data ${byteLen(readmeContent)}`,
    readmeContent,
    `commit refs/heads/main`,
    `mark :2`,
    `author GitArt <${authorEmail}> ${nowTs} +0000`,
    `committer GitArt <${authorEmail}> ${nowTs} +0000`,
    `data ${byteLen(commitMsg)}`,
    commitMsg,
    `M 100644 :1 README.md`,
    ``,
  ];
  const revertStream = streamLines.join('\n');

  return `#!/usr/bin/env node
// GitArt — Revert Script
// Wipes all art commits by force-pushing a single clean commit.
// GitHub removes them from the graph within 5-10 minutes.
// Run: node gitart-revert-${year}.mjs <repo-url>
//
// Fastest alternative: delete the repo on GitHub →
//   https://github.com/YOUR/REPO/settings (scroll to bottom)

import { execSync, spawnSync } from 'child_process';
import { mkdirSync } from 'fs';
import { get } from 'https';

const repoUrl = process.argv[2] || '${repoUrl || ''}';
if (!repoUrl) {
  console.error('Usage: node gitart-revert-${year}.mjs <repo-url>');
  process.exit(1);
}

try {
  const u = new URL(repoUrl);
  if (u.protocol !== 'https:' || u.hostname !== 'github.com') {
    console.error('❌ Repo URL must be a GitHub HTTPS URL (https://github.com/...)');
    process.exit(1);
  }
} catch {
  console.error('❌ Invalid repo URL:', repoUrl);
  process.exit(1);
}

const workDir = 'gitart-revert-${year}-' + Date.now();
mkdirSync(workDir, { recursive: true });
process.chdir(workDir);

const exec = (cmd) => execSync(cmd, { stdio: 'pipe', encoding: 'utf8' });
const git = (...args) => {
  const r = spawnSync('git', args, { stdio: 'pipe', encoding: 'utf8' });
  if (r.status !== 0) throw Object.assign(new Error(r.stderr || r.stdout || 'git failed'), { stderr: r.stderr });
  return r.stdout;
};

console.log('\\n[1/3] Building clean replacement repo...');
exec('git init -q');
try { exec('git checkout -b main'); } catch { exec('git checkout main'); }
git('config', 'user.email', '${authorEmail}');
git('config', 'user.name', 'GitArt');

const stream = ${JSON.stringify(revertStream)};

const fi = spawnSync('git', ['fast-import', '--quiet', '--force'], {
  input: stream,
  encoding: 'utf8',
});

if (fi.status !== 0) {
  console.error('❌ fast-import failed:', fi.stderr);
  process.exit(1);
}

exec('git checkout main -q');
const count = exec('git rev-list --count HEAD').trim();
console.log(\`  ✅ Clean repo ready — \${count} commit(s)\`);

console.log('\\n[2/3] Force-pushing to wipe art commits...');
try { git('remote', 'add', 'origin', repoUrl); } catch { git('remote', 'set-url', 'origin', repoUrl); }
try {
  git('push', 'origin', 'main', '--force');
  console.log('  ✅ Push succeeded — art commits are gone');
} catch (e) {
  const errDetail = (e.stderr || e.message || '').trim().split('\\n').filter(l => l.trim()).pop() || 'push failed';
  console.error('  ❌ Push failed:', errDetail);
  process.exit(1);
}

console.log('\\n[3/3] Verifying via GitHub API...');
const match = repoUrl.match(/github\\.com[\\/:]([^\\/]+)\\/([^\\/\\.]+)/);
if (match) {
  const [, owner, repo] = match;
  await new Promise((resolve) => {
    const opts = { hostname: 'api.github.com', path: \`/repos/\${owner}/\${repo}/commits?per_page=5\`, headers: { 'User-Agent': 'GitArt/1.0' } };
    get(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const commits = JSON.parse(data);
          const hasArt = Array.isArray(commits) && commits.some(c => c.commit?.message?.startsWith('art:'));
          console.log(\`  \${hasArt ? '⚠️  Art commits still cached — wait a few minutes' : '✅ No art commits visible on API'}\`);
        } catch {}
        resolve();
      });
    }).on('error', resolve);
  });
}

console.log(\`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
↩  GitArt ${year} — Reverted!
   GitHub removes art from your graph within 5–10 minutes.

   To fully delete the repo:
   https://github.com/\${match ? match[1] + '/' + match[2] : 'YOUR/REPO'}/settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\`);
`;
}
