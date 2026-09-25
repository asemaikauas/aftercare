import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  try {
    const apiKey = (env as { OPENAI_API_KEY?: string }).OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Transcription is not configured. Set OPENAI_API_KEY in .dev.vars (see .dev.vars.example)." },
        { status: 500 }
      );
    }

    const incoming = await request.formData();
    const audio = incoming.get("audio");
    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ error: "No audio provided" }, { status: 400 });
    }

    const filename = audio instanceof File && audio.name ? audio.name : "checkin.webm";
    const upstream = new FormData();
    upstream.append("file", audio, filename);
    upstream.append("model", "gpt-4o-mini-transcribe");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });

    if (!response.ok) {
      const detail = await response.text();
      return Response.json({ error: `Transcription failed: ${detail.slice(0, 300)}` }, { status: 502 });
    }

    const result = (await response.json()) as { text?: string };
    const transcript = result.text?.trim() ?? "";
    if (!transcript) {
      return Response.json({ error: "No speech detected" }, { status: 422 });
    }

    return Response.json({ transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
