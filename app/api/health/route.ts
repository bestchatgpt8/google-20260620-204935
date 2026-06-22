import { getPhase4Health } from "@/lib/phase2";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getPhase4Health());
}
