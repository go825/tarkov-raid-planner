import assert from "node:assert/strict";
import test from "node:test";
import { applyTaskOverlay, hasCoordinates, translateTree } from "../lib/tarkov/core.mjs";

test("translations use locale, English fallback, then original key", () => {
  const source = { name: "task.name", objectives: [{ description: "objective.name" }], untouched: "id-1" };
  assert.deepEqual(translateTree(source, { "task.name": "任務" }, { "objective.name": "Objective" }), {
    name: "任務", objectives: [{ description: "Objective" }], untouched: "id-1",
  });
});

test("overlay applies shared, mode and locale task patches in order", () => {
  const base = { task: { id: "task", name: "Base", objectives: [{ id: "objective", count: 1 }] } };
  const overlay = {
    tasks: { task: { name: "Shared", objectives: { objective: { count: 2 } } } },
    modes: { regular: { tasks: { task: { minPlayerLevel: 10 } } } },
    locales: { ja: { tasks: { task: { name: "日本語" } } } },
  };
  const result = applyTaskOverlay(base, overlay, "regular", "ja");
  assert.equal(result.task.name, "日本語");
  assert.equal(result.task.minPlayerLevel, 10);
  assert.equal(result.task.objectives[0].count, 2);
});

test("coordinate detection supports positions and zones", () => {
  assert.equal(hasCoordinates({ possibleLocations: [{ positions: [[1, 2, 3]] }] }), true);
  assert.equal(hasCoordinates({ zones: [{ position: { x: 1, y: 2, z: 3 } }] }), true);
  assert.equal(hasCoordinates({ maps: [{ id: "customs" }] }), false);
});
