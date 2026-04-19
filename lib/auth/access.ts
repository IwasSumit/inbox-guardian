import { getSession, createSession } from "@/lib/auth/session";
import { refreshAccessToken } from "@/lib/gmail/gmail";

export async function getValidAccessToken() {
  const session = await getSession();

  if (!session) {
    return null;
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

  return accessToken;
}