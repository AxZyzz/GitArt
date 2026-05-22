import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

const ROWS = 7;
const COLS = 53;
const COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

export default function Hero({ onGetStarted }) {
  const canvasRef = useRef(null);
  const gridRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = 22;
    const gap = 5;
    const total = cellSize + gap;

    canvas.width = COLS * total;
    canvas.height = ROWS * total;

    // init random grid
    if (!gridRef.current) {
      gridRef.current = Array(ROWS).fill(null).map(() =>
        Array(COLS).fill(null).map(() => Math.random() < 0.4 ? Math.floor(Math.random() * 5) : 0)
      );
    }

    let tick = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grid = gridRef.current;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const x = c * total;
          const y = r * total;
          ctx.fillStyle = COLORS[grid[r][c]];
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, cellSize, cellSize, 2);
          } else {
            ctx.rect(x, y, cellSize, cellSize);
          }
          ctx.fill();
        }
      }

      // ripple effect: randomly bump cells
      if (tick % 3 === 0) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        const cur = grid[r][c];
        if (cur < 4) grid[r][c] = cur + 1;
        else grid[r][c] = 0;
      }

      tick++;
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.canvasFade} />
      </div>

      <div className={styles.topLeft}>
        <div className={styles.topLeftBy}>made by <a href="https://www.linkedin.com/in/aman-xavier/" target="_blank" rel="noopener noreferrer">AxZyzz</a></div>
      </div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          open source · free · no account needed
        </div>

        <h1 className={styles.title}>
          <span className={styles.dim}>$</span> paint
          <span className={styles.green}> --your</span>
          <br />
          github
          <span className={styles.green}> --graph</span>
        </h1>

        <p className={styles.subtitle}>
          Turn your GitHub contribution graph into pixel art.
          <br />
          Draw, pick a template, generate a commit script. Done.
        </p>

        <div className={styles.terminal}>
          <div className={styles.termBar}>
            <span className={styles.dot1} />
            <span className={styles.dot2} />
            <span className={styles.dot3} />
            <span className={styles.termTitle}>bash</span>
          </div>
          <div className={styles.termBody}>
            <span className={styles.prompt}>$</span>
            <span className={styles.cmd}> git log --oneline</span>
            <br />
            <span className={styles.out}>a3f9c2d art: heart ♥ committed to the craft</span>
            <br />
            <span className={styles.out}>b7e1d4a art: pixel dreams, one commit at a time</span>
            <br />
            <span className={styles.out}>c2a8f1e init: gitart canvas 2025</span>
            <br />
            <span className={styles.prompt}>$</span>
            <span className={styles.cursor} />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={onGetStarted}>
            Start Drawing
          </button>
          <a className={styles.btnSecondary} href="#templates">
            Browse Templates
          </a>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>53</span>
            <span className={styles.statLabel}>weeks/year</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>365</span>
            <span className={styles.statLabel}>paintable days</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>5</span>
            <span className={styles.statLabel}>intensity levels</span>
          </div>
        </div>
      </div>
    </section>
  );
}
