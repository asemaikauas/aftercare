"use client";

import { useEffect, useMemo, useState } from "react";
import type { DailyCheckin } from "../db/checkins";
import PatientAppInbox from "./PatientAppInbox";

type CheckinFilter = "All" | "Needs review" | "Reviewed";

function RiskPill({ risk }: { risk: DailyCheckin["risk"] }) {
  return <span className={`checkin-risk ${risk.toLowerCase()}`}><i />{risk}</span>;
}

function durationSeconds(value: string) {
  const match = value.match(/^(\d+):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

export default function CheckinsCenter({ onNotify, initialCheckins }: { onNotify: (message: string) => void; initialCheckins: DailyCheckin[] }) {
  const [checkins, setCheckins] = useState(initialCheckins);
  const [selectedId, setSelectedId] = useState(initialCheckins[0]?.id ?? "");
  const [filter, setFilter] = useState<CheckinFilter>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    let inFlight = false;
    const refresh = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/checkins", { cache: "no-store" });
        const data = (await response.json()) as { checkins?: DailyCheckin[] };
        if (response.ok && Array.isArray(data.checkins) && active) {
          setCheckins(data.checkins);
          setSelectedId((current) => data.checkins!.some((item) => item.id === current) ? current : (data.checkins![0]?.id ?? ""));
        }
      } catch {
        // Keep the last successful database snapshot while reconnecting.
      } finally {
        inFlight = false;
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const reviewed = useMemo(() => checkins.filter((item) => item.status === "reviewed").map((item) => item.id), [checkins]);
  const visible = useMemo(() => checkins.filter((item) => {
    const matchesFilter = filter === "Reviewed" ? item.status === "reviewed" : filter === "Needs review" ? item.status === "needs_review" : true;
    return matchesFilter && `${item.patient} ${item.headline} ${item.procedure}`.toLowerCase().includes(query.toLowerCase());
  }), [checkins, filter, query]);
  const selected = checkins.find((item) => item.id === selectedId) ?? checkins[0];
  const needsReview = checkins.filter((item) => item.status === "needs_review").length;
  const urgent = checkins.filter((item) => item.risk === "Critical" && item.status !== "reviewed").length;
  const watching = checkins.filter((item) => item.risk === "Watch" && item.status !== "reviewed").length;
  const measuredDurations = checkins.map((item) => durationSeconds(item.duration)).filter(Boolean);
  const averageDuration = measuredDurations.length ? `${Math.round(measuredDurations.reduce((sum, value) => sum + value, 0) / measuredDurations.length)}s` : "—";
  const completedPatients = new Set(checkins.map((item) => item.patientId)).size;

  const markReviewed = async () => {
    if (!selected) return;
    const response = await fetch(`/api/checkins/${encodeURIComponent(selected.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewedBy: "Maya Nelson" }),
    });
    if (!response.ok) {
      onNotify("Could not update the check-in. Please try again.");
      return;
    }
    setCheckins((current) => current.map((item) => item.id === selected.id ? { ...item, status: "reviewed", change: "✓ Reviewed" } : item));
    onNotify(`${selected.patient}'s check-in marked reviewed`);
  };

  return (
    <div className="checkins-page">
      <PatientAppInbox />
      <header className="checkins-header"><div><p className="eyebrow">Daily patient pulse</p><h1>Voice check-ins</h1><p className="subtitle">One-minute conversations from the shared CareMinute backend, ready for clinical review.</p></div><div className="checkins-header-actions"><span className="sync-pill"><i />Shared backend <b>Live</b></span><button className="primary-button" type="button" onClick={() => onNotify("Daily check-in report exported")}>Export report</button></div></header>

      <section className="checkin-summary" aria-label="Daily check-in summary">
        <article className="checkin-hero-stat"><div className="completion-orbit"><strong>{Math.min(100, completedPatients * 10)}%</strong><span>complete</span></div><div><span>Today’s check-ins</span><h2>{completedPatients} of 10 patients checked in</h2><p>New submissions appear automatically from web and mobile.</p></div></article>
        <article><span className="summary-symbol critical">!</span><div><strong>{urgent}</strong><small>Urgent reviews</small></div><em>Now</em></article>
        <article><span className="summary-symbol watch">↗</span><div><strong>{watching}</strong><small>Watch closely</small></div><em>Today</em></article>
        <article><span className="summary-symbol voice">●</span><div><strong>{averageDuration}</strong><small>Average check-in</small></div><em>Live data</em></article>
      </section>

      {!selected ? <p className="empty-state">No check-ins have been submitted yet.</p> : (
        <section className="checkin-workspace">
          <aside className="checkin-queue">
            <div className="checkin-toolbar"><div><h2>Review queue</h2><span>{needsReview} need attention</span></div><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient" aria-label="Search voice check-ins" /></label></div>
            <div className="checkin-filters" role="tablist" aria-label="Check-in filters">{(["All", "Needs review", "Reviewed"] as CheckinFilter[]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? checkins.length : item === "Needs review" ? needsReview : reviewed.length}</span></button>)}</div>
            <div className="checkin-list" role="list">{visible.map((item) => <button key={item.id} type="button" role="listitem" className={`checkin-row ${selected.id === item.id ? "selected" : ""}`} onClick={() => setSelectedId(item.id)}><span className={`avatar checkin-avatar ${item.risk.toLowerCase()}`}>{item.initials}<i /></span><span className="checkin-row-copy"><span><strong>{item.patient}</strong><time>{item.time}</time></span><small>{item.procedure} · Day {item.day}</small><b>{item.headline}</b></span><span className="checkin-row-status"><RiskPill risk={item.risk} /><small className={item.status === "reviewed" ? "reviewed" : ""}>{item.status === "reviewed" ? "✓ Reviewed" : item.change}</small></span></button>)}</div>
          </aside>

          <article className="checkin-detail">
            <header className="checkin-detail-head"><div className="checkin-person"><span className={`avatar large ${selected.risk.toLowerCase()}`}>{selected.initials}<i /></span><div><div><h2>{selected.patient}</h2><RiskPill risk={selected.risk} /></div><p>{selected.procedure} · Recovery day {selected.day}</p><small>Check-in completed at {selected.time}</small></div></div><a href={`/patients/${selected.patientId}`}>Open profile <span>→</span></a></header>
            <div className="checkin-detail-scroll">
              <section className="checkin-brief"><div><span className="ai-mark">✦</span><div><strong>Check-in brief</strong><small>Generated from the submitted conversation</small></div><span className="review-tag">{selected.status === "reviewed" ? "Reviewed" : "Review required"}</span></div><p>{selected.summary}</p></section>
              {selected.flags.length > 0 ? <section className="flag-section"><div className="checkin-section-title"><h3>Attention needed</h3><span>{selected.flags.length} detected</span></div>{selected.flags.map((flag) => <div className={`checkin-flag ${flag.tone}`} key={`${flag.label}-${flag.detail}`}><span>{flag.tone === "critical" ? "!" : "↗"}</span><div><strong>{flag.label}</strong><small>{flag.detail}</small></div></div>)}</section> : <section className="clear-checkin"><span>✓</span><div><strong>No structured concerns detected</strong><p>The raw patient submission remains available for clinical review.</p></div></section>}
              {selected.answers.length > 0 && <section className="answer-section"><div className="checkin-section-title"><h3>Structured answers</h3><span>Latest submission</span></div><div className="answer-grid">{selected.answers.map((answer) => <article key={`${answer.label}-${answer.value}`}><div><span>{answer.label}</span><i className={answer.tone} /></div><strong>{answer.value}</strong><small>{answer.trend}</small></article>)}</div></section>}
              <details className="transcript-card" open><summary><span><i>“</i><b>Conversation transcript</b></span><small>{selected.transcript.length} exchange{selected.transcript.length === 1 ? "" : "s"} <em>⌄</em></small></summary><div>{selected.transcript.length ? selected.transcript.map((line, index) => <p className={line.speaker.toLowerCase()} key={`${line.speaker}-${index}`}><strong>{line.speaker}</strong><span>{line.text}</span></p>) : <p><span>No transcript was submitted for this check-in.</span></p>}</div></details>
            </div>
            <footer className="checkin-actions"><button className="secondary-button" type="button" onClick={() => onNotify(`Message draft opened for ${selected.patient}`)}>Message patient</button><button className="secondary-button" type="button" onClick={() => onNotify(`Call started for ${selected.patient}`)}>Call patient</button><button className="dark-button" type="button" disabled={selected.status === "reviewed"} onClick={() => void markReviewed()}>{selected.status === "reviewed" ? "Reviewed ✓" : "Mark reviewed"}</button></footer>
          </article>
        </section>
      )}
      <footer className="page-foot"><span>Voice audio is never retained</span><span>AI summaries require clinical review</span></footer>
    </div>
  );
}
