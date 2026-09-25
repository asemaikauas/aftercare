import { listPatientEvents, recordPatientEvent, type PatientEvent } from "../../../db/checkins";
import { getPatient, submitCheckin } from "../../../db/patients";

const VALID_KINDS: PatientEvent["kind"][] = ["check-in", "medication", "message", "wearable"];

export async function GET() {
  return Response.json({ events: await listPatientEvents() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const value = (await request.json()) as Partial<PatientEvent>;
    const kind = value.kind as PatientEvent["kind"];
    if (!value.id || !value.patientId || !value.patientName || !value.body || !value.createdAt || !VALID_KINDS.includes(kind)) {
      return Response.json({ error: "Invalid patient event" }, { status: 400 });
    }
    const patient = await getPatient(value.patientId);
    if (!patient || patient.name !== value.patientName) return Response.json({ error: "Patient not found" }, { status: 404 });
    const event: PatientEvent = {
      id: value.id,
      patientId: value.patientId,
      patientName: value.patientName,
      kind,
      body: value.body.trim().slice(0, 3000),
      createdAt: value.createdAt,
    };
    const created = await recordPatientEvent(event);
    if (created && kind === "check-in") {
      const voiceMatch = event.body.match(/^Voice check-in:\s*[“\"]?([\s\S]*?)[”\"]?$/i);
      const note = voiceMatch?.[1]?.trim() || event.body;
      await submitCheckin(event.patientId, "voice", note, {
        source: "native",
        clientEventId: `event-${event.id}`,
        submittedAt: event.createdAt,
      });
    }
    return Response.json({ accepted: true, id: event.id, duplicate: !created }, { status: created ? 201 : 200 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
