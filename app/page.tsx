import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: 460 }}>
        <h1 className="title">Inbox Guardian</h1>

        <p className="subtitle" style={{ marginBottom: 24, lineHeight: 1.6 }}>
          Secure AI-powered Gmail cleanup with direct Google integration.
        </p>

        <a
          href="/api/auth/google/login"
          style={{
            display: "block",
            background: "black",
            color: "white",
            padding: "14px 16px",
            borderRadius: 14,
            textAlign: "center",
            marginBottom: 20
          }}
        >
          Continue with Google
        </a>

        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
          By continuing, you agree to our{" "}
          <a href="/terms" style={{ color: "#2563eb" }}>Terms</a>{" "}
          and{" "}
          <a href="/privacy" style={{ color: "#2563eb" }}>Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}