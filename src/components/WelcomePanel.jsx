import { useState, useEffect } from "react";

export default function WelcomePanel({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

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

  return (
    <section
      className={`welcome-panel ${isExiting ? "exiting" : ""}`}
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

      <div className="welcome-content">
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

        {/* Committers section */}
        <div className="committers-section" aria-label="Daftar kontributor">
          <h2 className="committers-title">Committers</h2>
          <ul className="committers-list">
            <li className="committer-item">
              <div className="committer-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 11a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
                </svg>
              </div>
              <div className="committer-info">
                <span className="committer-name">Gorga Enrou Rorizky</span>
                <span className="committer-role">Data Science — Backend Contributor / Front end 2nd contributor</span>
              </div>
            </li>
            <li className="committer-item">
              <div className="committer-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 11a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
                </svg>
              </div>
              <div className="committer-info">
                <span className="committer-name">Muhammad Asyraf</span>
                <span className="committer-role">Informatics — Front End Contributor</span>
              </div>
            </li>
            <li className="committer-item">
              <div className="committer-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 11a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
                </svg>
              </div>
              <div className="committer-info">
                <span className="committer-name">Nadhiska Naila Arsy</span>
                <span className="committer-role">Visual Communication Design — Visual Designer</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}