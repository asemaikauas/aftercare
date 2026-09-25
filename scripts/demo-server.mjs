// Local development bridge. No authentication: never expose publicly.
import http from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { seedPatients as patientProfiles } from "../db/seed-data.ts";

const directory = fileURLToPath(
  new URL("../work/demo-clinic/", import.meta.url),
);
const filename = `${directory}/events.json`;
export function validateEvent(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const patient = patientProfiles.find((p) => p.id === value.patientId);
  return (
    !!patient &&
    value.patientName === patient.name &&
    typeof value.id === "string" &&
    /^[\w-]{1,100}$/.test(value.id) &&
    ["check-in", "medication", "message", "wearable"].includes(value.kind) &&
    typeof value.body === "string" &&
    value.body.trim().length > 0 &&
    value.body.length <= 3000 &&
    typeof value.createdAt === "string" &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}
export function createDemoServer(storage = filename) {
  let writeQueue = Promise.resolve();
  async function read() {
    try {
      return JSON.parse(await readFile(storage, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }
  return http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    const send = (status, body) => {
      res.writeHead(status);
      res.end(JSON.stringify(body));
    };
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    try {
      if (req.method === "GET" && req.url === "/health")
        return send(200, { service: "continuum-demo", syntheticOnly: true });
      if (req.method === "GET" && req.url === "/events") {
        await writeQueue.catch(() => {});
        return send(200, { events: await read() });
      }
      if (req.method === "POST" && req.url === "/events") {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 8192) {
            send(413, { error: "Body too large" });
            return;
          }
          chunks.push(chunk);
        }
        const body = Buffer.concat(chunks).toString("utf8");
        let value;
        try {
          value = JSON.parse(body);
        } catch {
          return send(400, { error: "Invalid JSON" });
        }
        if (!validateEvent(value))
          return send(400, {
            error: "Expected an event for a known patient",
          });
        const clean = {
          id: value.id,
          patientId: value.patientId,
          patientName: value.patientName,
          kind: value.kind,
          body: value.body.trim(),
          createdAt: value.createdAt,
        };
        const transaction = writeQueue
          .catch(() => {})
          .then(async () => {
            const events = await read();
            if (events.some((event) => event.id === clean.id)) return;
            // Keep idempotency keys instead of pruning previously acknowledged events.
            if (events.length >= 10000)
              throw new Error("Inbox capacity reached");
            await mkdir(dirname(storage), { recursive: true });
            await writeFile(
              `${storage}.tmp`,
              JSON.stringify([...events, clean], null, 2),
            );
            await rename(`${storage}.tmp`, storage);
          });
        writeQueue = transaction;
        await transaction;
        return send(201, { accepted: true, id: clean.id });
      }
      send(404, { error: "Not found" });
    } catch (error) {
      console.error("Local bridge:", error.message);
      send(500, { error: "Inbox unavailable; retry later" });
    }
  });
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const host = process.argv.includes("--lan") ? "0.0.0.0" : "127.0.0.1";
  const port = Number(process.env.DEMO_PORT || 4100);
  createDemoServer().listen(port, host, () =>
    console.log(
      `CareMinute local inbox: http://${host}:${port}\nUse --lan on a trusted local network to connect a phone. Do not expose this unauthenticated service publicly.`,
    ),
  );
}
