FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package.json ./
RUN npm install

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx next build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir /app/data && chown nextjs:nodejs /app/data
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy full node_modules for native modules (better-sqlite3, sharp)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/migrations ./migrations
# Include pre-seeded database as fallback
COPY --from=builder /app/data ./data-seed
COPY --from=builder /app/start.sh ./start.sh
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["sh", "start.sh"]
