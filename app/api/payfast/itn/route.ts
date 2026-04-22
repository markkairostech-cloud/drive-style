import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    console.log("PayFast ITN received:");
    console.log(body);

    // Always respond 200 OK to PayFast
    return new NextResponse("OK", { status: 200 });

  } catch (err: any) {
    console.error("ITN error:", err?.message || err);
    return new NextResponse("Error", { status: 500 });
  }
}