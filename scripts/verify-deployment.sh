#!/bin/bash

# Deployment Verification Script for KitKuhar
# This script verifies that all critical endpoints work after deployment

set -e

BASE_URL="https://kitkuhar.com"
TIMEOUT=30

echo "🔍 Verifying KitKuhar deployment..."

# Test main site
echo "Testing main site..."
if curl -f -s --max-time $TIMEOUT "$BASE_URL" > /dev/null; then
    echo "✅ Main site: OK"
else
    echo "❌ Main site: FAILED"
    exit 1
fi

# Test API health (backend health endpoint is at /health, not /api/health)
echo "Testing API health..."
if curl -f -s --max-time $TIMEOUT "$BASE_URL/health" > /dev/null; then
    echo "✅ API health: OK"
else
    echo "❌ API health: FAILED"
    echo "Note: Backend health endpoint might not be accessible through nginx routing"
    exit 1
fi

# Test API docs (try both /api/docs and fallback to /docs)
echo "Testing API docs..."
if curl -f -s --max-time $TIMEOUT "$BASE_URL/api/docs" > /dev/null; then
    echo "✅ API docs: OK (at /api/docs)"
elif curl -f -s --max-time $TIMEOUT "$BASE_URL/docs" > /dev/null; then
    echo "⚠️ API docs: OK but at /docs (nginx routing not updated)"
else
    echo "❌ API docs: FAILED"
    exit 1
fi

# Test API endpoints
echo "Testing API endpoints..."
if curl -f -s --max-time $TIMEOUT "$BASE_URL/api/auth/register" -X OPTIONS > /dev/null; then
    echo "✅ API auth endpoint: OK"
else
    echo "❌ API auth endpoint: FAILED"  
    exit 1
fi

echo "🎉 All critical endpoints verified successfully!"