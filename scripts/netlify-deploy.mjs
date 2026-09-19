// -----------------------------------------------------------
// EVINEX → NETLIFY DEPLOY HELPER (`node scripts/netlify-deploy.mjs`)
//
// Works around the netlify-cli crash on Windows/Node>=20
// ("TypeError: Cannot set property name ... only a getter")
// by talking to Netlify's APIs directly:
//   1. LOGIN  — OAuth ticket flow (opens browser, polls, exchanges
//               for a token; stored in ~/.netlify/evinex_netlify_token)
//   2. SITE   — reuses the recorded site, an existing evinex-* site,
//               or creates a new one
//   3. DEPLOY — digest deploy of dist/ via /api/v1 deploys endpoints
//               (the server bundle *.cjs is skipped: Netlify is a
//               static host; deploy the backend separately).
//
// Optional env: NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID, VITE_API_BASE
// -----------------------------------------------------------
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { exec } from 'child_process';

// Official netlify-cli OAuth client ID (extracted from the local
// netlify-cli package: dist/commands/base-command.js). Using the same
// client_id makes app.netlify.com treat our ticket flow exactly like
// `netlify login` — the authorize page will show the "Netlify CLI" app.
const CLIENT_ID =
  process.env.NETLIFY_CLI_CLIENT_ID || 'd6f37de6614df7ae58664cfca524744d73807a377f5ee71f1a254f78412e3750';
const HOME_TOKEN_FILE = path.join(os.homedir(), '.netlify', 'evinex_netlify_token');
const SITE_ID_FILE = path.join(process.cwd(), '.netlify-site-id');
const DIST = path.join(process.cwd(), 'dist');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- LOGIN (OAuth ticket flow, identical to netlify-cli) ----------
// NOTE: ticket endpoints live on api.netlify.com/api/v1 (per the
// official OpenAPI spec), while the authorize page is on app.netlify.com.
const API_BASE = process.env.NETLIFY_API_BASE || 'https://api.netlify.com/api/v1';

async function createTicket() {
  const res = await fetch(`${API_BASE}/oauth/tickets?client_id=${CLIENT_ID}`, { method: 'POST' });
  if (!res.ok) throw new Error(`ticket creation failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function openBrowser(url) {
  if (process.platform === 'win32') exec(`start "" "${url}"`);
  else if (process.platform === 'darwin') exec(`open "${url}"`);
  else exec(`xdg-open "${url}"`);
}

async function pollTicket(ticketId) {
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`${API_BASE}/oauth/tickets/${ticketId}?client_id=${CLIENT_ID}`);
    if (res.ok) {
      const ticket = await res.json();
      if (ticket.authorized) return true;
    }
    await sleep(3000);
  }
  throw new Error('timed out waiting for browser authorization (6 min)');
}

async function exchangeTicket(ticketId) {
  const res = await fetch(`${API_BASE}/oauth/tickets/${ticketId}/exchange?client_id=${CLIENT_ID}`, { method: 'POST' });
  if (!res.ok) throw new Error(`token exchange failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

async function main() {
  let token = process.env.NETLIFY_AUTH_TOKEN || (fs.existsSync(HOME_TOKEN_FILE) ? fs.readFileSync(HOME_TOKEN_FILE, 'utf8').trim() : '');

  if (!token) {
    console.log('[NETLIFY] No stored token — starting browser authorization…');
    const ticket = await createTicket();
    const authUrl = `https://app.netlify.com/authorize?response_type=ticket&ticket=${ticket.id}`;
    openBrowser(authUrl);
    console.log('[NETLIFY] Authorize the app in the browser window that just opened (waiting up to 6 minutes)…');
    await pollTicket(ticket.id);
    token = await exchangeTicket(ticket.id);
    fs.mkdirSync(path.dirname(HOME_TOKEN_FILE), { recursive: true });
    fs.writeFileSync(HOME_TOKEN_FILE, token, { mode: 0o600 });
    console.log(`[NETLIFY] Authorized. Token stored at ${HOME_TOKEN_FILE} (never committed).`);
  }

  const auth = { Authorization: `Bearer ${token}` };

  // ----- SITE: reuse recorded site → existing evinex-* site → create new -----
  let siteId = process.env.NETLIFY_SITE_ID || (fs.existsSync(SITE_ID_FILE) ? fs.readFileSync(SITE_ID_FILE, 'utf8').trim() : '');
  if (!siteId) {
    const listRes = await fetch('https://api.netlify.com/api/v1/sites?filter=all', { headers: auth });
    if (!listRes.ok) throw new Error(`site list failed (${listRes.status})`);
    const sites = await listRes.json();
    let site = Array.isArray(sites) ? sites.find((s) => s.name.startsWith('evinex')) : null;
    if (!site) {
      const name = `evinex-${crypto.randomBytes(3).toString('hex')}`;
      const createRes = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: { ...auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!createRes.ok) throw new Error(`site creation failed (${createRes.status}): ${await createRes.text()}`);
      site = await createRes.json();
      console.log(`[NETLIFY] Created new site: ${site.name}.netlify.app`);
    } else {
      console.log(`[NETLIFY] Reusing existing site: ${site.name}.netlify.app`);
    }
    siteId = site.id;
    fs.writeFileSync(SITE_ID_FILE, siteId);
  } else {
    console.log(`[NETLIFY] Using recorded site id: ${siteId}`);
  }

  // ---------- DEPLOY ----------
  const files = {};
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else {
        const rel = '/' + path.relative(DIST, fullPath).split(path.sep).join('/');
        if (rel.endsWith('.cjs') || rel.endsWith('.cjs.map')) continue; // backend bundle — not for static hosting
        files[rel] = crypto.createHash('sha1').update(fs.readFileSync(fullPath)).digest('hex');
      }
    }
  };
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html missing — run `npm run build` first.');
  }
  walk(DIST);

  const deployRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  if (!deployRes.ok) throw new Error(`deploy creation failed (${deployRes.status}): ${await deployRes.text()}`);
  const deploy = await deployRes.json();
  console.log(`[NETLIFY] Deploy ${deploy.id} created — uploading ${deploy.required.length} file(s)…`);

  for (const sha of deploy.required) {
    const relPath = Object.keys(files).find((k) => files[k] === sha);
    if (!relPath) continue;
    const body = fs.readFileSync(path.join(DIST, relPath));
    const up = await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/files${relPath}`, {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/octet-stream' },
      body,
    });
    if (!up.ok) throw new Error(`upload failed for ${relPath} (${up.status})`);
    console.log(`  uploaded ${relPath}`);
  }

  let state = '';
  let final = null;
  for (let i = 0; i < 60; i++) {
    const dRes = await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}`, { headers: auth });
    final = await dRes.json();
    state = final.state;
    if (state === 'ready' || state === 'error') break;
    await sleep(3000);
  }
  if (state !== 'ready') throw new Error(`deploy finished in state "${state}"`);
  console.log('[NETLIFY] Deploy is LIVE');
  console.log(`[NETLIFY] URL: ${final.ssl_url || final.deploy_ssl_url}`);
  console.log('[NETLIFY] NOTE: logins require the backend to be deployed (Render/Railway) and');
  console.log('[NETLIFY] VITE_API_BASE=<backend-url> set before the next build — see README.md.');
}

main().catch((err) => {
  console.error('[NETLIFY] FAILED:', err.message);
  process.exit(1);
});
