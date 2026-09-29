import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
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
export const CAMPUS_PLACES = [
  { name: "Telkom University", position: [-6.9747, 107.6301], kind: "Campus" },
  { name: "Telkom University Library", position: [-6.97345, 107.6304], kind: "Study space" },
  { name: "Telkom University Landmark Tower (TULT)", position: [-6.968949, 107.628111], kind: "Building" },
  { name: "Student Center", position: [-6.9771, 107.6298], kind: "Student spot" },
  { name: "Sport Center", position: [-6.97245, 107.6289], kind: "Sports" },
  { name: "Tel-U Coffee", position: [-6.9735, 107.6305], kind: "Cafe" },
  { name: "Asrama Putra", position: [-6.9718, 107.6288], kind: "Dormitory" },
  { name: "Asrama Putri", position: [-6.9735, 107.6295], kind: "Dormitory" },
];

/** Campus road and walkway network nodes [lat, lng] */
const CAMPUS_GRAPH_NODES = {
  // Asrama Putra internal roads
  asrama_p_g5: [-6.9718, 107.6288],
  asrama_p_west: [-6.9718, 107.6285],
  asrama_p_g2: [-6.9718, 107.6291],
  asrama_p_east: [-6.9718, 107.62935],
  asrama_p_southwest: [-6.9722, 107.6285],
  asrama_p_south: [-6.9722, 107.6288],
  asrama_tj_mart: [-6.97218, 107.62935],

  // Sport Center building
  sport_center: [-6.97245, 107.6289],

  // Road north of Sport Center & Parking Lot P
  road_sport_center: [-6.97222, 107.6297],
  road_park_n1: [-6.97226, 107.6301],
  road_park_n2: [-6.97230, 107.6306],
  road_park_n3: [-6.97235, 107.6310],
  road_park_ne: [-6.97238, 107.6313],

  // Road east of Parking Lot P along Danau Galau (the lake)
  road_lake_1: [-6.97250, 107.63128],
  road_lake_2: [-6.97275, 107.63110],
  road_lake_3: [-6.97305, 107.63092],
  road_lake_4: [-6.97330, 107.63085],
  road_library_junc: [-6.97340, 107.63070],
  library_entrance: [-6.97345, 107.63040],

  // Central road / Asrama Putri / KU
  road_asrama_putri: [-6.9735, 107.6295],
  road_ku_west: [-6.97340, 107.6298],
  road_ku_south: [-6.97380, 107.6301],

  // Central boulevard towards Rektorat & Student Center
  road_boulevard_n: [-6.9741, 107.6302],
  telkom_univ: [-6.9747, 107.6301],
  road_boulevard_s: [-6.9755, 107.6300],
  road_student_center_junc: [-6.9765, 107.6299],
  student_center: [-6.9771, 107.6298],

  // North road towards TULT
  road_north_gate: [-6.9708, 107.6283],
  road_tult_approach: [-6.9698, 107.6282],
  tult: [-6.968949, 107.628111],
};

/** Connected walkway segments across campus */
const CAMPUS_GRAPH_EDGES = [
  // Asrama Putra grid
  ["asrama_p_west", "asrama_p_g5"],
  ["asrama_p_g5", "asrama_p_g2"],
  ["asrama_p_g2", "asrama_p_east"],
  ["asrama_p_west", "asrama_p_southwest"],
  ["asrama_p_g5", "asrama_p_south"],
  ["asrama_p_east", "asrama_tj_mart"],
  ["asrama_p_southwest", "asrama_p_south"],
  ["asrama_p_south", "asrama_tj_mart"],

  // Road past Sport Center & along north of Parking Lot P
  ["sport_center", "asrama_tj_mart"],
  ["sport_center", "road_sport_center"],
  ["asrama_tj_mart", "road_sport_center"],
  ["road_sport_center", "road_park_n1"],
  ["road_park_n1", "road_park_n2"],
  ["road_park_n2", "road_park_n3"],
  ["road_park_n3", "road_park_ne"],

  // Curve and road south along the lake to Library / Tel-U Coffee
  ["road_park_ne", "road_lake_1"],
  ["road_lake_1", "road_lake_2"],
  ["road_lake_2", "road_lake_3"],
  ["road_lake_3", "road_lake_4"],
  ["road_lake_4", "road_library_junc"],
  ["road_library_junc", "library_entrance"],

  // Central links around KU & Asrama Putri
  ["road_asrama_putri", "road_ku_west"],
  ["road_ku_west", "library_entrance"],
  ["library_entrance", "road_ku_south"],
  ["road_library_junc", "road_ku_south"],
  ["road_ku_south", "road_boulevard_n"],

  // Boulevard to Rektorat & Student Center
  ["road_boulevard_n", "telkom_univ"],
  ["telkom_univ", "road_boulevard_s"],
  ["road_boulevard_s", "road_student_center_junc"],
  ["road_student_center_junc", "student_center"],

  // North path to TULT
  ["asrama_p_west", "road_north_gate"],
  ["road_north_gate", "road_tult_approach"],
  ["road_tult_approach", "tult"],
];

function distBetween([lat1, lng1], [lat2, lng2]) {
  const dLat = lat1 - lat2;
  const dLng = (lng1 - lng2) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function findNearestNode(point) {
  let nearest = null;
  let minDist = Infinity;
  for (const [id, coords] of Object.entries(CAMPUS_GRAPH_NODES)) {
    const d = distBetween(point, coords);
    if (d < minDist) {
      minDist = d;
      nearest = id;
    }
  }
  return { id: nearest, dist: minDist };
}

function findCampusRoute(from, to) {
  const start = findNearestNode(from);
  const end = findNearestNode(to);
  if (!start.id || !end.id) return null;
  // If either point is too far from campus (> ~1.5 km), don't use campus graph
  if (start.dist > 0.015 || end.dist > 0.015) return null;

  // Adjacency list
  const adj = {};
  for (const id of Object.keys(CAMPUS_GRAPH_NODES)) {
    adj[id] = [];
  }
  for (const [u, v] of CAMPUS_GRAPH_EDGES) {
    if (CAMPUS_GRAPH_NODES[u] && CAMPUS_GRAPH_NODES[v]) {
      const w = distBetween(CAMPUS_GRAPH_NODES[u], CAMPUS_GRAPH_NODES[v]);
      adj[u].push({ node: v, weight: w });
      adj[v].push({ node: u, weight: w });
    }
  }

  // Dijkstra
  const dist = {};
  const prev = {};
  const unvisited = new Set(Object.keys(CAMPUS_GRAPH_NODES));
  for (const id of Object.keys(CAMPUS_GRAPH_NODES)) {
    dist[id] = Infinity;
  }
  dist[start.id] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let minD = Infinity;
    for (const node of unvisited) {
      if (dist[node] < minD) {
        minD = dist[node];
        curr = node;
      }
    }
    if (curr === null || dist[curr] === Infinity || curr === end.id) break;
    unvisited.delete(curr);

    for (const edge of adj[curr]) {
      if (unvisited.has(edge.node)) {
        const alt = dist[curr] + edge.weight;
        if (alt < dist[edge.node]) {
          dist[edge.node] = alt;
          prev[edge.node] = curr;
        }
      }
    }
  }

  if (dist[end.id] === Infinity) return null;

  // Reconstruct path
  const path = [];
  let u = end.id;
  while (u) {
    path.unshift(CAMPUS_GRAPH_NODES[u]);
    u = prev[u];
  }

  // Assemble full path: from -> nodes -> to
  const raw = [from, ...path, to];
  // Deduplicate consecutive points that are extremely close
  const cleaned = [];
  for (let i = 0; i < raw.length; i++) {
    if (cleaned.length === 0) {
      cleaned.push(raw[i]);
    } else {
      const prevPt = cleaned[cleaned.length - 1];
      if (distBetween(prevPt, raw[i]) > 0.00003) {
        cleaned.push(raw[i]);
      }
    }
  }
  return cleaned;
}

/** Bearing in degrees from point A to B */
function bearingTo([lat1, lng1], [lat2, lng2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Create a rotatable arrow marker via DivIcon */
function createArrowIcon(L, heading) {
  return L.divIcon({
    className: "heading-arrow",
    html: `<div style="transform:rotate(${heading}deg);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:18px solid #e36f54;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))"></div>`,
    iconSize: [16, 18],
    iconAnchor: [8, 18],
  });
}

const CampusMap = forwardRef(function CampusMap({ navigateTo, onNavigationEnd }, ref) {
  const mapElement = useRef(null);
  const map = useRef(null);
  const locationMarker = useRef(null);
  const headingMarker = useRef(null);
  const routeLine = useRef(null);
  const destMarker = useRef(null);
  const userPos = useRef(null);
  const watchId = useRef(null);
  const headingListenerRef = useRef(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [navInfo, setNavInfo] = useState(null); // { distance, bearing, destName }

  // Clean route layers
  const clearRoute = useCallback(() => {
    routeLine.current?.remove();
    routeLine.current = null;
    destMarker.current?.remove();
    destMarker.current = null;
    headingMarker.current?.remove();
    headingMarker.current = null;
    setNavInfo(null);
  }, []);

  useImperativeHandle(ref, () => ({ clearRoute }), [clearRoute]);

  // Init map
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
      }).addTo(campusMap).bindTooltip("Telkom University campus", { sticky: true });
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
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      if (headingListenerRef.current) {
        window.removeEventListener("deviceorientationabsolute", headingListenerRef.current);
        window.removeEventListener("deviceorientation", headingListenerRef.current);
      }
    };
  }, []);

  // Start watching position continuously
  const startWatchingPosition = useCallback(() => {
    if (watchId.current != null) return; // already watching
    if (!navigator.geolocation) return;
    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        userPos.current = [coords.latitude, coords.longitude];
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );
  }, []);

  // Device heading listener — rotates heading arrow to show direction
  useEffect(() => {
    function onOrientation(e) {
      // alpha = compass heading (0=north). webkitCompassHeading for iOS
      const heading = e.webkitCompassHeading ?? (e.alpha != null ? (360 - e.alpha) % 360 : null);
      if (heading == null || !map.current || !userPos.current) return;

      import("leaflet").then(({ default: L }) => {
        if (!map.current || !userPos.current) return;
        const icon = createArrowIcon(L, heading);
        if (headingMarker.current) {
          headingMarker.current.setLatLng(userPos.current);
          headingMarker.current.setIcon(icon);
        } else {
          headingMarker.current = L.marker(userPos.current, { icon, interactive: false }).addTo(map.current);
        }
      });
    }

    // Prefer absolute orientation
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      // iOS 13+ needs permission
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // We'll request on user gesture (locateStudent or navigate)
      } else {
        window.addEventListener("deviceorientationabsolute", onOrientation, true);
        window.addEventListener("deviceorientation", onOrientation);
      }
      headingListenerRef.current = onOrientation;
    }

    return () => {
      if (headingListenerRef.current) {
        window.removeEventListener("deviceorientationabsolute", headingListenerRef.current);
        window.removeEventListener("deviceorientation", headingListenerRef.current);
      }
    };
  }, []);

  // Navigation: draw route from user to target
  useEffect(() => {
    if (!navigateTo || !map.current) return;

    async function navigate() {
      setLocationMessage("Mencari lokasi kamu...");

      // Request device orientation permission on iOS if needed
      if (typeof DeviceOrientationEvent?.requestPermission === "function") {
        try { await DeviceOrientationEvent.requestPermission(); } catch { /* user denied */ }
        if (headingListenerRef.current) {
          window.addEventListener("deviceorientationabsolute", headingListenerRef.current, true);
          window.addEventListener("deviceorientation", headingListenerRef.current);
        }
      }

      startWatchingPosition();

      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const from = [coords.latitude, coords.longitude];
          userPos.current = from;
          const to = navigateTo.position;
          const L = (await import("leaflet")).default;
          if (!map.current) return;

          clearRoute();

          // Calculate route following campus roads
          let routeCoords = findCampusRoute(from, to);

          // Fallback to OSRM if off-campus or no route found
          if (!routeCoords || routeCoords.length < 2) {
            try {
              const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&alternatives=false`;
              const res = await fetch(url);
              const data = await res.json();
              if (data.routes?.[0]) {
                routeCoords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
              }
            } catch { /* use straight line fallback */ }
          }

          if (!routeCoords || routeCoords.length < 2) {
            routeCoords = [from, to];
          }

          // Draw route following road network
          routeLine.current = L.polyline(routeCoords, {
            color: "#e36f54",
            weight: 5,
            opacity: 0.85,
            dashArray: "10 6",
            lineCap: "round",
          }).addTo(map.current);

          // User location marker
          if (locationMarker.current) locationMarker.current.remove();
          locationMarker.current = L.circleMarker(from, {
            radius: 9,
            color: "#ffffff",
            weight: 3,
            fillColor: "#e36f54",
            fillOpacity: 1,
          }).addTo(map.current).bindPopup("<strong>Kamu di sini</strong>").openPopup();

          // Destination marker
          destMarker.current = L.circleMarker(to, {
            radius: 10,
            color: "#ffffff",
            weight: 3,
            fillColor: "#4b8fa4",
            fillOpacity: 1,
          }).addTo(map.current).bindPopup(`<strong>${navigateTo.name}</strong><br/>Tujuanmu`);

          // Fit view to entire route with comfortable padding
          const bounds = L.latLngBounds(routeCoords);
          map.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });

          // Calculate true walking distance along route segments
          let totalDist = 0;
          for (let i = 0; i < routeCoords.length - 1; i++) {
            totalDist += map.current.distance(L.latLng(routeCoords[i]), L.latLng(routeCoords[i + 1]));
          }
          const nextStep = routeCoords[1] || to;
          const bearing = bearingTo(from, nextStep);
          setNavInfo({
            distance: totalDist < 1000 ? `${Math.round(totalDist)} m` : `${(totalDist / 1000).toFixed(1)} km`,
            bearing: Math.round(bearing),
            destName: navigateTo.name,
          });
          setLocationMessage("");
        },
        () => {
          setLocationMessage("Gagal mengakses lokasi. Cek izin browser.");
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
    navigate();
  }, [navigateTo, clearRoute, startWatchingPosition]);

  function locateStudent() {
    if (!map.current || !navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }

    // iOS orientation permission on user gesture
    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().catch(() => {});
      if (headingListenerRef.current) {
        window.addEventListener("deviceorientationabsolute", headingListenerRef.current, true);
        window.addEventListener("deviceorientation", headingListenerRef.current);
      }
    }

    startWatchingPosition();
    setLocationMessage("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const studentPosition = [coords.latitude, coords.longitude];
        userPos.current = studentPosition;
        import("leaflet").then(({ default: L }) => {
          if (!map.current) return;
          if (locationMarker.current) locationMarker.current.remove();
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
      {navInfo && (
        <div className="nav-info-bar" role="status">
          <span className="nav-arrow" style={{ transform: `rotate(${navInfo.bearing}deg)` }}>↑</span>
          <div>
            <strong>{navInfo.destName}</strong>
            <span>{navInfo.distance}</span>
          </div>
          <button type="button" className="nav-cancel" onClick={() => { clearRoute(); onNavigationEnd?.(); }} aria-label="Batalkan navigasi">✕</button>
        </div>
      )}
      {locationMessage && <p className="map-status" role="status">{locationMessage}</p>}
    </div>
  );
});

export default CampusMap;
