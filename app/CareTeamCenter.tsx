"use client";

import { useMemo, useState } from "react";

type TeamStatus = "Available" | "Busy" | "Away";
type TeamFilter = "All" | "Available" | "At capacity";

type TeamMember = {
  id: number;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  status: TeamStatus;
  statusNote: string;
  patients: number;
  capacity: number;
  urgent: number;
  tasks: number;
  color: string;
  preferences: string[];
  priorities: string[];
  contactWindow: string;
  appointmentTypes: string[];
  note: string;
  schedule: { day: string; date: string; slots: { time: string; type: "open" | "booked" | "protected"; label: string }[] }[];
};

const team: TeamMember[] = [
  { id: 1, name: "Maya Nelson", initials: "MN", role: "Care manager", specialty: "Orthopedic recovery", status: "Available", statusNote: "Available until 4:30 PM", patients: 6, capacity: 8, urgent: 2, tasks: 5, color: "teal", preferences: ["Morning check-ins", "SMS follow-ups", "Orthopedic pathways"], priorities: ["New escalations", "Discharge days 1–7", "Missed care tasks"], contactWindow: "8:00 AM – 4:30 PM", appointmentTypes: ["15 min phone", "20 min video"], note: "Route post-op mobility and wound concerns directly to Maya during weekday coverage.", schedule: [{ day: "Wed", date: "23", slots: [{ time: "9:30", type: "booked", label: "Sophia Reed" }, { time: "10:30", type: "open", label: "Available" }, { time: "11:30", type: "booked", label: "Noah Williams" }, { time: "2:00", type: "open", label: "Available" }] }, { day: "Thu", date: "24", slots: [{ time: "9:00", type: "open", label: "Available" }, { time: "10:30", type: "open", label: "Available" }, { time: "1:00", type: "protected", label: "Team huddle" }, { time: "3:00", type: "open", label: "Available" }] }, { day: "Fri", date: "25", slots: [{ time: "9:15", type: "booked", label: "Leo Park" }, { time: "11:00", type: "open", label: "Available" }, { time: "1:30", type: "open", label: "Available" }, { time: "3:30", type: "protected", label: "Admin" }] }] },
  { id: 2, name: "Dr. Priya Patel", initials: "PP", role: "Orthopedic surgeon", specialty: "Joint replacement", status: "Busy", statusNote: "In clinic until 12:30 PM", patients: 8, capacity: 8, urgent: 2, tasks: 3, color: "purple", preferences: ["Escalations only", "EHR messages", "Knee and hip pathways"], priorities: ["Suspected infection", "Unexpected pain increase", "Wound review"], contactWindow: "1:00 PM – 5:00 PM", appointmentTypes: ["20 min video", "30 min clinic"], note: "Assign only patients requiring surgical review or pathway exceptions.", schedule: [{ day: "Wed", date: "23", slots: [{ time: "9:00", type: "protected", label: "Surgery" }, { time: "11:00", type: "protected", label: "Clinic" }, { time: "1:30", type: "open", label: "Review slot" }, { time: "3:00", type: "booked", label: "Clinical review" }] }, { day: "Thu", date: "24", slots: [{ time: "9:30", type: "booked", label: "Post-op clinic" }, { time: "11:30", type: "open", label: "Review slot" }, { time: "2:00", type: "protected", label: "Surgery" }, { time: "4:00", type: "open", label: "Review slot" }] }, { day: "Fri", date: "25", slots: [{ time: "9:00", type: "open", label: "Review slot" }, { time: "10:30", type: "booked", label: "Clinic" }, { time: "1:00", type: "open", label: "Review slot" }, { time: "3:30", type: "protected", label: "Surgery" }] }] },
  { id: 3, name: "James Okafor", initials: "JO", role: "Cardiac nurse", specialty: "Cardiac recovery", status: "Available", statusNote: "Available now", patients: 5, capacity: 7, urgent: 1, tasks: 4, color: "blue", preferences: ["Phone follow-ups", "Cardiac pathways", "Afternoon appointments"], priorities: ["Fluid-status alerts", "Breathing changes", "Medication adherence"], contactWindow: "9:00 AM – 5:30 PM", appointmentTypes: ["15 min phone", "30 min video"], note: "Primary owner for cardiac discharge follow-up and fluid-status reviews.", schedule: [{ day: "Wed", date: "23", slots: [{ time: "10:00", type: "open", label: "Available" }, { time: "11:30", type: "booked", label: "Noah Williams" }, { time: "2:30", type: "open", label: "Available" }, { time: "4:00", type: "open", label: "Available" }] }, { day: "Thu", date: "24", slots: [{ time: "9:30", type: "open", label: "Available" }, { time: "11:00", type: "open", label: "Available" }, { time: "1:30", type: "booked", label: "Cardiac follow-up" }, { time: "3:30", type: "open", label: "Available" }] }, { day: "Fri", date: "25", slots: [{ time: "9:00", type: "protected", label: "Training" }, { time: "11:00", type: "open", label: "Available" }, { time: "2:00", type: "open", label: "Available" }, { time: "4:00", type: "open", label: "Available" }] }] },
  { id: 4, name: "Elena Ruiz", initials: "ER", role: "Physiotherapist", specialty: "Post-operative mobility", status: "Available", statusNote: "Next appointment at 11:00 AM", patients: 7, capacity: 10, urgent: 0, tasks: 3, color: "amber", preferences: ["Video appointments", "Mobility alerts", "Tue–Fri coverage"], priorities: ["Repeated mobility misses", "Fall-risk changes", "Exercise progression"], contactWindow: "8:30 AM – 4:00 PM", appointmentTypes: ["20 min video", "40 min assessment"], note: "Prioritize patients with two consecutive missed mobility goals.", schedule: [{ day: "Wed", date: "23", slots: [{ time: "9:30", type: "open", label: "Available" }, { time: "11:00", type: "booked", label: "Mobility review" }, { time: "1:30", type: "open", label: "Available" }, { time: "3:00", type: "booked", label: "Group session" }] }, { day: "Thu", date: "24", slots: [{ time: "9:00", type: "open", label: "Available" }, { time: "10:30", type: "booked", label: "Ethan Cole" }, { time: "1:00", type: "open", label: "Available" }, { time: "2:30", type: "open", label: "Available" }] }, { day: "Fri", date: "25", slots: [{ time: "9:00", type: "booked", label: "Isla Brooks" }, { time: "11:00", type: "open", label: "Available" }, { time: "1:30", type: "open", label: "Available" }, { time: "3:00", type: "protected", label: "Documentation" }] }] },
  { id: 5, name: "Grace Li", initials: "GL", role: "Clinical dietitian", specialty: "Post-operative nutrition", status: "Away", statusNote: "Returns tomorrow at 9:00 AM", patients: 4, capacity: 8, urgent: 0, tasks: 2, color: "rose", preferences: ["Nutrition flags", "Video appointments", "Dietary-intake reviews"], priorities: ["Low oral intake", "Persistent nausea", "Hydration goals"], contactWindow: "9:00 AM – 3:00 PM", appointmentTypes: ["20 min video", "30 min assessment"], note: "Route sustained low intake or hydration concerns after nursing review.", schedule: [{ day: "Wed", date: "23", slots: [{ time: "9:00", type: "protected", label: "Away" }, { time: "11:00", type: "protected", label: "Away" }, { time: "1:00", type: "protected", label: "Away" }, { time: "3:00", type: "protected", label: "Away" }] }, { day: "Thu", date: "24", slots: [{ time: "9:00", type: "open", label: "Available" }, { time: "10:30", type: "open", label: "Available" }, { time: "1:00", type: "booked", label: "Nutrition review" }, { time: "2:30", type: "open", label: "Available" }] }, { day: "Fri", date: "25", slots: [{ time: "9:30", type: "open", label: "Available" }, { time: "11:00", type: "booked", label: "Amelia Khan" }, { time: "1:00", type: "open", label: "Available" }, { time: "2:30", type: "open", label: "Available" }] }] },
];

const assignmentPool = ["Sophia Reed", "Noah Williams", "Amelia Khan", "Ethan Cole", "Mia Chen", "Oliver Grant", "Ava Martinez", "Lucas Bennett", "Isla Brooks", "Leo Park"];

function StatusBadge({ status }: { status: TeamStatus }) {
  return <span className={`team-status ${status.toLowerCase()}`}><i />{status}</span>;
}

export default function CareTeamCenter({ onNotify }: { onNotify: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<TeamFilter>("All");
  const [query, setQuery] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [assigning, setAssigning] = useState(false);
  const [patientToAssign, setPatientToAssign] = useState("Sophia Reed");
  const [assigned, setAssigned] = useState<Record<number, string[]>>({ 1: ["Sophia Reed", "Ethan Cole", "Mia Chen"], 2: ["Oliver Grant", "Isla Brooks"], 3: ["Noah Williams"], 4: ["Ethan Cole", "Isla Brooks"], 5: ["Amelia Khan"] });

  const selected = team.find((member) => member.id === selectedId) ?? team[0];
  const visible = useMemo(() => team.filter((member) => {
    const matchesFilter = filter === "Available" ? member.status === "Available" : filter === "At capacity" ? member.patients >= member.capacity : true;
    return matchesFilter && `${member.name} ${member.role} ${member.specialty}`.toLowerCase().includes(query.toLowerCase());
  }), [filter, query]);
  const availableNow = team.filter((member) => member.status === "Available").length;
  const totalPatients = team.reduce((sum, member) => sum + member.patients, 0);
  const openSlots = team.reduce((sum, member) => sum + member.schedule.flatMap((day) => day.slots).filter((slot) => slot.type === "open").length, 0);

  const assignPatient = () => {
    setAssigned((current) => ({ ...current, [selected.id]: [...new Set([...(current[selected.id] ?? []), patientToAssign])] }));
    setAssigning(false);
    onNotify(`${patientToAssign} assigned to ${selected.name}`);
  };

  return (
    <div className="team-page">
      <header className="team-header"><div><p className="eyebrow">Clinic operations</p><h1>Care Team</h1><p className="subtitle">Balance coverage, preferences, and patient priorities.</p></div><div className="team-header-actions"><button className="secondary-button" type="button" onClick={() => onNotify("Team schedule exported")}>Export schedule</button><button className="primary-button" type="button" onClick={() => onNotify("Invite form opened")}>＋ Add team member</button></div></header>

      <section className="team-summary" aria-label="Care team summary"><article className="coverage-card"><div className="coverage-avatars">{team.slice(0, 4).map((member) => <span className={`team-avatar ${member.color}`} key={member.id}>{member.initials}</span>)}</div><div><small>Today’s coverage</small><strong>{availableNow} team members available</strong><p>Urgent recovery pathways have active coverage.</p></div><span className="coverage-ok">Covered ✓</span></article><article><span className="team-stat-icon green">●</span><div><strong>{totalPatients}</strong><small>Active assignments</small></div><em>Across 5 staff</em></article><article><span className="team-stat-icon amber">◷</span><div><strong>{openSlots}</strong><small>Open time slots</small></div><em>Next 3 days</em></article><article><span className="team-stat-icon coral">!</span><div><strong>5</strong><small>Priority patients</small></div><em>2 urgent</em></article></section>

      <section className="team-workspace">
        <aside className="team-directory"><div className="team-directory-head"><div><h2>Team directory</h2><span>{team.length} members</span></div><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team" aria-label="Search care team" /></label></div><div className="team-filters" role="tablist">{(["All", "Available", "At capacity"] as TeamFilter[]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="team-list" role="list">{visible.map((member) => { const load = Math.round((member.patients / member.capacity) * 100); return <button key={member.id} type="button" role="listitem" className={`team-member-row ${selected.id === member.id ? "selected" : ""}`} onClick={() => { setSelectedId(member.id); setAssigning(false); }}><span className={`team-avatar large ${member.color}`}>{member.initials}<i className={member.status.toLowerCase()} /></span><span className="team-member-copy"><span><strong>{member.name}</strong><StatusBadge status={member.status} /></span><small>{member.role} · {member.specialty}</small><b>{member.statusNote}</b><span className="capacity-line"><i><b style={{ width: `${Math.min(load, 100)}%` }} /></i><em>{member.patients}/{member.capacity} patients</em></span></span><span className="member-signals"><b>{member.urgent}</b><small>priority</small><b>{member.tasks}</b><small>tasks</small></span></button>; })}</div></aside>

        <article className="team-detail">
          <header className="team-profile-head"><div className="team-profile-person"><span className={`team-avatar hero ${selected.color}`}>{selected.initials}<i className={selected.status.toLowerCase()} /></span><div><div><h2>{selected.name}</h2><StatusBadge status={selected.status} /></div><p>{selected.role} · {selected.specialty}</p><small>{selected.contactWindow}</small></div></div><button className="quiet-button" type="button" onClick={() => onNotify(`${selected.name}'s preferences opened for editing`)}>Edit preferences</button></header>

          <div className="team-detail-scroll">
            <section className="team-preference-grid"><article><div className="team-card-title"><span>◎</span><div><h3>Work preferences</h3><p>Best ways to route work</p></div></div><div className="preference-tags">{selected.preferences.map((item) => <span key={item}>{item}</span>)}</div><dl><div><dt>Contact hours</dt><dd>{selected.contactWindow}</dd></div><div><dt>Appointment types</dt><dd>{selected.appointmentTypes.join(" · ")}</dd></div></dl></article><article><div className="team-card-title"><span>↗</span><div><h3>Clinical priorities</h3><p>Route these first</p></div></div><ol>{selected.priorities.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol><div className="routing-note"><span>i</span><p>{selected.note}</p></div></article></section>

            <section className="availability-card"><div className="availability-head"><div><h3>Availability</h3><p>{weekOffset === 0 ? "23–25 September" : weekOffset > 0 ? "Next schedule period" : "Previous schedule period"}</p></div><div><button type="button" aria-label="Previous schedule" onClick={() => setWeekOffset((value) => value - 1)}>‹</button><button type="button" onClick={() => setWeekOffset(0)}>Today</button><button type="button" aria-label="Next schedule" onClick={() => setWeekOffset((value) => value + 1)}>›</button></div></div><div className="schedule-grid">{selected.schedule.map((day) => <div className="schedule-day" key={day.day}><header><span>{day.day}</span><strong>{day.date}</strong></header>{day.slots.map((slot) => <button type="button" key={`${day.day}-${slot.time}`} className={slot.type} onClick={() => slot.type === "open" ? onNotify(`${selected.name}: ${day.day} at ${slot.time} selected`) : onNotify(slot.label)}><time>{slot.time}</time><span>{slot.label}</span></button>)}</div>)}</div><div className="schedule-legend"><span><i className="open" />Available</span><span><i className="booked" />Booked</span><span><i className="protected" />Protected</span></div></section>

            <section className="assignment-card"><div className="assignment-head"><div><h3>Patient assignments</h3><p>{(assigned[selected.id] ?? []).length} patients directly assigned</p></div><button className="dark-button" type="button" onClick={() => setAssigning((value) => !value)}>＋ Assign patient</button></div>{assigning && <div className="assignment-form"><label>Patient<select value={patientToAssign} onChange={(event) => setPatientToAssign(event.target.value)}>{assignmentPool.map((patient) => <option key={patient}>{patient}</option>)}</select></label><div><span>Capacity after assignment</span><strong>{Math.min(selected.patients + 1, selected.capacity)} / {selected.capacity}</strong></div><button className="secondary-button" type="button" onClick={() => setAssigning(false)}>Cancel</button><button className="dark-button" type="button" onClick={assignPatient}>Confirm assignment</button></div>}<div className="assigned-patients">{(assigned[selected.id] ?? []).map((patient, index) => <div key={patient}><span className={`avatar ${index === 0 ? "watch" : "stable"}`}>{patient.split(" ").map((part) => part[0]).join("")}</span><div><strong>{patient}</strong><small>{index === 0 ? "Priority follow-up" : "Routine monitoring"}</small></div><span>{index === 0 ? "Review today" : "On track"}</span><button type="button" onClick={() => setAssigned((current) => ({ ...current, [selected.id]: (current[selected.id] ?? []).filter((name) => name !== patient) }))} aria-label={`Remove ${patient} assignment`}>×</button></div>)}</div></section>
          </div>
        </article>
      </section>

      <footer className="page-foot"><span>Aftercare · Care team</span><span>Assignments require staff confirmation</span></footer>
    </div>
  );
}
