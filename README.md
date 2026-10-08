# Vellisto Studio

Official website and creative portfolio for **Vellisto**, an independent creative studio based in Mumbai, India specializing in motion design, brand identities, short-form reels, and digital experiences.

---

## ⚡ Tech Stack & Architecture

- **Backend / Server:** Node.js + Express (`server.js`)
- **Frontend:** Vanilla HTML5, CSS3, ES modules with dynamic SSR/routing
- **Integrations:**
  - Discord CRM & Bot lead notifications
  - Form submission persistence
  - Resend email notifications

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```
Fill in your Discord bot token, channel IDs, and email credentials in `.env`.

### 3. Run Locally
```bash
npm run dev
# or
node server.js
```
The website will be available at [http://localhost:3001](http://localhost:3001).

---

## 📁 Repository Structure

```text
├── wondermake.xyz/       # Frontend assets, templates, and media
│   ├── assets/           # Compiled scripts and stylesheets
│   ├── api/posts/        # Project entries & markdown/HTML templates
│   ├── uploads/          # Video & image project assets
│   └── index.html        # Main entry point
├── backups/              # Archived components & pages (e.g. About page backup)
├── server.js             # Express application & API routing
├── discord-crm.js        # Discord bot CRM workflow
└── package.json          # Project configuration
```

---

© 2025–2026 Vellisto. All rights reserved.
