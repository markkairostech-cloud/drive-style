import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const payment_status = params.get("payment_status");
    const m_payment_id = params.get("m_payment_id");
    const amount = params.get("amount_gross");
    const tier = params.get("custom_str1");
    const phone = params.get("custom_str2");
    const email = params.get("custom_str3");
    const name = params.get("custom_str4");

    const supabase = getSupabaseAdmin();

    await supabase.from("payments").upsert(
        {
            m_payment_id,
            tier,
            name,
            email,
            phone,
            amount,
            status: payment_status,
        },
        {
            onConflict: "m_payment_id",
        }
    );

    console.log("Payment saved:", m_payment_id);

    return new NextResponse("OK", { status: 200 });

  } catch (err: any) {
    console.error("ITN error:", err?.message || err);
    return new NextResponse("Error", { status: 500 });
  }
}