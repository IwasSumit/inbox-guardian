import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth/access";
import { getLabelCounts } from "@/lib/gmail/gmail";

export async function GET() {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const labelCounts = await getLabelCounts(accessToken);

  return NextResponse.json({
    stats: {
      total: labelCounts.inbox,
      spam: labelCounts.spam,
      promotion: labelCounts.promotions,
      important: labelCounts.important,
      unknown: 0
    }
  });
}