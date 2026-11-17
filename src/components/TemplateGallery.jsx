import { useState } from 'react';
import styles from './TemplateGallery.module.css';
import { TEMPLATES, TEMPLATE_CATEGORIES, COLS } from '../data/templates.js';
import { LEVEL_VARS as COLORS } from '../lib/palette.js';

const CELL = 6;
const GAP = 2;

function MiniGrid({ grid }) {
  return (
    <div
      className={styles.miniGrid}
      style={{
        // Cells shrink on narrow cards so the whole year (incl. December) stays visible.
        gridTemplateColumns: `repeat(${COLS}, minmax(0, ${CELL}px))`,
        width: '100%',
        maxWidth: COLS * CELL + (COLS - 1) * GAP,
        gap: `${GAP}px`,
      }}
    >
      {grid.map((row, r) =>
        row.map((val, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              aspectRatio: '1',
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
  const [filter, setFilter] = useState('All');

  const filters = [
    { key: 'All', count: TEMPLATES.length },
    { key: 'New', count: TEMPLATES.filter(t => t.isNew).length },
    ...TEMPLATE_CATEGORIES.map(key => ({ key, count: TEMPLATES.filter(t => t.category === key).length })),
  ].filter(f => f.count > 0);

  const visible = TEMPLATES.filter(t =>
    filter === 'All' ? true : filter === 'New' ? t.isNew : t.category === filter
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.dim}>// </span>Templates
        </h2>
        <p className={styles.sub}>Click any template to load it into the editor.</p>
      </div>

      <div className={styles.filters} role="tablist" aria-label="Template categories">
        {filters.map(f => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.key}
            <span className={styles.filterCount}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visible.map(t => (
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
                {t.isNew && <span className={styles.newTag}>new</span>}
              </div>
              <div className={styles.desc}>{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
