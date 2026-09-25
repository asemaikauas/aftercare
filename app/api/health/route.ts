export function GET() {
  return Response.json(
    { service: "careminute", storage: "shared" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
