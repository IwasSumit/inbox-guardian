import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionData } from "@/lib/domain/types";
import { env } from "@/lib/utils/env";

const secret = new TextEncoder().encode(env.SESSION_SECRET);
const COOKIE_NAME = "inbox_guardian_session";

export async function createSession(data: SessionData) {
  const token = await new SignJWT(data as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/"
  });
}

export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}