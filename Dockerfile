# ============================================================
# EVINEX — Multi-stage production Docker image
# Requires Node >= 22.5 (built-in node:sqlite used by the DB layer)
# ============================================================

# ---------- Stage 1: Build the SPA + server bundle ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: Slim production runtime ----------
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV EVINEX_DB_PATH=/app/data/evinex.db
WORKDIR /app

# Runtime dependencies only (express is the sole runtime require of the bundle)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Prebuilt artifacts from stage 1
COPY --from=build /app/dist ./dist

# Persistent SQLite database location (mount a volume here on your platform)
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# PORT is honoured by the server (defaults to 3000)
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-3000}/api/health || exit 1

CMD ["node", "dist/server.cjs"]
