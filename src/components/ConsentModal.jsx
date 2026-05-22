import { useState } from 'react';
import styles from './ConsentModal.module.css';

export default function ConsentModal({ onAccept, onDecline, onClose, defaultEmail = '' }) {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleAccept = async () => {
    if (!valid) { setError('Enter a valid email.'); return; }
    setLoading(true);
    setError('');
    try {
      await onAccept(email.trim());
    } catch (e) {
      setError(e.message || 'Failed to save. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.icon}>📬</div>

        <h2 className={styles.title}>One quick thing before you download</h2>

        <p className={styles.body}>
          GitArt stores your email to send occasional updates — new templates, features, and improvements.
          <br /><br />
          <strong>Don't want that?</strong> No problem. You can{' '}
          <a
            href="https://github.com/AxZyzz/GitArt"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            clone the repo
          </a>
          {' '}and run it locally, or copy the script directly from the preview above.
        </p>

        <div className={styles.inputRow}>
          <input
            className={`${styles.input} ${error ? styles.inputErr : ''}`}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && !loading && handleAccept()}
            autoFocus
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.fine}>
          No spam. Unsubscribe anytime. Email stored securely in Supabase.
        </p>

        <div className={styles.actions}>
          <button className={styles.declineBtn} onClick={onDecline}>
            No thanks — copy instead
          </button>
          <button
            className={styles.acceptBtn}
            onClick={handleAccept}
            disabled={loading || !email}
          >
            {loading ? 'Saving...' : 'Accept & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
