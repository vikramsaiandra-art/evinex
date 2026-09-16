// ------------------------------------------------------------
// OPTIONAL REMOTE API BASE (for split-stack hosting, e.g. the UI
// on Netlify/GitHub Pages and the Express + SQLite backend on
// Render/Railway). Set VITE_API_BASE at BUILD time (Vite inlines
// import.meta.env), e.g.:
//   VITE_API_BASE=https://evinex-backend.onrender.com npx vite build
// When unset, fetches stay relative (/api/...) which is correct for
// the full-stack deployment where Express serves the SPA itself.
// ------------------------------------------------------------
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, '');

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
}

export {};
