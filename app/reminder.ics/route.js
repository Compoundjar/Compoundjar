import { buildIcs } from "../../lib/ics.js";
import { requestOrigin } from "../../lib/http.js";
import { parsePlan } from "../../lib/plan.js";

export async function GET(request) {
  const plan = parsePlan(request.nextUrl.searchParams);
  const origin = requestOrigin(request.headers);
  const body = buildIcs({
    plan,
    origin,
    startDate: request.nextUrl.searchParams.get("d"),
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="compound-jar.ics"',
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
