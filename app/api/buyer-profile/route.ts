import { NextResponse } from "next/server"
import { propertyEngine, type PropertyInput } from "@/lib/propertyEngine"
import { buildBuyerProfile } from "@/lib/buyerProfileBuilder"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PropertyInput
    const result = propertyEngine(body)
    const buyerProfile = buildBuyerProfile(body, result)

    return NextResponse.json({
      success: true,
      buyerProfile,
      result,
    })
  } catch (error) {
    console.error("Buyer profile error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate buyer profile right now.",
      },
      { status: 500 }
    )
  }
}