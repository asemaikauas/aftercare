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
  const [address, setAddress] = useState("http://localhost:4100");
  const [connected, setConnected] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [status, setStatus] = useState(
    "Connect to review check-ins, medication logs, wearable snapshots and messages from the patient phone app.",
  );
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!connected) return;
    let alive = true;
    let inFlight = false;
    const controller = new AbortController();
    async function refresh() {
      if (inFlight) return;
      inFlight = true;
      try {
        const response = await fetch(`${connected}/events`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (!Array.isArray(result.events)) throw new Error();
        if (alive) {
          setEvents(result.events.slice().reverse());
          setStatus(
            "Connected to clinic · refreshes every 3 seconds",
          );
        }
      } catch {
        if (alive)
          setStatus(
            "Clinic connection unavailable. Previously received updates remain below; reconnecting automatically.",
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
  }, [connected]);
  async function connect() {
    setLoading(true);
    try {
      const url = new URL(address.trim());
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error();
      const response = await fetch(`${url.origin}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      const result = await response.json();
      if (!response.ok || result.service !== "continuum-demo")
        throw new Error();
      setConnected(url.origin);
      setStatus("Connecting to patient updates…");
    } catch {
      setStatus(
        "Could not connect. Check the clinic server address and try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="patient-app-inbox" aria-label="Live patient app inbox">
      <div className="patient-inbox-heading">
        <div>
          <p className="eyebrow">From the patient phone</p>
          <h2>Patient app inbox</h2>
          <p role="status">{status}</p>
        </div>
        <span className="review-tag">Local connection</span>
      </div>
      <div className="patient-inbox-connect">
        <input
          aria-label="Patient clinic server address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="http://localhost:4100"
        />
        <button
          className="primary-button"
          disabled={loading}
          onClick={() => void connect()}
        >
          {loading ? "Connecting…" : "Connect clinic"}
        </button>
        {connected && (
          <button
            className="secondary-button"
            onClick={() => {
              setConnected("");
              setStatus(
                "Disconnected. Previously received updates remain below.",
              );
            }}
          >
            Disconnect
          </button>
        )}
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
          Complete a check-in on the phone, then connect and sync in the app’s
          Settings. It will appear here.
        </p>
      )}
    </section>
  );
}
