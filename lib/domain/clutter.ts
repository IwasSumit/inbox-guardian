import type { GmailEmail } from "@/lib/domain/types";

const clutterSenders = [
  "swiggy",
  "zomato",
  "ola",
  "uber",
  "rapido",
  "amazon",
  "flipkart",
  "myntra",
  "blinkit",
  "zepto",
  "bigbasket",
  "bookmyshow",
  "dominos",
  "pizzahut",
  "faasos",
  "instamart"
];

const positiveKeywords = [
  "delivered",
  "order delivered",
  "your order",
  "order confirmed",
  "order shipped",
  "out for delivery",
  "ride completed",
  "trip receipt",
  "payment receipt",
  "invoice",
  "bill",
  "rate your order",
  "your delivery",
  "offer",
  "discount",
  "coupon",
  "sale",
  "deal",
  "promotion",
  "promo"
];

const negativeProtectionKeywords = [
  "refund",
  "return",
  "replacement",
  "failed payment",
  "dispute",
  "account issue",
  "login",
  "password",
  "security",
  "otp",
  "verification",
  "warranty",
  "support ticket",
  "fraud",
  "alert"
];

export function isOldPromoOrDeliveryClutter(email: GmailEmail): boolean {
  const text = `${email.subject} ${email.snippet} ${email.from || ""}`.toLowerCase();

  const senderMatched = clutterSenders.some((s) => text.includes(s));
  const positiveMatched = positiveKeywords.some((k) => text.includes(k));
  const negativeMatched = negativeProtectionKeywords.some((k) => text.includes(k));

  return (senderMatched || positiveMatched) && !negativeMatched;
}