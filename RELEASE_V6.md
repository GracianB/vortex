# VØRTICE V6.0.0 · Release Certificate

**Release:** 6.0.0  
**Main commit:** `b686913adec300dd3f88d009bb2e3a6f78218af7`  
**Date:** 2026-10-07  
**Production URL:** https://vortex-gilt-xi.vercel.app/

## Certified before production deployment

- React 19 + TypeScript strict build
- ESLint with zero warnings
- 11 unit / contract tests
- production Vite build
- bundle performance budget
- full dependency audit with 0 vulnerabilities
- Chromium E2E
- desktop canvas-first contract
- desktop instrument contract
- mobile 390 px
- narrow mobile 320 px
- embed mode
- reduced-motion mode
- exact share-state contract
- WebGL context / render-quality contracts
- no horizontal overflow
- clean browser console

## Visual release contract

V6 must preserve:

1. Canvas-first opening. The field is the product.
2. Four movements: **I VÓRTICE · II FLUJO · III ÓRBITA · IV ONDA**.
3. Six master states: **VOID · AURORA · SOLAR · EMBER · ICE · PAPER**.
4. Instrument available on demand with `I`.
5. Pure-canvas state with `H`.
6. Sustained Focus audio-reactive breathing remains subtle.
7. Chrome remains legible on both dark and bright master states.
8. Idle state dissolves the interface back into the work.

## Final production certification

The repository includes a dedicated manual workflow:

`.github/workflows/production-smoke.yml`

It verifies the live URL in two layers:

1. HTTP / security headers / V6 document contract.
2. Full Chromium E2E directly against production.

The same HTTP contract is available locally as:

```bash
npm run smoke:live
```

## Current external dependency

At the time this certificate was written, Vercel had temporarily rate-limited deployments on the free plan after the V5/V6 iteration burst. The code release itself is green and merged.

**Remaining release action:** once Vercel accepts a new deployment, run **Vórtice Production Smoke**. If that workflow is green, V6 is production-certified and the project can be considered closed.
