"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "@/lib/domain/types";

type DashboardState = DashboardData;

export default function DashboardClient({ userName }: { userName: string }) {
  const [data, setData] = useState<DashboardState>({
    stats: {
      total: 0,
      spam: 0,
      promotion: 0,
      important: 0,
      unknown: 0
    },
    approvalList: [],
    oldSpamDeleteList: [],
    oldPromoDeleteList: []
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);

  const [spamDeleting, setSpamDeleting] = useState(false);
  const [promoDeleting, setPromoDeleting] = useState(false);
  const [singleDeleteLoadingId, setSingleDeleteLoadingId] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard-stats");
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(json.error || "Failed to load stats");
      }

      setData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          ...json.stats
        }
      }));
    } catch (err: any) {
      setError(err.message || "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadReviewData = async () => {
    try {
      setReviewLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard-review");
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(json.error || "Failed to load review data");
      }

      setData((prev) => ({
        ...prev,
        approvalList: json.approvalList || [],
        oldSpamDeleteList: json.oldSpamDeleteList || [],
        oldPromoDeleteList: json.oldPromoDeleteList || [],
        stats: {
          ...prev.stats,
          unknown: (json.approvalList || []).filter(
            (e: any) => e.category === "UNKNOWN"
          ).length
        }
      }));
    } catch (err: any) {
      setError(err.message || "Failed to load review data");
    } finally {
      setReviewLoading(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadStats(), loadReviewData()]);
  };

  const autoCleanSpam = async () => {
    if (reviewLoading || spamDeleting) return;

    const ids = data.oldSpamDeleteList.map((e) => e.id);
    if (ids.length === 0) {
      setSuccess("No old spam mails to delete.");
      return;
    }

    try {
      setSpamDeleting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch("/api/auto-clean", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messageIds: ids
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to delete old spam emails");
      }

      setSuccess(`${json.deleted} spam mails deleted successfully.`);
      await reloadAll();
    } catch (err: any) {
      setError(err.message || "Failed to delete old spam emails");
    } finally {
      setSpamDeleting(false);
    }
  };

  const autoCleanPromo = async () => {
    if (reviewLoading || promoDeleting) return;

    const ids = data.oldPromoDeleteList.map((e) => e.id);
    if (ids.length === 0) {
      setSuccess("No old promotional or delivery mails to delete.");
      return;
    }

    try {
      setPromoDeleting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch("/api/auto-clean-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messageIds: ids
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to delete old promotional/delivery emails");
      }

      setSuccess(`${json.deleted} promotional/delivery mails deleted successfully.`);
      await reloadAll();
    } catch (err: any) {
      setError(err.message || "Failed to delete old promotional/delivery emails");
    } finally {
      setPromoDeleting(false);
    }
  };

  const approveDelete = async (messageId: string) => {
  if (singleDeleteLoadingId) return;

  try {
    setSingleDeleteLoadingId(messageId);
    setError(null);
    setSuccess(null);

    const previousData = data;

    const updatedApprovalList = data.approvalList.filter(
      (email) => email.id !== messageId
    );

    setData({
      ...data,
      approvalList: updatedApprovalList,
      stats: {
        ...data.stats,
        unknown: updatedApprovalList.filter((e) => e.category === "UNKNOWN").length
      }
    });

    const res = await fetch("/api/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messageId })
    });

    const json = await res.json();

    if (!res.ok) {
      setData(previousData);
      throw new Error(json.error || "Failed to delete email");
    }

    setSuccess("Mail deleted successfully.");

    // Refresh only fast stats in background; do NOT block UI on heavy review reload
    loadStats();
  } catch (err: any) {
    setError(err.message || "Failed to delete email");
  } finally {
    setSingleDeleteLoadingId(null);
  }
};

  useEffect(() => {
    reloadAll();
  }, []);

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, error]);

  return (
    <>
      {(success || error) && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 9999,
            minWidth: 280,
            maxWidth: 420,
            background: success ? "#dcfce7" : "#fee2e2",
            color: success ? "#166534" : "#b91c1c",
            padding: 16,
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}
        >
          {success || error}
        </div>
      )}

      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32
            }}
          >
            <div>
              <h1 style={{ fontSize: 42, color: "black", marginBottom: 8 }}>
                Inbox Guardian
              </h1>
              <p style={{ color: "#475569" }}>Welcome, {userName}</p>
            </div>
            <a
              href="/api/auth/google/logout"
              style={{
                background: "white",
                border: "1px solid #cbd5e1",
                padding: "12px 18px",
                borderRadius: 14,
                color: "black"
              }}
            >
              Logout
            </a>
          </div>

          {(statsLoading || reviewLoading) && (
            <p>
              {statsLoading && reviewLoading
                ? "Loading dashboard..."
                : statsLoading
                ? "Loading stats..."
                : "Loading review data..."}
            </p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 16,
              marginBottom: 24
            }}
          >
            <Card title="Total Emails" value={data.stats.total} />
            <Card title="Spam" value={data.stats.spam} />
            <Card title="Promotions" value={data.stats.promotion} />
            <Card title="Important" value={data.stats.important} />
            <Card title="Unknown" value={data.stats.unknown} />
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 24,
              marginBottom: 24
            }}
          >
            <h2 style={{ fontSize: 24, color: "black", marginBottom: 16 }}>
              Auto Clean
            </h2>

            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 16
              }}
            >
              <button
                onClick={autoCleanSpam}
                disabled={reviewLoading || spamDeleting}
                style={{
                  background: reviewLoading || spamDeleting ? "#fca5a5" : "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 14,
                  cursor: reviewLoading || spamDeleting ? "not-allowed" : "pointer",
                  opacity: reviewLoading || spamDeleting ? 0.7 : 1
                }}
              >
                {spamDeleting
                  ? "Deleting Spam..."
                  : `Delete Old Spam (${data.oldSpamDeleteList.length})`}
              </button>

              <button
                onClick={autoCleanPromo}
                disabled={reviewLoading || promoDeleting}
                style={{
                  background: reviewLoading || promoDeleting ? "#fdba74" : "#f97316",
                  color: "white",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 14,
                  cursor: reviewLoading || promoDeleting ? "not-allowed" : "pointer",
                  opacity: reviewLoading || promoDeleting ? 0.7 : 1
                }}
              >
                {promoDeleting
                  ? "Deleting Promo & Delivery..."
                  : `Delete Old Promo & Delivery (${data.oldPromoDeleteList.length})`}
              </button>
            </div>

            <p style={{ color: "#475569" }}>
              Old spam is deleted after 5 days. Old promotional and low-value delivery/ride/order mails are deleted after 60 days.
            </p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 24
            }}
          >
            <h2
              style={{
                fontSize: 24,
                marginBottom: 16,
                color: "black"
              }}
            >
              Approval Required
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16
              }}
            >
              {data.approvalList.length === 0 && !reviewLoading && (
                <p style={{ color: "#64748b" }}>
                  No emails need approval.
                </p>
              )}

              {data.approvalList.map((email) => (
                <div
                  key={email.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontWeight: 600,
                        color: "black",
                        marginBottom: 6
                      }}
                    >
                      {email.subject || "(No subject)"}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#475569",
                        marginBottom: 8
                      }}
                    >
                      {email.snippet}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {email.category && (
                        <span
                          style={{
                            fontSize: 12,
                            background: "#e2e8f0",
                            padding: "4px 8px",
                            borderRadius: 9999,
                            color: "black"
                          }}
                        >
                          {email.category}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          background: "#f1f5f9",
                          padding: "4px 8px",
                          borderRadius: 9999,
                          color: "#334155"
                        }}
                      >
                        {email.ageDays} day(s) old
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => approveDelete(email.id)}
                      disabled={singleDeleteLoadingId === email.id}
                      style={{
                        background: "black",
                        color: "white",
                        border: "none",
                        padding: "12px 18px",
                        borderRadius: 14,
                        cursor: singleDeleteLoadingId === email.id ? "not-allowed" : "pointer",
                        opacity: singleDeleteLoadingId === email.id ? 0.7 : 1
                      }}
                    >
                      {singleDeleteLoadingId === email.id
                        ? "Deleting..."
                        : "Approve Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ background: "white", borderRadius: 20, padding: 20 }}>
      <p style={{ color: "#64748b", fontSize: 14 }}>{title}</p>
      <p style={{ fontSize: 36, fontWeight: 700, marginTop: 8, color: "black" }}>
        {value}
      </p>
    </div>
  );
}