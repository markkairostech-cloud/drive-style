import { NextResponse } from "next/server"
import { propertyEngine, type PropertyInput } from "@/lib/propertyEngine"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PropertyInput
    const result = propertyEngine(body)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Property advice error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate property advice right now.",
      },
      { status: 500 }
    )
  }
}