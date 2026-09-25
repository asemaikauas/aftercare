import { markCheckinReviewed } from "../../../../db/checkins";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = (await request.json().catch(() => ({}))) as { reviewedBy?: string };
    if (!id) return Response.json({ error: "Check-in id is required" }, { status: 400 });
    return Response.json(await markCheckinReviewed(id, payload.reviewedBy?.trim() || "Current clinician"));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
