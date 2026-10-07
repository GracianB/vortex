import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const html = readFileSync("index.html", "utf8");

test("production headers keep the public canvas embeddable but hardened", () => {
  const globalRule = vercel.headers.find((rule) => rule.source === "/(.*)");
  assert.ok(globalRule, "global Vercel header rule is required");

  const headers = Object.fromEntries(
    globalRule.headers.map((header) => [header.key.toLowerCase(), header.value]),
  );
  const csp = headers["content-security-policy"];

  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.match(csp, /form-action 'self'/);
  assert.match(csp, /frame-ancestors \*/);
  assert.equal(headers["x-content-type-options"], "nosniff");
  assert.match(headers["permissions-policy"], /camera=\(\)/);
  assert.match(headers["permissions-policy"], /microphone=\(\)/);
  assert.match(headers["permissions-policy"], /geolocation=\(\)/);
});

test("document publishes canonical and social metadata", () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/vortex-gilt-xi\.vercel\.app\/" \/>/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /viewport-fit=cover/);
});
