#!/bin/bash

# Nginx Configuration Test Script
# Tests nginx config before deployment to catch routing issues early

set -e

echo "🔧 Testing nginx configuration..."

# Check nginx syntax
echo "Checking nginx syntax..."
if docker run --rm -v "$(pwd)/nginx/nginx.nextjs.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t; then
    echo "✅ Nginx syntax: OK"
else
    echo "❌ Nginx syntax: FAILED"
    exit 1
fi

# Check for common routing issues
echo "Checking for routing issues..."

# Check for duplicate /api/ prefixes
if grep -q "proxy_pass.*backend/api/" nginx/nginx.nextjs.conf; then
    echo "❌ Found duplicate /api/ prefix in proxy_pass - this will cause 404s!"
    echo "   Should be: proxy_pass http://backend/;"
    echo "   Not: proxy_pass http://backend/api/;"
    exit 1
else
    echo "✅ No duplicate /api/ prefixes found"
fi

# Check for proper location block order
echo "Checking location block order..."
if ! grep -A 20 "location /api/" nginx/nginx.nextjs.conf | grep -q "proxy_pass http://backend/;"; then
    echo "❌ /api/ location block not configured correctly"
    exit 1
else
    echo "✅ Location blocks configured correctly"
fi

echo "🎉 Nginx configuration tests passed!"