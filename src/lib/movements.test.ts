import assert from "node:assert/strict";
import test from "node:test";
import { MASTER_SCENES, MOVEMENTS, movementFor } from "./movements.ts";

test("V6 defines exactly four ordered movements", () => {
  assert.deepEqual(
    MOVEMENTS.map(({ id, roman }) => [id, roman]),
    [
      ["vortex", "I"],
      ["flow", "II"],
      ["orbit", "III"],
      ["wave", "IV"],
    ],
  );
});

test("every V6 master scene has a unique identity and valid movement", () => {
  assert.equal(MASTER_SCENES.length, 6);
  assert.equal(new Set(MASTER_SCENES.map((scene) => scene.id)).size, 6);
  assert.equal(new Set(MASTER_SCENES.map((scene) => scene.code)).size, 6);

  const validModes = new Set(MOVEMENTS.map((movement) => movement.id));
  for (const scene of MASTER_SCENES) {
    assert.ok(validModes.has(scene.mode));
    assert.ok(scene.count >= 800 && scene.count <= 20_000);
    assert.ok(scene.force >= 0.15 && scene.force <= 3);
    assert.ok(scene.trail >= 0 && scene.trail <= 0.97);
  }
});

test("movement lookup always resolves the canonical chapter", () => {
  assert.equal(movementFor("orbit").roman, "III");
  assert.equal(movementFor("wave").name, "ONDA");
});
