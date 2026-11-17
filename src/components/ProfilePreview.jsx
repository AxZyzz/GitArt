import styles from './ProfilePreview.module.css';
import { ROWS, COLS } from '../data/templates.js';
import { INTENSITY_TO_COMMITS } from '../utils/scriptGenerator.js';
import { LEVEL_VARS as COLORS } from '../lib/palette.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const PITCH = 13; // cell 10px + gap 3px

// Week column a date falls in, using the same layout as the editor and script.
function weekCol(year, month, day) {
  const startOffset = new Date(year, 0, 1).getDay();
  const dayOfYear = Math.round((new Date(year, month, day) - new Date(year, 0, 1)) / 86400000);
  return Math.floor((dayOfYear + startOffset) / 7);
}

// Shows the art the way it will appear on a GitHub profile for the chosen year:
// month labels, Mon/Wed/Fri, real commit total, and no cells outside the year.
export default function ProfilePreview({ grid, year, years, onYearChange }) {
  const startOffset = new Date(year, 0, 1).getDay();
  const endOffset = new Date(year, 11, 31).getDay();
  const outside = (r, c) => (c === 0 && r < startOffset) || (c === COLS - 1 && r > endOffset);

  let total = 0;
  grid.forEach((row, r) => row.forEach((v, c) => { if (!outside(r, c)) total += INTENSITY_TO_COMMITS[v] ?? 0; }));

  const monthCols = MONTHS.map((m, i) => ({ m, col: weekCol(year, i, 1) }));

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.who}>
          <span className={styles.avatar} aria-hidden="true" />
          <span className={styles.handle}>@you</span>
        </div>
        <div className={styles.years} role="tablist" aria-label="Preview year">
          {years.map(y => (
            <button
              key={y}
              role="tab"
              aria-selected={y === year}
              className={`${styles.yearBtn} ${y === year ? styles.yearActive : ''}`}
              onClick={() => onYearChange(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.count}>
        <strong>{total.toLocaleString()}</strong> contributions in {year}
      </div>

      <div className={styles.scroller}>
        <div className={styles.calendar}>
          <div className={styles.months} style={{ width: COLS * PITCH }}>
            {monthCols.map(({ m, col }) => (
              <span key={m} style={{ left: col * PITCH }}>{m}</span>
            ))}
          </div>
          <div className={styles.body}>
            <div className={styles.days}>
              {DAY_LABELS.map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div
              className={styles.grid}
              style={{ gridTemplateColumns: `repeat(${COLS}, 10px)`, gridTemplateRows: `repeat(${ROWS}, 10px)` }}
            >
              {grid.map((row, r) =>
                row.map((v, c) => (
                  <span
                    key={`${r}-${c}`}
                    className={styles.cell}
                    style={{
                      gridRow: r + 1,
                      gridColumn: c + 1,
                      background: outside(r, c) ? 'transparent' : COLORS[v],
                      borderColor: outside(r, c) ? 'transparent' : undefined,
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.foot}>
        <span>Commits per cell: light 2 · medium 8 · dark 25 · max 50</span>
        <span className={styles.legend}>
          Less
          {COLORS.map((c, i) => <span key={i} className={styles.cell} style={{ background: c }} />)}
          More
        </span>
      </div>
    </div>
  );
}
