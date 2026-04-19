import type { EmailCategory, GmailEmail } from "@/lib/domain/types";

const spamKeywords = [
  "lottery",
  "claim prize",
  "winner",
  "win money",
  "urgent response",
  "free crypto"
];

const promoKeywords = [
  "sale",
  "discount",
  "offer",
  "limited time",
  "deal",
  "promo",
  "coupon",
  "unsubscribe"
];

const importantKeywords = [
  "invoice",
  "payment",
  "meeting",
  "interview",
  "bank",
  "security alert",
  "verification",
  "work",
  "project"
];

export function classifyEmailRules(email: GmailEmail): EmailCategory {
  const text = `${email.subject} ${email.snippet} ${email.from || ""}`.toLowerCase();

  if (spamKeywords.some((k) => text.includes(k))) return "SPAM";
  if (importantKeywords.some((k) => text.includes(k))) return "IMPORTANT";
  if (promoKeywords.some((k) => text.includes(k))) return "PROMOTION";

  return "UNKNOWN";
}