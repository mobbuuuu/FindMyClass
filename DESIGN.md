# FindMyClass Design Direction

## Identity & Purpose
FindMyClass provides clear campus navigation for students, faculty, and visitors at Telkom University Bandung. The interface balances high-utility map interaction with tactile floating glass controls.

## Dials
- **ENERGY: 2** (Balanced. Calm, utility-first foundation with deliberate coral accent points)
- **RHYTHM: 2** (Structured floating map capsules, clear list hierarchies, and spatial padding)
- **MOTION: 2** (Subtle transition easing, route line flow, and keyboard-friendly state changes)

## Color System
- `--ink: #202c35` — Primary text and dark controls (meets WCAG AAA against white at 13.9:1)
- `--muted: #55626a` — Secondary labels and captions (meets WCAG AA against light backgrounds at 5.8:1)
- `--cream: #f8f7f2` — Page ground and base background
- `--paper: #fffefa` — Capsule background tint
- `--blue: #a9d8e5` — Icon container background
- `--deep-blue: #255d6e` — Primary brand blue and active indicators (meets WCAG AA at 7.3:1 against white)
- `--coral: #c45030` — Wayfinding route line, directional arrows, and brand accent (meets WCAG AA at 4.6:1 against white)
- `--line: #dce2df` — Structural borders and divider rules

## Typography
- **Headings & Brand**: `Space Grotesk` (weights: 600, 700). Technical clarity with personality for campus wayfinding.
- **Body & Controls**: `DM Sans` (weights: 400, 500, 600, 700). Highly legible humanistic sans-serif for map labels and search inputs.

## Visual Hierarchy & Craft
1. **Map Ground Plane**: OpenStreetMap tiles render the campus geography.
2. **Floating Liquid Capsules**: Frosted backdrop blur (`18px-24px`), high-contrast 1px border, and subtle drop shadow for depth without clutter.
3. **Wayfinding Line**: Coral route polyline following actual paved walkways and roads.
4. **Accessible Hit Areas**: Minimum 44x44px touch targets on mobile viewports.
5. **Keyboard Focus**: Explicit `:focus-visible` ring on all interactive elements.
