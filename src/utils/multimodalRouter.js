export const PARKING_LOCATIONS = {
  motor: {
    name: "Parkiran Motor (Sport Center)",
    position: [-6.9716666667, 107.6295555556],
  },
  car: {
    name: "Parkiran Mobil (Sport Center)",
    position: [-6.9722222222, 107.6295555556],
  }
};

export const GATE_LOCATIONS = {
  "Gate 1": { name: "Gate 1", position: [-6.972076, 107.633449] },
  "Gate 2": { name: "Gate 2", position: [-6.973109, 107.633289] },
  "Gate 3": { name: "Gate 3", position: [-6.974003, 107.632496] },
  "Gate 4": { name: "Gate 4", position: [-6.976102, 107.632827] },
  "Gate 5": { name: "Gate 5", position: [-6.975225, 107.628982] },
};

export async function fetchOSRMRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&alternatives=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]) {
      return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch (e) {
    console.warn("OSRM fetch failed:", e);
  }
  return null;
}

export async function buildMultimodalRoute(from, to, transportMode, findCampusRouteFn, entryGate = null) {
  if (transportMode === "walk" || transportMode === "beam") {
    const coords = findCampusRouteFn(from, to);
    return {
      coords: coords || [from, to],
      legs: [{ mode: "walk", from, to, coords: coords || [from, to] }],
      parkingUsed: null,
      entryGateUsed: null,
    };
  }

  const parking = PARKING_LOCATIONS[transportMode];
  if (!parking) {
    const coords = findCampusRouteFn(from, to);
    return {
      coords: coords || [from, to],
      legs: [{ mode: "walk", from, to, coords: coords || [from, to] }],
      parkingUsed: null,
      entryGateUsed: null,
    };
  }

  if (!entryGate || !entryGate.position) {
    const leg1 = findCampusRouteFn(from, parking.position);
    const leg2 = findCampusRouteFn(parking.position, to);
    if (leg1 && leg2) {
      const combined = [...leg1, ...leg2.slice(1)];
      return {
        coords: combined,
        legs: [
          { mode: "drive", from, to: parking.position, coords: leg1 },
          { mode: "walk", from: parking.position, to, coords: leg2 },
        ],
        parkingUsed: parking,
        entryGateUsed: null,
      };
    }
  }

  try {
    const [leg1Coords, leg2Coords] = await Promise.all([
      fetchOSRMRoute(from, entryGate.position),
      fetchOSRMRoute(entryGate.position, parking.position),
    ]);

    const leg3Coords = findCampusRouteFn(parking.position, to);

    const legs = [];
    let allCoords = [];

    if (leg1Coords && leg1Coords.length >= 2) {
      legs.push({ mode: "drive", from, to: entryGate.position, coords: leg1Coords });
      allCoords = [...leg1Coords];
    } else {
      const fallback = findCampusRouteFn(from, entryGate.position);
      if (fallback && fallback.length >= 2) {
        legs.push({ mode: "drive", from, to: entryGate.position, coords: fallback });
        allCoords = [...fallback];
      } else {
        allCoords = [from];
      }
    }

    if (leg2Coords && leg2Coords.length >= 2) {
      legs.push({ mode: "drive", from: entryGate.position, to: parking.position, coords: leg2Coords });
      allCoords = [...allCoords, ...leg2Coords.slice(1)];
    } else {
      const fallback = findCampusRouteFn(entryGate.position, parking.position);
      if (fallback && fallback.length >= 2) {
        legs.push({ mode: "drive", from: entryGate.position, to: parking.position, coords: fallback });
        allCoords = [...allCoords, ...fallback.slice(1)];
      }
    }

    if (leg3Coords && leg3Coords.length >= 2) {
      legs.push({ mode: "walk", from: parking.position, to, coords: leg3Coords });
      allCoords = [...allCoords, ...leg3Coords.slice(1)];
    }

    return {
      coords: allCoords.length >= 2 ? allCoords : [from, to],
      legs,
      parkingUsed: parking,
      entryGateUsed: entryGate,
    };
  } catch (e) {
    console.warn("Multimodal route failed:", e);
    const coords = findCampusRouteFn(from, to);
    return {
      coords: coords || [from, to],
      legs: [{ mode: "walk", from, to, coords: coords || [from, to] }],
      parkingUsed: parking,
      entryGateUsed: entryGate,
    };
  }
}