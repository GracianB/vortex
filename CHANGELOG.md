# Changelog

All notable changes to Vórtice are documented here.

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

## 5.0.0 — 2026-10-07

### Experience
- Reframed Vórtice as a real-time interactive visual instrument.
- Added exact scene URLs for sharing mode, palette, background, density, force and trail.
- Added immersive canvas mode with the `H` shortcut.
- Hardened the mobile HUD down to a 320 px viewport.
- Added branded runtime recovery and clearer accessible status feedback.
- Preserved reduced-motion, keyboard, pointer and touch interaction.

### WebGL
- Added context-loss recovery instead of leaving a dead canvas.
- Paused rendering while the tab is hidden.
- Added adaptive render resolution based on device DPR, framebuffer pixel budget and GPU texture limits.
- Exposed render scale and live runtime diagnostics in the HUD.

### Architecture
- Reduced the project to the product it actually is: a focused React 19 + TypeScript + WebGL + Zustand + Vite SPA.
- Removed unused authentication, database, SSR, preview-host, P2P and app-builder scaffolding.
- Reduced the dependency graph and production surface.

### Quality
- Added strict typecheck and zero-warning lint gates.
- Added unit contracts for scene URLs, ambient persistence and render-quality budgets.
- Added production bundle budgets.
- Added Playwright E2E for desktop, mobile, 320 px, embed mode, immersive mode and reduced motion.
- Added CI screenshots as visual release evidence.
- Added a full dependency security audit to the release gate.
- Patched vulnerable transitive dependencies identified by the audit.

### Delivery
- Added production SEO/social metadata.
- Added Vercel browser hardening headers.
- Added explicit caching for hashed application assets.
