import test from "node:test";
import assert from "node:assert/strict";
import {
  wearableScenario,
  wearableScenarios,
  wearableSnapshot,
} from "../src/wearable.ts";

test("wearable scenarios provide bounded metrics and seven-day trends", () => {
  assert.equal(wearableScenarios.length, 4);
  for (const scenario of wearableScenarios) {
    assert.ok(scenario.recovery >= 0 && scenario.recovery <= 100);
    assert.ok(scenario.sleep >= 0 && scenario.sleep <= 100);
    assert.equal(scenario.recoveryTrend.length, 7);
    assert.equal(scenario.sleepTrend.length, 7);
  }
});

test("wearable snapshot includes the selected recovery metrics", () => {
  const scenario = wearableScenario("low-recovery");
  const snapshot = wearableSnapshot(scenario);
  assert.match(snapshot, /Wearable snapshot/);
  assert.match(snapshot, /Recovery 22%/);
  assert.match(snapshot, /HRV 31 ms/);
});
