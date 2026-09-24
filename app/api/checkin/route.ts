import { submitCheckin, type CheckinMood } from "../../../db/patients";

const VALID_MOODS: CheckinMood[] = ["good", "okay", "not_well"];

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { patientId?: string; mood?: string; note?: string };
    const patientId = payload.patientId?.trim() ?? "";
    const mood = payload.mood as CheckinMood;
    const note = payload.note?.trim() || undefined;

    if (!patientId) {
      return Response.json({ error: "patientId is required" }, { status: 400 });
    }
    if (!VALID_MOODS.includes(mood)) {
      return Response.json({ error: "mood must be one of: good, okay, not_well" }, { status: 400 });
    }

    const patient = await submitCheckin(patientId, mood, note);
    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json({ patient });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
