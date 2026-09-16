<div align="center">

# ⚖️ EVINEX — Secure Digital Document Management System

**Enterprise digital document management & evidentiary integrity system** with strict role-based access control (RBAC), SHA-256 cryptographic verification, tamper-proof audit trails, and a persistent SQLite database.

`React 19` · `TypeScript` · `Vite` · `Tailwind CSS 4` · `Express` · `SQLite (node:sqlite)` · `Node ≥ 22.5`

</div>

---

## ✨ Features

- **🔐 Gmail Sign-In (Google)** — users log in with their Google account; new accounts are auto-registered as *Users*
- **🛡️ Dedicated Admin Portal** — Administrators sign in through a separate, password-only portal (Google login is blocked for admin accounts)
- **👥 Zero-Trust RBAC** — 4 roles (`USER`, `LEGAL_OFFICER`, `ADVOCATE`, `ADMIN`) enforced on every API route and page route, with live 14-test verification matrix
- **📄 Document lifecycle** — users upload documents; hash is computed with SHA-256; only ADMIN/LEGAL_OFFICER/ADVOCATE can verify integrity
- **🧬 Immutable evidence** — original evidence records cannot be edited (PUT/PATCH/DELETE are blocked & audited); new versions chain onto the original
- **🧾 Append-only audit ledger** — every login, upload, verification and tamper attempt is recorded
- **🗄️ Persistent SQLite database** — users, cases, documents, evidence, sessions and audit logs survive restarts; auto-deduplicates on startup
- **📱 Mobile friendly** — bottom-sheet modals, safe-area support, installable as a PWA
- **🌐 i18n** — multi-language UI (12 Indian languages) and 4 national themes

## 🚀 Quick Start (local)

```bash
git clone https://github.com/vikramsaiandra-art/evinex.git
cd evinex
npm install
npm run dev          # development (Vite HMR) → http://localhost:3000
```

**Production locally:**

```bash
npm run build        # builds frontend + server bundle into dist/
npm start            # NODE_ENV=production recommended → http://localhost:3000
```

> ⚠️ Requires **Node.js ≥ 22.5** (the database uses Node's built-in `node:sqlite`).

## 🔑 Demo Accounts

| Role | Portal | Email | Password |
|---|---|---|---|
| Administrator | **Admin Portal** tab | `admin@evinex.demo` | `Evinex@Admin2026` |
| User (litigant) | User Sign In | `user@evinex.demo` | `Evinex@User2026` |
| Legal Officer | User Sign In | `legalofficer@evinex.demo` | `Evinex@Legal2026` |
| Advocate | User Sign In | `advocate@evinex.demo` | `Evinex@Advocate2026` |

Or click **Sign in with Google** with any Gmail address (demo mode — see env vars below).

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | production deploys | Set to `production` to serve the built SPA from Express |
| `PORT` | optional | Listen port (default `3000`; platforms inject their own) |
| `EVINEX_DB_PATH` | optional | SQLite file location (default `./data/evinex.db`; point it at a mounted volume in production) |
| `GOOGLE_CLIENT_ID` | optional | Google OAuth 2.0 Web Client ID — enables real Google Sign-In. Unset = demo prompt mode |
| `GEMINI_API_KEY` | optional | Currently unused by the app |

See [.env.example](.env.example).

## ☁️ Deployment

### Option A — Render (easiest, free tier)

1. Push this repo to GitHub (already done).
2. In [Render](https://render.com) → **New +** → **Blueprint** → select this repository. Render reads [`render.yaml`](render.yaml) automatically.
3. Deploy. Health check: `GET /api/health`.

> **Free plan caveat:** no persistent disk — the SQLite database re-seeds on each deploy/restart. Upgrade the plan and uncomment the `disk:` block in `render.yaml` (mounts `/var/data`) so data persists.

### Option B — Docker (any host: Fly.io, Railway, EC2, VPS…)

```bash
docker build -t evinex .
docker run -d -p 3000:3000 -e NODE_ENV=production -e EVINEX_DB_PATH=/app/data/evinex.db \
  -v evinex-data:/app/data evinex
```

Multi-stage build → final image runs only Node 24 + production dependencies. **Mount a volume at `/app/data`** to keep the database.

### Option C — Railway

1. **New Project** → **Deploy from GitHub repo**.
2. Set start command `node dist/server.cjs` (or use the Dockerfile), add variables `NODE_ENV=production`, and mount a volume at `/app/data`.

### Option D — Any VPS (Ubuntu)

```bash
# Install Node 24, then:
git clone https://github.com/vikramsaiandra-art/evinex.git && cd evinex
npm ci && npm run build
NODE_ENV=production EVINEX_DB_PATH=/opt/evinex/data/evinex.db node dist/server.cjs
# Put nginx/caddy in front for TLS, or run under pm2/systemd
```

### CI

Every push runs [.github/workflows/ci.yml](.github/workflows/ci.yml): type check → build → production smoke test (health + admin login).

## 🧪 Verification & Health

- `GET /api/health` — uptime probe for platforms
- `POST /api/test/run-matrix` — built-in 14-test RBAC/workflow suite
- `npm run lint` — TypeScript check
- `npm run db:reset` — wipe & re-seed the database

## 📁 Project Structure

```
server.ts                  Express API + auth + RBAC + static SPA serving
src/db.ts                  SQLite persistence layer (schema, seed, dedupe, CRUD)
src/main.tsx, src/App.tsx  React SPA (role dashboards, RBAC routing)
src/components/*           Dashboards, modals, login (Google + Admin Portal)
src/context/*              Auth + theme/i18n contexts
data/evinex.db             SQLite database (gitignored, auto-created)
Dockerfile / render.yaml   Deployment configs
```

## 📜 Compliance Notes

Evidentiary workflows modelled on **Bharatiya Sakshya Adhiniyam, 2023 (Sec 63)** — electronic record admissibility via SHA-256 integrity certification. Demo credentials are public by design; replace them before any real deployment.

