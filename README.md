# Inbox Guardian

# Inbox Guardian

Inbox Guardian is a user-facing web application that helps users clean, analyze, and manage their Gmail inbox intelligently.

It reduces inbox clutter by identifying:
- spam emails
- promotional emails
- delivery and ride notifications
- low-value old emails

and allows users to clean them using one-click actions while keeping manual control for uncertain cases.

---

## Why This Project

Most Gmail inboxes become overloaded with:
- promotions and discounts
- delivery updates
- ride receipts
- spam
- repetitive notifications

Inbox Guardian solves this by:
- showing useful inbox insights
- enabling safe auto-cleanup
- giving users review and delete controls
- creating a strong foundation for future AI-driven inbox automation

---

## Current Features

### Authentication
- Login with Google OAuth
- Session-based access to Gmail
- Logout support

### Dashboard
- Total Emails
- Spam Emails
- Promotions
- Important Emails
- Unknown / Review Emails

### Cleanup Actions
- Delete old spam emails older than 5 days
- Delete old promotional and delivery clutter older than 60 days
- Review and delete individual unknown emails

### UI Feedback
- Success and error toast messages
- Fast individual delete experience
- Separate bulk cleanup actions

---

## Architecture

```text
Browser (User)
   ↓
Next.js Frontend (React UI)
   ↓
Next.js API Routes (Backend inside same app)
   ↓
Google Gmail API
````

This project is built as a full-stack Next.js application, so the frontend UI and backend API routes live in the same codebase.

---

## End-to-End Flow

### 1. User Login

The user opens the app and clicks:

```text
Continue with Google
```

Flow:

1. User is redirected to Google OAuth
2. User grants Gmail permissions
3. Google returns an authorization code
4. Backend exchanges the code for an access token
5. Token is stored securely in session

---

### 2. Dashboard Load

After login, the user is redirected to:

```text
/dashboard
```

The frontend loads dashboard data using two APIs:

```text
GET /api/dashboard-stats
GET /api/dashboard-review
```

This split improves perceived performance:

* stats load first
* heavy review and cleanup data loads separately

---

### 3. Classification

Emails are categorized into one of the following buckets:

| Type        | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| Spam        | Gmail spam-labeled messages                                  |
| Promotion   | Promotional emails                                           |
| Important   | Emails likely important based on rules                       |
| Unknown     | Emails that need review                                      |
| Old Clutter | Low-value old delivery / promo / ride / order-related emails |

---

### 4. Cleanup Actions

#### Delete Old Spam

```text
POST /api/auto-clean
```

Deletes:

* Gmail spam emails older than 5 days

#### Delete Old Promo & Delivery

```text
POST /api/auto-clean-promo
```

Deletes:

* old promotional mails
* old delivery notifications
* old ride receipts
* low-value commerce clutter
* only when older than 60 days

#### Delete Individual Email

```text
POST /api/delete
```

Deletes:

* one selected email from the review list

---

## Code Flow

### Auth Flow

#### `/api/auth/google/login`

* Creates Google OAuth URL
* Redirects user to Google login

#### `/api/auth/google/callback`

* Receives OAuth authorization code
* Exchanges code for access token
* Stores token in session
* Redirects user to dashboard

---

### Dashboard Flow

#### `/api/dashboard-stats`

Returns lightweight stats:

* inbox count
* spam count
* promotion count
* important count

#### `/api/dashboard-review`

Returns heavier data:

* review queue
* old spam delete candidates
* old promo/delivery delete candidates

This route is intentionally separate from stats to improve UX.

---

### Cleanup Flow

#### `/api/auto-clean`

* receives spam message IDs
* deletes them through Gmail API

#### `/api/auto-clean-promo`

* receives promo/delivery message IDs
* deletes them through Gmail API

#### `/api/delete`

* receives one message ID
* deletes that message

---

## Project Structure

```text
frontend/
  app/
    api/
      auth/
        google/
          login/
          callback/
          logout/
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
      access.ts
      google.ts
      session.ts

    gmail/
      gmail.ts

    domain/
      classifier.ts
      cleanup.ts
      clutter.ts
      types.ts

    utils/
      env.ts
```

---

## Important Modules Explained

### `lib/auth`

Contains authentication and session-related logic:

* Google OAuth client setup
* session creation and retrieval
* access token refresh helper

### `lib/gmail`

Contains Gmail API wrappers:

* fetch emails
* fetch spam
* fetch old promotion candidates
* delete emails
* get label counts

### `lib/domain`

Contains business logic:

* classification rules
* cleanup rules
* clutter detection
* shared types

### `app/api`

Contains server-side route handlers:

* authentication endpoints
* dashboard endpoints
* cleanup endpoints

### `app/dashboard`

Contains the user-facing dashboard UI.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd inbox-guardian/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment file

Create `frontend/.env.local`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

APP_URL=http://localhost:3000
SESSION_SECRET=your_long_random_secret
```

### 4. Google Cloud setup

You need to configure Google Cloud before running the app:

* Enable **Gmail API**
* Configure **OAuth Consent Screen**
* Create an **OAuth Client ID**
* Choose **Web Application**
* Add this redirect URI:

```text
http://localhost:3000/api/auth/google/callback
```

### 5. Run the project

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Current Cleanup Logic

### Old Spam

Spam emails are eligible for auto-delete if:

* they are in Gmail spam
* they are older than 5 days

### Old Promotional / Delivery Clutter

Emails are eligible for auto-delete if:

* they are older than 60 days
* and they match promotional / delivery / ride / order clutter patterns

Examples of clutter sources:

* Swiggy
* Zomato
* Uber
* Ola
* Rapido
* Amazon
* Flipkart
* Myntra
* Blinkit
* Zepto
* BigBasket
* BookMyShow

---

## Safety Rules

The app tries to avoid deleting emails that may still be important.

Examples of protected patterns:

* refund
* return
* replacement
* failed payment
* dispute
* security
* OTP
* verification
* account issue
* warranty
* support ticket

This keeps cleanup safer and reduces accidental deletion of important messages.

---

## Current Limitations

* Classification is still rule-based, not AI-based
* Large inboxes can make review APIs slow
* No background jobs yet
* No database-based learning yet
* No unsubscribe automation yet

---

## Future Roadmap

### Phase 1

* Direct Google OAuth
* Gmail dashboard
* Basic cleanup flows

### Phase 2

* Better UI/UX
* Mark Important / Mark Safe
* Sender insights
* Better review experience
* Preferences persistence

### Phase 3

* AI-assisted classification
* Self-learning inbox automation
* Monthly reports and analytics
* Multi-user production deployment

---

## Deployment Goal

The long-term goal of Inbox Guardian is to become a deployed, user-facing web application that multiple users can use with their own Gmail accounts.

Planned deployment direction:

* Next.js app deployment
* production Google OAuth setup
* better persistence layer
* improved performance and observability

---

## If you are new to the project, start in this order:

1. Read `app/page.tsx`

   * entry login page

2. Read `app/api/auth/google/*`

   * login and callback flow

3. Read `app/dashboard/page.tsx`

   * dashboard entry point

4. Read `app/dashboard/DashboardClient.tsx`

   * main user interface

5. Read `app/api/dashboard-stats/route.ts`

   * fast summary data

6. Read `app/api/dashboard-review/route.ts`

   * heavier review and cleanup data

7. Read `lib/gmail/gmail.ts`

   * Gmail API integration

8. Read `lib/domain/*`

   * actual classification and cleanup logic

This sequence gives the clearest understanding of how the app works.

---

## Author

Built by Sumit Jadhav
