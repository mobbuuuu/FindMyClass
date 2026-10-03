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
      aria-label="Selamat datang di FindMyClass"
      aria-modal="true"
    >
      <div className="welcome-video-bg" aria-hidden="true">
        <video autoPlay muted loop playsInline poster="/welcome/campus-poster.jpg">
          <source src="/welcome/campus-profile.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" aria-hidden="true" />
      </div>

      <div className="welcome-content">
        <p className="welcome-eyebrow">FindMyClass</p>
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
    </section>
  );
}