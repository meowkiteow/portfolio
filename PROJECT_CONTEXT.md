# VELLISTO STUDIO — MASTER PROJECT & CRM BLUEPRINT

> **Last Updated:** October 7, 2026  
> **Repository Root:** `c:\Users\krish\Desktop\wondermake`  
> **Server Port:** `3001` (http://localhost:3001)  
> **Domain:** `https://vellisto.com`  

---

## 1. PROJECT EXECUTIVE SUMMARY
Vellisto is an ultra-premium video editing agency and production studio website equipped with an automated Discord-based Agency CRM and two-way Resend email synchronization. 

The system operates as a unified command center:
1. **Frontend Website**: Fully rebranded from Wondermake to **Vellisto**, featuring custom typography (`VELLIST✳`), interactive timezone selector with 3D extrude hover and smooth drawer animations, branded minimalist 404 page, and secure lead capture forms.
2. **Discord Agency CRM (`discord-crm.js`)**: An automated Discord bot running inside `server.js` that manages client inquiries, negotiation discussion channels, multi-platform onboarding, automated role management, and live project production hubs.
3. **Email Engine (Resend)**: Integrated with `vellisto.com`. Capable of 1-click email sending directly from Discord, and automatic routing of incoming client replies back into their dedicated Discord channel.

---

## 2. FILE STRUCTURE & RESPONSIBILITIES

```text
wondermake/
├── PROJECT_CONTEXT.md      # Permanent context, architecture & instructions
├── server.js               # Node.js HTTP server, SSR injection, routing, API & webhooks
├── discord-crm.js          # Discord Bot client, roles, modals, hubs, email sync
├── .env                    # Environment credentials & configuration
├── package.json            # Node.js project manifest & dependencies
├── submissions.json        # Persistent local database for website leads
├── clients.json            # Persistent local database for onboarded clients
└── wondermake.xyz/         # Complete website frontend build
    ├── index.html          # Main HTML entry with SSR data injection
    ├── 404.html            # Branded minimalist Error 404 page
    ├── manifest.webmanifest# PWA manifest
    ├── assets/             # CSS & JS bundles (contact, footer, header, logos)
    ├── api/                # Projects & Journal API JSON datasets
    └── uploads/            # High-res video media streams & case studies
```

---

## 3. DISCORD SERVER & ROLE SYSTEM

### Provisioned Roles (Auto-Managed by Bot):
1. **`@Co-Admin`** *(Gold `#E67E22`)*: Full `Administrator` privileges. Co-founder access to all channels, leads, and operations.
2. **`@Support`** *(Purple `#9B59B6`)*: Customer success and project moderator. Can manage discussions, send messages, attach files, and view client channels.
3. **`@Client`** *(Green `#2ECC71`)*: Onboarded client role. Granted access to their private project workspace.
4. **`@Member`** *(Blue `#3498DB`)*: Standard joiner role with access to community chat and `#work-with-us`.

### Dedicated Server Channels:
* **`#inquiries`** (ID: `1557272460271943740`): Inbound lead inbox from website forms and cold emails.
* **`#admin-hub`**: Private founder/co-admin command center. Features the self-cleaning **Admin Role Control Panel** with member and role pickers.
* **`#work-with-us`**: Public client onboarding channel. Features the **`[ 🚀 Work With Us / Start Project ]`** button, which spawns private inquiry channels with founders.
* **`💬 DISCUSSIONS` Category**: Dedicated rooms created for active lead negotiations (`#deal-[name]`).
* **`📁 CLIENTS` Category** (ID: `1557316812851515542`): Dedicated workspaces created for finalized clients (`#client-[name]`).

---

## 4. WORKFLOW PIPELINES

### A. Lead Ingestion & Negotiation
1. Visitor submits contact form on `/contact` or `/` (or sends email to `hello@vellisto.com`).
2. Card appears in `#inquiries` with **`[ 💬 Open Discussion Room ]`**.
3. Clicking it spawns `#deal-[name]` under `💬 DISCUSSIONS`.
4. Inside `#deal-[name]`, the founder has 1-click template buttons:
   - **`[ 💰 Send Pricing & Rates ]`**: Pre-filled rate card with turnaround and revision terms.
   - **`[ 🎬 Send Portfolio / Reel ]`**: Pre-filled video showcase reel.
   - **`[ 🤝 Send Deal Proposal ]`**: Pre-filled agreement summary (scope, 48h turnaround, 50% deposit).
   - **`[ ✉️ Custom Reply ]`**: Free-form response.

### B. Client Finalization & Multi-Platform Routing
1. In `#deal-[name]`, click **`[ 🚀 Finalize & Convert to Client ]`**.
2. Modal prompts for:
   - Client Name
   - Preferred Platform: `DISCORD`, `EMAIL`, `WHATSAPP`, or `INSTAGRAM`
   - Initial Milestone (e.g. `Rough Cut Draft`)
3. Bot automatically spawns `#client-[name]` under `CLIENTS` and pins the **Production Hub Dashboard**.
4. If Discord: Bot assigns the `@Client` role and gives access.
5. If Email/WhatsApp: Deliveries route to that platform automatically.

### C. Live Video Production Hub (Inside `#client-[name]`)
* **Storage Hubs**:
  - 📥 **Raw Footage**: Shared Google Drive link.
  - 📤 **Deliveries**: Dropbox folder link.
* **Interactive Timeline**:
  - Target Deadline with dynamic Discord countdown (`<t:timestamp:R>`).
  - Production Stage tracker (`Ingestion` ➔ `Rough Cut` ➔ `Sound & Color` ➔ `Client Review` ➔ `Approved`).
* **Action Buttons**:
  - **`[ 📅 Set / Change Deadline ]`**: Set hours/date; updates countdown for all viewers.
  - **`[ 📁 Set Storage Links ]`**: Paste Google Drive & Dropbox URLs anytime.
  - **`[ 🔄 Next Stage ]`**: Advance project milestone.
  - **`[ 🚀 Send Dropbox Delivery ]`**: Submit Dropbox video link + notes with optional `Send Email? (YES / NO)` toggle.
  - **`[ ✉️ Message Client ]`**: Direct messaging.
  - **`[ 👥 Assign Editor ]`**: Native user picker to grant lead editor role and channel access to team members.

---

## 5. EMAIL SYSTEM (RESEND)
* **Domain:** `vellisto.com` (Verified on Resend, ID `1ec1637c-7448-4e9e-be85-58f174f7fee9`).
* **Inbound Receiving:** MX record verified (`inbound-smtp.ap-northeast-1.amazonaws.com`).
* **Inbound Webhook Endpoint:** `POST /api/webhooks/resend`.
  - When an existing client replies to an email, it routes directly into their `#client-[name]` channel with a `[ ✉️ Reply to Email ]` button.
  - When an unknown sender emails `hello@vellisto.com`, it routes into `#inquiries` as a new lead.
* **Outbound Email:** Sent via Resend SDK (`resend.emails.send()`) using branded HTML templates.

---

## 6. HOW TO RUN THE SERVER
To run the server and Discord bot locally:
```powershell
cd c:\Users\krish\Desktop\wondermake
node server.js
```

---

## 7. EMAIL SUBSYSTEM & DELIVERABILITY STATUS
* **Domain:** `vellisto.com` (Resend ID: `1ec1637c-7448-4e9e-be85-58f174f7fee9`)
* **Status:** 100% Verified (DKIM, SPF, MX Inbound, DMARC active)
* **Capabilities:** `{"sending":"enabled", "receiving":"enabled"}`
* **Default Sender:** `Krishna | Vellisto <hello@vellisto.com>` (Configured for Primary Inbox placement)
* **Inbound Sync Engine:**
  - Active background polling loop (every 8s) via Resend Receiving API (`resend.emails.receiving`).
  - Automatically pulls replies even on `localhost` without needing tunnels/ngrok!
  - Routes directly to active Deal Rooms (`#deal-[name]`), Client Hubs (`#client-[name]`), or `#inquiries`.
  - Supports `POST /api/webhooks/resend` in production.
* **Button Architecture:**
  - `[ 💰 Send Pricing & Rates ]`: opens rate overview modal with human conversational subject.
  - `[ 🎬 Send Portfolio / Reel ]`: opens showcase reel modal.
  - `[ 🤝 Send Deal Proposal ]`: opens agreed scope modal.
  - `[ ✉️ Custom Reply ]`: opens custom 1-on-1 response modal with topic/lead fallback.
  - `[ 🚀 Finalize & Convert to Client ]`: opens onboarding modal with auto-workspace creation.
  - `[ 🔄 Update Status ]`: deferred reply acknowledgement prevents 3s timeout.
  - Catch-all fallback attached to guarantee zero Discord timeout errors.

---

## 8. CONTEXT RESTORATION INSTRUCTIONS (FOR FUTURE SESSIONS)
If starting a new conversation thread with Antigravity:
1. State: *"Read `c:\Users\krish\Desktop\wondermake\PROJECT_CONTEXT.md` to restore full context."*
2. The agent will read this document and have 100% complete memory of the architecture, database, bot logic, and credentials.

