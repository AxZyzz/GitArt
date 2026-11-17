import { useState } from 'react';
import styles from './ConsentModal.module.css';

// Shown on Download. Email is entirely optional — both buttons download.
export default function ConsentModal({ onDownload, onClose, defaultEmail = '' }) {
  const [email, setEmail] = useState(defaultEmail);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const subscribe = () => valid && onDownload(email.trim());

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="dl-title">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.icon}>⬇</div>

        <h2 id="dl-title" className={styles.title}>Your script is ready</h2>

        <p className={styles.body}>
          Want a note when we ship new templates and features? Drop your email below.
          <br />
          <strong>Totally optional</strong>. Skip it and the download starts right away.
        </p>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="email"
            placeholder="your@email.com (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && subscribe()}
            autoFocus
          />
        </div>

        <p className={styles.fine}>
          No spam. Unsubscribe anytime.
        </p>

        <div className={styles.actions}>
          <button className={styles.declineBtn} onClick={() => onDownload(null)}>
            Skip &amp; download
          </button>
          <button className={styles.acceptBtn} onClick={subscribe} disabled={!valid}>
            Subscribe &amp; download
          </button>
        </div>
      </div>
    </div>
  );
}
