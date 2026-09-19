// ------------------------------------------------------------
// OPTIONAL REMOTE API BASE (for split-stack hosting, e.g. the UI
// on Netlify/GitHub Pages and the Express + SQLite backend on
// Render/Railway). Set VITE_API_BASE at BUILD time (Vite inlines
// import.meta.env), e.g.:
//   VITE_API_BASE=https://evinex-backend.onrender.com npx vite build
// When unset, fetches stay relative (/api/...) which is correct for
// the full-stack deployment where Express serves the SPA itself.
// ------------------------------------------------------------
const RAW_API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();

// Trailing slashes are stripped so `API_BASE + '/api/auth/login'`
// can never produce a broken URL like https://backend.com//api/...
export const API_BASE: string = RAW_API_BASE ? RAW_API_BASE.replace(/\/+$/, '') : '';

if (API_BASE) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (typeof input === 'string' && (input.startsWith('/api/') || input === '/api')) {
      input = API_BASE + input;
    }
    return originalFetch(input, init);
  };
  // eslint-disable-next-line no-console
  console.info(`[EVINEX] API requests proxied to remote backend: ${API_BASE}`);

  // Deployment safety net: a production (HTTPS) build must never point
  // at a development-only backend URL — it would only ever work on the
  // machine where that localhost server is running.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(API_BASE) && window.location.protocol === 'https:') {
    // eslint-disable-next-line no-console
    console.warn(
      `[EVINEX] VITE_API_BASE points at a development URL (${API_BASE}) but this page is served over HTTPS. ` +
        'Rebuild the frontend with the production backend URL and redeploy.'
    );
  }
}

// Resolves a backend path against the configured API base. Used for
// login diagnostics only — the fetch wrapper above transparently
// rewrites every relative /api call, so application code keeps using
// relative paths (single source of truth, no /api/api/... doubling).
export function apiUrl(path: string): string {
  return API_BASE ? API_BASE + path : path;
}

// Human-readable description of where API calls are sent. Included in
// login diagnostics so a misconfigured deployment is immediately
// obvious. Safe to display: VITE_API_BASE is a public URL, no secrets.
export function describeApiTarget(): string {
  return API_BASE
    ? `${API_BASE} (VITE_API_BASE baked in at build time)`
    : 'same-origin /api paths (full-stack deployment — VITE_API_BASE not set)';
}

export {};
