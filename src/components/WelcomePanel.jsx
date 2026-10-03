import { useState, useRef, useEffect } from "react";

const WELCOME_SLIDES = [
  {
    id: 1,
    image: "/welcome/campus-overview.jpg",
    caption: "Selamat datang di Telkom University",
    description: "Kampus digital terbesar di Indonesia dengan fasilitas modern dan lingkungan hijau.",
  },
  {
    id: 2,
    image: "/welcome/library.jpg",
    caption: "Perpustakaan Digital & Ruang Belajar",
    description: "Akses ribuan jurnal, e-book, dan ruang kolaboratif 24 jam untuk mendukung akademikmu.",
  },
  {
    id: 3,
    image: "/welcome/sport-center.jpg",
    caption: "Sport Center & Area Parkir",
    description: "Fasilitas olahraga lengkap dan area parkir terpusat untuk kendaraan pribadi & BEAM.",
  },
  {
    id: 4,
    image: "/welcome/dorm-food.jpg",
    caption: "Asrama & Kuliner Kampus",
    description: "Hunian nyaman dan berbagai pilihan makan sehat di Food Court, Canteen, dan Cafe.",
  },
];

export default function WelcomePanel({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const slidesRef = useRef(null);

  const goNext = () => {
    if (currentIndex < WELCOME_SLIDES.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleComplete();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "Escape") handleComplete();
    if (e.key === "Enter" && currentIndex === WELCOME_SLIDES.length - 1) handleComplete();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  useEffect(() => {
    if (slidesRef.current) {
      slidesRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  const slide = WELCOME_SLIDES[currentIndex];
  const isLast = currentIndex === WELCOME_SLIDES.length - 1;

  return (
    <section
      className={`welcome-panel ${isExiting ? "exiting" : ""}`}
      role="dialog"
      aria-label="Selamat datang di FindMyClass"
      aria-modal="true"
    >
      {/* Background Video Layer */}
      <div className="welcome-video-bg" aria-hidden="true">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster="/welcome/campus-poster.jpg"
          onCanPlay={() => setVideoReady(true)}
          aria-hidden="true"
        >
          <source src="/welcome/campus-profile.mp4" type="video/mp4" />
        </video>
        <div className="video-overlay" aria-hidden="true" />
      </div>

      {/* Slides Carousel */}
      <div className="welcome-slides-container" ref={slidesRef} role="group" aria-roledescription="slide" aria-label="Slide sambutan">
        {WELCOME_SLIDES.map((s, i) => (
          <div key={s.id} className="welcome-slide" role="slide" aria-roledescription="slide" aria-label={`Slide ${i + 1} dari ${WELCOME_SLIDES.length}`}>
            <div className="slide-content">
              <div className="slide-image-wrapper">
                <img
                  src={s.image}
                  alt=""
                  loading={i === 0 ? "eager" : "lazy"}
                  className="slide-image"
                  aria-hidden="true"
                />
                <div className="image-caption">{s.caption}</div>
              </div>
              <div className="slide-text">
                <h2>{s.caption}</h2>
                <p>{s.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <nav className="welcome-dots" aria-label="Navigasi slide">
        {WELCOME_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`welcome-dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Ke slide ${i + 1}`}
            aria-current={i === currentIndex ? "true" : "false"}
          />
        ))}
      </nav>

      {/* Navigation Buttons */}
      <div className="welcome-nav">
        <button
          type="button"
          className="welcome-btn welcome-btn-prev"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Slide sebelumnya"
          aria-disabled={currentIndex === 0}
        >
          <span aria-hidden="true">←</span>
          <span className="btn-label">Sebelumnya</span>
        </button>

        <button
          type="button"
          className={`welcome-btn welcome-btn-next ${isLast ? "primary" : ""}`}
          onClick={goNext}
          aria-label={isLast ? "Mulai eksplorasi" : "Selanjutnya"}
        >
          <span className="btn-label">{isLast ? "Mulai Eksplorasi" : "Selanjutnya"}</span>
          <span aria-hidden="true">{isLast ? "→" : "→"}</span>
        </button>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        className="welcome-skip"
        onClick={handleComplete}
        aria-label="Lewati sambutan"
      >
        Lewati
      </button>
    </section>
  );
}