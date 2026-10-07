#!/usr/bin/env node
import { gzipSync } from "node:zlib";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "dist/assets";
const LIMITS = {
  largestJsRaw: 360_000,
  largestJsGzip: 115_000,
  totalJsGzip: 160_000,
  totalCssGzip: 12_000,
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function size(file) {
  const bytes = readFileSync(file);
  return {
    file: relative(ROOT, file),
    raw: statSync(file).size,
    gzip: gzipSync(bytes, { level: 9 }).length,
  };
}

function kb(n) {
  return `${(n / 1024).toFixed(1)} kB`;
}

const files = walk(ROOT);
const js = files.filter((file) => file.endsWith(".js")).map(size);
const css = files.filter((file) => file.endsWith(".css")).map(size);

if (js.length === 0) throw new Error("Performance budget: no JS assets found.");
if (css.length === 0) throw new Error("Performance budget: no CSS assets found.");

const largestJs = js.reduce((a, b) => (a.raw >= b.raw ? a : b));
const totalJsGzip = js.reduce((sum, asset) => sum + asset.gzip, 0);
const totalCssGzip = css.reduce((sum, asset) => sum + asset.gzip, 0);

const checks = [
  ["largest JS raw", largestJs.raw, LIMITS.largestJsRaw],
  ["largest JS gzip", largestJs.gzip, LIMITS.largestJsGzip],
  ["total JS gzip", totalJsGzip, LIMITS.totalJsGzip],
  ["total CSS gzip", totalCssGzip, LIMITS.totalCssGzip],
];

let failed = false;
for (const [label, actual, limit] of checks) {
  const ok = actual <= limit;
  if (!ok) failed = true;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${label}: ${kb(actual)} <= ${kb(limit)}`,
  );
}

console.log(
  `Largest JS: ${largestJs.file} (${kb(largestJs.raw)} raw / ${kb(largestJs.gzip)} gzip)`,
);

if (failed) {
  throw new Error("Vórtice performance budget exceeded.");
}

console.log("VÓRTICE PERFORMANCE BUDGET PASS");
