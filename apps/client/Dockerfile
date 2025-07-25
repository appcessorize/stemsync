FROM oven/bun:1 as base
WORKDIR /app

# Copy root files
COPY package.json ./
COPY bun.lockb ./
COPY turbo.json ./

# Copy all workspace files
COPY packages ./packages
COPY apps/client ./apps/client

# Install dependencies
RUN bun install

# Build shared packages and client
WORKDIR /app
RUN bun run build --filter=client...

# Runtime stage
FROM oven/bun:1
WORKDIR /app

# Copy built application
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/client ./apps/client

WORKDIR /app/apps/client
EXPOSE 3000

CMD ["bun", "run", "start"]