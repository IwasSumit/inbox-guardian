export type GmailEmail = {
  id: string;
  subject: string;
  snippet: string;
  from?: string;
  internalDate?: number;
};

export type EmailCategory =
  | "SPAM"
  | "PROMOTION"
  | "IMPORTANT"
  | "UNKNOWN"
  | "OLD_CLUTTER";

export type DashboardData = {
  stats: {
    total: number;
    spam: number;
    promotion: number;
    important: number;
    unknown: number;
  };
  approvalList: (GmailEmail & { category: EmailCategory; ageDays: number })[];
  oldSpamDeleteList: (GmailEmail & { category: "SPAM"; ageDays: number })[];
  oldPromoDeleteList: (GmailEmail & { category: "OLD_CLUTTER"; ageDays: number })[];
  allPromoDeleteList: (GmailEmail & { category: "OLD_CLUTTER"; ageDays: number })[];
};

export type SessionData = {
  email: string;
  name?: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  expiryDate?: number;
};