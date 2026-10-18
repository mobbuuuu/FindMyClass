import { useState, useEffect } from "react";

const PHRASES = [
  "Bingung dimana kelas kamu?",
  "Bingung mau makan minum dimana?",
  "Nyari toilet terdekat?",
  "Mau ke masjid kampus?",
  "Bingung parkir dimana?",
];

const TYPE_SPEED = 60;
const DELETE_SPEED = 30;
const PAUSE_AFTER_TYPE = 1800;
const PAUSE_AFTER_DELETE = 400;

export default function WelcomePanel({ onComplete, onStartExplore }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isExiting) return undefined;
    const timer = setTimeout(() => { onComplete(); }, 500);
    return () => clearTimeout(timer);
  }, [isExiting, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout;
    const phrase = PHRASES[phraseIdx];

    if (!deleting) {
      if (charIdx < phrase.length) {
        timeout = setTimeout(() => {
          setTypedText(phrase.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        }, TYPE_SPEED);
      } else {
        timeout = setTimeout(() => {
          setDeleting(true);
        }, PAUSE_AFTER_TYPE);
      }
    } else {
      if (charIdx > 0) {
        timeout = setTimeout(() => {
          setTypedText(phrase.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        }, DELETE_SPEED);
      } else {
        timeout = setTimeout(() => {
          setDeleting(false);
          setPhraseIdx(i => (i + 1) % PHRASES.length);
        }, PAUSE_AFTER_DELETE);
      }
    }

    return () => clearTimeout(timeout);
  }, [phraseIdx, charIdx, deleting]);

  const handleStart = () => {
    setIsExiting(true);
    if (onStartExplore) onStartExplore();
  };

  const handleScroll = (e) => {
    setIsScrolled(e.currentTarget.scrollTop > 50);
  };

  return (
    <section
      className={`welcome-panel ${isExiting ? "exiting" : ""} ${isScrolled ? "scrolled" : ""}`}
      onScroll={handleScroll}
      role="dialog"
      aria-label="Selamat datang di TelyuFinder"
      aria-modal="true"
    >
      <div className="welcome-video-bg" aria-hidden="true">
        <video autoPlay muted loop playsInline poster="/welcome/campus-poster.jpg">
          <source src="/welcome/campus-profile.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" aria-hidden="true" />
      </div>

      <div className={`welcome-hero-layer ${isScrolled ? "scrolled-out" : ""}`}>
        <p className="welcome-eyebrow">TelyuFinder</p>
        <h1 className="welcome-title">
          {typedText}
          <span className={`cursor ${cursorVisible ? "on" : ""}`}>|</span>
        </h1>
        <p className="welcome-desc">
          Panduan interaktif Telkom University Bandung — cari ruang kelas, asrama,
          fakultas, dan gerbang kampus dengan rute berjalan real-time.
        </p>
        <button
          type="button"
          className="welcome-btn welcome-btn-next primary"
          onClick={handleStart}
          aria-label="Mulai eksplorasi kampus"
        >
          <span className="btn-label">Mulai Eksplorasi</span>
          <span aria-hidden="true"> →</span>
        </button>
      </div>

      {/* Spacer pushes scroll content below first viewport */}
      <div className="welcome-scroll-spacer" aria-hidden="true" />

      <div className={`committers-layer ${isScrolled ? "scrolled-in" : ""}`} aria-label="Daftar kontributor">
        <h2 className="committers-title">Committers</h2>
        <div className="committers-grid">
          <div className="committer-card">
            <div className="committer-avatar">
              <img src="/welcome/committers/gorga.jpeg" alt="Gorga Enrou Rorizky" width="112" height="112" loading="lazy" />
            </div>
            <div className="committer-info">
              <span className="committer-name">Gorga Enrou Rorizky</span>
              <span className="committer-role">Data Science — Backend Contributor / Front end 2nd contributor</span>
            </div>
          </div>

          <div className="committer-card">
            <div className="committer-avatar">
              <img src="/welcome/committers/asyraf.jpeg" alt="Muhammad Asyraf" width="112" height="112" loading="lazy" />
            </div>
            <div className="committer-info">
              <span className="committer-name">Muhammad Asyraf</span>
              <span className="committer-role">Informatics — Front End Contributor</span>
            </div>
          </div>

          <div className="committer-card">
            <div className="committer-avatar">
              <img src="/welcome/committers/nadhinka.png" alt="Nadhinka Naila Arsy" width="112" height="112" loading="lazy" />
            </div>
            <div className="committer-info">
                <span className="committer-name">Nadhinka Naila Arsy</span>
              <span className="committer-role">Visual Communication Design — Visual Designer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
