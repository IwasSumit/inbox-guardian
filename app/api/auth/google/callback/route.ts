import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";
import { google } from "googleapis";
import { env } from "@/lib/utils/env";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", env.APP_URL));
  }

  const oauth2 = createOAuthClient();
  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);

  const oauth2Api = google.oauth2({ version: "v2", auth: oauth2 });
  const userInfo = await oauth2Api.userinfo.get();

  await createSession({
    email: userInfo.data.email || "",
    name: userInfo.data.name || undefined,
    picture: userInfo.data.picture || undefined,
    accessToken: tokens.access_token || "",
    refreshToken: tokens.refresh_token || undefined,
    expiryDate: tokens.expiry_date || undefined
  });

  return NextResponse.redirect(new URL("/dashboard", env.APP_URL));
}