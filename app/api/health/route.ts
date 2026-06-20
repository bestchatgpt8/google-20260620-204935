export const dynamic = "force-static";

export function GET() {
  return Response.json({
    ok: true,
    service: "googlesql-web",
    phase: "phase-1"
  });
}
