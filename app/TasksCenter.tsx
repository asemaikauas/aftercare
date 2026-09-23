"use client";

import { useMemo, useState } from "react";

type TaskStatus = "overdue" | "today" | "upcoming" | "complete";
type TaskPriority = "urgent" | "high" | "routine";
type TaskFilter = "My tasks" | "All tasks" | "Completed";

type ClinicTask = {
  id: number;
  title: string;
  description: string;
  patient: string;
  initials: string;
  procedure: string;
  due: string;
  dueDetail: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  ownerInitials: string;
  source: string;
  created: string;
  checklist: string[];
};

const seedTasks: ClinicTask[] = [
  { id: 1, title: "Call for fever assessment", description: "Complete the post-op red-flag assessment and confirm whether same-day clinical review is needed.", patient: "Sophia Reed", initials: "SR", procedure: "Knee replacement · Day 5", due: "Overdue", dueDetail: "By 8:30 AM · 42m ago", status: "overdue", priority: "urgent", owner: "Maya Nelson", ownerInitials: "MN", source: "Escalation rule", created: "Today at 8:14 AM", checklist: ["Confirm current temperature", "Review incision symptoms", "Document escalation outcome"] },
  { id: 2, title: "Review fluid-status check-in", description: "Review the reported weight increase and ankle swelling with the cardiac recovery protocol.", patient: "Noah Williams", initials: "NW", procedure: "Cardiac bypass · Day 7", due: "Overdue", dueDetail: "By 9:00 AM · 12m ago", status: "overdue", priority: "urgent", owner: "Maya Nelson", ownerInitials: "MN", source: "Patient check-in", created: "Today at 7:45 AM", checklist: ["Verify 48-hour weight trend", "Ask about breathing changes", "Route findings to cardiac nurse"] },
  { id: 3, title: "Check hydration response", description: "Review Amelia’s response to the hydration reminder and confirm today’s fluid target.", patient: "Amelia Khan", initials: "AK", procedure: "Colectomy · Day 4", due: "Today", dueDetail: "11:00 AM · in 1h 48m", status: "today", priority: "high", owner: "Maya Nelson", ownerInitials: "MN", source: "Care plan", created: "Yesterday at 4:20 PM", checklist: ["Review morning fluid log", "Check nausea severity", "Send updated guidance"] },
  { id: 4, title: "Offer physiotherapy appointment", description: "Send two available physiotherapy times after repeated mobility goals were missed.", patient: "Ethan Cole", initials: "EC", procedure: "Hip replacement · Day 6", due: "Today", dueDetail: "1:30 PM · in 4h 18m", status: "today", priority: "high", owner: "Maya Nelson", ownerInitials: "MN", source: "Care plan", created: "Today at 7:04 AM", checklist: ["Review mobility notes", "Select available appointment slots", "Send appointment offer"] },
  { id: 5, title: "Attach calcium result to review", description: "Add the latest calcium result and reported tingling to the queued clinician review.", patient: "Mia Chen", initials: "MC", procedure: "Thyroidectomy · Day 3", due: "Today", dueDetail: "3:00 PM · in 5h 48m", status: "today", priority: "high", owner: "Maya Nelson", ownerInitials: "MN", source: "Lab result", created: "Today at 8:05 AM", checklist: ["Confirm result timestamp", "Attach symptom report", "Notify reviewing clinician"] },
  { id: 6, title: "Prepare routine follow-up", description: "Prepare the recovery summary for tomorrow’s scheduled follow-up visit.", patient: "Leo Park", initials: "LP", procedure: "Hernia repair · Day 10", due: "Tomorrow", dueDetail: "9:15 AM", status: "upcoming", priority: "routine", owner: "Maya Nelson", ownerInitials: "MN", source: "Appointment", created: "Monday at 11:40 AM", checklist: ["Review ten-day trend", "Confirm appointment", "Prepare visit summary"] },
  { id: 7, title: "Review weekly adherence", description: "Check recovery-plan adherence before Friday’s physiotherapy review.", patient: "Isla Brooks", initials: "IB", procedure: "ACL reconstruction · Day 9", due: "Friday", dueDetail: "10:00 AM", status: "upcoming", priority: "routine", owner: "Dr. Patel", ownerInitials: "AP", source: "Weekly workflow", created: "Monday at 1:15 PM", checklist: ["Review exercise completion", "Check swelling trend", "Share summary with physiotherapy"] },
  { id: 8, title: "Confirm eye-drop schedule", description: "Verified the discharge eye-drop schedule after the patient’s morning check-in.", patient: "Ava Martinez", initials: "AM", procedure: "Cataract surgery · Day 2", due: "Completed", dueDetail: "Today at 8:35 AM", status: "complete", priority: "routine", owner: "Maya Nelson", ownerInitials: "MN", source: "Patient check-in", created: "Today at 8:22 AM", checklist: ["Review reported irritation", "Confirm eye-drop schedule", "Record patient response"] },
  { id: 9, title: "Close activity alert", description: "Reviewed the improving activity trend and closed the automated recovery alert.", patient: "Lucas Bennett", initials: "LB", procedure: "Appendectomy · Day 3", due: "Completed", dueDetail: "Yesterday at 6:20 PM", status: "complete", priority: "routine", owner: "Dr. Patel", ownerInitials: "AP", source: "Activity trend", created: "Yesterday at 6:05 PM", checklist: ["Review step trend", "Confirm pain score", "Close alert"] },
];

const patientProfileIds: Record<string, number> = {
  "Sophia Reed": 1,
  "Noah Williams": 2,
  "Amelia Khan": 3,
  "Ethan Cole": 4,
  "Mia Chen": 5,
  "Oliver Grant": 6,
  "Ava Martinez": 7,
  "Lucas Bennett": 8,
  "Isla Brooks": 9,
  "Leo Park": 10,
};

function statusLabel(status: TaskStatus) {
  if (status === "overdue") return "Overdue";
  if (status === "today") return "Due today";
  if (status === "upcoming") return "Upcoming";
  return "Completed";
}

export default function TasksCenter({ onNotify }: { onNotify: (message: string) => void }) {
  const [tasks, setTasks] = useState(seedTasks);
  const [filter, setFilter] = useState<TaskFilter>("My tasks");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === "Completed" ? task.status === "complete" : filter === "My tasks" ? task.owner === "Maya Nelson" && task.status !== "complete" : task.status !== "complete";
    return matchesFilter && `${task.title} ${task.patient} ${task.procedure}`.toLowerCase().includes(query.toLowerCase());
  }), [filter, query, tasks]);

  const taskGroups = useMemo(() => ([
    { status: "overdue" as const, label: "Overdue", note: "Needs attention" },
    { status: "today" as const, label: "Today", note: "Due before end of day" },
    { status: "upcoming" as const, label: "Upcoming", note: "Plan ahead" },
    { status: "complete" as const, label: "Completed", note: "Recently finished" },
  ]).map((group) => ({ ...group, items: visibleTasks.filter((task) => task.status === group.status) })).filter((group) => group.items.length), [visibleTasks]);

  const selected = tasks.find((task) => task.id === selectedId) ?? visibleTasks[0] ?? tasks[0];
  const overdueCount = tasks.filter((task) => task.status === "overdue").length;
  const todayCount = tasks.filter((task) => task.status === "today").length;
  const completedCount = tasks.filter((task) => task.status === "complete").length;
  const completionRate = Math.round((completedCount / tasks.length) * 100);

  const completeTask = (task: ClinicTask) => {
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: "complete", due: "Completed", dueDetail: "Just now" } : item));
    onNotify(`Task completed for ${task.patient}`);
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: ClinicTask = { id: Date.now(), title: newTitle.trim(), description: "New care-coordination task created by Maya.", patient: "Unassigned patient", initials: "UP", procedure: "Select patient", due: "Today", dueDetail: "By 5:00 PM", status: "today", priority: "routine", owner: "Maya Nelson", ownerInitials: "MN", source: "Manual task", created: "Just now", checklist: ["Add task details", "Complete follow-up"] };
    setTasks((current) => [task, ...current]);
    setSelectedId(task.id);
    setNewTitle("");
    setShowNewTask(false);
    onNotify("New task added");
  };

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <div><p className="eyebrow">Care coordination</p><h1>Tasks</h1><p className="subtitle">Follow-ups and reviews due today.</p></div>
        <div className="tasks-header-actions"><span className="tasks-date"><span>23</span><small>SEP<br />WED</small></span><button className="primary-button" type="button" onClick={() => setShowNewTask(true)}><span>＋</span> New task</button></div>
      </header>

      <section className="task-summary" aria-label="Task summary">
        <article className="task-focus-card"><span className="task-focus-icon">✓</span><div><small>Today</small><strong>{overdueCount + todayCount} tasks need your attention</strong></div><button type="button" onClick={() => { setFilter("My tasks"); setSelectedId(tasks.find((task) => task.status === "overdue")?.id ?? 1); }}>Start with overdue <span>→</span></button></article>
        <article className="task-stat"><span className="task-stat-icon overdue">!</span><div><strong>{overdueCount}</strong><small>Overdue</small></div><em>Needs action</em></article>
        <article className="task-stat"><span className="task-stat-icon today">◷</span><div><strong>{todayCount}</strong><small>Due today</small></div><em>On schedule</em></article>
        <article className="task-stat"><span className="task-progress-ring" style={{ background: `conic-gradient(var(--green) ${completionRate}%, #e5ebe7 0)` }}><i>{completionRate}</i></span><div><strong>{completionRate}%</strong><small>Completed</small></div><em>Today</em></article>
      </section>

      {showNewTask && <section className="quick-task" aria-label="Create a new task"><div><span>New care task</span><strong>What needs to be done?</strong></div><input autoFocus value={newTitle} onChange={(event) => setNewTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTask(); if (event.key === "Escape") setShowNewTask(false); }} placeholder="e.g. Call patient after lab review" aria-label="Task title" /><button className="secondary-button" type="button" onClick={() => setShowNewTask(false)}>Cancel</button><button className="dark-button" type="button" disabled={!newTitle.trim()} onClick={addTask}>Add task</button></section>}

      <section className="task-workspace">
        <div className="task-list-panel">
          <div className="task-toolbar">
            <div className="task-filter-tabs" role="tablist" aria-label="Task views">{(["My tasks", "All tasks", "Completed"] as TaskFilter[]).map((item) => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)}>{item}<span>{item === "Completed" ? completedCount : item === "My tasks" ? tasks.filter((task) => task.owner === "Maya Nelson" && task.status !== "complete").length : tasks.filter((task) => task.status !== "complete").length}</span></button>)}</div>
            <label className="task-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks or patients" aria-label="Search tasks" /></label>
          </div>

          <div className="task-list" role="list">
            {taskGroups.map((group) => <section className={`task-group ${group.status}`} key={group.status} aria-label={`${group.label} tasks`}><header><div><span className={`group-dot ${group.status}`} /><strong>{group.label}</strong><b>{group.items.length}</b></div><small>{group.note}</small></header><div className="task-group-card">{group.items.map((task) => <button key={task.id} role="listitem" type="button" className={`task-row ${selected.id === task.id ? "selected" : ""} ${task.status}`} onClick={() => setSelectedId(task.id)}><span className={`task-check ${task.status === "complete" ? "checked" : ""}`} onClick={(event) => { event.stopPropagation(); if (task.status !== "complete") completeTask(task); }}>{task.status === "complete" ? "✓" : ""}</span><span className={`avatar task-avatar ${task.priority}`}>{task.initials}</span><span className="task-copy"><span><strong>{task.title}</strong><i className={`task-priority ${task.priority}`}>{task.priority}</i></span><small>{task.patient} · {task.procedure}</small></span><span className="task-owner"><span className="mini-owner">{task.ownerInitials}</span><small>{task.owner === "Maya Nelson" ? "You" : task.owner}</small></span><span className={`task-due ${task.status}`}><strong>{task.due}</strong><small>{task.dueDetail}</small></span><span className="task-chevron">›</span></button>)}</div></section>)}
            {!visibleTasks.length && <div className="task-empty"><span>✓</span><strong>Nothing here right now</strong><p>Try another task view or search.</p></div>}
          </div>
        </div>

        <aside className="task-detail-panel">
          <header className="task-detail-head"><div><span className={`detail-status ${selected.status}`}>{statusLabel(selected.status)}</span><span className={`task-priority ${selected.priority}`}>{selected.priority} priority</span></div><button type="button" aria-label="More task options">•••</button><h2>{selected.title}</h2><p>{selected.description}</p></header>
          <section className="task-patient-card"><span className={`avatar large ${selected.priority}`}>{selected.initials}<i /></span><div><span>Patient</span><strong>{selected.patient}</strong><small>{selected.procedure}</small></div><a href={patientProfileIds[selected.patient] ? `/patients/${patientProfileIds[selected.patient]}` : "#patients"}>Open profile <span>→</span></a></section>
          <section className="task-detail-section"><div className="task-section-title"><div><h3>Checklist</h3></div><span>{selected.status === "complete" ? selected.checklist.length : 0}/{selected.checklist.length}</span></div>{selected.checklist.map((item, index) => <div className="detail-check" key={item}><span className={selected.status === "complete" ? "done" : ""}>{selected.status === "complete" ? "✓" : index + 1}</span><p>{item}</p></div>)}</section>
          <section className="task-meta-card"><div><span>Assigned to</span><p><b className="mini-owner">{selected.ownerInitials}</b><strong>{selected.owner}</strong></p></div><div><span>Due</span><strong className={selected.status === "overdue" ? "danger" : ""}>{selected.dueDetail}</strong></div><div><span>Created</span><strong>{selected.created}</strong></div><div><span>Source</span><strong>{selected.source}</strong></div></section>
          <div className="task-detail-actions"><button className="secondary-button" type="button" onClick={() => onNotify(`Reminder prepared for ${selected.patient}`)}>Send reminder</button><button className="dark-button" type="button" disabled={selected.status === "complete"} onClick={() => completeTask(selected)}>{selected.status === "complete" ? "Task completed" : "Mark complete"}</button></div>
          <footer><span>✦</span><p><strong>Clinical review required</strong>Completing a task does not change the care plan.</p></footer>
        </aside>
      </section>

      <footer className="page-foot"><span>Continuum · Synthetic data</span><span>Not for emergency use</span></footer>
    </div>
  );
}
