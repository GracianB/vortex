import assert from "node:assert/strict";
import test from "node:test";
import { MASTER_SCENES, MOVEMENTS, movementFor } from "./movements.ts";

test("defines seven ordered movements", () => {
  assert.deepEqual(
    MOVEMENTS.map(({ id, roman }) => [id, roman]),
    [
      ["vortex", "I"],
      ["flow", "II"],
      ["orbit", "III"],
      ["wave", "IV"],
      ["chaos", "V"],
      ["singularity", "VI"],
      ["supernova", "VII"],
    ],
  );
});

test("every master scene has a unique identity and valid movement", () => {
  assert.equal(MASTER_SCENES.length, 11);
  assert.equal(new Set(MASTER_SCENES.map((scene) => scene.id)).size, 11);
  assert.equal(new Set(MASTER_SCENES.map((scene) => scene.code)).size, 11);

  const validModes = new Set(MOVEMENTS.map((movement) => movement.id));
  for (const scene of MASTER_SCENES) {
    assert.ok(validModes.has(scene.mode));
    assert.ok(scene.count >= 800 && scene.count <= 32_000);
    assert.ok(scene.force >= 0.15 && scene.force <= 3);
    assert.ok(scene.trail >= 0 && scene.trail <= 0.97);
  }
});

test("movement lookup always resolves the canonical chapter", () => {
  assert.equal(movementFor("orbit").roman, "III");
  assert.equal(movementFor("wave").name, "ONDA");
  assert.equal(movementFor("chaos").roman, "V");
  assert.equal(movementFor("chaos").name, "CAOS");
  assert.equal(movementFor("singularity").roman, "VI");
  assert.equal(movementFor("supernova").roman, "VII");
  assert.equal(movementFor("supernova").name, "SUPERNOVA");
});
