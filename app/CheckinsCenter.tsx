"use client";

import { useMemo, useState } from "react";

type CheckinRisk = "Critical" | "Watch" | "Stable";
type CheckinFilter = "All" | "Needs review" | "Reviewed";

type DailyCheckin = {
  id: number;
  patientId: number;
  patient: string;
  initials: string;
  procedure: string;
  day: number;
  time: string;
  duration: string;
  risk: CheckinRisk;
  headline: string;
  change: string;
  summary: string;
  flags: { label: string; detail: string; tone: "critical" | "watch" }[];
  answers: { label: string; value: string; trend: string; tone: "critical" | "watch" | "stable" }[];
  transcript: { speaker: "Assistant" | "Patient"; text: string }[];
  wave: number[];
};

const checkins: DailyCheckin[] = [
  { id: 1, patientId: 1, patient: "Sophia Reed", initials: "SR", procedure: "Knee replacement", day: 5, time: "8:14 AM", duration: "0:54", risk: "Critical", headline: "Fever and worsening pain", change: "3 concerns detected", summary: "Sophia reports eating less, chills, and pain that increased overnight. Her reported temperature and incision warmth require staff review.", flags: [{ label: "Fever reported", detail: "38.1°C this morning", tone: "critical" }, { label: "Pain increased", detail: "8/10, up from 6 yesterday", tone: "critical" }, { label: "Incision change", detail: "New warmth around the incision", tone: "watch" }], answers: [{ label: "Nutrition", value: "Half a meal", trend: "Less than yesterday", tone: "watch" }, { label: "Hydration", value: "3 cups", trend: "Below daily goal", tone: "watch" }, { label: "Pain", value: "8 / 10", trend: "+2 since yesterday", tone: "critical" }, { label: "Medication", value: "Taken", trend: "On schedule", tone: "stable" }], transcript: [{ speaker: "Assistant", text: "How are you feeling compared with yesterday?" }, { speaker: "Patient", text: "Worse today. I had chills overnight and the pain is about an eight now." }, { speaker: "Assistant", text: "Have you noticed any changes around your incision?" }, { speaker: "Patient", text: "It feels warmer than yesterday. My temperature was 38.1 this morning." }, { speaker: "Assistant", text: "Were you able to eat and drink normally?" }, { speaker: "Patient", text: "Only about half my dinner. I’ve had three cups of water." }], wave: [28, 52, 76, 42, 88, 63, 35, 71, 92, 54, 31, 67, 84, 47, 73, 39, 58, 81, 45, 66, 30, 51, 72, 40] },
  { id: 2, patientId: 2, patient: "Noah Williams", initials: "NW", procedure: "Cardiac bypass", day: 7, time: "7:45 AM", duration: "1:01", risk: "Critical", headline: "Weight gain and ankle swelling", change: "2 concerns detected", summary: "Noah reports new ankle swelling and a 2.1 kg weight increase over 48 hours. He denies new breathing difficulty.", flags: [{ label: "Rapid weight change", detail: "+2.1 kg over 48 hours", tone: "critical" }, { label: "New swelling", detail: "Both ankles since last night", tone: "watch" }], answers: [{ label: "Nutrition", value: "Normal", trend: "No change", tone: "stable" }, { label: "Hydration", value: "6 cups", trend: "Goal met", tone: "stable" }, { label: "Breathing", value: "No change", trend: "No new difficulty", tone: "stable" }, { label: "Medication", value: "Taken", trend: "On schedule", tone: "stable" }], transcript: [{ speaker: "Assistant", text: "Have you noticed any new swelling or changes in your breathing?" }, { speaker: "Patient", text: "Both ankles look puffy since last night, but my breathing feels the same." }, { speaker: "Assistant", text: "What was your weight this morning?" }, { speaker: "Patient", text: "84.7 kilos. That is about two kilos higher than Monday." }], wave: [43, 66, 31, 79, 58, 87, 46, 72, 37, 60, 91, 52, 76, 33, 68, 45, 82, 56, 70, 41, 63, 84, 49, 73] },
  { id: 3, patientId: 3, patient: "Amelia Khan", initials: "AK", procedure: "Colectomy", day: 4, time: "8:02 AM", duration: "0:47", risk: "Watch", headline: "Low intake and persistent nausea", change: "2 changes from yesterday", summary: "Amelia’s nausea is unchanged, but she is drinking less and skipped breakfast. No new severe symptoms were reported.", flags: [{ label: "Low fluid intake", detail: "2 of 6 cups logged", tone: "watch" }, { label: "Meal missed", detail: "Breakfast skipped", tone: "watch" }], answers: [{ label: "Nutrition", value: "Breakfast missed", trend: "Appetite lower", tone: "watch" }, { label: "Hydration", value: "2 cups", trend: "Below goal", tone: "watch" }, { label: "Pain", value: "4 / 10", trend: "No change", tone: "stable" }, { label: "Medication", value: "Taken", trend: "On schedule", tone: "stable" }], transcript: [{ speaker: "Assistant", text: "Were you able to eat breakfast this morning?" }, { speaker: "Patient", text: "No, I still feel nauseous. I have only managed two cups of water." }, { speaker: "Assistant", text: "Is your pain better, worse, or about the same?" }, { speaker: "Patient", text: "About the same, maybe a four." }], wave: [35, 72, 48, 82, 54, 39, 69, 88, 44, 63, 78, 51, 32, 74, 58, 85, 47, 67, 36, 76, 55, 71, 43, 62] },
  { id: 4, patientId: 4, patient: "Ethan Cole", initials: "EC", procedure: "Hip replacement", day: 6, time: "7:18 AM", duration: "0:52", risk: "Watch", headline: "Mobility goal missed", change: "Follow-up suggested", summary: "Ethan reports increased stiffness and did not complete yesterday’s second walk. Pain and medication adherence remain stable.", flags: [{ label: "Mobility below plan", detail: "Second walk missed yesterday", tone: "watch" }], answers: [{ label: "Nutrition", value: "Normal", trend: "No change", tone: "stable" }, { label: "Hydration", value: "Goal met", trend: "On target", tone: "stable" }, { label: "Pain", value: "5 / 10", trend: "No change", tone: "stable" }, { label: "Mobility", value: "1 of 2 walks", trend: "Below plan", tone: "watch" }], transcript: [{ speaker: "Assistant", text: "How did yesterday’s walking exercises go?" }, { speaker: "Patient", text: "I did the morning walk, but my hip felt stiff so I skipped the second one." }, { speaker: "Assistant", text: "Has your pain changed?" }, { speaker: "Patient", text: "No, it is still around five." }], wave: [31, 59, 77, 42, 68, 86, 53, 37, 73, 49, 81, 64, 35, 57, 88, 46, 70, 39, 75, 55, 83, 44, 62, 51] },
  { id: 5, patientId: 7, patient: "Ava Martinez", initials: "AM", procedure: "Cataract surgery", day: 2, time: "8:22 AM", duration: "0:39", risk: "Stable", headline: "Recovery on track", change: "No concerns detected", summary: "Ava reports improving vision, mild expected irritation, and full adherence to her eye-drop schedule.", flags: [], answers: [{ label: "Nutrition", value: "Normal", trend: "No change", tone: "stable" }, { label: "Vision", value: "Improving", trend: "As expected", tone: "stable" }, { label: "Discomfort", value: "2 / 10", trend: "Improving", tone: "stable" }, { label: "Eye drops", value: "Taken", trend: "On schedule", tone: "stable" }], transcript: [{ speaker: "Assistant", text: "How is your vision feeling today?" }, { speaker: "Patient", text: "It is clearer than yesterday. There is only a little irritation." }, { speaker: "Assistant", text: "Were you able to use your eye drops on schedule?" }, { speaker: "Patient", text: "Yes, I used both doses." }], wave: [29, 48, 67, 40, 71, 54, 35, 61, 76, 45, 58, 69, 32, 52, 73, 43, 64, 38, 70, 50, 66, 41, 57, 46] },
];

function RiskPill({ risk }: { risk: CheckinRisk }) {
  return <span className={`checkin-risk ${risk.toLowerCase()}`}><i />{risk}</span>;
}

export default function CheckinsCenter({ onNotify }: { onNotify: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState<CheckinFilter>("All");
  const [query, setQuery] = useState("");
  const [reviewed, setReviewed] = useState<number[]>([5]);

  const visible = useMemo(() => checkins.filter((item) => {
    const matchesFilter = filter === "Reviewed" ? reviewed.includes(item.id) : filter === "Needs review" ? item.risk !== "Stable" && !reviewed.includes(item.id) : true;
    return matchesFilter && `${item.patient} ${item.headline} ${item.procedure}`.toLowerCase().includes(query.toLowerCase());
  }), [filter, query, reviewed]);

  const selected = checkins.find((item) => item.id === selectedId) ?? checkins[0];
  const needsReview = checkins.filter((item) => item.risk !== "Stable" && !reviewed.includes(item.id)).length;

  const markReviewed = () => {
    setReviewed((current) => current.includes(selected.id) ? current : [...current, selected.id]);
    onNotify(`${selected.patient}'s check-in marked reviewed`);
  };

  return (
    <div className="checkins-page">
      <header className="checkins-header"><div><p className="eyebrow">Daily patient pulse</p><h1>Voice check-ins</h1><p className="subtitle">One-minute conversations, ready for clinical review.</p></div><div className="checkins-header-actions"><span className="sync-pill"><i />Voice service active <b>Live</b></span><button className="primary-button" type="button" onClick={() => onNotify("Daily check-in report exported")}>Export report</button></div></header>

      <section className="checkin-summary" aria-label="Daily check-in summary">
        <article className="checkin-hero-stat"><div className="completion-orbit"><strong>80%</strong><span>complete</span></div><div><span>Today’s check-ins</span><h2>8 of 10 patients checked in</h2><p>Most patients finished in under one minute.</p></div></article>
        <article><span className="summary-symbol critical">!</span><div><strong>2</strong><small>Urgent reviews</small></div><em>Now</em></article>
        <article><span className="summary-symbol watch">↗</span><div><strong>2</strong><small>Watch closely</small></div><em>Today</em></article>
        <article><span className="summary-symbol voice">●</span><div><strong>52s</strong><small>Average check-in</small></div><em>−8s</em></article>
      </section>

      <section className="checkin-workspace">
        <aside className="checkin-queue">
          <div className="checkin-toolbar"><div><h2>Review queue</h2><span>{needsReview} need attention</span></div><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient" aria-label="Search voice check-ins" /></label></div>
          <div className="checkin-filters" role="tablist" aria-label="Check-in filters">{(["All", "Needs review", "Reviewed"] as CheckinFilter[]).map((item) => <button key={item} type="button" role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? checkins.length : item === "Needs review" ? needsReview : reviewed.length}</span></button>)}</div>
          <div className="checkin-list" role="list">{visible.map((item) => <button key={item.id} type="button" role="listitem" className={`checkin-row ${selected.id === item.id ? "selected" : ""}`} onClick={() => setSelectedId(item.id)}><span className={`avatar checkin-avatar ${item.risk.toLowerCase()}`}>{item.initials}<i /></span><span className="checkin-row-copy"><span><strong>{item.patient}</strong><time>{item.time}</time></span><small>{item.procedure} · Day {item.day}</small><b>{item.headline}</b></span><span className="checkin-row-status"><RiskPill risk={item.risk} /><small className={reviewed.includes(item.id) ? "reviewed" : ""}>{reviewed.includes(item.id) ? "✓ Reviewed" : item.change}</small></span></button>)}</div>
        </aside>

        <article className="checkin-detail">
          <header className="checkin-detail-head"><div className="checkin-person"><span className={`avatar large ${selected.risk.toLowerCase()}`}>{selected.initials}<i /></span><div><div><h2>{selected.patient}</h2><RiskPill risk={selected.risk} /></div><p>{selected.procedure} · Recovery day {selected.day}</p><small>Check-in completed today at {selected.time}</small></div></div><a href={`/patients/${selected.patientId}`}>Open profile <span>→</span></a></header>

          <div className="checkin-detail-scroll">
            <section className="checkin-brief"><div><span className="ai-mark">✦</span><div><strong>Check-in brief</strong><small>Generated from today’s conversation</small></div><span className="review-tag">Review required</span></div><p>{selected.summary}</p></section>

            {selected.flags.length > 0 ? <section className="flag-section"><div className="checkin-section-title"><h3>Attention needed</h3><span>{selected.flags.length} detected</span></div>{selected.flags.map((flag) => <div className={`checkin-flag ${flag.tone}`} key={flag.label}><span>{flag.tone === "critical" ? "!" : "↗"}</span><div><strong>{flag.label}</strong><small>{flag.detail}</small></div></div>)}</section> : <section className="clear-checkin"><span>✓</span><div><strong>No concerns detected</strong><p>Answers are consistent with the current recovery plan.</p></div></section>}

            <section className="answer-section"><div className="checkin-section-title"><h3>Structured answers</h3><span>Compared with yesterday</span></div><div className="answer-grid">{selected.answers.map((answer) => <article key={answer.label}><div><span>{answer.label}</span><i className={answer.tone} /></div><strong>{answer.value}</strong><small>{answer.trend}</small></article>)}</div></section>

            <details className="transcript-card"><summary><span><i>“</i><b>Conversation transcript</b></span><small>{selected.transcript.length} exchanges <em>⌄</em></small></summary><div>{selected.transcript.map((line, index) => <p className={line.speaker.toLowerCase()} key={`${line.speaker}-${index}`}><strong>{line.speaker}</strong><span>{line.text}</span></p>)}</div></details>
          </div>

          <footer className="checkin-actions"><button className="secondary-button" type="button" onClick={() => onNotify(`Message draft opened for ${selected.patient}`)}>Message patient</button><button className="secondary-button" type="button" onClick={() => onNotify(`Call started for ${selected.patient}`)}>Call patient</button><button className="dark-button" type="button" disabled={reviewed.includes(selected.id)} onClick={markReviewed}>{reviewed.includes(selected.id) ? "Reviewed ✓" : "Mark reviewed"}</button></footer>
        </article>
      </section>

      <footer className="page-foot"><span>Voice audio is never retained</span><span>AI summaries require clinical review</span></footer>
    </div>
  );
}
