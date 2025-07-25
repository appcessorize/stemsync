FROM oven/bun:1 as base
WORKDIR /app

# Copy root files
COPY package.json ./
COPY bun.lockb ./
COPY turbo.json ./

# Copy all workspace files
COPY packages ./packages
COPY apps/server ./apps/server

# Install dependencies
RUN bun install

# Build shared packages and server
WORKDIR /app
RUN bun run build --filter=server...

# Runtime stage
FROM oven/bun:1
WORKDIR /app

# Copy built application
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/server ./apps/server

WORKDIR /app/apps/server
EXPOSE 8080

CMD ["bun", "run", "src/index.ts"]