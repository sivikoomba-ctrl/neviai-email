# Cloud Run image for a Next.js app moved off Vercel (project neviai-apps, asia-south1).
# Build-time env arrives as .env.production from Secret Manager (cloudbuild.yaml) and is
# deleted before the run stage; at runtime the service's own env vars are used.
FROM node:22-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++
ENV NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=6144
COPY . .
RUN npm ci --no-audit --no-fund
# The lockfiles are written on Windows and omit Linux-only optional binaries (npm bug #4828).
RUN npm install --no-save --no-audit --no-fund $(node -p " \
  const v = (p) => { try { return require('./node_modules/' + p + '/package.json').version } catch { return null } }; \
  [['lightningcss', 'lightningcss-linux-x64-gnu'], \
   ['@tailwindcss/oxide', '@tailwindcss/oxide-linux-x64-gnu'], \
   ['libsql', '@libsql/linux-x64-gnu'], \
   ['sharp', '@img/sharp-linux-x64']] \
  .filter(([p]) => v(p)).map(([p, b]) => b + '@' + v(p)).join(' ')")
RUN cp .env.production .env \
  && if [ -f prisma/schema.prisma ]; then npx prisma generate; fi \
  && npm run build \
  && rm -f .env .env.production .env.local

FROM node:22-slim AS run
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 8080
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "8080"]
