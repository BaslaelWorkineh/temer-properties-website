import type { NextRequest } from "next/server";
import { checkBookableDate, getSlotAvailability } from "@/lib/booking";

/** GET /api/availability?date=YYYY-MM-DD -> remaining capacity per visit slot. */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const headers = { "Cache-Control": "no-store" };
  const check = checkBookableDate(date);
  if (!check.ok) return Response.json({ date, open: false, message: check.message, slots: [] }, { headers });
  return Response.json({ date, open: true, slots: await getSlotAvailability(date) }, { headers });
}
