import { NextResponse } from "next/server";
import crypto from "crypto";

type PlanTier = "Silver" | "Gold" | "Platinum";

const PLAN_PRICES_ZAR: Record<PlanTier, number> = {
  Silver: 10,
  Gold: 20,
  Platinum: 30,
};

function pfHost(mode: string | undefined) {
  return mode === "live" ? "www.payfast.co.za" : "sandbox.payfast.co.za";
}

function buildSignature(params: Record<string, string>, passphrase?: string) {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`);

  let paramString = entries.join("&");
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  }

  return crypto.createHash("md5").update(paramString).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tier = body?.tier as PlanTier;
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();

    if (!tier || !(tier in PLAN_PRICES_ZAR)) {
      return new NextResponse("Invalid tier", { status: 400 });
    }
    if (!name || !email || !phone) {
      return new NextResponse("Missing contact details", { status: 400 });
    }

    const merchant_id = process.env.PAYFAST_MERCHANT_ID || "";
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY || "";
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    const mode = process.env.PAYFAST_MODE || "sandbox";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

    if (!merchant_id || !merchant_key || !siteUrl) {
      return new NextResponse("Server not configured", { status: 500 });
    }

    const amount = PLAN_PRICES_ZAR[tier].toFixed(2);

    const m_payment_id = `ds_${tier.toLowerCase()}_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;

    const return_url = `${siteUrl}/engagement/success?m_payment_id=${encodeURIComponent(m_payment_id)}`;
    const cancel_url = `${siteUrl}/engagement/cancel?m_payment_id=${encodeURIComponent(m_payment_id)}`;
    const notify_url = `${siteUrl}/api/payfast/itn`; // we will build this later (after we wire UI)

    const params: Record<string, string> = {
      merchant_id,
      merchant_key,
      return_url,
      cancel_url,
      notify_url,

      m_payment_id,
      amount,

      item_name: `Drive Style ${tier}`,
      item_description: `${tier} concierge engagement`,

      email_address: email,
      name_first: name,

      custom_str1: tier,
      custom_str2: phone,
      custom_str3: email,
      custom_str4: name,
    };

    const signature = buildSignature(params, passphrase || undefined);

    const base = `https://${pfHost(mode)}/eng/process`;
    const redirectUrl =
      base +
      "?" +
      Object.entries({ ...params, signature })
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&");

    return NextResponse.json({ redirectUrl });
  } catch {
    return new NextResponse("Bad request", { status: 400 });
  }
}