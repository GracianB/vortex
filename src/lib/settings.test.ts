import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSceneUrl,
  parseSceneSearch,
  serializeScene,
  type SettingsSnapshot,
} from "./settings.ts";

const scene: SettingsSnapshot = {
  count: 9200,
  force: 1.35,
  trail: 0.91,
  palette: "solar",
  mode: "orbit",
  bg: "abyss",
  customBg: "#102018",
};

test("scene serialization round-trips exact public settings", () => {
  const query = serializeScene(scene);
  assert.deepEqual(parseSceneSearch(query), {
    count: 9200,
    force: 1.35,
    trail: 0.91,
    palette: "solar",
    mode: "orbit",
    bg: "abyss",
  });
});

test("scene parser clamps numeric values and ignores invalid enums", () => {
  assert.deepEqual(
    parseSceneSearch(
      "?mode=nope&palette=ice&bg=void&count=999999&force=-4&trail=12",
    ),
    {
      palette: "ice",
      bg: "void",
      count: 20000,
      force: 0.15,
      trail: 0.97,
    },
  );
});

test("custom backgrounds are normalized and share URLs discard unrelated params", () => {
  const custom = { ...scene, bg: "custom" as const, customBg: "#Aa11Cc" };
  const url = buildSceneUrl(
    "https://vortex.example/?embed=1&utm_source=noise#fragment",
    custom,
  );
  const parsed = new URL(url);

  assert.equal(parsed.hash, "");
  assert.equal(parsed.searchParams.has("embed"), false);
  assert.equal(parsed.searchParams.has("utm_source"), false);
  assert.equal(parsed.searchParams.get("color"), "aa11cc");
  assert.equal(parseSceneSearch(parsed.search).customBg, "#aa11cc");
});
