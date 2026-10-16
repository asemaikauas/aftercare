// Disabled: the route had no auth, so anyone with the URL could spend the OpenAI key.
// It never reads OPENAI_API_KEY now. Restore it from git history once callers are authenticated.
export async function POST() {
  return Response.json(
    { error: "Voice transcription is turned off. Please type your check-in instead." },
    { status: 503 }
  );
}
