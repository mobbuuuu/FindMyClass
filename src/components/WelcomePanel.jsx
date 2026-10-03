import { useState, useEffect } from "react";

export default function WelcomePanel({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isExiting) return undefined;
    const timer = setTimeout(() => {
      onComplete();
    }, 500);
    return () => clearTimeout(timer);
  }, [isExiting, onComplete]);

  const handleStart = () => {
    setIsExiting(true);
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

      {/* Layer 1: Hero — fixed to viewport center-left, out of scroll flow */}
      <div className={`welcome-hero-layer ${isScrolled ? "scrolled-out" : ""}`}>
        <p className="welcome-eyebrow">TelyuFinder</p>
        <h1 className="welcome-title">
          Telusuri setiap sudut kampus <span>lebih mudah</span>
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

      {/* Layer 2: Committers — in scroll flow, fades in on scroll */}
      <div className={`committers-layer ${isScrolled ? "scrolled-in" : ""}`} aria-label="Daftar kontributor">
        <h2 className="committers-title">Committers</h2>
        <div className="committers-grid">
          <div className="committer-card">
            <div className="committer-avatar">
              <img src="/welcome/committers/gorga.jpg" alt="Gorga Enrou Rorizky" width="88" height="88" loading="lazy" />
            </div>
            <div className="committer-info">
              <span className="committer-name">Gorga Enrou Rorizky</span>
              <span className="committer-role">Data Science — Backend Contributor / Front end 2nd contributor</span>
            </div>
          </div>

          <div className="committer-card">
            <div className="committer-avatar">
              <img src="/welcome/committers/asyraf.jpg" alt="Muhammad Asyraf" width="88" height="88" loading="lazy" />
            </div>
            <div className="committer-info">
              <span className="committer-name">Muhammad Asyraf</span>
              <span className="committer-role">Informatics — Front End Contributor</span>
            </div>
          </div>

          <div className="committer-card">
            <div className="committer-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 11a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
              </svg>
            </div>
            <div className="committer-info">
              <span className="committer-name">Nadhiska Naila Arsy</span>
              <span className="committer-role">Visual Communication Design — Visual Designer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
