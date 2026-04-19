import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/auth/access";
import {
  fetchEmails,
  fetchOldSpamEmails,
  fetchOldPromotionCandidates
} from "@/lib/gmail/gmail";
import { classifyEmailRules } from "@/lib/domain/classifier";
import { getEmailAgeInDays, isOlderThanDays } from "@/lib/domain/cleanup";
import { isOldPromoOrDeliveryClutter } from "@/lib/domain/clutter";
import type { DashboardData } from "@/lib/domain/types";

export async function GET() {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [emails, oldSpamEmails, oldPromotionCandidates] = await Promise.all([
    fetchEmails(accessToken),
    fetchOldSpamEmails(accessToken),
    fetchOldPromotionCandidates(accessToken)
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

  return NextResponse.json({
    approvalList,
    oldSpamDeleteList: Array.from(uniqueSpamMap.values()),
    oldPromoDeleteList: Array.from(uniquePromoMap.values())
  });
}