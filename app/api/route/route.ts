import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const url = process.env.DRIVESTYLE_SHEETS_WEBAPP_URL;
    const token = process.env.DRIVESTYLE_LEAD_TOKEN;

    if (!url || !token) {
      return NextResponse.json(
        { ok: false, error: "Missing .env.local settings (URL or TOKEN)" },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Honeypot spam trap (same field name as we used on the homepage)
    if (body.company) {
      return NextResponse.json({ ok: true });
    }

    const payload = {
      token,
      type: "route_finder",
      submittedAt: new Date().toISOString(),

      // contact
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",

      // route finder answers
      urgency: body.urgency || "",
      trigger: body.trigger || "",
      weekdayDrive: body.weekdayDrive || "",
      parking: body.parking || "",
      passengers: body.passengers || "",
      afterLongDay: body.afterLongDay || "",
      twoYears: body.twoYears || "",

      trade_space_vs_parking: body.trade_space_vs_parking || "",
      trade_performance_vs_economy: body.trade_performance_vs_economy || "",
      trade_new_vs_spec: body.trade_new_vs_spec || "",
      trade_badge_vs_reliability: body.trade_badge_vs_reliability || "",
      trade_tech_vs_simple: body.trade_tech_vs_simple || "",

      budgetBand: body.budgetBand || "",
      newVsUsed: body.newVsUsed || "",
      niceToHaves: Array.isArray(body.niceToHaves) ? body.niceToHaves.join("; ") : (body.niceToHaves || ""),
      notes: body.notes || "",
    };

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();

    return NextResponse.json(
      { ok: upstream.ok, upstreamStatus: upstream.status, upstreamBody: text },
      { status: upstream.ok ? 200 : 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
