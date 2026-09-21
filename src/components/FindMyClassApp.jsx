import { useState } from "react";
import CampusMap from "./CampusMap.jsx";

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

  function submitSearch(event) {
    event.preventDefault();
    setActiveTab("Search");
  }

  return (
    <main className="map-app" id="map">
      <CampusMap />
      <nav className="liquid-menu" aria-label="Map navigation">
        <Brand />
        <span className="menu-divider" />
        <form className="map-search" onSubmit={submitSearch}>
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a class or place..." aria-label="Find a class or place" />
          {query && <button type="button" className="clear-search" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </form>
        <span className="menu-divider menu-divider-desktop" />
        <div className="menu-tabs">
          {["Explore", "Saved"].map((tab) => (
            <button className={activeTab === tab ? "menu-tab active" : "menu-tab"} key={tab} type="button" onClick={() => setActiveTab(tab)}>
              <span className="tab-icon">{tab === "Explore" ? "⌖" : "♡"}</span><span>{tab}</span>
            </button>
          ))}
        </div>
        <button className="profile-button" type="button" aria-label="Open profile">AS</button>
      </nav>
      {activeTab === "Search" && query && <div className="search-toast" role="status">Searching campus for <strong>{query}</strong></div>}
    </main>
  );
}
