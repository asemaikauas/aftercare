import { desc, sql } from "drizzle-orm";
import { getDb } from "./index";
import { patientEvents } from "./schema";
import { seedPatients } from "./seed-data";

export type PatientEvent = {
  id: string;
  patientId: string;
  patientName: string;
  kind: "check-in" | "medication" | "message" | "wearable";
  body: string;
  createdAt: string;
};

const KINDS: PatientEvent["kind"][] = [
  "check-in",
  "medication",
  "message",
  "wearable",
];

async function ensureTable() {
  const db = getDb();
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS patient_events (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      kind TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  return db;
}

// Mirrors the local bridge's validation so both paths accept the same payload.
export function parseEvent(value: unknown): PatientEvent | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const event = value as Record<string, unknown>;
  const patient = seedPatients.find((p) => p.id === event.patientId);
  if (!patient || event.patientName !== patient.name) return;
  if (typeof event.id !== "string" || !/^[\w-]{1,100}$/.test(event.id)) return;
  if (!KINDS.includes(event.kind as PatientEvent["kind"])) return;
  if (typeof event.body !== "string") return;
  const body = event.body.trim();
  if (!body || body.length > 3000) return;
  if (typeof event.createdAt !== "string" || !Number.isFinite(Date.parse(event.createdAt)))
    return;
  return {
    id: event.id,
    patientId: patient.id,
    patientName: patient.name,
    kind: event.kind as PatientEvent["kind"],
    body,
    createdAt: event.createdAt,
  };
}

// Resubmitting an event the phone already delivered must not duplicate it: the
// app retries from its offline outbox whenever a response is lost.
export async function recordEvent(event: PatientEvent): Promise<void> {
  const db = await ensureTable();
  await db.insert(patientEvents).values(event).onConflictDoNothing();
}

export async function listEvents(limit = 200): Promise<PatientEvent[]> {
  const db = await ensureTable();
  const rows = await db
    .select()
    .from(patientEvents)
    .orderBy(desc(patientEvents.createdAt))
    .limit(limit);
  return rows as PatientEvent[];
}
