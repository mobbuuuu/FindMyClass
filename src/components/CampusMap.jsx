import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import "leaflet/dist/leaflet.css";
import { CAMPUS_ROAD_NODES, CAMPUS_ROAD_EDGES } from "../data/campusGraphData.js";
import { buildMultimodalRoute, PARKING_LOCATIONS, GATE_LOCATIONS, fetchOSRMRoute } from "../utils/multimodalRouter.js";

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
  // 1-6: Utama
  { name: "Asrama Putra", position: [-6.9711944444, 107.6287777778], kind: "Dormitory", aliases: ["Asrama Putra", "Dorm Putra"] },
  { name: "Sport Center", position: [-6.97245, 107.6289], kind: "Sports", aliases: ["SC", "Olahraga"], hours: { open: "06:00", close: "21:00", text: "06:00 - 21:00" } },
  { name: "Asrama Putri", position: [-6.9743055556, 107.6290555556], kind: "Dormitory", aliases: ["Asrama Putri", "Dorm Putri"] },
  { name: "Tel-U Coffee", position: [-6.9731388889, 107.6293055556], kind: "Cafe", aliases: ["Coffee", "Kopi"], hours: { open: "08:00", close: "21:00", text: "08:00 - 21:00" } },
  { name: "Telkom University Library, Study Space", position: [-6.971760334262225, 107.6324196103809], kind: "Study space", aliases: ["Perpus", "Library", "Perpustakaan"], floors: "4 Lantai", hours: { open: "08:00", close: "18:00", text: "08:00 - 18:00" } },
  { name: "Telkom University Campus", position: [-6.9729166667, 107.6300000000], kind: "Campus", aliases: ["Tel-U", "Telkom"] },
  { name: "Telkom University Landmark Tower (TULT)", position: [-6.968949, 107.628111], kind: "Building", aliases: ["TULT", "Tower", "Landmark Tower"], floors: "20 Lantai" },

  // Tambahan 1-6
  { name: "Fakultas Komunikasi dan Ilmu Sosial", position: [-6.972002173916829, 107.63281880706629], kind: "Faculty", aliases: ["FKIS", "Komunikasi", "Ilmu Sosial"], floors: "4 Lantai" },
  { name: "Fakultas Ilmu Terapan", position: [-6.9731944444, 107.6326666667], kind: "Faculty", aliases: ["FIT", "Ilmu Terapan"], floors: "4 Lantai" },
  { name: "Fakultas Ekonomi dan Bisnis", position: [-6.971336184403436, 107.631943572998], kind: "Faculty", aliases: ["FEB", "Ekonomi", "Bisnis"], floors: "4 Lantai" },
  { name: "Fakultas Industri Kreatif", position: [-6.9717777778, 107.6315000000], kind: "Faculty", aliases: ["FIK", "Industri Kreatif"], floors: "4 Lantai" },
  { name: "Telkom University Convention Hall", position: [-6.9712777778, 107.6312222222], kind: "Hall", aliases: ["Convention Hall", "Aula"] },
  { name: "Danau Galau", position: [-6.9731666667, 107.6312777778], kind: "Landmark", aliases: ["Danau", "Lake"] },

  // Tambahan 7-9: GKU
  { name: "Gedung Kuliah Umum 1", position: [-6.974390859546471, 107.63106844734378], kind: "Lecture", address: "Jl. Telekomunikasi, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257", aliases: ["GKU 1", "GKU1", "Kuliah Umum 1"], floors: "4 Lantai" },
  { name: "Gedung Kuliah Umum 2", position: [-6.9748408361847485, 107.63105842897347], kind: "Lecture", aliases: ["GKU 2", "GKU2", "Kuliah Umum 2"], floors: "4 Lantai" },
  { name: "Gedung Kuliah Umum 3", position: [-6.972866066219806, 107.6298691237254], kind: "Lecture", aliases: ["GKU 3", "GKU3", "Kuliah Umum 3"], floors: "4 Lantai" },

  // Tambahan 10-15
  { name: "Food Court Asrama Putri", position: [-6.9741944444, 107.6292777778], kind: "Food Court", aliases: ["Food Court", "Foodcourt"], hours: { open: "07:00", close: "20:00", text: "07:00 - 20:00" } },
  { name: "Kantin Putri", position: [-6.974439793270318, 107.6287960878003], kind: "Canteen", aliases: ["Kantin"], hours: { open: "07:00", close: "20:00", text: "07:00 - 20:00" } },
  { name: "Fakultas Teknik Elektro", position: [-6.975473686188717, 107.6295071364736], kind: "Faculty", aliases: ["FTE", "Teknik Elektro"], floors: "4 Lantai" },
  { name: "Fakultas Informatika", position: [-6.9758309689279425, 107.63069039465188], kind: "Faculty", aliases: ["FRI", "Informatika", "IF"], floors: "4 Lantai" },
  { name: "Gedung Serba guna", position: [-6.9763885581062715, 107.63028949108872], kind: "Hall", aliases: ["GSG", "Serba Guna", "Serbaguna"] },
  { name: "Masjid Syamsul Ulum", position: [-6.975699272034128, 107.6321904194122], kind: "Mosque", aliases: ["MSU", "Masjid", "Mushola"], hours: { open: "04:00", close: "22:00", text: "04:00 - 22:00" } },

  // Tambahan 16-20: Gates
  { name: "Gate 1", position: [-6.972076, 107.633449], kind: "Gate", address: "Stt Telkom, Jl. Telekomunikasi Jl. Sukapura, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267", aliases: ["Gerbang 1"] },
  { name: "Gate 2", position: [-6.973109, 107.633289], kind: "Gate", address: "2JGM+P8R, Jl. Telekomunikasi, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257", aliases: ["Gerbang 2"] },
  { name: "Gate 3", position: [-6.974003, 107.632496], kind: "Gate", address: "2JGM+C26, Jl. Telekomunikasi, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257", aliases: ["Gerbang 3"] },
  { name: "Gate 4", position: [-6.976102, 107.632827], kind: "Gate", address: "Jl. Sukabirus No.72, Sukapura, Kec. Dayeuhkolot, Kota Bandung, Jawa Barat 40257", aliases: ["Gerbang 4"] },
  { name: "Gate 5", position: [-6.975225, 107.628982], kind: "Gate", address: "2JFH+WH5, Jl. Radio Palasari Road, Citeureup, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257", aliases: ["Gerbang 5"] },

  // Parkiran Kendaraan Kampus
  { name: "Parkiran Motor (Sport Center)", position: [-6.9716666667, 107.6295555556], kind: "Building", address: "Samping Sport Center Telkom University", aliases: ["Parkiran Motor", "Parkir Motor"] },
  { name: "Parkiran Mobil (Sport Center)", position: [-6.9722222222, 107.6295555556], kind: "Building", address: "Sebelah Parkiran Motor Sport Center", aliases: ["Parkiran Mobil", "Parkir Mobil"] },

  // BEAM Electric Scooter Docks
  { name: "Shelter BEAM - Sport Center", position: [-6.9723, 107.6291], kind: "BeamDock", aliases: ["BEAM SC", "Beam Sport Center"] },
  { name: "Shelter BEAM - GKU", position: [-6.9745, 107.6308], kind: "BeamDock", aliases: ["BEAM GKU"] },
  { name: "Shelter BEAM - TULT", position: [-6.9691, 107.6283], kind: "BeamDock", aliases: ["BEAM TULT", "Beam Tower"] },
  { name: "Shelter BEAM - Asrama Putri", position: [-6.9744, 107.6293], kind: "BeamDock", aliases: ["BEAM Asrama"] },
  { name: "Shelter BEAM - Masjid", position: [-6.9755, 107.6320], kind: "BeamDock", aliases: ["BEAM Masjid", "BEAM MSU"] },
];

export { CAMPUS_ROAD_NODES, CAMPUS_ROAD_EDGES };

/** Map place kind to marker fill color */
const KIND_COLORS = {
  Lecture: "#c45030",
  Faculty: "#255d6e",
  Gate: "#5a4fc4",
  Dormitory: "#d97706",
  Cafe: "#d97706",
  "Food Court": "#d97706",
  Canteen: "#d97706",
  Sports: "#16a34a",
  Landmark: "#16a34a",
  Campus: "#16a34a",
  Mosque: "#16a34a",
  Hall: "#16a34a",
  "Study space": "#16a34a",
  Building: "#255d6e",
  BeamDock: "#0284c7",
};

export function getKindColor(kind) {
  return KIND_COLORS[kind] || "#255d6e";
}

/** Walking time estimate at ~75 m/min */
export function formatWalkTime(meters) {
  if (!meters || meters <= 0) return "< 1 mnt";
  const minutes = Math.round(meters / 75);
  if (minutes < 1) return "< 1 mnt";
  return `~${minutes} mnt`;
}

/** Haversine distance between two [lat, lng] coordinates in meters */
export function getHaversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Format distance as human-readable string */
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Check if a facility is open right now (WIB / UTC+7) */
export function getPlaceStatus(hours) {
  if (!hours) return null;
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 3600000 * 7);
  const currentMinutes = wib.getHours() * 60 + wib.getMinutes();
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  return { isOpen, text: hours.text };
}

/** Ray-casting algorithm to determine if a coordinate is within a polygon boundary */
function isInsidePolygon(point, vs) {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Pre-classify all road nodes: 1 if inside campus boundary, 0 if outside
const IS_INSIDE_ROAD_NODE = new Uint8Array(CAMPUS_ROAD_NODES.length);
for (let i = 0; i < CAMPUS_ROAD_NODES.length; i++) {
  if (isInsidePolygon(CAMPUS_ROAD_NODES[i], TELKOM_BOUNDARY)) {
    IS_INSIDE_ROAD_NODE[i] = 1;
  }
}

// Pre-build internal-only adjacency graph so campus navigation never exits perimeter
const INTERNAL_ROAD_ADJACENCY = Array.from({ length: CAMPUS_ROAD_NODES.length }, () => []);
for (let i = 0; i < CAMPUS_ROAD_EDGES.length; i++) {
  const [u, v] = CAMPUS_ROAD_EDGES[i];
  if (IS_INSIDE_ROAD_NODE[u] && IS_INSIDE_ROAD_NODE[v]) {
    const p1 = CAMPUS_ROAD_NODES[u];
    const p2 = CAMPUS_ROAD_NODES[v];
    const dLat = p1[0] - p2[0];
    const dLon = (p1[1] - p2[1]) * Math.cos(((p1[0] + p2[0]) / 2) * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    INTERNAL_ROAD_ADJACENCY[u].push({ to: v, dist });
    INTERNAL_ROAD_ADJACENCY[v].push({ to: u, dist });
  }
}

/** MinHeap priority queue for sub-millisecond Dijkstra pathfinding */
class MinHeap {
  constructor() {
    this.heap = [];
  }
  push(node, val) {
    this.heap.push({ node, val });
    this._up(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._down(0);
    }
    return top;
  }
  isEmpty() {
    return this.heap.length === 0;
  }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p].val > this.heap[i].val) {
        const tmp = this.heap[p];
        this.heap[p] = this.heap[i];
        this.heap[i] = tmp;
        i = p;
      } else {
        break;
      }
    }
  }
  _down(i) {
    const len = this.heap.length;
    while ((i << 1) + 1 < len) {
      let left = (i << 1) + 1;
      let right = left + 1;
      let best = left;
      if (right < len && this.heap[right].val < this.heap[left].val) best = right;
      if (this.heap[best].val < this.heap[i].val) {
        const tmp = this.heap[best];
        this.heap[best] = this.heap[i];
        this.heap[i] = tmp;
        i = best;
      } else {
        break;
      }
    }
  }
}

function distBetween([lat1, lng1], [lat2, lng2]) {
  const dLat = lat1 - lat2;
  const dLng = (lng1 - lng2) * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function findNearestInsideRoadNode(point) {
  let nearest = -1;
  let minDist = Infinity;
  for (let i = 0; i < CAMPUS_ROAD_NODES.length; i++) {
    if (!IS_INSIDE_ROAD_NODE[i]) continue;
    const d = distBetween(point, CAMPUS_ROAD_NODES[i]);
    if (d < minDist) {
      minDist = d;
      nearest = i;
    }
  }
  return { id: nearest, dist: minDist };
}

/**
 * Calculates shortest walking route strictly following campus paved roads and footpaths.
 * Confined 100% within the campus boundary to keep routes on internal walkways.
 */
function findCampusRoute(from, to) {
  const start = findNearestInsideRoadNode(from);
  const end = findNearestInsideRoadNode(to);
  if (start.id === -1 || end.id === -1) return null;
  // If either point is too far from campus (> ~1.5 km), don't use campus graph
  if (start.dist > 0.015 || end.dist > 0.015) return null;

  const N = CAMPUS_ROAD_NODES.length;
  const dist = new Float64Array(N).fill(Infinity);
  const prev = new Int32Array(N).fill(-1);
  const heap = new MinHeap();

  dist[start.id] = 0;
  heap.push(start.id, 0);

  while (!heap.isEmpty()) {
    const { node, val } = heap.pop();
    if (val > dist[node]) continue;
    if (node === end.id) break;

    const edges = INTERNAL_ROAD_ADJACENCY[node];
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const alt = val + edge.dist;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = node;
        heap.push(edge.to, alt);
      }
    }
  }

  if (dist[end.id] === Infinity) return null;

  // Reconstruct path along real paved roads inside campus
  const path = [];
  let cur = end.id;
  while (cur !== -1) {
    path.push(CAMPUS_ROAD_NODES[cur]);
    cur = prev[cur];
  }
  path.reverse();

  // Assemble full path: from -> road nodes -> to
  const raw = [from, ...path, to];
  // Deduplicate consecutive points that are extremely close (< ~1 meter)
  const cleaned = [];
  for (let i = 0; i < raw.length; i++) {
    if (cleaned.length === 0) {
      cleaned.push(raw[i]);
    } else {
      const prevPt = cleaned[cleaned.length - 1];
      if (distBetween(prevPt, raw[i]) > 0.00001) {
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
    html: `<div style="transform:rotate(${heading}deg);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-bottom:18px solid #c45030;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))"></div>`,
    iconSize: [16, 18],
    iconAnchor: [8, 18],
  });
}

/** Create pulsating user location marker */
function createUserMarker(L, position, popupText) {
  const icon = L.divIcon({
    className: "user-location-pin",
    html: `<div class="user-pulse-ring"></div><div class="user-pulse-ring-inner"></div><div class="user-pin-dot"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  return L.marker(position, { icon, zIndexOffset: 1000 }).bindPopup(`<strong>${popupText}</strong>`);
}

/** Create Google Maps-style red teardrop destination pin */
function createDestinationMarker(L, position, title, subtitle) {
  const icon = L.divIcon({
    className: "",
    html: `<svg style="display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4))" viewBox="0 0 24 36" width="32" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#EA4335"/>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 19.5 10.2 31.8 12 34.2C13.8 31.8 22 19.5 22 12C22 6.48 17.52 2 12 2Z" fill="#D93025"/>
      <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
    </svg>`,
    iconSize: [32, 46],
    iconAnchor: [16, 46],
    popupAnchor: [0, -46],
  });
  return L.marker(position, { icon, zIndexOffset: 950 }).bindPopup(`<strong>${title}</strong><br/>${subtitle}`);
}

const CampusMap = forwardRef(function CampusMap({ navigateTo, onNavigationEnd, onSelectPlace, onUserLocationChange }, ref) {
  const mapElement = useRef(null);
  const map = useRef(null);
  const locationMarker = useRef(null);
  const headingMarker = useRef(null);
  const routeLine = useRef(null);
  const destMarker = useRef(null);
  const parkingMarker = useRef(null);
  const gateMarker = useRef(null);
  const userPos = useRef(null);
  const watchId = useRef(null);
  const headingListenerRef = useRef(null);
  const onSelectPlaceRef = useRef(onSelectPlace);
  const placeMarkersRef = useRef({});
  const activeMarkerRef = useRef(null);
  const resizeCleanupRef = useRef(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [navInfo, setNavInfo] = useState(null); // { distance, bearing, destName }

  useEffect(() => {
    onSelectPlaceRef.current = onSelectPlace;
  });

  // Clean route layers
  const clearRoute = useCallback(() => {
    // Remove main route line and any extra legs
    if (routeLine.current) {
      routeLine.current.remove();
      if (routeLine.current._extraLegs) {
        routeLine.current._extraLegs.forEach((leg) => leg.remove());
      }
      routeLine.current = null;
    }
    destMarker.current?.remove();
    destMarker.current = null;
    parkingMarker.current?.remove();
    parkingMarker.current = null;
    gateMarker.current?.remove();
    gateMarker.current = null;
    parkingMarker.current = null;
    headingMarker.current?.remove();
    headingMarker.current = null;
    if (activeMarkerRef.current) {
      const kindColor = activeMarkerRef.current._kindColor || "#255d6e";
      activeMarkerRef.current.setStyle({ radius: 7, fillColor: kindColor, weight: 2 });
      activeMarkerRef.current = null;
    }
    setNavInfo(null);
  }, []);

  const panToPlace = useCallback((place) => {
    if (!map.current || !place?.position) return;
    map.current.flyTo(place.position, 17, { duration: 0.8 });

    if (activeMarkerRef.current && activeMarkerRef.current !== placeMarkersRef.current[place.name]) {
      const prevColor = activeMarkerRef.current._kindColor || "#255d6e";
      activeMarkerRef.current.setStyle({ radius: 7, fillColor: prevColor, weight: 2 });
    }
    const marker = placeMarkersRef.current[place.name];
    if (marker) {
      marker.setStyle({ radius: 10, fillColor: "#c45030", weight: 3 });
      marker.openTooltip();
      activeMarkerRef.current = marker;
    }
  }, []);

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
        dragging: true,
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
        color: "#c45030",
        weight: 3,
        opacity: 0.95,
        fillColor: "#c45030",
        fillOpacity: 0.06,
      }).addTo(campusMap).bindTooltip("Telkom University campus", { sticky: true });
      const campusBounds = L.latLngBounds(TELKOM_BOUNDARY);
      campusMap.fitBounds(campusBounds, { padding: [18, 18] });
      campusMap.setMaxBounds(campusBounds.pad(1.2));
      campusMap.setMinZoom(14);

      CAMPUS_PLACES.forEach((place) => {
        const fillColor = getKindColor(place.kind);
        const marker = L.circleMarker(place.position, {
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor,
          fillOpacity: 0.9,
        })
          .addTo(campusMap)
          .bindTooltip(place.name, {
            permanent: false,
            direction: "top",
            offset: [0, -8],
            className: "campus-tooltip",
          });

        placeMarkersRef.current[place.name] = marker;
        marker._kindColor = fillColor;

        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectPlaceRef.current?.(place);
        });
      });

      map.current = campusMap;

      // Re-measure Leaflet once the shell settles so tiles fill the viewport
      const onResize = () => campusMap.invalidateSize();
      window.addEventListener("resize", onResize);
      setTimeout(onResize, 120);
      resizeCleanupRef.current = onResize;
    });

    return () => {
      disposed = true;
      campusMap?.remove();
      if (resizeCleanupRef.current) {
        window.removeEventListener("resize", resizeCleanupRef.current);
        resizeCleanupRef.current = null;
      }
      map.current = null;
      locationMarker.current = null;
      placeMarkersRef.current = {};
      activeMarkerRef.current = null;
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
        onUserLocationChange?.([coords.latitude, coords.longitude]);
        if (locationMarker.current) {
          locationMarker.current.setLatLng(userPos.current);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 },
    );
  }, []);

  // Rotates heading arrow to show compass direction
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

          // Calculate multimodal route with legs
          const mode = navigateTo.mode || "walk";
          const entryGate = navigateTo.gate || null;
          const routeResult = await buildMultimodalRoute(from, to, mode, findCampusRoute, entryGate);

          let routeCoords = routeResult.coords;
          const { legs, parkingUsed, entryGateUsed } = routeResult;

          // Fallback if no route coords
          if (!routeCoords || routeCoords.length < 2) {
            routeCoords = [from, to];
          }

          // Draw Google Maps-style dual-layer route (casing + core)
          const allCreatedLines = [];

          const drawGmapsLeg = (coords, isDrive, isBeam) => {
            // Core color based on transport mode
            const coreColor = isDrive ? "#1a73e8" : isBeam ? "#0284c7" : "#1a73e8";
            const casingColor = "#ffffff";

            // 1. Outer casing layer (gives Google Maps distinctive crisp border)
            const casing = L.polyline(coords, {
              color: casingColor,
              weight: 9,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map.current);
            allCreatedLines.push(casing);

            // 2. Core path layer
            const core = L.polyline(coords, {
              color: coreColor,
              weight: 5,
              opacity: 1,
              dashArray: isDrive ? undefined : "12 10",
              lineCap: "round",
              lineJoin: "round",
              className: "animated-route-line",
            }).addTo(map.current);
            allCreatedLines.push(core);
          };

          if (legs && legs.length > 0) {
            legs.forEach((leg) => {
              drawGmapsLeg(leg.coords, leg.mode === "drive", mode === "beam");
            });
          } else {
            drawGmapsLeg(routeCoords, mode === "motor" || mode === "car", mode === "beam");
          }

          if (allCreatedLines.length > 0) {
            routeLine.current = allCreatedLines[0];
            routeLine.current._extraLegs = allCreatedLines.slice(1);
          }

          // User location marker with radar pulse
          if (locationMarker.current) locationMarker.current.remove();
          locationMarker.current = createUserMarker(L, from, "Kamu di sini").addTo(map.current).openPopup();

          // Entry gate marker if applicable
          if (entryGateUsed) {
            const gIcon = L.divIcon({
              className: "gate-location-pin",
              html: `<div style="background:#3b82f6;color:white;font-weight:bold;border-radius:50%;width:28px;height:28px;display:grid;place-items:center;border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3);font-size:12px;">🚪</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            gateMarker.current?.remove();
            gateMarker.current = L.marker(entryGateUsed.position, { icon: gIcon, zIndexOffset: 960 })
              .addTo(map.current)
              .bindPopup(`<strong>${entryGateUsed.name}</strong><br/>Gerbang masuk kendaraan.`);
          }

          // Parking marker if applicable
          if (parkingUsed) {
            const pIcon = L.divIcon({
              className: "parking-location-pin",
              html: `<div style="background:#255d6e;color:white;font-weight:bold;border-radius:50%;width:28px;height:28px;display:grid;place-items:center;border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3);font-size:12px;">🅿️</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });
            parkingMarker.current = L.marker(parkingUsed.position, { icon: pIcon, zIndexOffset: 950 })
              .addTo(map.current)
              .bindPopup(`<strong>${parkingUsed.name}</strong><br/>Parkir kendaraan di sini, lanjut jalan kaki.`);
          }

          // Destination marker with animated glow
          destMarker.current = createDestinationMarker(L, to, navigateTo.name, "Tujuanmu").addTo(map.current);

          // Fit view to entire route with comfortable padding
          const bounds = L.latLngBounds(routeCoords);
          map.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });

          // Calculate total distance (sum of all legs)
          let totalDist = 0;
          for (let i = 0; i < routeCoords.length - 1; i++) {
            totalDist += map.current.distance(L.latLng(routeCoords[i]), L.latLng(routeCoords[i + 1]));
          }
          const nextStep = routeCoords[1] || to;
          const bearing = bearingTo(from, nextStep);

          // Build descriptive nav info
          let destLabel = navigateTo.name;
          const parts = [];
          if (entryGateUsed) parts.push(`Gerbang: ${entryGateUsed.name}`);
          if (parkingUsed) parts.push(`Parkir: ${parkingUsed.name}`);
          parts.push("Jalan kaki ke tujuan");

          // Calculate estimated arrival time (ETA)
          const walkMinutes = Math.max(1, Math.round(totalDist / 75));
          const arrivalDate = new Date(Date.now() + walkMinutes * 60000);
          const etaText = arrivalDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          // Determine turn icon / instruction from initial bearing
          const stepDist = Math.round(map.current.distance(L.latLng(from), L.latLng(nextStep)));

          setNavInfo({
            distance: totalDist < 1000 ? `${Math.round(totalDist)} m` : `${(totalDist / 1000).toFixed(1)} km`,
            walkTime: formatWalkTime(totalDist),
            minutes: walkMinutes,
            eta: etaText,
            bearing: Math.round(bearing),
            stepDist: stepDist < 1000 ? `${stepDist} m` : `${(stepDist / 1000).toFixed(1)} km`,
            destName: navigateTo.name,
            routeSummary: parts.join(" → "),
            mode: navigateTo.mode || "walk",
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

  const locateStudent = useCallback(() => {
    if (!map.current || !navigator.geolocation) {
      setLocationMessage("Lokasi tidak tersedia di peramban ini.");
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
    setIsLocating(true);
    setLocationMessage("Mencari lokasi kamu...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const studentPosition = [coords.latitude, coords.longitude];
        userPos.current = studentPosition;
        onUserLocationChange?.(studentPosition);
        import("leaflet").then(({ default: L }) => {
          setIsLocating(false);
          if (!map.current) return;
          if (locationMarker.current) locationMarker.current.remove();
          map.current.setView(studentPosition, 17);
          locationMarker.current = createUserMarker(L, studentPosition, "Kamu di sini").addTo(map.current).openPopup();
          setLocationMessage("Lokasi kamu ditampilkan di peta.");
        });
      },
      () => {
        setIsLocating(false);
        setLocationMessage("Tidak dapat mengakses lokasi. Periksa izin browser.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [startWatchingPosition]);

  useImperativeHandle(ref, () => ({
    clearRoute,
    panToPlace,
    locateStudent,
    invalidateSize: () => map.current?.invalidateSize(),
  }), [clearRoute, panToPlace, locateStudent]);

  return (
    <div className="campus-map-shell">
      <div ref={mapElement} className="campus-map" style={{ touchAction: "none" }} aria-label="Peta Kampus Telkom University" />
      <div className="map-action-controls" aria-label="Kontrol navigasi peta">
        <button
          type="button"
          onClick={() => map.current?.zoomIn()}
          aria-label="Perbesar peta"
          title="Perbesar"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => map.current?.zoomOut()}
          aria-label="Perkecil peta"
          title="Perkecil"
        >
          −
        </button>
        <span className="control-divider" aria-hidden="true" />
        <button
          type="button"
          onClick={locateStudent}
          className={isLocating ? "locating" : ""}
          aria-label="Lokasi saya saat ini"
          title="Lokasi saya"
        >
          ⌖
        </button>
      </div>
      {navInfo && (
        <>
          {/* Google Maps Turn-by-turn Top Instruction Banner */}
          <div className="gmaps-nav-banner" role="status">
            <div className="gmaps-turn-icon" style={{ transform: `rotate(${navInfo.bearing}deg)` }}>
              ↑
            </div>
            <div className="gmaps-turn-details">
              <span className="gmaps-turn-dist">Dalam {navInfo.stepDist}</span>
              <strong className="gmaps-turn-instruction">Lurus ke arah {navInfo.destName}</strong>
            </div>
          </div>

          {/* Google Maps Bottom ETA & Trip Summary Bar */}
          <div className="gmaps-nav-bottom-bar" role="status">
            <div className="gmaps-eta-left">
              <div className="gmaps-duration-badge">
                <span className="gmaps-time-val">{navInfo.minutes}</span>
                <span className="gmaps-time-unit">mnt</span>
              </div>
              <div className="gmaps-trip-sub">
                <span className="gmaps-dist-val">{navInfo.distance}</span>
                <span className="gmaps-dot-sep">·</span>
                <span className="gmaps-eta-time">Tiba {navInfo.eta}</span>
              </div>
            </div>
            <div className="gmaps-eta-right">
              <button
                type="button"
                className="gmaps-exit-btn"
                onClick={() => { clearRoute(); onNavigationEnd?.(); }}
                aria-label="Batalkan navigasi"
                title="Keluar dari navigasi"
              >
                ✕
              </button>
            </div>
          </div>
        </>
      )}
      {locationMessage && <p className="map-status" role="status">{locationMessage}</p>}
    </div>
  );
});

export default CampusMap;
