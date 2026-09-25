"use client";

import { useEffect, useState } from "react";
import type { PatientEvent } from "../db/checkins";

export default function PatientAppInbox() {
  const [events, setEvents] = useState<PatientEvent[]>([]);
  const [status, setStatus] = useState("Connecting to the shared CareMinute backend…");

  useEffect(() => {
    let active = true;
    let inFlight = false;
    const controller = new AbortController();
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/events", { cache: "no-store", signal: controller.signal });
        const result = (await response.json()) as { events?: PatientEvent[] };
        if (!response.ok || !Array.isArray(result.events)) throw new Error();
        if (active) {
          setEvents(result.events);
          setStatus("Shared backend connected · refreshes every 3 seconds");
        }
      } catch {
        if (active) setStatus("Shared backend unavailable. Retrying automatically…");
      } finally {
        inFlight = false;
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 3000);
    return () => { active = false; controller.abort(); window.clearInterval(timer); };
  }, []);

  return (
    <section className="patient-app-inbox" aria-label="Live patient app inbox">
      <div className="patient-inbox-heading">
        <div><p className="eyebrow">From the patient app</p><h2>Patient app inbox</h2><p role="status">{status}</p></div>
        <span className="review-tag">D1 shared backend</span>
      </div>
      {events.length > 0 ? (
        <div className="patient-inbox-events">
          {events.slice(0, 30).map((event) => (
            <article key={event.id}>
              <div><a href={`/patients/${event.patientId}`}><strong>{event.patientName}</strong></a><span>{event.kind === "wearable" ? "wearable snapshot" : event.kind}</span><time>{new Date(event.createdAt).toLocaleString()}</time></div>
              <p>{event.body}</p>
              <small>{event.kind === "wearable" ? "Wearable data · clinical review required" : "Patient-reported · clinical review required"}</small>
            </article>
          ))}
        </div>
      ) : <p className="patient-inbox-empty">New check-ins, medication logs, wearable snapshots, and messages will appear here automatically.</p>}
    </section>
  );
}
