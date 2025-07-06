import { NextRequest, NextResponse } from "next/server";
import { getPayloadHMR } from "@payloadcms/next/utilities";
import configPromise from "@payload-config";

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config: configPromise });
    const { disputeId } = await req.json();

    if (!disputeId) {
      return NextResponse.json({ error: "Dispute ID is required" }, { status: 400 });
    }

    // Update the dispute to mark funds as released
    await payload.update({
      collection: "disputes",
      id: disputeId,
      data: {
        fundsReleased: true,
      },
    });

    console.log(`[Mark Funds Released API] Successfully marked funds as released for dispute ${disputeId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[Mark Funds Released API] Error:`, error);
    return NextResponse.json(
      { error: "Failed to mark funds as released" },
      { status: 500 }
    );
  }
}
