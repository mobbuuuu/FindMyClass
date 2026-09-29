import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const TELKOM_UNIVERSITY = [-6.9747, 107.6301];
const TELKOM_BOUNDARY = [
  [-6.9712235, 107.6267521], [-6.9712548, 107.6268379], [-6.9713512, 107.6280972],
  [-6.9713819, 107.6284996], [-6.971936, 107.6284781], [-6.9719344, 107.6284312],
  [-6.9719437, 107.6284074], [-6.9719577, 107.6283936], [-6.9731484, 107.6283976],
  [-6.9732909, 107.6282461], [-6.973806, 107.6277861], [-6.9743039, 107.6282313],
  [-6.974871, 107.6287074], [-6.9752204, 107.6290434], [-6.9756444, 107.6290561],
  [-6.9771872, 107.6290481], [-6.977725, 107.6290642], [-6.9777157, 107.6292425],
  [-6.9776837, 107.6294491], [-6.9776425, 107.629732], [-6.9776405, 107.6298387],
  [-6.9776505, 107.62995], [-6.9776897, 107.6301411], [-6.9777357, 107.6305917],
  [-6.9778057, 107.6307462], [-6.9778155, 107.6310799], [-6.9778528, 107.6312086],
  [-6.9779447, 107.6317893], [-6.9778075, 107.6318067], [-6.9777397, 107.6312891],
  [-6.9774654, 107.6315466], [-6.9762394, 107.6327978], [-6.9761877, 107.6328865],
  [-6.9760504, 107.6329319], [-6.9756371, 107.6329654], [-6.9755306, 107.6329688],
  [-6.975446, 107.6329333], [-6.9752184, 107.6326986], [-6.9750573, 107.6325926],
  [-6.9748191, 107.6324698], [-6.9747597, 107.632434], [-6.9744437, 107.6325403],
  [-6.9740603, 107.632598], [-6.9739511, 107.6326248], [-6.9739019, 107.6326382],
  [-6.9732669, 107.6333047], [-6.9731498, 107.6334415], [-6.9730965, 107.6334992],
  [-6.9721713, 107.6335354], [-6.9721221, 107.6334442], [-6.9720409, 107.6335066],
  [-6.9714512, 107.6326704], [-6.9709586, 107.6319851], [-6.9704453, 107.6311774],
  [-6.9703549, 107.6310401], [-6.970285, 107.6309752], [-6.9697046, 107.6307312],
  [-6.9696267, 107.630347], [-6.9692014, 107.6286001], [-6.9684853, 107.628462],
  [-6.9684786, 107.6280342], [-6.9685079, 107.6275742], [-6.9694956, 107.6277231],
  [-6.9696164, 107.6275597], [-6.9696254, 107.6275329], [-6.9702045, 107.6267943],
  [-6.9707124, 107.6267702],
];
const CAMPUS_PLACES = [
  { name: "Telkom University", position: [-6.9747, 107.6301], kind: "Campus" },
  { name: "Telkom University Library", position: [-6.9729, 107.6294], kind: "Study space" },
  { name: "Telkom University Landmark Tower (TULT)", position: [-6.968949, 107.628111], kind: "Building" },
  { name: "Student Center", position: [-6.9771, 107.6298], kind: "Student spot" },
];

export default function CampusMap() {
  const mapElement = useRef(null);
  const map = useRef(null);
  const locationMarker = useRef(null);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    if (!mapElement.current || map.current) return undefined;
    let disposed = false;
    let campusMap;

    import("leaflet").then(({ default: L }) => {
      if (disposed || !mapElement.current) return;
      campusMap = L.map(mapElement.current, {
        center: TELKOM_UNIVERSITY,
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
      });

      L.control.zoom({ position: "bottomright" }).addTo(campusMap);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(campusMap);

      L.polygon(TELKOM_BOUNDARY, {
        color: "#e36f54",
        weight: 3,
        opacity: 0.95,
        fillColor: "#f39a7d",
        fillOpacity: 0.08,
      }).addTo(campusMap).bindTooltip("Telkom University campus", {
        sticky: true,
      });
      const campusBounds = L.latLngBounds(TELKOM_BOUNDARY);
      campusMap.fitBounds(campusBounds, { padding: [18, 18] });
      campusMap.setMaxBounds(campusBounds.pad(0.08));

      CAMPUS_PLACES.forEach((place) => {
        L.circleMarker(place.position, {
          radius: place.kind === "Campus" ? 10 : 7,
          color: "#ffffff",
          weight: 3,
          fillColor: place.kind === "Campus" ? "#f39a7d" : "#4b8fa4",
          fillOpacity: 1,
        }).addTo(campusMap).bindPopup(`<strong>${place.name}</strong><br />${place.kind}`);
      });

      map.current = campusMap;
    });

    return () => {
      disposed = true;
      campusMap?.remove();
      map.current = null;
      locationMarker.current = null;
    };
  }, []);

  function locateStudent() {
    if (!map.current || !navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }

    setLocationMessage("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const studentPosition = [coords.latitude, coords.longitude];
        import("leaflet").then(({ default: L }) => {
          if (!map.current) return;
          if (locationMarker.current) {
            locationMarker.current.remove();
          }
          map.current.setView(studentPosition, 17);
          locationMarker.current = L.circleMarker(studentPosition, {
            radius: 9,
            color: "#ffffff",
            weight: 3,
            fillColor: "#e36f54",
            fillOpacity: 1,
          }).addTo(map.current).bindPopup("<strong>You are here</strong>").openPopup();
          setLocationMessage("Your location is shown on the map.");
        });
      },
      () => setLocationMessage("We could not access your location. Check browser permissions."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="campus-map-shell">
      <div ref={mapElement} className="campus-map" aria-label="OpenStreetMap of Telkom University" />
      <div className="map-zoom-controls" aria-label="Map zoom controls">
        <button type="button" onClick={() => map.current?.zoomIn()} aria-label="Zoom in">+</button>
        <span />
        <button type="button" onClick={() => map.current?.zoomOut()} aria-label="Zoom out">−</button>
      </div>
      <div className="map-overlay">
        <div><strong>Telkom University</strong><span>Bandung campus</span></div>
        <button type="button" onClick={locateStudent} aria-label="Show my location">◎</button>
      </div>
      {locationMessage && <p className="map-status" role="status">{locationMessage}</p>}
    </div>
  );
}
