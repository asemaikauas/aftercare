export async function GET() {
  return Response.json({ service: "careminute-api", database: "D1", status: "ok" });
}
