import { NextResponse } from "next/server";
import { getVehicleCatalog } from "@/lib/vehicleCatalog";
import { generateAdvice } from "@/lib/driveStyleEngine";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const catalog = getVehicleCatalog();
   
    // For now we just generate advice from the brief.
    // Next step will be budget filtering + passing candidates into the engine.
    const advice = generateAdvice(body);

    return NextResponse.json(advice);
  } catch (error) {
    console.error("Advice generation failed:", error);
    return NextResponse.json({ error: "Advice generation failed." }, { status: 500 });
  }
}