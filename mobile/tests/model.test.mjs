import test from "node:test";
import assert from "node:assert/strict";
import {
  bridgeAddress,
  dayKey,
  decodeStore,
  doseKey,
  parseTime,
  validateCheckin,
} from "../src/model.ts";
test("daily medication keys use local calendar day and isolate profiles", () => {
  const day = new Date(2026, 8, 24, 23, 59);
  const next = new Date(2026, 8, 25, 0, 1);
  assert.equal(dayKey(day), "2026-09-24");
  assert.notEqual(doseKey("1", "A", day), doseKey("1", "A", next));
  assert.notEqual(doseKey("1", "A", day), doseKey("2", "A", day));
});
test("reminder time rejects invalid hours and minutes without silently normalizing", () => {
  assert.deepEqual(parseTime("09:30"), { hour: 9, minute: 30 });
  for (const bad of ["24:00", "12:60", "9:30", "", "abc"])
    assert.throws(() => parseTime(bad));
});
test("check-in requires intentional responses and accepts zero pain", () => {
  assert.throws(() => validateCheckin(null, 3));
  assert.throws(() => validateCheckin(3, null));
  assert.throws(() => validateCheckin(6, 11));
  assert.doesNotThrow(() => validateCheckin(1, 0));
});
test("corrupt persistence is surfaced instead of silently replacing patient data", () => {
  assert.equal(decodeStore(null).patientId, "1");
  assert.throws(() => decodeStore("not-json"));
  assert.throws(() => decodeStore('{"version":2}'));
});
test("clinic URL does not accept credentials or non-HTTP schemes", () => {
  assert.equal(
    bridgeAddress(" http://192.168.1.5:3000/ "),
    "http://192.168.1.5:3000",
  );
  for (const bad of [
    "javascript:alert(1)",
    "http://user:password@localhost:3000",
    "https://example.com/path",
    "https://example.com/?token=secret",
  ])
    assert.throws(() => bridgeAddress(bad));
});
