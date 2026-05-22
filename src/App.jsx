import { useState, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import PixelGrid from './components/PixelGrid.jsx';
import TemplateGallery from './components/TemplateGallery.jsx';
import ScriptExporter from './components/ScriptExporter.jsx';
import { emptyGrid } from './data/templates.js';
import TextGenerator from './components/TextGenerator.jsx';
import styles from './App.module.css';

export default function App() {
  const [grid, setGrid] = useState(emptyGrid);
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const editorRef = useRef(null);

  const handleTemplateSelect = (template) => {
    setGrid(template.grid.map(row => [...row]));
    setActiveTemplateId(template.id);
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGridChange = (newGrid) => {
    setGrid(newGrid);
    setActiveTemplateId(null);
  };

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.app}>
      <Navbar />

      <Hero onGetStarted={scrollToEditor} />

      <main className={styles.main}>
        <section id="templates" className={styles.section}>
          <TemplateGallery onSelect={handleTemplateSelect} activeId={activeTemplateId} />
        </section>

        <div className={styles.divider}>
          <span className={styles.dividerText}>or type text</span>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.dim}>// </span>Text Generator
            </h2>
            <p className={styles.sectionSub}>
              Type any name or phrase — gets rendered as pixel art on the grid.
            </p>
          </div>
          <TextGenerator onApply={grid => { setGrid(grid); setActiveTemplateId(null); editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} />
        </section>

        <div className={styles.divider}>
          <span className={styles.dividerText}>or draw your own</span>
        </div>

        <section id="editor" ref={editorRef} className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.dim}>// </span>Canvas Editor
            </h2>
            <p className={styles.sectionSub}>
              Paint directly on the contribution graph. Each cell = one day of commits.
            </p>
          </div>
          <PixelGrid grid={grid} onChange={handleGridChange} year={year} />
        </section>

        <section id="export" className={styles.section}>
          <ScriptExporter grid={grid} year={year} onYearChange={setYear} />
        </section>

        <section className={styles.howSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.dim}>// </span>How It Works
            </h2>
          </div>
          <div className={styles.howGrid}>
            <div className={styles.howCard}>
              <div className={styles.howNum}>01</div>
              <div className={styles.howTitle}>GitHub graphs commits</div>
              <div className={styles.howDesc}>
                GitHub counts commits per day and displays them as colored squares.
                Darker = more commits. The graph spans 52 weeks.
              </div>
            </div>
            <div className={styles.howCard}>
              <div className={styles.howNum}>02</div>
              <div className={styles.howTitle}>Git allows backdated commits</div>
              <div className={styles.howDesc}>
                Git's <code>GIT_AUTHOR_DATE</code> env var lets you set any date for a commit.
                That's the trick — we create all commits now, dated to the right days.
              </div>
            </div>
            <div className={styles.howCard}>
              <div className={styles.howNum}>03</div>
              <div className={styles.howTitle}>Empty commits, no spam</div>
              <div className={styles.howDesc}>
                We use <code>git commit --allow-empty</code>. No files are changed.
                This is purely aesthetic — it doesn't affect real project history.
              </div>
            </div>
            <div className={styles.howCard}>
              <div className={styles.howNum}>04</div>
              <div className={styles.howTitle}>Dedicated repo, safe</div>
              <div className={styles.howDesc}>
                Always use a fresh empty repo. GitArt generates a script you run locally —
                no credentials are ever shared or stored.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <span className={styles.footerBracket}>[</span>GitArt<span className={styles.footerBracket}>]</span>
          </div>
          <p className={styles.footerSub}>
            Open source · No accounts · No servers · Just commits.
          </p>
          <div className={styles.footerLinks}>
            <a href="https://github.com/AxZyzz/GitArt" target="_blank" rel="noopener noreferrer">GitHub</a>
            <span>·</span>
            <a href="#editor">Editor</a>
            <span>·</span>
            <a href="#templates">Templates</a>
            <span>·</span>
            <a href="https://www.linkedin.com/in/aman-xavier/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
          <p className={styles.footerDisclaimer}>
            ⚠ This is a fun project — not a tool to fake your GitHub portfolio. Use it for creativity, not to misrepresent your work.
          </p>
          <p className={styles.footerCopy}>
            A fun project by <a href="https://www.linkedin.com/in/aman-xavier/" target="_blank" rel="noopener noreferrer">Aman Xavier</a> · Built with love and too less commits.
          </p>
          <div className={styles.footerCompany}>
            <p className={styles.footerCompanyText}>
              Is your business drowning in manual, repetitive work?{' '}
              <a href="https://a2b.services" target="_blank" rel="noopener noreferrer">
                <strong>A2B AI Technologies</strong>
              </a>{' '}
              builds AI automation solutions that cut the grunt work so your team can focus on what matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
