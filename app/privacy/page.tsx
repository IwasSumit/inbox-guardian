export default function Privacy() {
  return (
    <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1>Privacy Policy</h1>

      <p>
        Inbox Guardian is a Gmail management tool that helps users clean and organize their inbox.
      </p>

      <h2>Data We Access</h2>
      <p>
        The application accesses Gmail data such as email metadata and content in order to:
        analyze inbox activity, identify spam, and help users clean unwanted emails.
      </p>

      <h2>How We Use Data</h2>
      <p>
        We use this data only to provide features like inbox analysis, spam detection, and cleanup.
        We do not sell, share, or use your data for advertising.
      </p>

      <h2>Data Storage</h2>
      <p>
        Inbox Guardian does not permanently store your email data. All processing happens
        temporarily during your session.
      </p>

      <h2>Security</h2>
      <p>
        We use secure authentication via Google OAuth and follow best practices to protect user data.
      </p>

      <h2>Contact</h2>
      <p>
        If you have any questions, contact us at: your-email@example.com
      </p>
    </main>
  );
}