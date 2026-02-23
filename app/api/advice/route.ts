import { NextResponse } from "next/server";
import { generateAdvice, BriefInput } from "@/lib/driveStyleEngine";

export async function POST(req: Request) {
  const input = (await req.json()) as BriefInput;

  if (!input?.passengers || !input?.distance || !input?.environment) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const advice = generateAdvice(input);
  return NextResponse.json({ ok: true, advice });
}
