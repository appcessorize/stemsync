FROM oven/bun:1 as base
WORKDIR /app

# Copy package files
COPY package.json bun.lockb turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the server
RUN bun run build --filter=server...

# Runtime stage
FROM oven/bun:1
WORKDIR /app

# Copy built application
COPY --from=base /app .

# Set working directory to server
WORKDIR /app/apps/server

EXPOSE 8080
CMD ["bun", "run", "src/index.ts"]