import type { GmailEmail } from "@/lib/domain/types";

export function getEmailAgeInDays(email: GmailEmail): number {
  if (!email.internalDate) return 0;

  const now = Date.now();
  const diffMs = now - email.internalDate;

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isOlderThanDays(email: GmailEmail, days: number): boolean {
  return getEmailAgeInDays(email) > days;
}