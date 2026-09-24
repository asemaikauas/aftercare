"use client";

import { useState } from "react";
import type { PatientProfile } from "../../../db/types";
import { saveSentMessage } from "../../message-store";

type ProfileTab = "Overview" | "Clinical record" | "Labs & vitals" | "Documents & history";
type ActionModal = "message" | "appointment" | null;

function StatusBadge({ risk }: { risk: "Critical" | "Watch" | "Stable" }) {
  return <span className={`profile-risk ${risk.toLowerCase()}`}><i />{risk}</span>;
}

export default function PatientProfileView({ patient }: { patient: PatientProfile | undefined }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("Overview");
  const [modal, setModal] = useState<ActionModal>(null);
  const [toast, setToast] = useState("");
  const [slot, setSlot] = useState("Thu, 24 Sep · 10:30 AM");
  const [messageDraft, setMessageDraft] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  if (!patient) {
    return (
      <main className="missing-patient">
        <span className="brand-mark">A</span>
        <h1>Patient record not found</h1>
        <p>This synthetic demo record may have moved or does not exist.</p>
        <a href="/dashboard">Return to patient priority</a>
      </main>
    );
  }

  const completedTasks = patient.tasks.filter((task) => task.done).length;
  const urgent = patient.risk === "Critical";
  const openMessage = () => {
    setMessageDraft(`Hi ${patient.name.split(" ")[0]}, this is Maya from Northbridge Clinic. I’m checking in about your recovery today. Please complete your latest check-in, or reply if you would like us to call.`);
    setModal("message");
  };
  const sendMessage = () => {
    saveSentMessage({ patientId: Number(patient.id), patientName: patient.name, initials: patient.initials, body: messageDraft.trim(), category: "Check-in" });
    setModal(null);
    notify(`Message sent to ${patient.name}`);
  };
  const sendAppointmentOffer = () => {
    saveSentMessage({ patientId: Number(patient.id), patientName: patient.name, initials: patient.initials, body: `Appointment offer: ${slot}. Please confirm whether this time works for you.`, category: "Appointment" });
    setModal(null);
    notify(`Appointment offer sent to ${patient.name}`);
  };

  return (
    <div className="profile-shell">
      <aside className="profile-sidebar">
        <a className="brand profile-brand" href="/dashboard"><span className="brand-mark">A</span><span>Aftercare</span></a>
        <a className="back-to-cohort" href="/dashboard"><span>←</span> Back to patient priority</a>
        <div className="profile-side-patient">
          <span className={`avatar profile-avatar ${patient.risk.toLowerCase()}`}>{patient.initials}<i /></span>
          <strong>{patient.name}</strong>
          <small>{patient.mrn} · Demo record</small>
          <StatusBadge risk={patient.risk} />
        </div>
        <nav className="record-jump-nav" aria-label="Patient profile sections">
          {(["Overview", "Clinical record", "Labs & vitals", "Documents & history"] as ProfileTab[]).map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
              <span>{tab === "Overview" ? "⌂" : tab === "Clinical record" ? "▤" : tab === "Labs & vitals" ? "⌁" : "□"}</span>{tab}
            </button>
          ))}
        </nav>
        <div className="profile-sidebar-note">
          <span>Demo environment</span>
          <p>All personal and clinical information on this page is synthetic.</p>
        </div>
        <div className="profile-user"><span className="avatar teal">MN</span><div><strong>Maya Nelson</strong><small>Care manager</small></div><button aria-label="Open account menu">•••</button></div>
      </aside>

      <main className="profile-main">
        <header className="profile-topbar">
          <div>
            <p><a href="/dashboard">Patients</a><span>›</span>{patient.name}</p>
            <h1>Patient profile</h1>
          </div>
          <div className="profile-header-actions">
            <span className="profile-sync"><i />Record updated 2m ago</span>
            <button className="secondary-button profile-action" type="button" onClick={openMessage}>Message patient</button>
            <button className="dark-button profile-action" type="button" onClick={() => setModal("appointment")}>Schedule follow-up</button>
          </div>
        </header>

        <section className="patient-hero">
          <div className="hero-identity">
            <span className={`avatar hero-avatar ${patient.risk.toLowerCase()}`}>{patient.initials}<i /></span>
            <div>
              <div className="hero-name-row"><h2>{patient.name}</h2><StatusBadge risk={patient.risk} /><span className="synthetic-chip">Synthetic patient</span></div>
              <p>{patient.age} years · {patient.pronouns} · DOB {patient.dob}</p>
              <small>{patient.mrn} · {patient.service}</small>
            </div>
          </div>
          <div className="hero-facts">
            <div><span>Procedure</span><strong>{patient.procedure}</strong><small>{patient.procedureDate}</small></div>
            <div><span>Discharged</span><strong>{patient.dischargeDate}</strong><small>Active recovery program</small></div>
            <div><span>Next appointment</span><strong>{patient.nextAppointment.split(" · ").slice(0, 2).join(" · ")}</strong><small>{patient.nextAppointment.split(" · ").slice(2).join(" · ") || "Clinic follow-up"}</small></div>
            <div className={`hero-score ${patient.risk.toLowerCase()}`}><span>Priority score</span><strong>{patient.score}<small>/100</small></strong><em>{patient.risk}</em></div>
          </div>
        </section>

        <nav className="profile-tabs" role="tablist" aria-label="Patient profile views">
          {(["Overview", "Clinical record", "Labs & vitals", "Documents & history"] as ProfileTab[]).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
        </nav>

        <div className="profile-content-grid">
          <div className="profile-primary">
            {activeTab === "Overview" && (
              <>
                <section className={`profile-alert ${patient.risk.toLowerCase()}`}>
                  <div className="alert-symbol">{urgent ? "!" : patient.risk === "Watch" ? "↗" : "✓"}</div>
                  <div><span>{urgent ? "Needs review now" : patient.risk === "Watch" ? "Watch signal" : "Recovery on track"}</span><h3>{patient.alert}</h3><p>{patient.summary}</p></div>
                  <button type="button" onClick={() => setActiveTab("Labs & vitals")}>Review evidence <span>→</span></button>
                </section>

                <section className="profile-ai-card">
                  <div className="profile-card-heading"><div><span className="ai-mark">✦</span><div><h3>AI care brief</h3><p>Current record evidence</p></div></div><span className="review-tag">Review required</span></div>
                  <p>{urgent ? `Contact ${patient.name.split(" ")[0]} now for a nurse-led assessment. Confirm the reported changes using the clinic protocol and route findings to the on-call clinician.` : patient.risk === "Watch" ? `Review ${patient.name.split(" ")[0]}’s latest check-in today. A reminder or earlier follow-up may be appropriate after staff review.` : `Continue routine monitoring. No additional clinical action is suggested from the current synthetic signals.`}</p>
                  <div className="ai-source-line"><span>Based on</span><b>Patient check-ins</b><b>Wearables</b><b>Care plan</b><b>Clinical record</b></div>
                  <div className="ai-profile-actions"><button type="button" onClick={openMessage}>Draft a message</button><button type="button" onClick={() => setActiveTab("Documents & history")}>See source timeline</button></div>
                </section>

                <div className="profile-section-title"><div><h3>Recovery signals</h3><p>Latest readings compared with personal and clinic baselines.</p></div><span><i />Live sources</span></div>
                <div className="profile-metrics">
                  {patient.metrics.map((metric) => <article key={metric.label} className={`profile-metric ${metric.tone}`}><div><span>{metric.label}</span><i /></div><strong>{metric.value}</strong><p>{metric.context}</p><em><b style={{ width: metric.tone === "critical" ? "88%" : metric.tone === "watch" ? "61%" : "42%" }} /></em></article>)}
                </div>

                <section className="profile-card task-card">
                  <div className="profile-card-heading plain"><div><h3>Today’s care plan</h3><p>{completedTasks} of {patient.tasks.length} tasks completed</p></div><button type="button" onClick={() => notify("Care plan opened for review")}>Review plan</button></div>
                  <div className="task-progress"><span style={{ width: `${(completedTasks / patient.tasks.length) * 100}%` }} /></div>
                  {patient.tasks.map((task) => <div className="profile-task" key={task.label}><span className={task.done ? "done" : ""}>{task.done ? "✓" : ""}</span><div><strong>{task.label}</strong><small>{task.detail}</small></div>{!task.done && <button type="button" onClick={openMessage}>Remind</button>}</div>)}
                </section>
              </>
            )}

            {activeTab === "Clinical record" && (
              <>
                <section className="profile-card episode-card">
                  <div className="profile-card-heading plain"><div><h3>Current recovery episode</h3><p>Imported from the discharge record</p></div><span className="source-chip">Clinic EHR</span></div>
                  <div className="episode-grid"><div><span>Procedure</span><strong>{patient.procedure}</strong></div><div><span>Procedure date</span><strong>{patient.procedureDate}</strong></div><div><span>Discharge date</span><strong>{patient.dischargeDate}</strong></div><div><span>Service line</span><strong>{patient.service}</strong></div></div>
                </section>
                <div className="clinical-columns">
                  <section className="profile-card clinical-card"><div className="profile-card-heading plain"><div><h3>Conditions</h3><p>Relevant history</p></div><button type="button" onClick={() => notify("Condition editor is disabled in demo mode")}>Edit</button></div>{patient.conditions.map((condition) => <div className="clinical-list-row" key={condition}><span className="condition-mark" /><strong>{condition}</strong><small>Confirmed</small></div>)}</section>
                  <section className="profile-card clinical-card"><div className="profile-card-heading plain"><div><h3>Allergies</h3><p>Care-team record</p></div><button type="button" onClick={() => notify("Allergy editor is disabled in demo mode")}>Edit</button></div>{patient.allergies.map((allergy) => <div className="clinical-list-row" key={allergy}><span className="allergy-mark">!</span><strong>{allergy}</strong><small>Confirmed</small></div>)}</section>
                </div>
                <section className="profile-card medication-card"><div className="profile-card-heading plain"><div><h3>Current medications</h3><p>Reconciled against the discharge plan</p></div><span className="source-chip">{patient.medications.length} active</span></div>{patient.medications.map((medication) => <div className="medication-row" key={medication.name}><span className="med-icon">Rx</span><div><strong>{medication.name}</strong><small>{medication.detail}</small></div><b>{medication.status}</b><button type="button" onClick={() => notify(`${medication.name} source record opened`)}>View source</button></div>)}</section>
                <section className="profile-card"><div className="profile-card-heading plain"><div><h3>Reported symptoms</h3><p>Latest patient-submitted information</p></div><span className="source-chip">Patient check-in</span></div><div className="large-tag-list">{patient.symptoms.map((symptom) => <span key={symptom}>{symptom}</span>)}</div></section>
              </>
            )}

            {activeTab === "Labs & vitals" && (
              <>
                <div className="profile-section-title top"><div><h3>Latest vitals and connected signals</h3><p>Every value retains its source and collection context.</p></div><span><i />Updated 2m ago</span></div>
                <div className="profile-metrics expanded">
                  {patient.metrics.map((metric) => <article key={metric.label} className={`profile-metric ${metric.tone}`}><div><span>{metric.label}</span><i /></div><strong>{metric.value}</strong><p>{metric.context}</p><em><b style={{ width: metric.tone === "critical" ? "88%" : metric.tone === "watch" ? "61%" : "42%" }} /></em><small>{metric.label.includes("WHOOP") ? "WHOOP" : metric.label === "Steps" || metric.label === "Sleep" ? "Apple Health" : "Patient / clinical record"}</small></article>)}
                </div>
                <section className="profile-card labs-card"><div className="profile-card-heading plain"><div><h3>Laboratory results</h3><p>Most recent results for this recovery episode</p></div><button type="button" onClick={() => notify("Laboratory report prepared")}>Download report</button></div><div className="labs-table" role="table" aria-label="Laboratory results"><div className="labs-table-head" role="row"><span>Date</span><span>Test</span><span>Result</span><span>Context</span><span>Status</span></div>{patient.labs.map((lab) => <div className="labs-table-row" role="row" key={`${lab.date}-${lab.name}`}><span>{lab.date}</span><strong>{lab.name}</strong><b>{lab.value}</b><span>{lab.reference}</span><em className={lab.status.toLowerCase()}>{lab.status}</em></div>)}</div></section>
                <section className="profile-card provenance-card"><span>i</span><div><h3>Source provenance</h3><p>Results shown here mirror their originating record. AI summaries and risk scores never replace or edit the underlying clinical data.</p></div></section>
              </>
            )}

            {activeTab === "Documents & history" && (
              <>
                <section className="profile-card documents-card"><div className="profile-card-heading plain"><div><h3>Patient documents</h3><p>Recovery records</p></div><button type="button" onClick={() => notify("Upload is disabled for this synthetic demo")}>＋ Add document</button></div><div className="document-grid">{patient.documents.map((document) => <button key={document.name} type="button" onClick={() => notify(`${document.name} opened in preview mode`)}><span className="document-icon">▤</span><div><strong>{document.name}</strong><small>{document.type} · {document.date}</small></div><em>Open →</em></button>)}</div></section>
                <section className="profile-card history-card"><div className="profile-card-heading plain"><div><h3>Activity history</h3><p>Patient and care-team events</p></div><button type="button" onClick={() => notify("Audit trail exported")}>Export audit trail</button></div><div className="full-timeline">{patient.timeline.map((event, index) => <div className="full-timeline-row" key={`${event.time}-${event.title}`}><div className="timeline-rail"><span className={event.tone}>{event.tone === "critical" ? "!" : event.tone === "watch" ? "↗" : event.tone === "stable" ? "✓" : "•"}</span>{index < patient.timeline.length - 1 && <i />}</div><time>{event.time}</time><div><strong>{event.title}</strong><p>{event.detail}</p><small>{event.source}</small></div></div>)}</div></section>
              </>
            )}
          </div>

          <aside className="profile-aside">
            <section className="profile-card personal-record">
              <div className="profile-card-heading plain"><div><h3>Personal details</h3><p>Patient record</p></div><button type="button" onClick={() => notify("Personal detail editing is disabled in demo mode")}>Edit</button></div>
              <dl><div><dt>Full name</dt><dd>{patient.name}</dd></div><div><dt>Date of birth</dt><dd>{patient.dob} · {patient.age} years</dd></div><div><dt>Sex</dt><dd>{patient.sex}</dd></div><div><dt>Pronouns</dt><dd>{patient.pronouns}</dd></div><div><dt>Preferred language</dt><dd>{patient.language}</dd></div><div><dt>Phone</dt><dd>{patient.phone}</dd></div><div><dt>Email</dt><dd>{patient.email}</dd></div><div><dt>Home address</dt><dd>{patient.address}</dd></div><div><dt>Emergency contact</dt><dd>{patient.emergencyContact}</dd></div></dl>
            </section>

            <section className="profile-card care-team-card"><div className="profile-card-heading plain"><div><h3>Care team</h3><p>Assigned to this episode</p></div></div>{patient.careTeam.map((member) => <div className="team-member" key={member.name}><span>{member.initials}</span><div><strong>{member.name}</strong><small>{member.role}</small></div><button aria-label={`Message ${member.name}`} onClick={() => notify(`Message draft opened for ${member.name}`)}>□</button></div>)}</section>

            <section className="profile-card connection-card"><div className="profile-card-heading plain"><div><h3>Connected sources</h3><p>Authorized feeds</p></div></div><div><span className="source-logo apple">♥</span><p><strong>Apple Health</strong><small>Synced 2m ago</small></p><i /></div><div><span className="source-logo whoop">W</span><p><strong>WHOOP</strong><small>Synced 4m ago</small></p><i /></div><div><span className="source-logo ehr">＋</span><p><strong>Clinic EHR</strong><small>Synced 6m ago</small></p><i /></div><button type="button" onClick={() => notify("Source settings opened")}>Manage data sources</button></section>

            <section className="profile-safety-note"><span>✦</span><p><strong>Decision support only</strong>AI summaries require clinical review.</p></section>
          </aside>
        </div>
      </main>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="Close dialog">×</button>
            {modal === "message" ? <><span className="modal-kicker">Patient message</span><h2 id="profile-modal-title">Message {patient.name}</h2><p className="modal-copy">Review this AI-assisted draft before sending.</p><label className="message-label">Message<textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} /></label><div className="message-meta"><span>SMS + in-app</span><span>Approved template</span></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button type="button" className="dark-button" disabled={!messageDraft.trim()} onClick={sendMessage}>Approve & send</button></div></> : <><span className="modal-kicker">Follow-up appointment</span><h2 id="profile-modal-title">Offer an appointment</h2><p className="modal-copy">The patient will be asked to confirm one clinic-approved slot.</p><div className="slot-list">{["Thu, 24 Sep · 10:30 AM", "Thu, 24 Sep · 2:00 PM", "Fri, 25 Sep · 9:15 AM"].map((option) => <button type="button" key={option} className={slot === option ? "active" : ""} onClick={() => setSlot(option)}><span><i />{option}</span><small>{option.includes("Fri") ? "Clinic visit" : "Nurse video call"}</small></button>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button type="button" className="dark-button" onClick={sendAppointmentOffer}>Approve & offer</button></div></>}
          </section>
        </div>
      )}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite"><span>✓</span>{toast}</div>
    </div>
  );
}
