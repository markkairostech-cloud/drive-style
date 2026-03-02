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

    // spam trap
if (body.company) {
  return NextResponse.json({ ok: true });
}


    const payload = {
      token,
      submittedAt: new Date().toISOString(),
      name: body.name || "",
      email: body.email || "",
      phone: body.phone || "",
      budget: body.budget || "",
      message: body.message || "",
      source: body.source || "unknown",
    };

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await upstream.text();

    return NextResponse.json({
      ok: upstream.ok,
      upstreamStatus: upstream.status,
      upstreamBody: text,
    }, { status: upstream.ok ? 200 : 502 });

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
