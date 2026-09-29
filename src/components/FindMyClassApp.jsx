import { useState, useRef, useMemo } from "react";
import CampusMap, { CAMPUS_PLACES } from "./CampusMap.jsx";

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
  const [navigateTo, setNavigateTo] = useState(null);
  const mapRef = useRef(null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return CAMPUS_PLACES.filter(
      (p) => p.name.toLowerCase().includes(q) || p.kind.toLowerCase().includes(q),
    );
  }, [query]);

  function submitSearch(event) {
    event.preventDefault();
    if (searchResults.length === 1) handleNavigate(searchResults[0]);
    else setActiveTab("Search");
  }

  function handleNavigate(place) {
    setNavigateTo({ ...place });
    setQuery("");
    setActiveTab("Explore");
  }

  function handleNavigationEnd() {
    setNavigateTo(null);
  }

  return (
    <main className="map-app" id="map">
      <CampusMap ref={mapRef} navigateTo={navigateTo} onNavigationEnd={handleNavigationEnd} />
      <nav className="liquid-menu" aria-label="Map navigation">
        <Brand />
        <span className="menu-divider" />
        <form className="map-search" onSubmit={submitSearch}>
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a class or place..."
            aria-label="Find a class or place"
            autoComplete="off"
          />
          {query && (
            <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear search">×</button>
          )}
        </form>
        <span className="menu-divider menu-divider-desktop" />
        <div className="menu-tabs">
          {["Explore", "Saved"].map((tab) => (
            <button
              className={activeTab === tab ? "menu-tab active" : "menu-tab"}
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon">{tab === "Explore" ? "⌖" : "♡"}</span>
              <span>{tab}</span>
            </button>
          ))}
        </div>
        <button className="profile-button" type="button" aria-label="Open profile">AS</button>
      </nav>

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
                onClick={() => handleNavigate(place)}
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

      {navigateTo && (
        <div className="search-toast" role="status">
          Navigasi ke <strong>{navigateTo.name}</strong>
        </div>
      )}
    </main>
  );
}
