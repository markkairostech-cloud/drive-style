import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import DriveStyleReport from "@/components/pdf/DriveStyleReport";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, name, tier, recommendation, narrative } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing email address",
        },
        { status: 400 }
      );
    }

    if (!recommendation) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing recommendation",
        },
        { status: 400 }
      );
    }

    const pdfBlob = await pdf(
      <DriveStyleReport
        customerName={name}
        tier={tier || "Drive Style"}
        narrative={narrative}
        advice={recommendation}
      />
    ).toBlob();

    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer());

    console.log("Drive Style PDF generated:", {
      email,
      name,
      tier,
      bytes: pdfBuffer.length,
    });

    return NextResponse.json({
      success: true,
      message: "PDF generated successfully",
      pdfBytes: pdfBuffer.length,
    });
  } catch (e: any) {
    console.error("Recommendation send error:", e?.message || e);

    return NextResponse.json(
      {
        success: false,
        error: "Could not process recommendation",
      },
      { status: 500 }
    );
  }
}