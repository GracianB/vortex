#!/usr/bin/env node
import assert from "node:assert/strict";

const url = process.env.VORTEX_LIVE_URL || "https://vortex-gilt-xi.vercel.app/";

const response = await fetch(url, {
  redirect: "follow",
  headers: {
    "user-agent": "vortex-release-smoke/6.0.0",
  },
});

assert.equal(response.ok, true, `Live URL returned HTTP ${response.status}`);

const html = await response.text();
assert.match(html, /VØRTICE · Generative Audiovisual Field/);
assert.match(html, /<div id="root"><\/div>/);
assert.match(html, /name="description"/);

const csp = response.headers.get("content-security-policy") || "";
const xcto = response.headers.get("x-content-type-options") || "";
const referrer = response.headers.get("referrer-policy") || "";
const permissions = response.headers.get("permissions-policy") || "";

assert.match(csp, /object-src 'none'/);
assert.match(csp, /base-uri 'self'/);
assert.equal(xcto.toLowerCase(), "nosniff");
assert.match(referrer, /strict-origin-when-cross-origin/i);
assert.match(permissions, /camera=\(\)/);
assert.match(permissions, /microphone=\(\)/);

console.log("VÓRTICE LIVE CONTRACT PASS");
console.log(`URL: ${response.url}`);
console.log(`HTTP: ${response.status}`);
console.log("Headers: CSP / nosniff / referrer / permissions PASS");
