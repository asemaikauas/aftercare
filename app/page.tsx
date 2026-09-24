"use client";

import { useEffect, useMemo, useState } from "react";
import MessagesCenter from "./MessagesCenter";
import TasksCenter from "./TasksCenter";
import CheckinsCenter from "./CheckinsCenter";
import CareTeamCenter from "./CareTeamCenter";
import { saveSentMessage } from "./message-store";

type Risk = "Critical" | "Watch" | "Stable";
type Tab = "Overview" | "Timeline" | "Care plan" | "Records";
type Modal = "reminder" | "appointment" | "integration" | null;

type Patient = {
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

const patients: Patient[] = [
  {
    id: 1,
    name: "Sophia Reed",
    initials: "SR",
    age: 67,
    procedure: "Total knee replacement",
    discharged: "18 Sep 2026",
    day: 5,
    risk: "Critical",
    score: 86,
    change: 18,
    alert: "Fever and rising resting heart rate",
    lastContact: "Yesterday, 4:20 PM",
    nextCheck: "Call due now",
    recovery: [78, 75, 72, 68, 59, 51, 43, 38, 31, 29, 24, 22],
    metrics: {
      heartRate: "92 bpm",
      heartDelta: "+18 vs baseline",
      sleep: "4h 12m",
      sleepDelta: "−31% this week",
      temperature: "38.1°C",
      tempDelta: "+1.2°C today",
      steps: "612",
      stepsDelta: "−46% yesterday",
    },
    symptoms: ["Pain 8/10", "Chills", "Incision warmth"],
    conditions: ["Hypertension", "Type 2 diabetes"],
    labs: [
      { name: "CRP", value: "31 mg/L", note: "Up from 12 on discharge", status: "high" },
      { name: "WBC", value: "12.4 ×10⁹/L", note: "Above configured range", status: "high" },
      { name: "Hemoglobin", value: "11.1 g/dL", note: "Stable", status: "normal" },
    ],
    evidence: [
      { source: "Apple Health", signal: "Resting heart rate", detail: "92 bpm · 18 above baseline", level: "high" },
      { source: "Patient check-in", signal: "Temperature", detail: "38.1°C · reported 08:14", level: "high" },
      { source: "WHOOP", signal: "Recovery", detail: "22% · down 29 pts in 3 days", level: "medium" },
    ],
    summary: "Three signals crossed the clinic’s post-op escalation rules overnight. Sophia reports chills and worsening pain alongside a sustained rise in resting heart rate.",
    recommendation: "Contact Sophia now for a nurse-led assessment. Confirm incision changes and screen for urgent red flags using the clinic protocol; route findings to the on-call clinician.",
    tasks: [
      { label: "Morning symptom check-in", detail: "Overdue by 1h 24m", done: false },
      { label: "Take prescribed medication", detail: "Patient marked complete at 07:32", done: true },
      { label: "Upload incision photo", detail: "Requested yesterday", done: false },
      { label: "Physio exercises", detail: "2 of 3 sessions complete", done: false },
    ],
    timeline: [
      { time: "08:14", title: "Escalation created", detail: "Temperature and heart-rate rules crossed threshold.", kind: "alert" },
      { time: "07:32", title: "Medication confirmed", detail: "Morning dose logged by patient.", kind: "task" },
      { time: "06:58", title: "WHOOP data synced", detail: "Recovery 22%, sleep performance 48%.", kind: "sync" },
      { time: "Yesterday", title: "Care manager call", detail: "Pain was 6/10; no fever reported.", kind: "call" },
    ],
  },
  {
    id: 2,
    name: "Noah Williams",
    initials: "NW",
    age: 59,
    procedure: "Coronary artery bypass",
    discharged: "16 Sep 2026",
    day: 7,
    risk: "Critical",
    score: 78,
    change: 11,
    alert: "Weight gain and low activity",
    lastContact: "Today, 7:45 AM",
    nextCheck: "Review within 1 hr",
    recovery: [65, 67, 64, 60, 58, 54, 49, 45, 42, 39, 35, 34],
    metrics: { heartRate: "84 bpm", heartDelta: "+11 vs baseline", sleep: "5h 03m", sleepDelta: "−18% this week", temperature: "37.2°C", tempDelta: "Within range", steps: "884", stepsDelta: "−38% yesterday" },
    symptoms: ["Ankle swelling", "Fatigue"],
    conditions: ["Coronary artery disease", "Hypertension"],
    labs: [
      { name: "Potassium", value: "4.4 mmol/L", note: "Within range", status: "normal" },
      { name: "Creatinine", value: "1.3 mg/dL", note: "Slight rise", status: "high" },
      { name: "Hemoglobin", value: "10.8 g/dL", note: "Expected post-op trend", status: "low" },
    ],
    evidence: [
      { source: "Patient check-in", signal: "Weight", detail: "+2.1 kg in 48 hours", level: "high" },
      { source: "Apple Health", signal: "Walking steadiness", detail: "Below recent baseline", level: "medium" },
      { source: "WHOOP", signal: "Strain", detail: "Low for 3 consecutive days", level: "medium" },
    ],
    summary: "Noah’s reported weight and ankle swelling meet the clinic’s configured fluid-status review rule. Activity remains below his discharge target.",
    recommendation: "Have the cardiac nurse review the morning check-in and contact Noah within one hour. Use the existing discharge protocol to determine escalation.",
    tasks: [
      { label: "Daily weight", detail: "Completed at 07:40", done: true },
      { label: "Breathing exercises", detail: "Not yet logged", done: false },
      { label: "Morning medication", detail: "Completed", done: true },
    ],
    timeline: [
      { time: "07:45", title: "Check-in reviewed", detail: "Patient reported ankle swelling.", kind: "alert" },
      { time: "07:40", title: "Weight logged", detail: "84.7 kg, up 2.1 kg over 48 hours.", kind: "task" },
      { time: "06:42", title: "Wearables synced", detail: "Activity and recovery updated.", kind: "sync" },
    ],
  },
  {
    id: 3,
    name: "Amelia Khan",
    initials: "AK",
    age: 44,
    procedure: "Laparoscopic colectomy",
    discharged: "19 Sep 2026",
    day: 4,
    risk: "Watch",
    score: 64,
    change: 7,
    alert: "Low hydration and nausea",
    lastContact: "Yesterday, 2:10 PM",
    nextCheck: "Check by 11:00 AM",
    recovery: [61, 63, 62, 59, 55, 50, 48, 44, 46, 43, 40, 41],
    metrics: { heartRate: "81 bpm", heartDelta: "+7 vs baseline", sleep: "5h 48m", sleepDelta: "−12% this week", temperature: "37.4°C", tempDelta: "+0.3°C today", steps: "1,204", stepsDelta: "−22% yesterday" },
    symptoms: ["Nausea", "Low appetite"],
    conditions: ["Iron-deficiency anemia"],
    labs: [
      { name: "Sodium", value: "134 mmol/L", note: "Slightly low", status: "low" },
      { name: "Hemoglobin", value: "10.4 g/dL", note: "Monitor", status: "low" },
    ],
    evidence: [
      { source: "Patient check-in", signal: "Fluid intake", detail: "2 of 6 cups logged", level: "medium" },
      { source: "Apple Health", signal: "Resting heart rate", detail: "7 above baseline", level: "medium" },
      { source: "Care plan", signal: "Meal goal", detail: "Missed twice", level: "low" },
    ],
    summary: "Hydration and meal goals have been missed while nausea persists. Other recovery signals remain within the clinic’s watch range.",
    recommendation: "Send the hydration check-in and review her response at 11:00 AM. Escalate only if symptoms meet the clinic’s existing protocol.",
    tasks: [
      { label: "Hydration goal", detail: "2 of 6 cups", done: false },
      { label: "Morning medication", detail: "Completed", done: true },
      { label: "Short walk", detail: "Not yet logged", done: false },
    ],
    timeline: [
      { time: "08:02", title: "Check-in completed", detail: "Nausea unchanged; low fluid intake.", kind: "task" },
      { time: "06:51", title: "Apple Health synced", detail: "Sleep and activity updated.", kind: "sync" },
    ],
  },
  {
    id: 4,
    name: "Ethan Cole",
    initials: "EC",
    age: 71,
    procedure: "Hip replacement",
    discharged: "17 Sep 2026",
    day: 6,
    risk: "Watch",
    score: 58,
    change: 4,
    alert: "Mobility goal missed twice",
    lastContact: "Monday, 10:30 AM",
    nextCheck: "Review today",
    recovery: [55, 57, 60, 62, 59, 55, 51, 49, 46, 48, 45, 44],
    metrics: { heartRate: "73 bpm", heartDelta: "+4 vs baseline", sleep: "6h 05m", sleepDelta: "−8% this week", temperature: "36.9°C", tempDelta: "Within range", steps: "920", stepsDelta: "−29% yesterday" },
    symptoms: ["Stiffness", "Pain 5/10"], conditions: ["Osteoarthritis"],
    labs: [{ name: "Hemoglobin", value: "11.5 g/dL", note: "Improving", status: "normal" }],
    evidence: [
      { source: "Apple Health", signal: "Steps", detail: "Below plan for 2 days", level: "medium" },
      { source: "Care plan", signal: "Physio", detail: "1 session missed", level: "medium" },
    ],
    summary: "Ethan is medically stable, but two mobility goals were missed and reported stiffness has increased.",
    recommendation: "Send a mobility check-in and offer an appointment slot with the physiotherapy team.",
    tasks: [{ label: "Morning walk", detail: "Not yet logged", done: false }, { label: "Medication", detail: "Completed", done: true }],
    timeline: [{ time: "07:04", title: "Apple Health synced", detail: "920 steps logged yesterday.", kind: "sync" }],
  },
  {
    id: 5,
    name: "Mia Chen",
    initials: "MC",
    age: 36,
    procedure: "Thyroidectomy",
    discharged: "20 Sep 2026",
    day: 3,
    risk: "Watch",
    score: 55,
    change: 3,
    alert: "New tingling symptom",
    lastContact: "Today, 8:05 AM",
    nextCheck: "Clinician review queued",
    recovery: [60, 62, 63, 61, 60, 58, 56, 55, 52, 50, 49, 48],
    metrics: { heartRate: "76 bpm", heartDelta: "+3 vs baseline", sleep: "6h 31m", sleepDelta: "−6% this week", temperature: "36.8°C", tempDelta: "Within range", steps: "2,132", stepsDelta: "+4% yesterday" },
    symptoms: ["Finger tingling", "Mild throat pain"], conditions: ["Hashimoto’s thyroiditis"],
    labs: [{ name: "Calcium", value: "8.4 mg/dL", note: "At lower configured boundary", status: "low" }, { name: "TSH", value: "Pending", note: "Scheduled follow-up", status: "normal" }],
    evidence: [{ source: "Patient check-in", signal: "New symptom", detail: "Finger tingling reported", level: "medium" }, { source: "Lab result", signal: "Calcium", detail: "8.4 mg/dL", level: "medium" }],
    summary: "Mia reported a new symptom this morning. Her latest calcium result is at the clinic’s lower review boundary.",
    recommendation: "Keep the existing clinician review in queue and attach the symptom report and latest lab result.",
    tasks: [{ label: "Symptom check-in", detail: "Completed", done: true }, { label: "Medication", detail: "Completed", done: true }],
    timeline: [{ time: "08:05", title: "New symptom reported", detail: "Finger tingling added to check-in.", kind: "alert" }],
  },
  {
    id: 6,
    name: "Oliver Grant",
    initials: "OG",
    age: 52,
    procedure: "Rotator cuff repair",
    discharged: "15 Sep 2026",
    day: 8,
    risk: "Stable",
    score: 31,
    change: -5,
    alert: "Recovery progressing as expected",
    lastContact: "Tuesday, 3:20 PM",
    nextCheck: "Routine check tomorrow",
    recovery: [44, 46, 48, 51, 55, 59, 61, 64, 66, 68, 70, 72],
    metrics: { heartRate: "66 bpm", heartDelta: "At baseline", sleep: "7h 12m", sleepDelta: "+9% this week", temperature: "36.7°C", tempDelta: "Within range", steps: "4,218", stepsDelta: "+12% yesterday" },
    symptoms: ["Pain 3/10"], conditions: ["None flagged"], labs: [{ name: "No new labs", value: "—", note: "Not required", status: "normal" }],
    evidence: [{ source: "WHOOP", signal: "Recovery", detail: "72% · improving", level: "low" }, { source: "Care plan", signal: "Adherence", detail: "94% this week", level: "low" }],
    summary: "Recovery signals and care-plan adherence are improving with no new concerns reported.",
    recommendation: "Continue routine monitoring. No additional staff action is suggested today.",
    tasks: [{ label: "Sling check", detail: "Completed", done: true }, { label: "Exercises", detail: "Completed", done: true }],
    timeline: [{ time: "07:11", title: "WHOOP synced", detail: "Recovery improved to 72%.", kind: "sync" }],
  },
  {
    id: 7, name: "Ava Martinez", initials: "AM", age: 63, procedure: "Cataract surgery", discharged: "21 Sep 2026", day: 2, risk: "Stable", score: 28, change: -2, alert: "All check-ins complete", lastContact: "Today, 8:22 AM", nextCheck: "Routine check Friday", recovery: [52, 54, 55, 57, 59, 62, 63, 64, 66, 68, 69, 71], metrics: { heartRate: "69 bpm", heartDelta: "At baseline", sleep: "7h 01m", sleepDelta: "+3% this week", temperature: "36.6°C", tempDelta: "Within range", steps: "3,905", stepsDelta: "+8% yesterday" }, symptoms: ["Mild irritation"], conditions: ["Type 2 diabetes"], labs: [{ name: "Glucose", value: "118 mg/dL", note: "Within patient range", status: "normal" }], evidence: [{ source: "Patient check-in", signal: "Vision", detail: "Improving as expected", level: "low" }], summary: "Ava has completed every check-in and reports improving vision with mild irritation only.", recommendation: "Continue the existing eye-drop reminders and routine follow-up.", tasks: [{ label: "Morning eye drops", detail: "Completed", done: true }, { label: "Symptom check", detail: "Completed", done: true }], timeline: [{ time: "08:22", title: "Check-in completed", detail: "No new concerns reported.", kind: "task" }] },
  {
    id: 8, name: "Lucas Bennett", initials: "LB", age: 48, procedure: "Appendectomy", discharged: "20 Sep 2026", day: 3, risk: "Stable", score: 24, change: -6, alert: "Pain and activity improving", lastContact: "Yesterday, 6:05 PM", nextCheck: "Routine check tomorrow", recovery: [40, 42, 46, 49, 52, 55, 59, 62, 65, 68, 71, 74], metrics: { heartRate: "64 bpm", heartDelta: "−2 vs baseline", sleep: "7h 34m", sleepDelta: "+11% this week", temperature: "36.8°C", tempDelta: "Within range", steps: "4,605", stepsDelta: "+17% yesterday" }, symptoms: ["Pain 2/10"], conditions: ["None flagged"], labs: [{ name: "WBC", value: "8.1 ×10⁹/L", note: "Within range", status: "normal" }], evidence: [{ source: "Apple Health", signal: "Activity", detail: "Trending upward", level: "low" }], summary: "Lucas is meeting activity and symptom targets with no new flags.", recommendation: "Continue routine monitoring.", tasks: [{ label: "Short walk", detail: "Completed", done: true }, { label: "Medication", detail: "Completed", done: true }], timeline: [{ time: "06:48", title: "Apple Health synced", detail: "Activity continues to improve.", kind: "sync" }] },
  {
    id: 9, name: "Isla Brooks", initials: "IB", age: 29, procedure: "ACL reconstruction", discharged: "14 Sep 2026", day: 9, risk: "Stable", score: 19, change: -3, alert: "Physio goals on track", lastContact: "Monday, 1:15 PM", nextCheck: "Physio Friday", recovery: [50, 51, 53, 55, 58, 60, 62, 65, 67, 69, 70, 73], metrics: { heartRate: "61 bpm", heartDelta: "At baseline", sleep: "7h 48m", sleepDelta: "+8% this week", temperature: "36.5°C", tempDelta: "Within range", steps: "3,480", stepsDelta: "+14% yesterday" }, symptoms: ["Expected swelling"], conditions: ["None flagged"], labs: [{ name: "No new labs", value: "—", note: "Not required", status: "normal" }], evidence: [{ source: "Care plan", signal: "Physio adherence", detail: "100% this week", level: "low" }], summary: "Isla’s mobility and adherence are progressing according to her care plan.", recommendation: "No additional action suggested before Friday’s physiotherapy visit.", tasks: [{ label: "Range-of-motion set", detail: "Completed", done: true }, { label: "Ice and elevation", detail: "Completed", done: true }], timeline: [{ time: "07:25", title: "Exercises completed", detail: "Morning set logged.", kind: "task" }] },
  {
    id: 10, name: "Leo Park", initials: "LP", age: 41, procedure: "Hernia repair", discharged: "13 Sep 2026", day: 10, risk: "Stable", score: 15, change: -8, alert: "Ready for routine follow-up", lastContact: "Friday, 11:40 AM", nextCheck: "Appointment tomorrow", recovery: [48, 50, 53, 57, 60, 64, 68, 71, 74, 76, 78, 81], metrics: { heartRate: "63 bpm", heartDelta: "−3 vs baseline", sleep: "8h 02m", sleepDelta: "+14% this week", temperature: "36.6°C", tempDelta: "Within range", steps: "5,102", stepsDelta: "+21% yesterday" }, symptoms: ["No new symptoms"], conditions: ["None flagged"], labs: [{ name: "No new labs", value: "—", note: "Not required", status: "normal" }], evidence: [{ source: "WHOOP", signal: "Recovery", detail: "81% · strong", level: "low" }], summary: "Leo’s recovery is on track and all required daily tasks are complete.", recommendation: "Proceed with the scheduled routine follow-up tomorrow.", tasks: [{ label: "Daily check-in", detail: "Completed", done: true }, { label: "Walking goal", detail: "Completed", done: true }], timeline: [{ time: "06:36", title: "WHOOP synced", detail: "Recovery improved to 81%.", kind: "sync" }] },
];

const riskOrder: Record<Risk, number> = { Critical: 0, Watch: 1, Stable: 2 };

function RiskBadge({ risk }: { risk: Risk }) {
  return <span className={`risk-badge ${risk.toLowerCase()}`}><i />{risk}</span>;
}

function MetricCard({ label, value, change, tone, bars }: { label: string; value: string; change: string; tone: string; bars: number[] }) {
  return (
    <article className="metric-card">
      <div className="metric-head"><span>{label}</span><span className={`metric-icon ${tone}`} aria-hidden="true" /></div>
      <div className="metric-value-row"><strong>{value}</strong><span>{change}</span></div>
      <div className={`mini-bars ${tone}`} aria-hidden="true">
        {bars.map((bar, index) => <i key={index} style={{ height: `${bar}%` }} />)}
      </div>
    </article>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"overview" | "checkins" | "tasks" | "messages" | "team">("overview");
  const [selectedId, setSelectedId] = useState(1);
  const [riskFilter, setRiskFilter] = useState<"All" | Risk>("All");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("Overview");
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState("");
  const [sentPatients, setSentPatients] = useState<number[]>([]);
  const [appointmentSlot, setAppointmentSlot] = useState("Thu, 24 Sep · 10:30 AM");
  const [messageDraft, setMessageDraft] = useState("");

  useEffect(() => {
    const syncScreen = () => setScreen(window.location.hash === "#messages" ? "messages" : window.location.hash === "#tasks" ? "tasks" : window.location.hash === "#checkins" ? "checkins" : window.location.hash === "#team" ? "team" : "overview");
    syncScreen();
    window.addEventListener("hashchange", syncScreen);
    return () => window.removeEventListener("hashchange", syncScreen);
  }, []);

  const selected = patients.find((patient) => patient.id === selectedId) ?? patients[0];
  const visiblePatients = useMemo(() => patients
    .filter((patient) => riskFilter === "All" || patient.risk === riskFilter)
    .filter((patient) => `${patient.name} ${patient.procedure}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || b.score - a.score), [riskFilter, query]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  };

  const selectPatient = (id: number) => {
    setSelectedId(id);
    setTab("Overview");
  };

  const openReminder = () => {
    setMessageDraft(`Hi ${selected.name.split(" ")[0]}, this is Maya from Northbridge Clinic. We noticed your recovery check-in needs attention. Please complete it when you can, or reply if you need help.`);
    setModal("reminder");
  };

  const sendReminder = () => {
    saveSentMessage({ patientId: selected.id, patientName: selected.name, initials: selected.initials, body: messageDraft.trim(), category: "Care plan" });
    setSentPatients((current) => current.includes(selected.id) ? current : [...current, selected.id]);
    setModal(null);
    notify(`Reminder sent to ${selected.name}`);
  };

  const sendAppointmentOffer = () => {
    saveSentMessage({ patientId: selected.id, patientName: selected.name, initials: selected.initials, body: `Appointment offer: ${appointmentSlot}. Please confirm whether this time works for you.`, category: "Appointment" });
    setModal(null);
    notify(`Appointment offer sent to ${selected.name}`);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">a</span><span>aftercare</span></div>
        <nav aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          <a className={`nav-item ${screen === "overview" ? "active" : ""}`} href="#overview" aria-current={screen === "overview" ? "page" : undefined}><span className="nav-symbol">⌂</span>Overview</a>
          <a className={`nav-item ${screen === "checkins" ? "active" : ""}`} href="#checkins" aria-current={screen === "checkins" ? "page" : undefined}><span className="nav-symbol">◉</span>Check-ins<span className="nav-count alert">2</span></a>
          <a className={`nav-item ${screen === "tasks" ? "active" : ""}`} href="#tasks" aria-current={screen === "tasks" ? "page" : undefined}><span className="nav-symbol">✓</span>Tasks<span className="nav-count alert">5</span></a>
          <a className={`nav-item ${screen === "messages" ? "active" : ""}`} href="#messages" aria-current={screen === "messages" ? "page" : undefined}><span className="nav-symbol">□</span>Messages<span className="unread-dot" /></a>
          <p className="nav-label second">Manage</p>
          <button className="nav-item nav-button" type="button" onClick={() => setModal("integration")}><span className="nav-symbol">⌁</span>Integrations</button>
          <a className={`nav-item ${screen === "team" ? "active" : ""}`} href="#team" aria-current={screen === "team" ? "page" : undefined}><span className="nav-symbol">◌</span>Care Team</a>
        </nav>
        <div className="sidebar-foot">
          <div className="clinic-switcher"><span className="clinic-icon">NB</span><span><strong>Northbridge Clinic</strong><small>Orthopedic recovery</small></span><span>⌄</span></div>
          <div className="user-card"><span className="avatar teal">MN</span><span><strong>Maya Nelson</strong><small>Care manager</small></span><button aria-label="Open account menu">•••</button></div>
        </div>
      </aside>

      <main className="main" id={screen}>
        {screen === "messages" ? <MessagesCenter onNotify={notify} /> : screen === "tasks" ? <TasksCenter onNotify={notify} /> : screen === "checkins" ? <CheckinsCenter onNotify={notify} /> : screen === "team" ? <CareTeamCenter onNotify={notify} /> : <>
        <header className="topbar">
          <div>
            <p className="eyebrow">Wednesday, 23 September</p>
            <h1>Good morning, Maya</h1>
            <p className="subtitle">Overnight recovery updates.</p>
          </div>
          <div className="top-actions">
            <span className="sync-pill"><i />All sources synced <b>2m ago</b></span>
            <button className="icon-button" aria-label="Notifications"><span>♢</span><i /></button>
            <button className="primary-button" type="button" onClick={() => setModal("integration")}><span>＋</span> Connect source</button>
          </div>
        </header>

        <section className="summary-strip" aria-label="Cohort summary">
          <div className="summary-intro">
            <span className="pulse-orb"><i /></span>
            <div><strong>2 patients need review now</strong><p>Both crossed clinic escalation rules overnight.</p></div>
            <button type="button" onClick={() => { setRiskFilter("Critical"); document.getElementById("patients")?.scrollIntoView({ behavior: "smooth" }); }}>Review queue <span>→</span></button>
          </div>
          <div className="summary-stat"><span className="stat-dot coral" /><div><strong>2</strong><small>Need review</small></div><em>+1</em></div>
          <div className="summary-stat"><span className="stat-dot amber" /><div><strong>3</strong><small>Watch closely</small></div><em>Same</em></div>
          <div className="summary-stat"><span className="stat-dot green" /><div><strong>92%</strong><small>Plan adherence</small></div><em className="positive">+4%</em></div>
        </section>

        <section className="workspace-grid" id="patients">
          <div className="queue-panel">
            <div className="panel-heading">
            <div><div className="title-row"><h2>Patient priority</h2><span>10 active</span></div><p>Prioritized by risk and missed care.</p></div>
              <button className="quiet-button" type="button" onClick={() => notify("Daily cohort summary exported")}>Export summary</button>
            </div>
            <div className="queue-toolbar">
              <div className="filters" aria-label="Filter patients by risk">
                {(["All", "Critical", "Watch", "Stable"] as const).map((filter) => (
                  <button key={filter} type="button" className={riskFilter === filter ? "active" : ""} onClick={() => setRiskFilter(filter)}>{filter}{filter !== "All" && <span>{patients.filter((p) => p.risk === filter).length}</span>}</button>
                ))}
              </div>
              <label className="search"><span>⌕</span><input aria-label="Search patients" placeholder="Search patient" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            </div>
            <div className="patient-list" role="list" aria-label="Patient priority queue">
              {visiblePatients.map((patient) => (
                <div key={patient.id} role="listitem" className={`patient-row ${selectedId === patient.id ? "selected" : ""}`}>
                  <button className="patient-row-main" type="button" onClick={() => selectPatient(patient.id)} aria-label={`Preview ${patient.name}`}>
                    <span className={`avatar patient-avatar ${patient.risk.toLowerCase()}`}>{patient.initials}<i /></span>
                    <span className="patient-identity"><strong>{patient.name}</strong><small>{patient.procedure} · Day {patient.day}</small></span>
                    <span className="patient-signal"><RiskBadge risk={patient.risk} /><small>{patient.alert}</small></span>
                    <span className="patient-source"><span><b>{patient.score}</b>/100</span><small>{patient.change > 0 ? `↑ ${patient.change} today` : `↓ ${Math.abs(patient.change)} today`}</small></span>
                  </button>
                  <a className="row-profile-link" href={`/patients/${patient.id}`} aria-label={`Open ${patient.name}'s full profile`}>›</a>
                </div>
              ))}
              {visiblePatients.length === 0 && <div className="empty-state"><strong>No patients found</strong><span>Try another name or risk filter.</span></div>}
            </div>
          </div>

          <aside className="detail-panel" aria-label={`${selected.name} patient details`}>
            <div className="detail-top">
              <div className="patient-title">
                <span className={`avatar large ${selected.risk.toLowerCase()}`}>{selected.initials}<i /></span>
                <div><div><h2>{selected.name}</h2><RiskBadge risk={selected.risk} /></div><p>{selected.age} yrs · {selected.procedure}</p><small>Discharged {selected.discharged} · Day {selected.day}</small></div>
                <button className="more-button" aria-label="More patient options">•••</button>
              </div>
              <div className="detail-actions">
                <button className="secondary-button" type="button" onClick={openReminder}><span>□</span>{sentPatients.includes(selected.id) ? "Message sent" : "Message"}</button>
                <button className="dark-button" type="button" onClick={() => setModal("appointment")}><span>＋</span>Appointment</button>
                <a className="profile-button" href={`/patients/${selected.id}`}>Open full patient profile <span>→</span></a>
              </div>
            </div>

            <div className="tabs" role="tablist" aria-label="Patient record sections">
              {(["Overview", "Timeline", "Care plan", "Records"] as Tab[]).map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
            </div>

            <div className="detail-body">
              {tab === "Overview" && (
                <>
                  <section className="ai-brief">
                    <div className="ai-title"><span className="ai-mark">✦</span><div><strong>AI care brief</strong><small>Updated 2 minutes ago</small></div><span className="review-tag">Review required</span></div>
                    <p>{selected.summary}</p>
                    <div className="recommendation"><span>Suggested next step</span><p>{selected.recommendation}</p></div>
                    <div className="brief-actions"><button type="button" onClick={openReminder}>Draft patient message</button><button type="button" onClick={() => setTab("Timeline")}>View evidence</button></div>
                  </section>

                  <div className="section-heading"><div><h3>Signals at a glance</h3></div><span className="live-label"><i />Live</span></div>
                  <div className="metric-grid">
                    <MetricCard label="Resting heart rate" value={selected.metrics.heartRate} change={selected.metrics.heartDelta} tone={selected.risk === "Critical" ? "coral" : "blue"} bars={selected.recovery.slice(4)} />
                    <MetricCard label="Sleep" value={selected.metrics.sleep} change={selected.metrics.sleepDelta} tone="purple" bars={[54, 64, 48, 70, 59, 46, 41, 38]} />
                    <MetricCard label="Temperature" value={selected.metrics.temperature} change={selected.metrics.tempDelta} tone={selected.risk === "Critical" ? "coral" : "green"} bars={[38, 41, 39, 45, 48, 52, 63, selected.risk === "Critical" ? 88 : 50]} />
                    <MetricCard label="Activity" value={selected.metrics.steps} change={selected.metrics.stepsDelta} tone="green" bars={[72, 65, 78, 62, 58, 51, 48, 42]} />
                  </div>

                  <section className="evidence-card">
                    <div className="card-title"><div><h3>Why this patient is prioritized</h3><p>Source data behind the current score.</p></div><span className="score-ring">{selected.score}</span></div>
                    {selected.evidence.map((item) => <div className="evidence-row" key={`${item.source}-${item.signal}`}><span className={`level-mark ${item.level}`} /><div><strong>{item.signal}</strong><small>{item.source}</small></div><p>{item.detail}</p></div>)}
                  </section>

                  <div className="record-columns">
                    <section className="compact-card"><div className="card-title"><h3>Symptoms & conditions</h3><button type="button" onClick={() => setTab("Records")}>See record</button></div><p className="compact-label">Reported symptoms</p><div className="tag-list">{selected.symptoms.map((item) => <span className="tag symptom" key={item}>{item}</span>)}</div><p className="compact-label">Known conditions</p><div className="tag-list">{selected.conditions.map((item) => <span className="tag" key={item}>{item}</span>)}</div></section>
                    <section className="compact-card"><div className="card-title"><h3>Latest labs</h3><button type="button" onClick={() => setTab("Records")}>View all</button></div>{selected.labs.slice(0, 3).map((lab) => <div className="lab-row" key={lab.name}><span className={`lab-status ${lab.status}`} /><div><strong>{lab.name}</strong><small>{lab.note}</small></div><b>{lab.value}</b></div>)}</section>
                  </div>
                </>
              )}

              {tab === "Timeline" && (
                <section className="tab-card timeline-card"><div className="tab-card-heading"><h3>Patient timeline</h3><p>Patient and team activity.</p></div>{selected.timeline.map((item, index) => <div className="timeline-row" key={`${item.time}-${item.title}`}><div className="timeline-line"><span className={item.kind}>{item.kind === "alert" ? "!" : item.kind === "sync" ? "↻" : item.kind === "call" ? "☎" : "✓"}</span>{index < selected.timeline.length - 1 && <i />}</div><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}<button className="wide-button" type="button" onClick={() => notify("Full audit trail prepared")}>Open full audit trail</button></section>
              )}

              {tab === "Care plan" && (
                <section className="tab-card"><div className="tab-card-heading"><h3>Today’s care plan</h3><p>Prescribed tasks and reminders.</p></div><div className="progress-block"><div><span>Today’s adherence</span><strong>{Math.round((selected.tasks.filter((task) => task.done).length / selected.tasks.length) * 100)}%</strong></div><i><b style={{ width: `${(selected.tasks.filter((task) => task.done).length / selected.tasks.length) * 100}%` }} /></i></div>{selected.tasks.map((task) => <div className="care-task" key={task.label}><span className={task.done ? "done" : ""}>{task.done ? "✓" : ""}</span><div><strong>{task.label}</strong><small>{task.detail}</small></div>{!task.done && <button type="button" onClick={openReminder}>Remind</button>}</div>)}<button className="wide-button" type="button" onClick={openReminder}>Send care-plan reminder</button></section>
              )}

              {tab === "Records" && (
                <section className="tab-card"><div className="tab-card-heading"><h3>Clinical record</h3><p>Discharge and follow-up details.</p></div><div className="record-info"><span>Procedure</span><strong>{selected.procedure}</strong><small>Discharged {selected.discharged}</small></div><div className="record-info"><span>Conditions</span><strong>{selected.conditions.join(" · ")}</strong><small>Discharge summary</small></div><h4>Recent laboratory results</h4>{selected.labs.map((lab) => <div className="lab-row expanded" key={lab.name}><span className={`lab-status ${lab.status}`} /><div><strong>{lab.name}</strong><small>{lab.note}</small></div><b>{lab.value}</b></div>)}<div className="source-note"><span>i</span><p><strong>Source record</strong>Each item keeps its original source and timestamp.</p></div></section>
              )}
            </div>

            <footer className="detail-footer"><span>✦ AI-generated summary · Clinical review required</span><button type="button" onClick={() => notify("Feedback recorded — thank you")}>Was this useful?</button></footer>
          </aside>
        </section>

        <footer className="page-foot"><span>Synthetic patient data</span><span>Decision support only — not for emergency use</span></footer>
        </>}
      </main>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Close dialog">×</button>
            {modal === "reminder" && <><span className="modal-kicker">Patient message</span><h2 id="modal-title">Message {selected.name}</h2><p className="modal-copy">AI drafted this from the active care plan. Review before sending.</p><label className="message-label">Message<textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /></label><div className="message-meta"><span>SMS + in-app</span><span>Uses approved template</span></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button type="button" className="dark-button" disabled={!messageDraft.trim()} onClick={sendReminder}>Approve & send</button></div></>}
            {modal === "appointment" && <><span className="modal-kicker">Appointment request</span><h2 id="modal-title">Offer a follow-up slot</h2><p className="modal-copy">Choose a clinic-approved slot for {selected.name}. The patient will be asked to confirm.</p><div className="slot-list">{["Thu, 24 Sep · 10:30 AM", "Thu, 24 Sep · 2:00 PM", "Fri, 25 Sep · 9:15 AM"].map((slot) => <button type="button" key={slot} className={appointmentSlot === slot ? "active" : ""} onClick={() => setAppointmentSlot(slot)}><span><i />{slot}</span><small>{slot.includes("Thu") ? "Nurse video call" : "Clinic visit"}</small></button>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button type="button" className="dark-button" onClick={sendAppointmentOffer}>Approve & offer slot</button></div></>}
            {modal === "integration" && <><span className="modal-kicker">Data sources</span><h2 id="modal-title">Connected health data</h2><p className="modal-copy">This demo uses realistic synthetic feeds. Production connections require patient consent and clinic configuration.</p><div className="integration-list"><div><span className="integration-icon apple">♥</span><p><strong>Apple Health</strong><small>Activity, sleep, heart rate</small></p><b>Demo active</b></div><div><span className="integration-icon whoop">W</span><p><strong>WHOOP</strong><small>Recovery, strain, sleep</small></p><b>Demo active</b></div><div><span className="integration-icon ehr">＋</span><p><strong>Clinic EHR</strong><small>Discharge notes, labs, appointments</small></p><b>Mock feed</b></div></div><div className="modal-actions"><button type="button" className="dark-button full" onClick={() => setModal(null)}>Done</button></div></>}
          </section>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite"><span>✓</span>{toast}</div>
    </div>
  );
}
