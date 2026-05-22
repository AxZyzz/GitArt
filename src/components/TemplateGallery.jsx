import { useState } from 'react';
import styles from './TemplateGallery.module.css';
import { TEMPLATES, COLS } from '../data/templates.js';

const CELL = 6;
const GAP = 2;
const COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

function MiniGrid({ grid }) {
  return (
    <div
      className={styles.miniGrid}
      style={{
        gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
        gridTemplateRows: `repeat(7, ${CELL}px)`,
        gap: `${GAP}px`,
      }}
    >
      {grid.map((row, r) =>
        row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: CELL,
              height: CELL,
              borderRadius: '1px',
              background: COLORS[val],
            }}
          />
        ))
      )}
    </div>
  );
}

export default function TemplateGallery({ onSelect, activeId }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.dim}>// </span>Templates
        </h2>
        <p className={styles.sub}>Click any template to load it into the editor.</p>
      </div>

      <div className={styles.grid}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            className={`${styles.card} ${activeId === t.id ? styles.active : ''}`}
            onClick={() => onSelect(t)}
            onMouseEnter={() => setHovered(t.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className={styles.preview}>
              <MiniGrid grid={t.grid} />
              {(hovered === t.id || activeId === t.id) && (
                <div className={styles.previewOverlay}>
                  <span className={styles.useBtn}>
                    {activeId === t.id ? '✓ Active' : 'Use Template'}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.info}>
              <div className={styles.name}>
                <span className={styles.emoji}>{t.emoji}</span>
                {t.name}
              </div>
              <div className={styles.desc}>{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
