import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: process.env.PAYFAST_MODE || null,
    hasMerchantId: !!process.env.PAYFAST_MERCHANT_ID,
    hasMerchantKey: !!process.env.PAYFAST_MERCHANT_KEY,
    hasPassphrase: !!process.env.PAYFAST_PASSPHRASE,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
  });
}