import test from "node:test";
import assert from "node:assert/strict";
import { clinicSubmission } from "../src/watch-transport.ts";
import { seedPatients } from "../../db/seed-data.ts";
import { validateEvent } from "../../scripts/demo-server.mjs";

test("watch submissions remain compatible with the unchanged clinic API", () => {
  for (const kind of ["watch-alert", "watch-response", "watch-reminder", "watch-checkin"]) {
    const event = { id: "watch-test", patientId: seedPatients[0].id, patientName: seedPatients[0].name, kind, body: "SIMULATED patient response", createdAt: new Date().toISOString(), simulated: true };
    const payload = clinicSubmission(event);
    assert.equal(validateEvent(payload), true);
    assert.equal(payload.id, event.id);
    assert.equal(payload.kind, kind === "watch-checkin" ? "check-in" : "message");
    assert.equal(payload.body.startsWith("HELP REQUEST"), kind === "watch-alert");
    assert.equal(event.kind, kind);
  }
});
test("existing wearable submissions are unchanged", () => {
  const item = { kind: "wearable", body: "existing snapshot" };
  assert.equal(clinicSubmission(item), item);
});
