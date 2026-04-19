# Inbox Guardian

Inbox Guardian is a user-facing web application that helps users clean and manage their Gmail inbox intelligently.

(Currently still in building stage and yet to be deployed for users. If you want to explore the functionalities now then take a pull and run locally.)

It allows users to:
- log in with Google
- view Gmail-based dashboard insights
- auto-delete old spam emails
- auto-delete old promotional and delivery clutter
- review unknown or potentially important emails before deletion

This project is currently built as a full-stack Next.js application using direct Google OAuth and the Gmail API.

---

## Current Features

### Authentication
- Google OAuth login
- Session-based access for Gmail operations
- Logout support

### Dashboard
- Gmail inbox count
- Spam count
- Promotions count
- Important count
- Unknown/review-needed count

### Cleanup Actions
- Delete old spam emails older than 5 days
- Delete old promotional and delivery clutter older than 60 days
- Delete individual unknown/review emails manually

### Review Queue
- Unknown and promotional emails can be reviewed before deletion
- Toast feedback for actions like deletion success/failure

---

## Tech Stack

- **Frontend + Backend:** Next.js (App Router)
- **Language:** TypeScript
- **Auth:** Google OAuth 2.0
- **Email API:** Gmail API
- **Session Handling:** Signed cookie session
- **Future Enhancements:** AI-based classification, sender insights, unsubscribe flows, monthly analytics reports

---

## Project Structure

```text
frontend/
  app/
    api/
      auth/
        google/
      dashboard-stats/
      dashboard-review/
      delete/
      auto-clean/
      auto-clean-promo/
    dashboard/
      DashboardClient.tsx
      page.tsx
    globals.css
    layout.tsx
    page.tsx
  lib/
    auth/
    gmail/
    domain/
    utils/