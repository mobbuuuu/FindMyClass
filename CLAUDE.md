# FindMyClass Developer Guide

## Overview
FindMyClass guides students, staff, and visitors across Telkom University Bandung. Users search for classrooms, dormitories, faculties, or gates. The map plots walking routes with GPS tracking and compass heading.

## Tech Stack
- Astro 5: Static site generation and asset pipeline
- React 19: Interactive UI components hydrated on the client
- Leaflet: Map tile rendering and SVG path drawing
- OpenStreetMap: Tile provider
- Modern CSS: Glass styles and keyframe animations
- Custom Dijkstra graph: Shortest path routing along campus walkways

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Build production bundle
npm run preview  # Run production build locally
```

## Structure
- `src/components/CampusMap.jsx`: Leaflet map setup, place coordinates (`CAMPUS_PLACES`), GPS tracker, compass heading, and Dijkstra router.
- `src/data/campusGraphData.js`: Road and walkway graph nodes (`CAMPUS_ROAD_NODES`, `CAMPUS_ROAD_EDGES`) extracted from OpenStreetMap data.
- `src/components/FindMyClassApp.jsx`: Search input, category filtering, destination state, and floating command capsule.
- `src/pages/index.astro`: Entry page mounting the React component.
- `styles.css`: Glass tokens, marker pulses, route dash animation, and responsive rules.

## Map and Routing Architecture

### Walkway Graph
- Campus center: `[-6.9747, 107.6301]`.
- Campus boundary: `TELKOM_BOUNDARY` points define the border.
- Place records: `CAMPUS_PLACES` stores faculties, halls, dormitories, and gates.
- Road network: `CAMPUS_ROAD_NODES` and `CAMPUS_ROAD_EDGES` map paved roads and walking paths directly from OpenStreetMap.
- Routing logic: `findCampusRoute()` maps start and destination points to nearest nodes, then runs Dijkstra algorithm with MinHeap. The path follows paved walkways and skirts water bodies like Danau Galau. Points outside campus trigger the OSRM router.

### Device State and Markers
- Marker cleanup: React refs (`locationMarker`, `destMarker`, `routeLine`) track active map layers. Remove the existing marker before creating a replacement. This limits user pins to one per device.
- Compass orientation: Listeners handle `deviceorientationabsolute` and `deviceorientation` events. Code rotates the arrow icon to match the user heading.

## Rules
1. Road adherence: Map every new building or gate to adjacent graph nodes. Do not draw paths through buildings or water.
2. Client-only Leaflet: Leaflet requires `window`. Load Leaflet inside `useEffect` with dynamic imports, or mount components through Astro `client:load`.
3. Marker style resets: Apply `background: transparent !important` and `border: none !important` to custom `L.divIcon` CSS classes. This strips default white boxes.
4. Resource cleanup: Invoke `.remove()` on markers and event listeners when components unmount.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: download `antislop.md` again, or run `npx antislop-ai --update` if it was installed as skill folders.
<!-- antislop:end -->

