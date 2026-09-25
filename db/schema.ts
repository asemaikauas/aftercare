import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Nested record shapes (conditions, labs, tasks, etc.) are stored as JSON
// text columns. This dataset is seeded once from Synthea output, not
// a normalized clinical schema — see db/README seed script for the shape.
export const patients = sqliteTable("patients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  risk: text("risk").notNull(), // "Critical" | "Watch" | "Stable"
  score: integer("score").notNull(),
  age: integer("age").notNull(),
  dob: text("dob").notNull(),
  pronouns: text("pronouns").notNull(),
  sex: text("sex").notNull(),
  language: text("language").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  mrn: text("mrn").notNull(),
  procedure: text("procedure").notNull(),
  procedureDate: text("procedure_date").notNull(),
  dischargeDate: text("discharge_date").notNull(),
  service: text("service").notNull(),
  nextAppointment: text("next_appointment").notNull(),
  alert: text("alert").notNull(),
  summary: text("summary").notNull(),
  careTeam: text("care_team", { mode: "json" }).notNull(),
  conditions: text("conditions", { mode: "json" }).notNull(),
  allergies: text("allergies", { mode: "json" }).notNull(),
  medications: text("medications", { mode: "json" }).notNull(),
  symptoms: text("symptoms", { mode: "json" }).notNull(),
  metrics: text("metrics", { mode: "json" }).notNull(),
  labs: text("labs", { mode: "json" }).notNull(),
  tasks: text("tasks", { mode: "json" }).notNull(),
  documents: text("documents", { mode: "json" }).notNull(),
  timeline: text("timeline", { mode: "json" }).notNull(),
  source: text("source").notNull().default("synthea"),
});

export const checkins = sqliteTable("checkins", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  submittedAt: text("submitted_at").notNull(),
  source: text("source").notNull(),
  mood: text("mood").notNull(),
  duration: text("duration").notNull().default("—"),
  risk: text("risk").notNull(),
  status: text("status").notNull().default("submitted"),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  transcript: text("transcript", { mode: "json" }).notNull(),
  answers: text("answers", { mode: "json" }).notNull(),
  flags: text("flags", { mode: "json" }).notNull(),
  wave: text("wave", { mode: "json" }).notNull(),
  reviewedAt: text("reviewed_at"),
  reviewedBy: text("reviewed_by"),
});

export const patientEvents = sqliteTable("patient_events", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  patientName: text("patient_name").notNull(),
  kind: text("kind").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});
