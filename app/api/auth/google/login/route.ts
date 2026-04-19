import { NextResponse } from "next/server";
import { createOAuthClient, GOOGLE_SCOPES } from "@/lib/auth/google";

export async function GET() {
  const oauth2 = createOAuthClient();

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES
  });

  return NextResponse.redirect(url);
}