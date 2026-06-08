import { NextResponse } from "next/server";
import { pdf } from "@react-pdf/renderer";
import DriveStyleReport from "@/components/pdf/DriveStyleReport";
import { resend } from "@/lib/resend";
import { buildNarrative } from "@/lib/narratives/storyBuilder";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      name,
      tier,
      recommendation,
    } = body;

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

    const narrative = buildNarrative({
      family: recommendation?.answers?.family,
      imagePriority: recommendation?.answers?.imagePriority,
      drivingExcitement: recommendation?.answers?.drivingExcitement,
    });

    const pdfBlob = await pdf(
      <DriveStyleReport
        customerName={name}
        tier={tier || "Drive Style"}
        narrative={narrative}
        advice={recommendation}
      />
    ).toBlob();

    const pdfBuffer = Buffer.from(
      await pdfBlob.arrayBuffer()
    );

    const topVehicle =
      recommendation?.models?.[0]?.name ||
      "Your Top Recommendation";

    const verdict =
      recommendation?.verdict ||
      "Your personalised Drive Style recommendation is attached.";

    await resend.emails.send({
      from: "DriveStyle <hello@drive-style.co.za>",
      to: [email],
      subject: "Your DriveStyle Recommendation is Ready",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;padding:20px;">
          
          <h1 style="color:#0f172a;">
            Your DriveStyle Recommendation
          </h1>

          <p>
            Hi ${name || "there"},
          </p>

          <p>
            Thank you for using DriveStyle.
          </p>

          <p>
            Based on your answers, we've generated your personalised vehicle recommendation.
          </p>

          <hr />

          <h2>Drive Style Profile</h2>
          <p><strong>${narrative.archetype}</strong></p>

          <p>
            ${narrative.identitySummary}
          </p>

          <h2>Top Recommendation</h2>
          <p>
            <strong>${topVehicle}</strong>
          </p>

          <h2>DriveStyle Verdict</h2>
          <p>
            ${verdict}
          </p>

          <hr />

          <p>
            Your full personalised PDF report is attached.
          </p>

          <p>
            Drive confidently,<br/>
            <strong>The DriveStyle Team</strong><br/>
            www.drive-style.co.za
          </p>

        </div>
      `,
      attachments: [
        {
          filename: "DriveStyle-Recommendation.pdf",
          content: pdfBuffer,
        },
      ],
    });

    console.log("Drive Style email sent:", {
      email,
      name,
      vehicle: topVehicle,
    });

    return NextResponse.json({
      success: true,
      message: "Recommendation sent successfully",
    });
  } catch (e: any) {
    console.error(
      "Recommendation send error:",
      e?.message || e
    );

    return NextResponse.json(
      {
        success: false,
        error: "Could not send recommendation",
      },
      { status: 500 }
    );
  }
}