import { google } from "googleapis";
import type { GmailEmail } from "@/lib/domain/types";
import { createOAuthClient } from "@/lib/auth/google";

function getGmailClient(accessToken: string) {
  const oauth2 = createOAuthClient();
  oauth2.setCredentials({ access_token: accessToken });

  return google.gmail({ version: "v1", auth: oauth2 });
}

export async function refreshAccessToken(refreshToken: string) {
  const oauth2 = createOAuthClient();
  oauth2.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2.refreshAccessToken();
  return credentials;
}

async function fetchEmailsByQuery(
  accessToken: string,
  query: string,
  maxResults = 300
): Promise<GmailEmail[]> {
  const gmail = getGmailClient(accessToken);

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults
  });

  const messages = listRes.data.messages || [];
  const results: GmailEmail[] = [];

  for (const msg of messages) {
    if (!msg.id) continue;

    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From"]
    });

    const headers = detail.data.payload?.headers || [];
    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const internalDate = detail.data.internalDate
      ? Number(detail.data.internalDate)
      : undefined;

    results.push({
      id: msg.id,
      subject,
      from,
      snippet: detail.data.snippet || "",
      internalDate
    });
  }

  return results;
}

export async function fetchEmails(accessToken: string): Promise<GmailEmail[]> {
  return fetchEmailsByQuery(accessToken, "-in:chats", 100);
}

export async function fetchOldSpamEmails(accessToken: string) {
  return fetchEmailsByQuery(accessToken, "in:spam older_than:5d", 500);
}

export async function fetchOldPromotionCandidates(accessToken: string) {
  return fetchEmailsByQuery(accessToken, "older_than:60d", 500);
}

export async function deleteEmail(accessToken: string, messageId: string) {
  const gmail = getGmailClient(accessToken);

  await gmail.users.messages.trash({
    userId: "me",
    id: messageId
  });
}

async function getSingleLabelCount(
  accessToken: string,
  labelId: string
): Promise<number> {
  const gmail = getGmailClient(accessToken);

  try {
    const res = await gmail.users.labels.get({
      userId: "me",
      id: labelId
    });

    return res.data.messagesTotal || 0;
  } catch {
    return 0;
  }
}

export async function fetchPromotionMessageIds(
  accessToken: string,
  maxResults = 500
): Promise<string[]> {
  const gmail = getGmailClient(accessToken);

  const res = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["CATEGORY_PROMOTIONS"],
    maxResults
  });

  return (res.data.messages || [])
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id));
}

export async function fetchSpamMessageIds(
  accessToken: string,
  maxResults = 500
): Promise<string[]> {
  const gmail = getGmailClient(accessToken);

  const res = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["SPAM"],
    maxResults
  });

  return (res.data.messages || [])
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id));
}

export async function getLabelCounts(accessToken: string) {
  const [inbox, spam, promotions, important] = await Promise.all([
    getSingleLabelCount(accessToken, "INBOX"),
    getSingleLabelCount(accessToken, "SPAM"),
    getSingleLabelCount(accessToken, "CATEGORY_PROMOTIONS"),
    getSingleLabelCount(accessToken, "IMPORTANT")
  ]);

  return {
    inbox,
    spam,
    promotions,
    important
  };
}