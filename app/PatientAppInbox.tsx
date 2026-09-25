"use client";
import { useEffect, useState } from "react";
type Event = {
  id: string;
  patientId: string;
  patientName: string;
  kind: string;
  body: string;
  createdAt: string;
};
export default function PatientAppInbox() {
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState("Loading patient updates…");
  useEffect(() => {
    let alive = true;
    let inFlight = false;
    const controller = new AbortController();
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch("/api/events", {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.events)) throw new Error();
        if (alive) {
          setEvents(result.events);
          setStatus("Live from the patient app · refreshes every 3 seconds");
        }
      } catch {
        if (alive)
          setStatus(
            "Patient updates are temporarily unavailable; retrying automatically.",
          );
      } finally {
        inFlight = false;
      }
    }
    void refresh();
    const timer = setInterval(() => void refresh(), 3000);
    return () => {
      alive = false;
      clearInterval(timer);
      controller.abort();
    };
  }, []);
  return (
    <section className="patient-app-inbox" aria-label="Live patient app inbox">
      <div className="patient-inbox-heading">
        <div>
          <p className="eyebrow">From the patient phone</p>
          <h2>Patient app inbox</h2>
          <p role="status">{status}</p>
        </div>
        <span className="review-tag">Live</span>
      </div>
      {events.length > 0 ? (
        <div className="patient-inbox-events">
          {events.slice(0, 30).map((event) => (
            <article key={event.id}>
              <div>
                <a href={`/patients/${event.patientId}`}>
                  <strong>{event.patientName}</strong>
                </a>
                <span>{event.kind === "wearable" ? "wearable snapshot" : event.kind}</span>
                <time>{new Date(event.createdAt).toLocaleString()}</time>
              </div>
              <p>{event.body}</p>
              <small>
                {event.kind === "wearable"
                  ? "Wearable data · clinical review required"
                  : "Patient-reported · clinical review required"}
              </small>
            </article>
          ))}
        </div>
      ) : (
        <p className="patient-inbox-empty">
          Complete a check-in on the phone with this clinic server connected in
          the app’s Settings. It will appear here.
        </p>
      )}
    </section>
  );
}
