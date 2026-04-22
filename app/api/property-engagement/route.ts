import { NextResponse } from "next/server"
import type { PropertyPackageKey } from "@/lib/propertyPackages"

type PropertyEngagementPayload = {
  packageKey: PropertyPackageKey
  source?: string
  buyerType?: string
  location?: string
  budget?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PropertyEngagementPayload

    if (!body.packageKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Package key is required.",
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Property engagement captured.",
      engagement: {
        packageKey: body.packageKey,
        source: body.source ?? "property-results",
        buyerType: body.buyerType ?? "",
        location: body.location ?? "",
        budget: body.budget ?? "",
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Property engagement error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Unable to capture property engagement right now.",
      },
      { status: 500 }
    )
  }
}