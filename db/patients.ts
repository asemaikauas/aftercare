import { eq, sql } from "drizzle-orm";
import { getDb } from "./index";
import { patients } from "./schema";
import { seedPatients } from "./seed-data";
import type { PatientProfile } from "./types";

async function ensureSeeded() {
  const db = getDb();
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      initials TEXT NOT NULL,
      risk TEXT NOT NULL,
      score INTEGER NOT NULL,
      age INTEGER NOT NULL,
      dob TEXT NOT NULL,
      pronouns TEXT NOT NULL,
      sex TEXT NOT NULL,
      language TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      emergency_contact TEXT NOT NULL,
      mrn TEXT NOT NULL,
      procedure TEXT NOT NULL,
      procedure_date TEXT NOT NULL,
      discharge_date TEXT NOT NULL,
      service TEXT NOT NULL,
      next_appointment TEXT NOT NULL,
      alert TEXT NOT NULL,
      summary TEXT NOT NULL,
      care_team TEXT NOT NULL,
      conditions TEXT NOT NULL,
      allergies TEXT NOT NULL,
      medications TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      metrics TEXT NOT NULL,
      labs TEXT NOT NULL,
      tasks TEXT NOT NULL,
      documents TEXT NOT NULL,
      timeline TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'synthea'
    )
  `);

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(patients);
  if (count > 0) return db;

  for (const patient of seedPatients) {
    await db.insert(patients).values({
      id: patient.id,
      name: patient.name,
      initials: patient.initials,
      risk: patient.risk,
      score: patient.score,
      age: patient.age,
      dob: patient.dob,
      pronouns: patient.pronouns,
      sex: patient.sex,
      language: patient.language,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      emergencyContact: patient.emergencyContact,
      mrn: patient.mrn,
      procedure: patient.procedure,
      procedureDate: patient.procedureDate,
      dischargeDate: patient.dischargeDate,
      service: patient.service,
      nextAppointment: patient.nextAppointment,
      alert: patient.alert,
      summary: patient.summary,
      careTeam: patient.careTeam,
      conditions: patient.conditions,
      allergies: patient.allergies,
      medications: patient.medications,
      symptoms: patient.symptoms,
      metrics: patient.metrics,
      labs: patient.labs,
      tasks: patient.tasks,
      documents: patient.documents,
      timeline: patient.timeline,
    });
  }

  return db;
}

function toProfile(row: typeof patients.$inferSelect): PatientProfile {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    risk: row.risk as PatientProfile["risk"],
    score: row.score,
    age: row.age,
    dob: row.dob,
    pronouns: row.pronouns,
    sex: row.sex,
    language: row.language,
    phone: row.phone,
    email: row.email,
    address: row.address,
    emergencyContact: row.emergencyContact,
    mrn: row.mrn,
    procedure: row.procedure,
    procedureDate: row.procedureDate,
    dischargeDate: row.dischargeDate,
    service: row.service,
    nextAppointment: row.nextAppointment,
    alert: row.alert,
    summary: row.summary,
    careTeam: row.careTeam as PatientProfile["careTeam"],
    conditions: row.conditions as string[],
    allergies: row.allergies as string[],
    medications: row.medications as PatientProfile["medications"],
    symptoms: row.symptoms as string[],
    metrics: row.metrics as PatientProfile["metrics"],
    labs: row.labs as PatientProfile["labs"],
    tasks: row.tasks as PatientProfile["tasks"],
    documents: row.documents as PatientProfile["documents"],
    timeline: row.timeline as PatientProfile["timeline"],
  };
}

export async function listPatients(): Promise<PatientProfile[]> {
  const db = await ensureSeeded();
  const rows = await db.select().from(patients);
  return rows.map(toProfile);
}

export async function getPatient(id: string): Promise<PatientProfile | undefined> {
  const db = await ensureSeeded();
  const [row] = await db.select().from(patients).where(eq(patients.id, id));
  return row ? toProfile(row) : undefined;
}

export type CheckinMood = "good" | "okay" | "not_well" | "voice";

const riskRank: Record<PatientProfile["risk"], number> = { Stable: 0, Watch: 1, Critical: 2 };

function nowLabel() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export async function submitCheckin(id: string, mood: CheckinMood, note?: string): Promise<PatientProfile | undefined> {
  const db = await ensureSeeded();
  const [row] = await db.select().from(patients).where(eq(patients.id, id));
  if (!row) return undefined;
  const patient = toProfile(row);

  const timelineEntry =
    mood === "good"
      ? { time: `Today · ${nowLabel()}`, title: "Check-in completed", detail: "Patient reported feeling good with no new symptoms.", source: "Patient app", tone: "stable" as const }
      : mood === "okay"
        ? { time: `Today · ${nowLabel()}`, title: "Check-in completed", detail: note ? `Patient reported some discomfort: ${note}` : "Patient reported some discomfort.", source: "Patient app", tone: "watch" as const }
        : mood === "voice"
          ? { time: `Today · ${nowLabel()}`, title: "Voice check-in completed", detail: note ? `Patient said: "${note}"` : "Patient completed a voice check-in.", source: "Patient app", tone: "watch" as const }
          : { time: `Today · ${nowLabel()}`, title: "New concern reported", detail: note ? `Patient flagged a new concern: ${note}` : "Patient flagged a new concern during check-in.", source: "Patient app", tone: "critical" as const };

  const nextTimeline = [timelineEntry, ...patient.timeline];

  const checkinTaskIndex = patient.tasks.findIndex((task) => /check-?in|symptom/i.test(task.label));
  const nextTasks = checkinTaskIndex === -1
    ? patient.tasks
    : patient.tasks.map((task, index) => (index === checkinTaskIndex ? { ...task, done: true, detail: `Completed ${nowLabel()}` } : task));

  let nextRisk = patient.risk;
  let nextScore = patient.score;
  let nextAlert = patient.alert;
  let nextSummary = patient.summary;
  let nextSymptoms = patient.symptoms;

  if (mood === "okay") {
    nextRisk = riskRank[patient.risk] < riskRank.Watch ? "Watch" : patient.risk;
    nextScore = Math.min(99, patient.score + 8);
    if (note) nextSymptoms = [note, ...patient.symptoms];
  } else if (mood === "voice") {
    // No sentiment classification is run on the transcript, so risk/score are
    // left untouched here — a clinician reads the raw transcript and decides.
    if (note) nextSymptoms = [note, ...patient.symptoms];
  } else if (mood === "not_well") {
    nextRisk = "Critical";
    nextScore = Math.max(patient.score + 20, 82);
    nextAlert = note ? `New patient-reported concern: ${note}` : "New patient-reported concern";
    nextSummary = `${patient.name.split(" ")[0]} flagged a new concern during today's check-in${note ? `: "${note}"` : ""}. Escalated for same-day clinician review.`;
    if (note) nextSymptoms = [note, ...patient.symptoms];
  }

  await db
    .update(patients)
    .set({
      risk: nextRisk,
      score: nextScore,
      alert: nextAlert,
      summary: nextSummary,
      symptoms: nextSymptoms,
      tasks: nextTasks,
      timeline: nextTimeline,
    })
    .where(eq(patients.id, id));

  return getPatient(id);
}
