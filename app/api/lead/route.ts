import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const url = process.env.DRIVESTYLE_SHEETS_WEBAPP_URL;
    const token = process.env.DRIVESTYLE_LEAD_TOKEN;

    if (!url || !token) {
      return NextResponse.json(
        { ok: false, error: "Missing environment variables (URL or TOKEN)" },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Spam trap
    if (body.company) {
      return NextResponse.json({ ok: true });
    }

    // ✅ Insert into Supabase using admin client
    const { data: insertedLead, error: leadError } = await supabaseAdmin
      .from("leads")
      .insert([
        {
          name: body.name || null,
          email: body.email || null,
          phone: body.phone || null,
          budget: body.budget || null,
          budget_type: body.budgetType || null,
          message: body.message || null,
          source: body.source || "quiz",
        },
      ])
      .select("id")
      .single();

    // ❗ Proper error handling (this was missing)
    if (leadError) {
      console.error("Lead insert error:", leadError);
      return NextResponse.json(
        { ok: false, error: leadError.message },
        { status: 500 }
      );
    }

    // ✅ Send to Google Sheets
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

    return NextResponse.json(
      {
        ok: upstream.ok,
        upstreamStatus: upstream.status,
        upstreamBody: text,
        leadId: insertedLead?.id || null,
      },
      { status: upstream.ok ? 200 : 502 }
    );
  } catch (err: any) {
    console.error("Lead route error:", err);

    return NextResponse.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}