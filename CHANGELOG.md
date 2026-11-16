# Changelog

All notable changes to Vórtice are documented here.

## 8.0.0 — 2026-11-16

### Extreme Simulation & Generative Physics
- Extended particle capacity to **32,000 particles** with optimized typed buffer allocation.
- Added 6th movement: **SINGULARIDAD** (Movement VI: *ABSORBER*), featuring hyperbolic accretion gravitational pull and perpendicular relativistic bipolar jet ejection.
- Added 7th movement: **SUPERNOVA** (Movement VII: *DETONAR*), featuring cyclical supersonic shockwave detonations and magnetized cosmic filament swirling.
- Implemented **Physical Shockwaves**: canvas taps, clicks, and `Space` pulses now project genuine expanding supersonic wave fronts that physically accelerate and excite surrounding particles.
- Added **Mobile Gyroscope Gravity**: tilting smartphones or tablets (`deviceorientation`) applies direct physical directional gravity acceleration to the particle field.
- Added **Celestial** palette (`celestial`): golden-cyan ethereal aura with velocity-reactive chromatic shifts.
- Added 3 curated master states: **SINGULARITY** (Code 08, 24,000 particles), **SUPERNOVA** (Code 09, 28,000 particles), and **CELESTIAL** (Code 10, 20,000 particles). Total of 11 master scenes.

### Video Recording & Generative Audio
- Added **Cinematic WebM Video Capture** via `canvas.captureStream(60)` and `MediaRecorder` API (`V` shortcut and dedicated dock button).
- Added **Generative Harmonic Synthesizer** via Web Audio API: dual sub-bass and fifth oscillators with dynamic resonant lowpass filters linked to cursor motion and field energy.
- Added harmonic resonant chime triggered on shockwave and pulse events.
- Added 4K wallpaper export capability.

### Controls & UI
- Upgraded movement rail and utility dock to seamlessly host 7 movements and 6 utility actions across mobile and desktop.
- Added shortcut `V` for video recording, `6` for Singularity, and `7` for Supernova.
- Complete bilingual ES/EN translations for all new movements, presets, and notifications.

## 7.0.0 — 2026-11-16

### Generative Field & Movements
- Added 5th movement: **CAOS** (Movement V: *COLAPSAR*), introducing brownian turbulence, entropy dynamics, and local repulsive forces.
- Added **Nebula** palette with deep violet, magenta, and cyan hues tailored for space and stellar visualization.
- Added 2 curated master states: **STORM** (Code 06, high energy slate chaos) and **GALAXY** (Code 07, cosmic nebula orbit).
- Added shortcut `P` to shuffle through curated master scenes dynamically.
- Added shortcut `5` for instantaneous transition into the Caos movement.

### Controls & Architecture
- Extended responsive movement rail to dynamically accommodate 5 canonical movements across desktop and mobile viewports.
- Updated bilingual dictionary (ES/EN) with complete translations for all new movements, presets, and interaction strings.
- Updated test suites with verification for the 5 movements and 8 master scenes.

## 6.0.0 — 2026-10-07

### Final experience
- Moved Vórtice from a visible software dashboard to a canvas-first audiovisual instrument.
- Replaced the large status card and settings-first composition with a restrained VØRTICE signature, four-movement rail and on-demand instrument.
- Reframed Vórtice, Flujo, Órbita and Onda as four movements with cinematic chapter transitions.
- Added six curated master states: VOID, AURORA, SOLAR, EMBER, ICE and PAPER.
- Added a new cinematic opening, contextual gesture language and an idle state where the interface dissolves back into the work.
- Kept the exact share, PNG capture, fullscreen, reset, trail and advanced tuning controls without letting them dominate the composition.

### Audiovisual system
- Connected Sustained Focus to a Web Audio analyser after user interaction.
- Added restrained low/mid-frequency energy to field motion, hue progression and luminosity.
- Kept the response deliberately subtle so audio supports the generative field instead of turning it into a music visualizer.

### Interaction
- Added `I` to open or close the instrument.
- Kept `H` as the full canvas-only state.
- Movement keys `1`–`4` now trigger a field pulse and chapter identity.
- Rebuilt desktop, mobile and 320 px layouts around the same artistic hierarchy.

### Quality
- Extended production E2E around the V6 canvas-first contract, master states, instrument panel, share-state preservation, mobile layouts, embed and reduced-motion modes.
- Retained the V5 release gates: strict TypeScript, zero-warning lint, unit tests, production build, bundle budgets, full dependency audit and real Chromium E2E.
