import { listCheckins } from "../../../db/checkins";
import { ensurePatientStorage, submitCheckin, type CheckinMood } from "../../../db/patients";

const VALID_MOODS: CheckinMood[] = ["good", "okay", "not_well", "voice"];

export async function GET() {
  await ensurePatientStorage();
  return Response.json({ checkins: await listCheckins() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      id?: string;
      patientId?: string;
      mood?: string;
      note?: string;
      source?: "web" | "native" | "watch";
      submittedAt?: string;
    };
    const patientId = payload.patientId?.trim() ?? "";
    const mood = payload.mood as CheckinMood;
    const note = payload.note?.trim() || undefined;
    if (!patientId) return Response.json({ error: "patientId is required" }, { status: 400 });
    if (!VALID_MOODS.includes(mood)) return Response.json({ error: "Invalid check-in mood" }, { status: 400 });

    const patient = await submitCheckin(patientId, mood, note, {
      source: payload.source ?? "web",
      clientEventId: payload.id?.trim() || undefined,
      submittedAt: payload.submittedAt,
    });
    if (!patient) return Response.json({ error: "Patient not found" }, { status: 404 });
    return Response.json({ patient }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
