import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const port = 41000 + (process.pid % 1000);
const origin = `http://localhost:${port}`;
const sharedCheckinId = `integration-web-${process.pid}`;
const sharedEventId = `integration-native-${process.pid}`;
let server;
let serverOutput = "";

before(async () => {
  server = spawn(
    process.execPath,
    ["node_modules/vinext/dist/cli.js", "dev", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: projectRoot,
      env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => { serverOutput += chunk; });
  server.stderr.on("data", (chunk) => { serverOutput += chunk; });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Development server exited before becoming ready.\n${serverOutput}`);
    }

    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error(`Timed out waiting for the development server.\n${serverOutput}`);
}, { timeout: 35_000 });

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    once(server, "exit"),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
});

async function render(pathname = "/") {
  return fetch(`${origin}${pathname}`, { headers: { accept: "text/html" } });
}

test("server-renders the CareMinute landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>CareMinute — Post-discharge care command center<\/title>/i);
  assert.match(html, /Patient Priority/);
  assert.match(html, /AI Care Brief/);
  assert.match(html, /Patient recovery operations/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("renders safety and human-review boundaries", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /Decision support only/);
  assert.match(html, /require clinical review/);
  assert.match(html, /not for emergency use/i);
  assert.match(html, /source signal behind it/);
});

test("presents the connected 60-second daily check-in", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /WHOOP/);
  assert.match(html, /Apple Health/);
  assert.match(html, /Speak, type, or tap to answer/i);
  assert.match(html, /checkin-conversation\.webp/i);
  assert.match(html, /Request a medication refill/i);
  assert.match(html, /Book an appointment/i);
  assert.match(html, /Did you consume any sugar today/i);
  assert.match(html, /A bar of dark chocolate/i);
  assert.match(html, /How did you feel after it/i);
});

test("renders a dedicated patient profile route", async () => {
  const response = await render("/patients/1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Patient profile/);
  assert.match(html, /Christel Carter/);
  assert.match(html, /Personal details/);
  assert.match(html, /Clinical record/);
  assert.match(html, /Patient record/);
});

test("persists web check-ins in the shared administrator queue", async () => {
  const created = await fetch(`${origin}/api/checkins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: sharedCheckinId, patientId: "4", mood: "voice", note: "Integration transcript from the patient app" }),
  });
  assert.equal(created.status, 201);

  const list = await fetch(`${origin}/api/checkins`);
  assert.equal(list.status, 200);
  const payload = await list.json();
  const checkin = payload.checkins.find((item) => item.id === sharedCheckinId);
  assert.equal(checkin.patientId, "4");
  assert.match(checkin.transcript[0].text, /Integration transcript/);

  const reviewed = await fetch(`${origin}/api/checkins/${sharedCheckinId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewedBy: "Integration Clinician" }),
  });
  assert.equal(reviewed.status, 200);
  assert.equal((await reviewed.json()).status, "reviewed");
});

test("routes native offline events through the same backend idempotently", async () => {
  const event = {
    id: sharedEventId,
    patientId: "4",
    patientName: "Mason Weissnat",
    kind: "check-in",
    body: 'Voice check-in: "Native integration transcript"',
    createdAt: new Date().toISOString(),
  };
  const first = await fetch(`${origin}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  assert.equal(first.status, 201);

  const duplicate = await fetch(`${origin}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json()).duplicate, true);

  const list = await fetch(`${origin}/api/checkins`);
  const payload = await list.json();
  const checkin = payload.checkins.find((item) => item.id === `event-${sharedEventId}`);
  assert.match(checkin.transcript[0].text, /Native integration transcript/);
});
