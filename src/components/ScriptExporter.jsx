import { useState } from 'react';
import styles from './ScriptExporter.module.css';
import { generateNodeScript, generateRevertScript, gridToCommitDates } from '../utils/scriptGenerator.js';
import ConsentModal from './ConsentModal.jsx';
import { subscribeEmail } from '../lib/supabase.js';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

function parseGitHubUrl(url) {
  const m = url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

export default function ScriptExporter({ grid, year, onYearChange }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [showConsent, setShowConsent] = useState(false);

  const schedule = gridToCommitDates(grid, year);
  const totalCommits = schedule.reduce((s, d) => s + d.count, 0);
  const activeDays = schedule.length;
  const emailValid = authorEmail.trim().length > 0;
  const emailToUse = emailValid ? authorEmail.trim() : '';

  const script = generateNodeScript(grid, year, repoUrl, emailToUse || 'gitart@example.com');

  const handleVerify = async () => {
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const headers = { 'User-Agent': 'GitArt/1.0' };
      const base = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;

      const [repoRes, commitsRes] = await Promise.all([
        fetch(base, { headers }),
        fetch(`${base}/commits?per_page=1`, { headers }),
      ]);

      const repoData = repoRes.ok ? await repoRes.json() : null;
      const commitsData = commitsRes.ok ? await commitsRes.json() : null;
      const latestCommit = Array.isArray(commitsData) && commitsData[0];
      const latestEmail = latestCommit?.commit?.author?.email;

      setVerifyResult({
        repoFound: repoRes.ok,
        isPublic: repoData ? !repoData.private : false,
        defaultBranch: repoData?.default_branch,
        commitsVisible: !!(latestCommit),
        latestEmail,
        emailMatch: latestEmail === emailToUse,
        repoUrl: repoData ? `https://github.com/${parsed.owner}/${parsed.repo}` : null,
        profileUrl: `https://github.com/${parsed.owner}`,
      });
    } catch {
      setVerifyResult({ error: 'Network error — check your connection.' });
    }
    setVerifying(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitart-${year}.mjs`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => setShowConsent(true);

  const handleConsentAccept = async (email) => {
    await subscribeEmail(email);
    setShowConsent(false);
    triggerDownload();
  };

  const handleConsentDecline = async () => {
    setShowConsent(false);
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadRevert = () => {
    const revert = generateRevertScript(year, repoUrl, emailToUse);
    const blob = new Blob([revert], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitart-revert-${year}.mjs`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.wrap}>
      {showConsent && (
        <ConsentModal
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
          onClose={() => setShowConsent(false)}
          defaultEmail={authorEmail.trim() || ''}
        />
      )}
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.dim}>// </span>Export Script
        </h2>
        <p className={styles.sub}>
          Generate a commit script. Run it in a fresh empty repo to paint your graph.
        </p>
      </div>

      <div className={styles.config}>
        <div className={styles.field}>
          <label className={styles.label}>Year</label>
          <div className={styles.yearTabs}>
            {YEARS.map(y => (
              <button
                key={y}
                className={`${styles.yearTab} ${year === y ? styles.active : ''}`}
                onClick={() => onYearChange(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field} style={{ flex: 1 }}>
          <label className={styles.label}>GitHub Repo URL <span className={styles.optional}>(optional)</span></label>
          <input
            className={styles.input}
            type="text"
            placeholder="https://github.com/you/your-art-repo.git"
            value={repoUrl}
            onChange={e => { setRepoUrl(e.target.value); setVerifyResult(null); }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            GitHub Email <span className={styles.required}>required</span>
          </label>
          <input
            className={`${styles.input} ${!authorEmail.trim() ? styles.inputWarn : ''}`}
            type="email"
            placeholder="your-github@email.com"
            value={authorEmail}
            onChange={e => setAuthorEmail(e.target.value)}
          />
        </div>
      </div>

      {!authorEmail.trim() && (
        <div className={styles.emailNotice}>
          <span>⚠</span>
          <span>
            Set your GitHub account email above — commits must use your verified GitHub email to count as contributions.
            <a href="https://github.com/settings/emails" target="_blank" rel="noopener noreferrer"> Check your emails →</a>
          </span>
        </div>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{activeDays}</span>
          <span className={styles.summaryLabel}>days with commits</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{totalCommits}</span>
          <span className={styles.summaryLabel}>total commits</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{year}</span>
          <span className={styles.summaryLabel}>target year</span>
        </div>
      </div>

      {activeDays === 0 ? (
        <div className={styles.empty}>
          Draw something on the grid first, then generate your script.
        </div>
      ) : (
        <>
          <div className={styles.scriptBox}>
            <div className={styles.scriptHeader}>
              <div className={styles.scriptMeta}>
                <span className={styles.scriptFilename}>
                  gitart-{year}.mjs
                </span>
                <span className={styles.scriptLines}>{script.split('\n').length} lines</span>
              </div>
              <div className={styles.scriptActions}>
                <button className={styles.actionBtn} onClick={() => setExpanded(e => !e)}>
                  {expanded ? '↑ Collapse' : '↓ Preview'}
                </button>
                <button className={styles.actionBtn} onClick={handleCopy}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
                <button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleDownload} disabled={!emailValid} title={!emailValid ? 'Enter your GitHub email above first' : ''}>
                  ↓ Download
                </button>
                <button className={`${styles.actionBtn} ${styles.revertBtn}`} onClick={handleDownloadRevert} title="Download a script to undo this art">
                  ↩ Revert Script
                </button>
              </div>
            </div>

            {expanded && (
              <pre className={styles.code}>{script}</pre>
            )}
          </div>

          <div className={styles.instructions}>
            <h3 className={styles.stepsTitle}>
              <span className={styles.dim}>$</span> how to use
            </h3>
            <ol className={styles.steps}>
              <li>
                Create a <strong>new empty repo</strong> on GitHub.
                Do not initialize it with a README.
              </li>
              <li>
                Fill in your <strong>GitHub email</strong> above and the repo URL, then download the script.
              </li>
              <li>
                Run:{' '}
                <code className={styles.inlineCode}>
                  node gitart-{year}.mjs https://github.com/YOU/REPO.git
                </code>
              </li>
              <li>
                Script self-verifies — it checks commit count, push status, and GitHub API.
              </li>
              <li>
                Use the <strong>Verify</strong> button below anytime to re-check.
              </li>
            </ol>

            <div className={styles.warning}>
              <span className={styles.warningIcon}>⚠</span>
              <span>
                Use a <strong>dedicated empty repo</strong> for this.
                The script force-pushes and will overwrite any existing history.
              </span>
            </div>
          </div>

          {parseGitHubUrl(repoUrl) && (
            <div className={styles.verifier}>
              <div className={styles.verifierHeader}>
                <h3 className={styles.stepsTitle}>
                  <span className={styles.dim}>$</span> verify repo
                </h3>
                <button
                  className={`${styles.actionBtn} ${styles.primary}`}
                  onClick={handleVerify}
                  disabled={verifying}
                >
                  {verifying ? '⏳ Checking...' : '⟳ Run Check'}
                </button>
              </div>

              {verifyResult && !verifyResult.error && (
                <div className={styles.checks}>
                  <CheckRow ok={verifyResult.repoFound} label="Repo found on GitHub" />
                  <CheckRow ok={verifyResult.isPublic} label="Repo is public" detail={!verifyResult.isPublic ? 'contributions only count on public repos' : ''} />
                  <CheckRow ok={verifyResult.defaultBranch === 'main'} label="Default branch is main" detail={verifyResult.defaultBranch} />
                  <CheckRow ok={verifyResult.commitsVisible} label="Commits visible via API" />
                  <CheckRow ok={verifyResult.emailMatch} label="Author email matches" detail={verifyResult.latestEmail || 'no commits yet'} />
                  {verifyResult.repoUrl && (
                    <div className={styles.verifyLinks}>
                      <a href={verifyResult.repoUrl} target="_blank" rel="noopener noreferrer">View repo →</a>
                      <a href={verifyResult.profileUrl} target="_blank" rel="noopener noreferrer">View profile →</a>
                    </div>
                  )}
                </div>
              )}

              {verifyResult?.error && (
                <div className={styles.verifyError}>{verifyResult.error}</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CheckRow({ ok, label, detail }) {
  return (
    <div className={styles.checkRow}>
      <span className={ok ? styles.checkPass : styles.checkFail}>{ok ? '✅' : '❌'}</span>
      <span className={styles.checkLabel}>{label}</span>
      {detail && <span className={styles.checkDetail}>— {detail}</span>}
    </div>
  );
}
