import type { PatientProfile } from "../db/types";

export type Risk = "Critical" | "Watch" | "Stable";

export type Patient = {
  id: number;
  name: string;
  initials: string;
  age: number;
  procedure: string;
  discharged: string;
  day: number;
  risk: Risk;
  score: number;
  change: number;
  alert: string;
  lastContact: string;
  nextCheck: string;
  recovery: number[];
  metrics: {
    heartRate: string;
    heartDelta: string;
    sleep: string;
    sleepDelta: string;
    temperature: string;
    tempDelta: string;
    steps: string;
    stepsDelta: string;
  };
  symptoms: string[];
  conditions: string[];
  labs: { name: string; value: string; note: string; status: "high" | "low" | "normal" }[];
  evidence: { source: string; signal: string; detail: string; level: "high" | "medium" | "low" }[];
  summary: string;
  recommendation: string;
  tasks: { label: string; detail: string; done: boolean }[];
  timeline: { time: string; title: string; detail: string; kind: string }[];
};

const today = new Date(2026, 8, 23); // Wed 23 Sep 2026, matches the demo's "today"

function parseDemoDate(value: string): Date | null {
  const [day, mon, year] = value.split(" ");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = months.indexOf(mon);
  if (monthIndex === -1 || !day || !year) return null;
  return new Date(Number(year), monthIndex, Number(day));
}

export function dayOfRecovery(dischargeDate: string): number {
  const discharged = parseDemoDate(dischargeDate);
  if (!discharged) return 1;
  const diffDays = Math.round((today.getTime() - discharged.getTime()) / 86_400_000);
  return Math.max(1, diffDays + 1);
}

function metricLookup(metrics: PatientProfile["metrics"], label: string) {
  return metrics.find((metric) => metric.label === label);
}

function toneToLevel(tone: string): "high" | "medium" | "low" {
  if (tone === "critical") return "high";
  if (tone === "watch") return "medium";
  return "low";
}

function toneToKind(tone: string): string {
  if (tone === "critical") return "alert";
  if (tone === "watch") return "task";
  if (tone === "neutral") return "call";
  return "sync";
}

function statusToLevel(status: PatientProfile["labs"][number]["status"]): "high" | "low" | "normal" {
  if (status === "High") return "high";
  if (status === "Low") return "low";
  return "normal";
}

// Deterministic 12-point recovery trend ending at the patient's current score,
// shaped by risk tier (critical trends worsening, stable trends improving).
function buildRecoveryTrend(score: number, risk: Risk): number[] {
  const direction = risk === "Stable" ? -1 : risk === "Critical" ? 1 : 0.4;
  const points: number[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const value = Math.round(score - direction * i * 3.2);
    points.push(Math.min(95, Math.max(8, value)));
  }
  return points;
}

const riskChange: Record<Risk, number> = { Critical: 14, Watch: 5, Stable: -6 };

export function toDashboardPatient(patient: PatientProfile): Patient {
  const heart = metricLookup(patient.metrics, "Resting heart rate");
  const sleep = metricLookup(patient.metrics, "Sleep");
  const temperature = metricLookup(patient.metrics, "Temperature");
  const steps = metricLookup(patient.metrics, "Steps");

  return {
    id: Number(patient.id),
    name: patient.name,
    initials: patient.initials,
    age: patient.age,
    procedure: patient.procedure,
    discharged: patient.dischargeDate,
    day: dayOfRecovery(patient.dischargeDate),
    risk: patient.risk,
    score: patient.score,
    change: riskChange[patient.risk],
    alert: patient.alert,
    lastContact: "Care manager · today",
    nextCheck: patient.risk === "Critical" ? "Review now" : patient.nextAppointment.split(" · ").slice(0, 2).join(" · "),
    recovery: buildRecoveryTrend(patient.score, patient.risk),
    metrics: {
      heartRate: heart?.value ?? "Not tracked",
      heartDelta: heart?.context ?? "",
      sleep: sleep?.value ?? "Not tracked",
      sleepDelta: sleep?.context ?? "",
      temperature: temperature?.value ?? "Not tracked",
      tempDelta: temperature?.context ?? "",
      steps: steps?.value ?? "Not tracked",
      stepsDelta: steps?.context ?? "",
    },
    symptoms: patient.symptoms,
    conditions: patient.conditions,
    labs: patient.labs.slice(0, 3).map((lab) => ({
      name: lab.name,
      value: lab.value,
      note: lab.reference,
      status: statusToLevel(lab.status),
    })),
    evidence: patient.metrics.slice(0, 3).map((metric) => ({
      source: "Patient check-in",
      signal: metric.label,
      detail: `${metric.value} · ${metric.context}`,
      level: toneToLevel(metric.tone),
    })),
    summary: patient.summary,
    recommendation:
      patient.risk === "Critical"
        ? `Contact ${patient.name.split(" ")[0]} now for a nurse-led assessment. Confirm the reported changes using the clinic protocol and route findings to the on-call clinician.`
        : patient.risk === "Watch"
          ? `Review ${patient.name.split(" ")[0]}'s latest check-in today. A reminder or earlier follow-up may be appropriate after staff review.`
          : `Continue routine monitoring. No additional clinical action is suggested from the current signals.`,
    tasks: patient.tasks,
    timeline: patient.timeline.map((event) => ({
      time: event.time,
      title: event.title,
      detail: event.detail,
      kind: toneToKind(event.tone),
    })),
  };
}
