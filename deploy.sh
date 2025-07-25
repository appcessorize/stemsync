#!/bin/bash

# Beatsync Deployment Script

set -e

echo "🚀 Starting Beatsync deployment..."

# Build applications
echo "📦 Building applications..."
bun install
bun run build

# Create deployment directory structure
echo "📁 Creating deployment structure..."
mkdir -p dist/server
mkdir -p dist/client

# Copy server files
echo "🔧 Preparing server files..."
cp -r apps/server/dist/* dist/server/
cp apps/server/package.json dist/server/
cp apps/server/.env.production dist/server/.env
cp -r node_modules dist/server/

# Copy client files
echo "🎨 Preparing client files..."
cp -r apps/client/.next dist/client/
cp -r apps/client/public dist/client/
cp apps/client/package.json dist/client/
cp apps/client/.env.production dist/client/.env.production
cp -r apps/client/node_modules dist/client/

# Create start scripts
echo "📝 Creating start scripts..."

cat > dist/server/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env
exec bun run dist/index.js
EOF
chmod +x dist/server/start.sh

cat > dist/client/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
exec bun run start
EOF
chmod +x dist/client/start.sh

echo "✅ Build complete! Files ready in ./dist/"
echo ""
echo "📋 Next steps:"
echo "1. Copy ./dist to your server"
echo "2. Set up systemd services (see beatsync-backend.service)"
echo "3. Configure Nginx (see nginx.conf)"
echo "4. Update domain in .env.production files"