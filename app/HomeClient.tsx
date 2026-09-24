"use client";

import { useEffect, useMemo, useState } from "react";
import type { Patient, Risk } from "./dashboard-adapter";
import MessagesCenter from "./MessagesCenter";
import TasksCenter from "./TasksCenter";
import CheckinsCenter from "./CheckinsCenter";
import CareTeamCenter from "./CareTeamCenter";
import { saveSentMessage } from "./message-store";

type Tab = "Overview" | "Timeline" | "Care plan" | "Records";
type Modal = "reminder" | "appointment" | "integration" | null;

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

export default function HomeClient({ patients }: { patients: Patient[] }) {
  const [screen, setScreen] = useState<"overview" | "checkins" | "tasks" | "messages" | "team">("overview");
  const [selectedId, setSelectedId] = useState(patients[0]?.id ?? 0);
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
    .sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || b.score - a.score), [patients, riskFilter, query]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  };

  const selectPatient = (id: number) => {
    setSelectedId(id);
    setTab("Overview");
  };

  const openReminder = () => {
    if (!selected) return;
    setMessageDraft(`Hi ${selected.name.split(" ")[0]}, this is Maya from Northbridge Clinic. We noticed your recovery check-in needs attention. Please complete it when you can, or reply if you need help.`);
    setModal("reminder");
  };

  const sendReminder = () => {
    if (!selected) return;
    saveSentMessage({ patientId: selected.id, patientName: selected.name, initials: selected.initials, body: messageDraft.trim(), category: "Care plan" });
    setSentPatients((current) => current.includes(selected.id) ? current : [...current, selected.id]);
    setModal(null);
    notify(`Reminder sent to ${selected.name}`);
  };

  const sendAppointmentOffer = () => {
    if (!selected) return;
    saveSentMessage({ patientId: selected.id, patientName: selected.name, initials: selected.initials, body: `Appointment offer: ${appointmentSlot}. Please confirm whether this time works for you.`, category: "Appointment" });
    setModal(null);
    notify(`Appointment offer sent to ${selected.name}`);
  };

  if (!selected) {
    return <div className="app-shell"><main className="main"><p>No patients found.</p></main></div>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span><span>Continuum</span></div>
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
            <div><strong>{patients.filter((p) => p.risk === "Critical").length} patients need review now</strong><p>Both crossed clinic escalation rules overnight.</p></div>
            <button type="button" onClick={() => { setRiskFilter("Critical"); document.getElementById("patients")?.scrollIntoView({ behavior: "smooth" }); }}>Review queue <span>→</span></button>
          </div>
          <div className="summary-stat"><span className="stat-dot coral" /><div><strong>{patients.filter((p) => p.risk === "Critical").length}</strong><small>Need review</small></div><em>+1</em></div>
          <div className="summary-stat"><span className="stat-dot amber" /><div><strong>{patients.filter((p) => p.risk === "Watch").length}</strong><small>Watch closely</small></div><em>Same</em></div>
          <div className="summary-stat"><span className="stat-dot green" /><div><strong>92%</strong><small>Plan adherence</small></div><em className="positive">+4%</em></div>
        </section>

        <section className="workspace-grid" id="patients">
          <div className="queue-panel">
            <div className="panel-heading">
            <div><div className="title-row"><h2>Patient priority</h2><span>{patients.length} active</span></div><p>Prioritized by risk and missed care.</p></div>
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
