import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { env } from "@/lib/utils/env";

export async function GET() {
  await clearSession();
  return NextResponse.redirect(new URL("/", env.APP_URL));
}