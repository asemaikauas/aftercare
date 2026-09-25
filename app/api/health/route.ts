export function GET() {
  return Response.json(
    { service: "careminute-api", database: "D1", status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
