import { useState } from 'react';
import { generateFromText, getTextWidth, COLS } from '../data/templates.js';
import styles from './TextGenerator.module.css';

const MAX_COLS = COLS - 2; // leave 1-col margin each side

export default function TextGenerator({ onApply }) {
  const [text, setText] = useState('');

  const upper = text.toUpperCase().replace(/[^A-Z0-9! ]/g, '');
  const width = getTextWidth(upper);
  const fits = width <= MAX_COLS;
  const remaining = upper.trim().length;

  const handleApply = () => {
    if (!upper.trim()) return;
    onApply(generateFromText(upper));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.inputRow}>
          <input
            className={`${styles.input} ${!fits && remaining > 0 ? styles.inputWarn : ''}`}
            type="text"
            placeholder="Type any text — AMAN, RAHUL, HI MOM…"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fits && handleApply()}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            className={styles.btn}
            onClick={handleApply}
            disabled={!upper.trim() || !fits}
          >
            Generate →
          </button>
        </div>

        <div className={styles.meta}>
          {upper.trim() ? (
            fits
              ? <span className={styles.ok}>✓ fits in grid ({width} / {MAX_COLS} cols used)</span>
              : <span className={styles.warn}>⚠ too wide ({width} cols, max {MAX_COLS}) — shorten text</span>
          ) : (
            <span className={styles.hint}>
              Supports A–Z, 0–9, spaces, !
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
