#!/bin/bash

# Exit on error
set -e

# Debug info
echo "=== Starting Vercel Build Script ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "=== Installing dependencies... ==="
npm ci --prefer-offline --no-audit --progress=false

# Install Prisma globally to ensure it's available
echo "=== Installing Prisma CLI... ==="
npm install -g prisma@6.8.1

# Generate Prisma client
echo "=== Generating Prisma client... ==="
prisma generate

# Run database migrations
echo "=== Running database migrations... ==="
prisma migrate deploy

# Seed the database
echo "=== Seeding the database... ==="
# Check if seed script exists
if [ -f "prisma/seed.js" ]; then
  echo "Running seed script..."
  node prisma/seed.js
else
  echo "Seed script not found at prisma/seed.js"
  # Try TypeScript seed if JS version not found
  if [ -f "prisma/seed.ts" ]; then
    echo "Found TypeScript seed, installing ts-node..."
    npm install -D ts-node typescript @types/node
    echo "Running TypeScript seed..."
    npx ts-node --transpile-only prisma/seed.ts
  else
    echo "No seed files found. Skipping database seeding."
  fi
fi

# Build the application
echo "=== Building the application... ==="
npm run build

echo "=== Build completed successfully! ==="
