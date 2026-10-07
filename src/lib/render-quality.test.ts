import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_RENDER_PIXELS,
  resolveRenderDpr,
} from "./render-quality.ts";

test("render DPR stays near native on a normal 1080p display", () => {
  const dpr = resolveRenderDpr({
    width: 1920,
    height: 1080,
    deviceDpr: 2,
    maxTextureSize: 16384,
  });
  assert.ok(dpr > 1.9 && dpr <= 2);
});

test("render DPR respects the pixel budget on 4K high-DPI screens", () => {
  const dpr = resolveRenderDpr({
    width: 3840,
    height: 2160,
    deviceDpr: 2,
    maxTextureSize: 16384,
  });
  assert.ok(dpr < 1);
  assert.ok(3840 * 2160 * dpr * dpr <= MAX_RENDER_PIXELS + 1);
});

test("render DPR never exceeds the GPU texture limit", () => {
  const dpr = resolveRenderDpr({
    width: 5000,
    height: 2000,
    deviceDpr: 2,
    maxTextureSize: 4096,
    pixelBudget: Number.MAX_SAFE_INTEGER,
  });
  assert.ok(5000 * dpr <= 4096 + 0.001);
});
