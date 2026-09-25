import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "./index";
import { checkins, patientEvents } from "./schema";

export type CheckinRisk = "Critical" | "Watch" | "Stable";
export type CheckinStatus = "submitted" | "needs_review" | "reviewed";
export type CheckinAnswer = { label: string; value: string; trend: string; tone: "critical" | "watch" | "stable" };
export type CheckinFlag = { label: string; detail: string; tone: "critical" | "watch" };
export type TranscriptLine = { speaker: "Assistant" | "Patient"; text: string };

export type DailyCheckin = {
  id: string;
  patientId: string;
  patient: string;
  initials: string;
  procedure: string;
  day: number;
  time: string;
  submittedAt: string;
  duration: string;
  risk: CheckinRisk;
  status: CheckinStatus;
  headline: string;
  change: string;
  summary: string;
  flags: CheckinFlag[];
  answers: CheckinAnswer[];
  transcript: TranscriptLine[];
  wave: number[];
  reviewedAt?: string;
  reviewedBy?: string;
};

export type PatientEvent = {
  id: string;
  patientId: string;
  patientName: string;
  kind: "check-in" | "medication" | "message" | "wearable";
  body: string;
  createdAt: string;
};

const starterCheckins = [
  {
    id: "seed-checkin-1", patientId: "1", submittedAt: "2026-09-25T08:14:00+04:00", source: "seed", mood: "not_well", duration: "0:54", risk: "Critical", status: "needs_review", headline: "Fever and worsening pain", summary: "Sophia reports chills, worsening pain, and new warmth around the incision. Staff review is required.",
    transcript: [{ speaker: "Assistant", text: "How are you feeling compared with yesterday?" }, { speaker: "Patient", text: "Worse today. I had chills overnight and the pain is about an eight now." }],
    answers: [{ label: "Pain", value: "8 / 10", trend: "+2 since yesterday", tone: "critical" }],
    flags: [{ label: "Fever reported", detail: "38.1°C this morning", tone: "critical" }], wave: [28, 52, 76, 42, 88, 63, 35, 71, 92, 54, 31, 67],
  },
  {
    id: "seed-checkin-2", patientId: "2", submittedAt: "2026-09-25T07:45:00+04:00", source: "seed", mood: "not_well", duration: "1:01", risk: "Critical", status: "needs_review", headline: "Weight gain and ankle swelling", summary: "Noah reports new ankle swelling and a 2.1 kg weight increase over 48 hours.",
    transcript: [{ speaker: "Assistant", text: "Have you noticed any new swelling or changes in your breathing?" }, { speaker: "Patient", text: "Both ankles look puffy since last night, but my breathing feels the same." }],
    answers: [{ label: "Breathing", value: "No change", trend: "Stable", tone: "stable" }],
    flags: [{ label: "Rapid weight change", detail: "+2.1 kg over 48 hours", tone: "critical" }], wave: [43, 66, 31, 79, 58, 87, 46, 72, 37, 60, 91, 52],
  },
] as const;

export async function ensureCheckinStorage() {
  const db = getDb();
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS checkins (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      source TEXT NOT NULL,
      mood TEXT NOT NULL,
      duration TEXT NOT NULL DEFAULT '—',
      risk TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'submitted',
      headline TEXT NOT NULL,
      summary TEXT NOT NULL,
      transcript TEXT NOT NULL,
      answers TEXT NOT NULL,
      flags TEXT NOT NULL,
      wave TEXT NOT NULL,
      reviewed_at TEXT,
      reviewed_by TEXT
    )
  `);
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

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(checkins);
  if (count === 0) {
    for (const item of starterCheckins) {
      await db.insert(checkins).values({
        ...item,
        transcript: [...item.transcript],
        answers: [...item.answers],
        flags: [...item.flags],
        wave: [...item.wave],
      });
    }
  }
  return db;
}

function dayOfRecovery(dischargeDate: string) {
  const parsed = Date.parse(dischargeDate);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor((Date.now() - parsed) / 86_400_000) + 1);
}

export async function listCheckins(): Promise<DailyCheckin[]> {
  const db = await ensureCheckinStorage();
  const rows = await db.run(sql`
    SELECT c.*, p.name AS patient_name, p.initials, p.procedure, p.discharge_date
    FROM checkins c
    JOIN patients p ON p.id = c.patient_id
    ORDER BY c.submitted_at DESC
  `);
  return (rows.results as Record<string, unknown>[]).map((row) => {
    const parse = <T,>(value: unknown, fallback: T): T => {
      if (typeof value !== "string") return fallback;
      try { return JSON.parse(value) as T; } catch { return fallback; }
    };
    const submittedAt = String(row.submitted_at);
    const risk = String(row.risk) as CheckinRisk;
    const status = String(row.status) as CheckinStatus;
    const flags = parse<CheckinFlag[]>(row.flags, []);
    return {
      id: String(row.id), patientId: String(row.patient_id), patient: String(row.patient_name), initials: String(row.initials), procedure: String(row.procedure),
      day: dayOfRecovery(String(row.discharge_date)), time: new Date(submittedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), submittedAt,
      duration: String(row.duration), risk, status, headline: String(row.headline),
      change: status === "reviewed" ? "✓ Reviewed" : flags.length ? `${flags.length} concern${flags.length === 1 ? "" : "s"} detected` : "New submission",
      summary: String(row.summary), flags, answers: parse<CheckinAnswer[]>(row.answers, []), transcript: parse<TranscriptLine[]>(row.transcript, []), wave: parse<number[]>(row.wave, []),
      reviewedAt: row.reviewed_at ? String(row.reviewed_at) : undefined, reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
    };
  });
}

export async function markCheckinReviewed(id: string, reviewedBy: string) {
  const db = await ensureCheckinStorage();
  const reviewedAt = new Date().toISOString();
  await db.update(checkins).set({ status: "reviewed", reviewedAt, reviewedBy }).where(eq(checkins.id, id));
  return { id, status: "reviewed" as const, reviewedAt, reviewedBy };
}

export async function hasCheckin(id: string) {
  const db = await ensureCheckinStorage();
  const [row] = await db.select({ id: checkins.id }).from(checkins).where(eq(checkins.id, id));
  return Boolean(row);
}

export async function recordPatientEvent(event: PatientEvent) {
  const db = await ensureCheckinStorage();
  const [existing] = await db.select({ id: patientEvents.id }).from(patientEvents).where(eq(patientEvents.id, event.id));
  if (existing) return false;
  await db.insert(patientEvents).values(event);
  return true;
}

export async function listPatientEvents(): Promise<PatientEvent[]> {
  const db = await ensureCheckinStorage();
  return (await db.select().from(patientEvents).orderBy(desc(patientEvents.createdAt))) as PatientEvent[];
}
