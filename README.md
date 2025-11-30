
# VoiceOmni SaaS - Master Deployment Guide

Welcome to **VoiceOmni**, the SOTA Voice AI Platform. This guide ensures a flawless integration from zero to production using **Windsurf** and **Google Gemini 3**.

## 🏗 System Architecture

*   **Frontend**: React + Vite + Tailwind (Served via Nginx)
*   **Backend**: Node.js + Fastify + WebSockets (Twilio Handling)
*   **AI Core**: Google Gemini 2.5 Live API
*   **Database**: PostgreSQL
*   **Cache**: Redis (for Line Management & Rate Limiting)
*   **Payments**: Stripe

---

## 🌊 Windsurf 1-Click Setup

Follow these exact steps to launch the entire platform inside Windsurf.

### 1. Configuration
Create a file named `.env` in the root directory. Copy and paste the following configuration (replace placeholders with your keys):

```env
# --- AI Configuration ---
GEMINI_API_KEY=your_google_ai_studio_key

# --- Backend Configuration ---
PORT=3000
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000

# --- Database & Cache (Docker Internal) ---
DB_CONNECTION_STRING=postgres://user:password@postgres:5432/voiceomni
REDIS_URL=redis://redis:6379

# --- Stripe (Payments) ---
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUB_KEY=pk_test_...

# --- Email (Gmail API) ---
GMAIL_USER=your_email@gmail.com
GMAIL_CLIENT_ID=your_oauth_client_id
GMAIL_CLIENT_SECRET=your_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_oauth_refresh_token
```

### 2. Launch
Open the Windsurf Terminal and run:

```bash
docker-compose up --build
```

### 3. Verification
*   **Frontend Dashboard**: Open `http://localhost:8080` in your browser.
*   **Backend Health**: Visit `http://localhost:3000/api/health` (Should return `{"status":"ok"}`).

---

## 📡 Go Live Checklist (Google Cloud Run)

When you are ready to deploy to the public internet:

1.  **Frontend**: Deploy the `dist` folder to Firebase Hosting or Netlify.
    *   Set `VITE_USE_MOCK=false`.
    *   Set `VITE_API_URL` to your production backend URL.
2.  **Backend**: Deploy the `backend` folder to **Google Cloud Run**.
    *   Expose Port 3000.
    *   Set all Environment Variables from the `.env` section above in the Cloud Run configuration.
3.  **Twilio**:
    *   Buy a number.
    *   Set the **Voice Webhook** to `wss://your-cloud-run-url.com/webhook/{botId}`.
4.  **Stripe**:
    *   Create your Products (Starter, Pro, etc.) in Stripe Dashboard.
    *   Update `INITIAL_PLANS` in `App.tsx` with your real `stripeProductId`.

## 🛠 Features Included

*   **Registration Flow**: Users can sign up, select add-ons (Extra Lines), and pay via Stripe immediately.
*   **Voice Editor**: SOTA Config Panel with AI Tool Generation ("Zauberstab").
*   **Tool Library**: Integrations for Salesforce, Resmio, Calendly, and more.
*   **Infrastructure Manager**: Monitor simulated or real server metrics (CPU, Redis).
*   **Email Marketing**: Integrated Newsletter builder sending via Gmail API.

