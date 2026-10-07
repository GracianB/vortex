# Changelog

All notable changes to Vórtice are documented here.

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
