import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      name,
      tier,
      recommendation,
    } = body;

    console.log("Drive Style request:", {
      email,
      name,
      tier,
    });

    return NextResponse.json({
      success: true,
      message: "Recommendation request received",
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: "Could not process recommendation",
      },
      { status: 500 }
    );
  }
}