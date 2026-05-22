import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './PixelGrid.module.css';
import { emptyGrid, ROWS, COLS } from '../data/templates.js';
import { INTENSITY_TO_COMMITS } from '../utils/scriptGenerator.js';

const COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const LABELS = ['None', 'Light', 'Medium', 'Dark', 'Max'];
const CELL = 13;
const GAP = 3;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PixelGrid({ grid, onChange, year }) {
  const [drawLevel, setDrawLevel] = useState(4);
  const [eraseMode, setEraseMode] = useState(false);
  const isDrawing = useRef(false);

  const effectiveLevel = eraseMode ? 0 : drawLevel;

  const startOffset = new Date(year, 0, 1).getDay();
  const endOffset = new Date(year, 11, 31).getDay();
  const isDisabled = (r, c) =>
    (c === 0 && r < startOffset) || (c === COLS - 1 && r > endOffset);

  const paint = useCallback((row, col) => {
    if ((col === 0 && row < startOffset) || (col === COLS - 1 && row > endOffset)) return;
    const next = grid.map(r => [...r]);
    next[row][col] = effectiveLevel;
    onChange(next);
  }, [grid, onChange, effectiveLevel, startOffset, endOffset]);

  const handleMouseDown = (e, row, col) => {
    e.preventDefault();
    isDrawing.current = true;
    paint(row, col);
  };

  const handleMouseEnter = (row, col) => {
    if (isDrawing.current) paint(row, col);
  };

  useEffect(() => {
    const up = () => { isDrawing.current = false; };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const clearGrid = () => onChange(emptyGrid());

  const fillGrid = () => {
    onChange(grid.map((row, r) => row.map((v, c) => isDisabled(r, c) ? 0 : drawLevel)));
  };

  const invertGrid = () => {
    onChange(grid.map((row, r) => row.map((v, c) => isDisabled(r, c) ? 0 : (v === 0 ? drawLevel : 0))));
  };

  const totalCells = grid.flat().filter(v => v > 0).length;
  const totalCommits = grid.flat().reduce((s, v) => s + (INTENSITY_TO_COMMITS[v] ?? 0), 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <span className={styles.toolLabel}>Intensity</span>
          <div className={styles.levels}>
            {COLORS.map((color, i) => (
              <button
                key={i}
                className={`${styles.levelBtn} ${drawLevel === i && !eraseMode ? styles.active : ''}`}
                style={{ '--color': color }}
                title={LABELS[i]}
                onClick={() => { setDrawLevel(i); setEraseMode(false); }}
              />
            ))}
          </div>
        </div>

        <div className={styles.toolGroup}>
          <button
            className={`${styles.tool} ${eraseMode ? styles.toolActive : ''}`}
            onClick={() => setEraseMode(e => !e)}
            title="Eraser (E)"
          >
            ⌫ Erase
          </button>
        </div>

        <div className={styles.toolGroup}>
          <button className={styles.tool} onClick={clearGrid}>Clear</button>
          <button className={styles.tool} onClick={fillGrid}>Fill</button>
          <button className={styles.tool} onClick={invertGrid}>Invert</button>
        </div>

        <div className={styles.stats}>
          <span className={styles.statItem}>
            <span className={styles.statVal}>{totalCells}</span> active cells
          </span>
          <span className={styles.statSep}>·</span>
          <span className={styles.statItem}>
            <span className={styles.statVal}>~{totalCommits}</span> commits
          </span>
        </div>
      </div>

      <div className={styles.gridWrap}>
        <div className={styles.dayLabels}>
          {DAYS.map(d => <span key={d} className={styles.dayLabel}>{d}</span>)}
        </div>

        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
            gap: `${GAP}px`,
          }}
          onContextMenu={e => e.preventDefault()}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const disabled = isDisabled(r, c);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`${styles.cell} ${disabled ? styles.cellDisabled : ''}`}
                  style={{ background: disabled ? '#0a0e13' : COLORS[val] }}
                  onMouseDown={disabled ? undefined : e => handleMouseDown(e, r, c)}
                  onMouseEnter={disabled ? undefined : () => handleMouseEnter(r, c)}
                  title={disabled ? 'Outside year range' : `Week ${c + 1}, ${DAYS[r]} — Level ${val}`}
                />
              );
            })
          )}
        </div>

        <div className={styles.legend}>
          <span className={styles.legendLabel}>Less</span>
          {COLORS.map((c, i) => (
            <div key={i} className={styles.legendCell} style={{ background: c }} />
          ))}
          <span className={styles.legendLabel}>More</span>
        </div>
      </div>

      <p className={styles.hint}>
        Click or drag to paint · Right-click = erase · Use intensity levels for shading
      </p>
    </div>
  );
}
