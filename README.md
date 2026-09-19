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
npm run seed         # idempotently create/repair the 4 demo accounts in the database
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

> **Seeding:** the demo accounts are ensured idempotently on every server boot, and can be
> (re)created/repaired in any database at any time with `npm run seed` (set `EVINEX_DB_PATH`
> to target the production database file). Existing accounts are updated in place — never
> duplicated. Passwords are always stored as PBKDF2-SHA512 hashes with per-user random salts.

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

### Option C — Railway (uses `railway.json`, auto-detected)

1. In [Railway](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select this repo.
   Railway detects [`railway.json`](railway.json) and builds with the [`Dockerfile`](Dockerfile) (Node 24, health check `/api/health`) — no manual config needed.
2. **Attach a volume for the database:** open the service → **Volumes** tab → create a volume with mount path **`/app/data`** so SQLite survives redeploys.
3. Optional: add a `GOOGLE_CLIENT_ID` variable for real Google Sign-In.
4. **Settings → Networking → Generate Domain** to get your public URL.

### Option C2 — GitHub Pages (static UI preview only)

⚠️ GitHub Pages hosts static files only — **the Express + SQLite backend is NOT deployed there**, so sign-in and API features are disabled in the preview (an on-page banner explains this). Useful for sharing the look & feel of the UI.

1. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. The [`gh-pages.yml`](.github/workflows/gh-pages.yml) workflow runs on every push to `main` (or trigger it manually via **Actions → Deploy SPA preview → Run workflow**).
3. The preview appears at `https://vikramsaiandra-art.github.io/evinex/`.

For the full working app (login, uploads, verification, audit), use Options A/B/C.


### Option D — Netlify (static UI + hosted backend)

⚠️ Netlify hosts static files only — the Express + SQLite backend cannot run there, which is why sign-ins fail on a plain Netlify deploy. To make logins work, deploy the **backend** separately (Option A on Render, or Option C on Railway) and point the **UI** at it:

1. Deploy the backend first (Render Blueprint or Railway) and copy its public URL, e.g. `https://evinex.onrender.com`.
2. In [Netlify](https://app.netlify.com) → **Add new site → Import an existing project** → select this GitHub repo. Netlify auto-reads [`netlify.toml`](netlify.toml) (build: `npx vite build`, publish: `dist`).
3. **Crucial:** add the environment variable `VITE_API_BASE = https://<your-backend-url>` under **Site configuration → Environment variables**. (Vite inlines it at build time, so set it *before* the build and trigger a redeploy after changing it.)
4. **Recommended (security):** on the backend host, set `ALLOWED_ORIGIN=https://<your-netlify-url>` so only your site may call the API.
5. Redeploy. Logins, uploads and verification now work — the UI talks to your hosted backend over CORS (Bearer-token auth, no cookies, so cross-origin is safe).

Alternatively, uncomment the `/api/*` proxy block in `netlify.toml` to reverse-proxy API calls to your backend instead of using `VITE_API_BASE`.

### Option E — Any VPS (Ubuntu)

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

- `GET /api/health` — uptime probe for platforms (also reports SQLite connectivity + user count)
- `GET /api/auth/health` — authentication subsystem + database readiness (no secrets)
- `POST /api/test/run-matrix` — built-in 14-test RBAC/workflow suite
- `npm run lint` — TypeScript check
- `npm run seed` — idempotently create/repair the 4 demo accounts in any database
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

