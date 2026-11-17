import { useState } from 'react';
import styles from './TutorialVideo.module.css';

export const TUTORIAL_ID = 'JpHKqhPetHo';
export const TUTORIAL_URL = `https://youtu.be/${TUTORIAL_ID}`;

const STEPS = [
  { n: '01', title: 'Draw', text: 'Pick a template, type text, or paint the grid yourself.' },
  { n: '02', title: 'Export', text: 'Choose the year and download your ready-to-run script.' },
  { n: '03', title: 'Run', text: 'Run it with Node against a new empty repo. Your graph updates.' },
];

// Click-to-load YouTube embed: shows the thumbnail first and only loads the
// player (and YouTube's scripts) once the visitor presses play.
export default function TutorialVideo() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.player}>
        {playing ? (
          <iframe
            className={styles.frame}
            src={`https://www.youtube-nocookie.com/embed/${TUTORIAL_ID}?autoplay=1&rel=0&modestbranding=1`}
            title="GitArt tutorial: paint your GitHub contribution graph in 2 minutes"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            className={styles.poster}
            onClick={() => setPlaying(true)}
            aria-label="Play the 2-minute GitArt tutorial video"
          >
            <img
              className={styles.thumb}
              src={`https://i.ytimg.com/vi/${TUTORIAL_ID}/hqdefault.jpg`}
              alt=""
              loading="lazy"
            />
            <span className={styles.shade} />
            <span className={styles.play} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
            </span>
            <span className={styles.duration}>2:25</span>
          </button>
        )}
      </div>

      <div className={styles.side}>
        <ol className={styles.steps}>
          {STEPS.map(s => (
            <li key={s.n} className={styles.step}>
              <span className={styles.stepNum}>{s.n}</span>
              <span>
                <span className={styles.stepTitle}>{s.title}</span>
                <span className={styles.stepText}>{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <a className={styles.ytLink} href={TUTORIAL_URL} target="_blank" rel="noopener noreferrer">
          Open on YouTube ↗
        </a>
      </div>
    </div>
  );
}
