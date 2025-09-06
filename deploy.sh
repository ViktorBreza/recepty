#!/bin/bash

# Production Deployment Script for KitKuhar
# This script should be executed by webhook server on production

set -e

echo "🚀 Starting KitKuhar deployment..."

# Get current directory
DEPLOY_DIR="/home/pi/kitkuhar"
cd "$DEPLOY_DIR"

echo "📂 Current directory: $(pwd)"

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git fetch origin main
git reset --hard origin/main

echo "📋 Latest commit: $(git log --oneline -1)"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Remove old containers and images to force rebuild
echo "🧹 Cleaning old containers and images..."
docker-compose rm -f || true
docker system prune -f || true

# Build and start new containers
echo "🔨 Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Test deployment
echo "🔍 Testing deployment..."
curl -f http://localhost || echo "Frontend test failed"
curl -f http://localhost/health || echo "Health check failed"

echo "✅ Deployment completed!"

# Log deployment
echo "$(date): Deployed commit $(git rev-parse --short HEAD)" >> deploy.log