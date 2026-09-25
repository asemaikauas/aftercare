import { listEvents, parseEvent, recordEvent } from "../../../db/events";

export async function GET() {
  try {
    const events = await listEvents();
    return Response.json({ events }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const event = parseEvent(await request.json());
    if (!event) {
      return Response.json(
        { error: "Expected an event for a known patient" },
        { status: 400 },
      );
    }
    await recordEvent(event);
    return Response.json({ accepted: true, id: event.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
