export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          background: "white",
          padding: 32,
          borderRadius: 20,
          width: "100%",
          maxWidth: 420
        }}
      >
        <h1 style={{ fontSize: 42, color: "black", marginBottom: 12 }}>
          Inbox Guardian
        </h1>
        <p style={{ color: "#475569", marginBottom: 24 }}>
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
            textAlign: "center"
          }}
        >
          Continue with Google
        </a>
      </div>
    </main>
  );
}