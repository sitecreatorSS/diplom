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

# Generate Prisma client
echo "=== Generating Prisma client... ==="
npx prisma generate

# Run database migrations
echo "=== Running database migrations... ==="
npx prisma migrate deploy

# Seed the database
echo "=== Seeding the database... ==="
if [ -f "prisma/seed.js" ]; then
  echo "Running JavaScript seed..."
  node prisma/seed.js
elif [ -f "prisma/seed.ts" ]; then
  echo "Running TypeScript seed..."
  npx ts-node --transpile-only prisma/seed.ts
else
  echo "No seed files found. Skipping database seeding."
fi

# Build the application
echo "=== Building the application... ==="
npm run build

echo "=== Build completed successfully! ==="
