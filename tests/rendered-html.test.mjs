import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Continuum clinic dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Continuum — Post-discharge care command center<\/title>/i);
  assert.match(html, /Good morning, Maya/);
  assert.match(html, /Patient priority/);
  assert.match(html, /Sophia Reed/);
  assert.match(html, /AI care brief/);
  assert.match(html, /Synthetic patient data/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("renders safety and human-review boundaries", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /Review required/);
  assert.match(html, /Clinical review required/);
  assert.match(html, /Decision support only — not for emergency use/);
  assert.match(html, /Source data behind the current score/);
});

test("renders a dedicated patient profile route", async () => {
  const response = await render("/patients/1");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Patient profile/);
  assert.match(html, /Sophia Reed/);
  assert.match(html, /Personal details/);
  assert.match(html, /Clinical record/);
  assert.match(html, /Synthetic patient/);
});
