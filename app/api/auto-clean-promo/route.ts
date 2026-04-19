import { NextRequest, NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth/session";
import { deleteEmail, refreshAccessToken } from "@/lib/gmail/gmail";

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let accessToken = session.accessToken;

  if (session.refreshToken) {
    const refreshed = await refreshAccessToken(session.refreshToken);

    if (refreshed.access_token) {
      accessToken = refreshed.access_token;
      await createSession({
        ...session,
        accessToken,
        refreshToken: refreshed.refresh_token || session.refreshToken,
        expiryDate: refreshed.expiry_date || session.expiryDate
      });
    }
  }

  const body = await req.json();
  const messageIds: string[] = body.messageIds || [];

  for (const id of messageIds) {
    await deleteEmail(accessToken, id);
  }

  return NextResponse.json({
    success: true,
    deleted: messageIds.length
  });
}