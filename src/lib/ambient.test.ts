import assert from "node:assert/strict";
import test from "node:test";
import { parseAmbientVolume } from "./ambient.ts";

test("ambient volume defaults to 45% when no preference exists", () => {
  assert.equal(parseAmbientVolume(null), 0.45);
  assert.equal(parseAmbientVolume(""), 0.45);
  assert.equal(parseAmbientVolume("not-a-number"), 0.45);
});

test("ambient volume accepts valid preferences and clamps corrupt ranges", () => {
  assert.equal(parseAmbientVolume("0.72"), 0.72);
  assert.equal(parseAmbientVolume("2"), 1);
  assert.equal(parseAmbientVolume("-1"), 0);
});
