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

# Run database migrations
echo "=== Running database migrations... ==="
npm run db:migrate

# Seed the database
echo "=== Seeding the database... ==="
npm run db:seed || echo "Seeding failed or skipped, continuing build."

# Build the application
echo "=== Building the application... ==="
npm run build

echo "=== Build completed successfully! ==="
