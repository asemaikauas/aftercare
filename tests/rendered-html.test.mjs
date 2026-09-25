import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const port = 41000 + (process.pid % 1000);
const origin = `http://localhost:${port}`;
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

test("server-renders the Aftercare landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Aftercare — Post-discharge care command center<\/title>/i);
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
