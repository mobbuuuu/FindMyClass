import { useState, useRef, useMemo, useEffect } from "react";
import CampusMap, { CAMPUS_PLACES } from "./CampusMap.jsx";

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "lecture", label: "Kuliah (GKU)", kinds: ["Lecture"] },
  { id: "faculty", label: "Fakultas", kinds: ["Faculty"] },
  { id: "gate", label: "Gerbang", kinds: ["Gate"] },
  { id: "dorm_food", label: "Asrama & Makan", kinds: ["Dormitory", "Cafe", "Food Court", "Canteen"] },
  { id: "facility", label: "Fasilitas & Ibadah", kinds: ["Mosque", "Hall", "Building", "Study space", "Sports", "Landmark", "Campus"] },
];

function Brand() {
  return (
    <a className="brand map-brand" href="#map" aria-label="FindMyClass home">
      <span className="brand-mark" aria-hidden="true">+</span>
      <span>Find<span>MyClass</span></span>
    </a>
  );
}

export default function FindMyClassApp() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Explore");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [navigateTo, setNavigateTo] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showGatePicker, setShowGatePicker] = useState(false);
  const [selectedTransportMode, setSelectedTransportMode] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([
    CAMPUS_PLACES.find((p) => p.name.includes("Landmark Tower")) || CAMPUS_PLACES[0],
    CAMPUS_PLACES.find((p) => p.name.includes("Library")) || CAMPUS_PLACES[1],
  ].filter(Boolean));
  const mapRef = useRef(null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CAMPUS_PLACES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q),
    );
  }, [query]);

  const categoryPlaces = useMemo(() => {
    if (selectedCategory === "all") return [];
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    if (!cat || !cat.kinds) return [];
    return CAMPUS_PLACES.filter((p) => cat.kinds.includes(p.kind));
  }, [selectedCategory]);

  // Keyboard navigation: Escape clears search or active modal
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (query) {
          setQuery("");
        } else if (navigateTo) {
          handleNavigationEnd();
        } else if (selectedPlace) {
          setSelectedPlace(null);
        } else if (selectedCategory !== "all") {
          setSelectedCategory("all");
        } else if (showProfile) {
          setShowProfile(false);
        } else if (activeTab === "Saved") {
          setActiveTab("Explore");
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query, navigateTo, selectedPlace, selectedCategory, showProfile, activeTab]);

  function submitSearch(event) {
    event.preventDefault();
    event.currentTarget.querySelector("input")?.blur();
    if (searchResults.length === 1) handleSelectPlace(searchResults[0]);
    else setActiveTab("Search");
  }

  function handleSelectPlace(place) {
    setSelectedPlace(place);
    mapRef.current?.panToPlace(place);
  }

  function handleNavigate(place, mode = "walk") {
    // For motor/car, show gate picker first
    if (mode === "motor" || mode === "car") {
      setSelectedTransportMode(mode);
      setShowTransportModal(false);
      setShowGatePicker(true);
      return;
    }
    // For walk/beam, navigate directly
    setNavigateTo({ ...place, mode });
    setSelectedPlace(null);
    setShowTransportModal(false);
    setQuery("");
    setShowProfile(false);
    setActiveTab("Explore");
  }

  function handleSelectGate(gate) {
    const mode = selectedTransportMode;
    if (!mode || !selectedPlace) return;
    setNavigateTo({ ...selectedPlace, mode, gate });
    setSelectedPlace(null);
    setShowGatePicker(false);
    setSelectedTransportMode(null);
    setQuery("");
    setShowProfile(false);
    setActiveTab("Explore");
  }

  function handleNavigationEnd() {
    setNavigateTo(null);
    mapRef.current?.clearRoute();
  }

  function toggleSavePlace(place) {
    setSavedPlaces((prev) => {
      const exists = prev.some((p) => p.name === place.name);
      if (exists) {
        return prev.filter((p) => p.name !== place.name);
      }
      return [...prev, place];
    });
  }

  return (
    <main className="map-app" id="map">
      <CampusMap
        ref={mapRef}
        navigateTo={navigateTo}
        onNavigationEnd={handleNavigationEnd}
        onSelectPlace={handleSelectPlace}
      />

      {/* Floating Top Navigation Header */}
      <header className="top-nav-stack">
        <nav className="liquid-menu" aria-label="Navigasi peta">
          <Brand />
          <span className="menu-divider" />
          <form className="map-search" onSubmit={submitSearch}>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kelas atau gedung..."
              aria-label="Cari kelas atau gedung"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              inputMode="search"
              enterKeyHint="search"
            />
            {query && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setQuery("")}
                aria-label="Hapus teks pencarian"
              >
                ×
              </button>
            )}
          </form>
          <span className="menu-divider menu-divider-desktop" />
          <div className="menu-tabs">
            {["Explore", "Saved"].map((tab) => (
              <button
                className={activeTab === tab ? "menu-tab active" : "menu-tab"}
                key={tab}
                type="button"
                aria-label={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowProfile(false);
                }}
              >
                <span className="tab-icon" aria-hidden="true">{tab === "Explore" ? "⌖" : "♡"}</span>
                <span>{tab}</span>
              </button>
            ))}
          </div>
          <button
            className="profile-button"
            type="button"
            aria-label="Buka profil pengguna"
            aria-expanded={showProfile}
            onClick={() => {
              setShowProfile((prev) => !prev);
              if (activeTab === "Saved") setActiveTab("Explore");
            }}
          >
            AS
          </button>
        </nav>

        {/* Category Filter Chips Bar */}
        <div className="category-chips-bar" role="toolbar" aria-label="Kategori fasilitas kampus">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-chip ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory && cat.id !== "all" ? "all" : cat.id);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick items list when a specific category is selected */}
        {categoryPlaces.length > 0 && (
          <div className="category-places-strip" role="listbox" aria-label="Daftar gedung dalam kategori">
            {categoryPlaces.map((place) => (
              <button
                key={place.name}
                type="button"
                className="category-place-pill"
                onClick={() => handleSelectPlace(place)}
              >
                <span className="pill-dot" aria-hidden="true" />
                <span>{place.name}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Search results dropdown */}
      {query.trim() && (
        <div className="search-results-dropdown" role="listbox" aria-label="Hasil pencarian">
          {searchResults.length === 0 ? (
            <div className="search-no-result">Tidak ditemukan "{query}"</div>
          ) : (
            searchResults.map((place) => (
              <button
                key={place.name}
                className="search-result-item"
                type="button"
                role="option"
                onClick={() => {
                  handleSelectPlace(place);
                  setQuery("");
                }}
              >
                <span className="search-result-icon" aria-hidden="true">⌖</span>
                <div className="search-result-text">
                  <strong>{place.name}</strong>
                  <span>{place.kind}</span>
                </div>
                <span className="search-result-go" aria-hidden="true">→</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Interactive Place Preview Card (Bottom Center) */}
      {selectedPlace && !navigateTo && (
        <section className="place-preview-card" role="dialog" aria-label={`Detail lokasi ${selectedPlace.name}`}>
          <div className="place-preview-header">
            <div>
              <span className="place-kind-badge">{selectedPlace.kind}</span>
              <h2 className="place-name">{selectedPlace.name}</h2>
              {selectedPlace.address && (
                <p className="place-address">{selectedPlace.address}</p>
              )}
            </div>
            <button
              type="button"
              className="place-close-btn"
              onClick={() => setSelectedPlace(null)}
              aria-label="Tutup pratinjau lokasi"
            >
              ×
            </button>
          </div>
          <div className="place-preview-actions">
            <button
              type="button"
              className="btn-start-route"
              onClick={() => setShowTransportModal(true)}
              aria-label={`Pilih moda rute ke ${selectedPlace.name}`}
            >
              <span aria-hidden="true">➔</span>
              <span>Mulai Rute</span>
            </button>
            <button
              type="button"
              className={`btn-save-place ${savedPlaces.some((p) => p.name === selectedPlace.name) ? "saved" : ""}`}
              onClick={() => toggleSavePlace(selectedPlace)}
              aria-label={savedPlaces.some((p) => p.name === selectedPlace.name) ? "Hapus dari tersimpan" : "Simpan lokasi"}
            >
              <span aria-hidden="true">{savedPlaces.some((p) => p.name === selectedPlace.name) ? "★" : "♡"}</span>
              <span>{savedPlaces.some((p) => p.name === selectedPlace.name) ? "Tersimpan" : "Simpan"}</span>
            </button>
          </div>
        </section>
      )}

      {/* Modal / Dialog Pemilihan Moda Transportasi Kampus */}
      {selectedPlace && showTransportModal && !navigateTo && (
        <section className="transport-modal-card" role="dialog" aria-label="Pilih Moda Transportasi">
          <div className="transport-modal-header">
            <div>
              <span className="place-kind-badge">Opsi Perjalanan</span>
              <h3 className="place-name">Pilih Moda Kendaraan</h3>
              <p className="place-address">Tujuan: <strong>{selectedPlace.name}</strong></p>
            </div>
            <button
              type="button"
              className="place-close-btn"
              onClick={() => setShowTransportModal(false)}
              aria-label="Tutup pemilihan kendaraan"
            >
              ×
            </button>
          </div>
          <div className="transport-options-list">
            <button
              type="button"
              className="transport-option-btn"
              onClick={() => handleNavigate(selectedPlace, "walk")}
            >
              <span className="transport-icon">🚶</span>
              <div className="transport-info">
                <strong>Jalan Kaki</strong>
                <span>Rute pedestrian kampus</span>
              </div>
            </button>

            <button
              type="button"
              className="transport-option-btn"
              onClick={() => handleNavigate(selectedPlace, "motor")}
            >
              <span className="transport-icon">🏍️</span>
              <div className="transport-info">
                <strong>Motor Pribadi</strong>
                <span>Wajib parkir samping Sport Center</span>
              </div>
            </button>

            <button
              type="button"
              className="transport-option-btn"
              onClick={() => handleNavigate(selectedPlace, "car")}
            >
              <span className="transport-icon">🚗</span>
              <div className="transport-info">
                <strong>Mobil Pribadi</strong>
                <span>Wajib parkir mobil samping Sport Center</span>
              </div>
            </button>

            <button
              type="button"
              className="transport-option-btn"
              onClick={() => handleNavigate(selectedPlace, "beam")}
            >
              <span className="transport-icon">⚡</span>
              <div className="transport-info">
                <strong>Motor Listrik BEAM</strong>
                <span>Bebas lawan arah / lewat Sport Center</span>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* Gate Picker Modal (for Motor/Mobil Pribadi) */}
      {selectedPlace && showGatePicker && !navigateTo && (
        <section className="transport-modal-card" role="dialog" aria-label="Pilih Gerbang Masuk">
          <div className="transport-modal-header">
            <div>
              <span className="place-kind-badge">Gerbang Masuk</span>
              <h3 className="place-name">Pilih Gerbang Masuk Kampus</h3>
              <p className="place-address">Moda: <strong>{selectedTransportMode === "motor" ? "Motor Pribadi" : "Mobil Pribadi"}</strong> → Parkir di Sport Center</p>
            </div>
            <button
              type="button"
              className="place-close-btn"
              onClick={() => setShowGatePicker(false)}
              aria-label="Tutup pemilihan gerbang"
            >
              ×
            </button>
          </div>
          <div className="transport-options-list">
            {CAMPUS_PLACES.filter((p) => p.kind === "Gate").map((gate) => (
              <button
                key={gate.name}
                type="button"
                className="transport-option-btn"
                onClick={() => handleSelectGate(gate)}
              >
                <span className="transport-icon">🚪</span>
                <div className="transport-info">
                  <strong>{gate.name}</strong>
                  <span>Masuk via {gate.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Saved Places Tab Panel */}
      {activeTab === "Saved" && (
        <section className="saved-places-panel" aria-label="Lokasi tersimpan">
          <div className="saved-header">
            <h3>Lokasi Tersimpan</h3>
            <button
              type="button"
              className="saved-close-button"
              aria-label="Tutup panel tersimpan"
              onClick={() => setActiveTab("Explore")}
            >
              ×
            </button>
          </div>
          {savedPlaces.length === 0 ? (
            <div className="saved-empty">
              <div className="saved-empty-icon" aria-hidden="true">♡</div>
              <p>Belum ada lokasi yang disimpan. Cari kelas atau gedung untuk menandainya sebagai favorit.</p>
              <button
                type="button"
                className="saved-explore-button"
                onClick={() => setActiveTab("Explore")}
              >
                Jelajahi Kampus
              </button>
            </div>
          ) : (
            savedPlaces.map((place) => (
              <div key={place.name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <button
                  className="search-result-item"
                  type="button"
                  style={{ flex: 1 }}
                  onClick={() => {
                    handleSelectPlace(place);
                    setActiveTab("Explore");
                  }}
                >
                  <span className="search-result-icon" aria-hidden="true">★</span>
                  <div className="search-result-text">
                    <strong>{place.name}</strong>
                    <span>{place.kind}</span>
                  </div>
                  <span className="search-result-go" aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSavePlace(place)}
                  aria-label={`Hapus ${place.name} dari tersimpan`}
                  style={{
                    minWidth: "44px",
                    minHeight: "44px",
                    border: 0,
                    background: "transparent",
                    color: "var(--muted)",
                    fontSize: "18px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {/* Profile Card Popover */}
      {showProfile && (
        <section className="profile-card-popover" aria-label="Informasi profil">
          <div className="profile-card-header">
            <div className="profile-identity">
              <div className="profile-avatar-large" aria-hidden="true">AS</div>
              <div>
                <div className="profile-name">Asyraf</div>
                <div className="profile-role">Mahasiswa - Telkom University</div>
              </div>
            </div>
            <button
              type="button"
              className="profile-close-btn"
              aria-label="Tutup profil"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>
          </div>
          <div className="profile-status-box">
            <span className="profile-status-badge" aria-hidden="true" />
            <strong>Navigasi Offline Siap</strong>
            <div>Peta jalan kampus dan panduan kompas aktif tanpa koneksi data eksternal.</div>
          </div>
          <button
            type="button"
            className="saved-explore-button"
            style={{ width: "100%" }}
            onClick={() => setShowProfile(false)}
          >
            Tutup
          </button>
        </section>
      )}

      {navigateTo && (
        <div className="search-toast" role="status">
          <span>Navigasi aktif ke <strong>{navigateTo.name}</strong></span>
          <button
            type="button"
            className="toast-exit-btn"
            onClick={handleNavigationEnd}
            aria-label="Batalkan navigasi"
          >
            Akhiri ✕
          </button>
        </div>
      )}
    </main>
  );
}
