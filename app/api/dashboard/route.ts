import { NextResponse } from "next/server";
import { getSession, createSession } from "@/lib/auth/session";
import {
  fetchEmails,
  fetchOldSpamEmails,
  fetchOldPromotionCandidates,
  refreshAccessToken,
  getLabelCounts
} from "@/lib/gmail/gmail";
import { classifyEmailRules } from "@/lib/domain/classifier";
import { getEmailAgeInDays, isOlderThanDays } from "@/lib/domain/cleanup";
import { isOldPromoOrDeliveryClutter } from "@/lib/domain/clutter";
import type { DashboardData } from "@/lib/domain/types";

export async function GET() {
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

  const [emails, oldSpamEmails, oldPromotionCandidates, labelCounts] =
    await Promise.all([
      fetchEmails(accessToken),
      fetchOldSpamEmails(accessToken),
      fetchOldPromotionCandidates(accessToken),
      getLabelCounts(accessToken)
    ]);

  const approvalList: DashboardData["approvalList"] = [];
  const oldSpamDeleteList: DashboardData["oldSpamDeleteList"] = [];
  const oldPromoDeleteList: DashboardData["oldPromoDeleteList"] = [];

  for (const email of emails) {
    const category = classifyEmailRules(email);
    const ageDays = getEmailAgeInDays(email);

    if (category === "PROMOTION" || category === "UNKNOWN") {
      approvalList.push({
        ...email,
        category,
        ageDays
      });
    }
  }

  for (const spamEmail of oldSpamEmails) {
    oldSpamDeleteList.push({
      ...spamEmail,
      category: "SPAM",
      ageDays: getEmailAgeInDays(spamEmail)
    });
  }

  for (const email of oldPromotionCandidates) {
    const ageDays = getEmailAgeInDays(email);

    if (isOlderThanDays(email, 60) && isOldPromoOrDeliveryClutter(email)) {
      oldPromoDeleteList.push({
        ...email,
        category: "OLD_CLUTTER",
        ageDays
      });
    }
  }

  const uniqueSpamMap = new Map(
    oldSpamDeleteList.map((email) => [email.id, email])
  );
  const uniquePromoMap = new Map(
    oldPromoDeleteList.map((email) => [email.id, email])
  );

  const stats: DashboardData["stats"] = {
    total: labelCounts.inbox,
    spam: labelCounts.spam,
    promotion: labelCounts.promotions,
    important: labelCounts.important,
    unknown: approvalList.filter((e) => e.category === "UNKNOWN").length
  };

  return NextResponse.json({
    stats,
    approvalList,
    oldSpamDeleteList: Array.from(uniqueSpamMap.values()),
    oldPromoDeleteList: Array.from(uniquePromoMap.values())
  });
}