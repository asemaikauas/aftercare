import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDemoServer } from "../scripts/demo-server.mjs";
test("phone event reaches admin inbox, survives restart, and retry is idempotent", async () => {
  const directory = await mkdtemp(join(tmpdir(), "continuum-test-"));
  let server = createDemoServer(join(directory, "events.json"));
  const listen = () =>
    new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const close = () => new Promise((resolve) => server.close(resolve));
  await listen();
  let url = `http://127.0.0.1:${server.address().port}`;
  const event = {
    id: "test-1",
    patientId: "1",
    patientName: "Sophia Reed",
    kind: "check-in",
    body: "Feeling good. Pain 2/10.",
    createdAt: new Date().toISOString(),
  };
  const post = (data) =>
    fetch(`${url}/events`, { method: "POST", body: JSON.stringify(data) });
  try {
    assert.equal(
      (await (await fetch(`${url}/health`)).json()).service,
      "continuum-demo",
    );
    assert.equal(
      (await post({ ...event, patientId: "not-a-patient" })).status,
      400,
    );
    assert.equal((await post({ ...event, body: "" })).status, 400);
    assert.equal((await post(event)).status, 201);
    assert.equal((await post(event)).status, 201);
    await Promise.all([
      post({ ...event, id: "test-2" }),
      post({ ...event, id: "test-3" }),
    ]);
    assert.equal(
      (await (await fetch(`${url}/events`)).json()).events.length,
      3,
    );
    await close();
    server = createDemoServer(join(directory, "events.json"));
    await listen();
    url = `http://127.0.0.1:${server.address().port}`;
    assert.equal(
      (await (await fetch(`${url}/events`)).json()).events[0].body,
      event.body,
    );
  } finally {
    await close();
    await rm(directory, { recursive: true });
  }
});
