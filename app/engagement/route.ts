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

    // Required fields for an engagement
    const tier = body.tier || "";
    const name = body.name || "";
    const email = body.email || "";
    const phone = body.phone || "";

    if (!tier || !name || !email || !phone) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields (tier, name, email, phone)" },
        { status: 400 }
      );
    }

    const payload = {
      token,
      submittedAt: new Date().toISOString(),

      // NEW: tell Apps Script which tab to write to
      tab: "Engagements",

      // engagement fields
      tier,
      amount: body.amount || body.amount_gross || "",
      m_payment_id: body.m_payment_id || "",
      name,
      email,
      phone,

      source: body.source || "engagement",
      meta: body.meta || "",
    };

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();

    return NextResponse.json(
      {
        ok: upstream.ok,
        upstreamStatus: upstream.status,
        upstreamBody: text,
      },
      { status: upstream.ok ? 200 : 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}