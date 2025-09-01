#!/bin/bash

# 🐱👨‍🍳 Кіт Кухар - Deployment Script for Raspberry Pi 5
# This script deploys the entire application stack using Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo -e "${BLUE}"
echo "🐱👨‍🍳 =================================="
echo "     Кіт Кухар Deployment Script"
echo "     Raspberry Pi 5 Optimized"
echo "==================================${NC}"
echo

# Check if running on Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    print_warning "This script is optimized for Raspberry Pi. Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Check Docker installation
print_status "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    print_warning "Please log out and back in for Docker group changes to take effect"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo apt update
    sudo apt install -y docker-compose-plugin
fi

print_success "Docker is ready!"

# Create necessary directories
print_status "Creating directories..."
mkdir -p nginx/ssl logs

# Create environment file
print_status "Creating environment configuration..."
if [ ! -f .env ]; then
    cat > .env << EOF
# Database Configuration
POSTGRES_DB=kitkuhar
POSTGRES_USER=kitkuhar_user
POSTGRES_PASSWORD=kitkuhar_password_$(date +%Y)

# Backend Configuration  
SECRET_KEY=kitkuhar_secret_key_$(date +%Y)_very_secure_$(openssl rand -hex 8)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API URL for frontend
REACT_APP_API_URL=http://localhost:8000
EOF
    print_success "Environment file created"
else
    print_warning "Environment file already exists, skipping..."
fi

# Create database initialization file
print_status "Setting up database initialization..."
cat > init.sql << 'EOF'
-- Initialize Кіт Кухар database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'Europe/Kiev';

-- Create indexes for performance
-- (Tables will be created by SQLAlchemy migrations)
EOF

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Pull latest images
print_status "Pulling base images..."
docker-compose pull database nginx

# Build application images
print_status "Building application images..."
docker-compose build --no-cache

# Start services
print_status "Starting Кіт Кухар services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check service status
print_status "Checking service health..."
services=("kitkuhar-db" "kitkuhar-backend" "kitkuhar-frontend" "kitkuhar-proxy")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        print_success "$service is running"
    else
        print_error "$service is not running properly"
        all_healthy=false
    fi
done

# Show logs if any service failed
if [ "$all_healthy" = false ]; then
    print_error "Some services failed to start. Showing logs:"
    docker-compose logs --tail=20
    exit 1
fi

# Show final status
echo
print_success "🎉 Кіт Кухар успішно запущений!"
echo
echo -e "${GREEN}📍 Доступні URL:${NC}"
echo "   🌐 Головний сайт: http://localhost"
echo "   🔧 API документація: http://localhost/docs"
echo "   ❤️  Health check: http://localhost/health"
echo

# Show system information
echo -e "${BLUE}📊 Системна інформація:${NC}"
echo "   💾 Використання пам'яті:"
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.CPUPerc}}"
echo

# Show useful commands
echo -e "${YELLOW}🔧 Корисні команди:${NC}"
echo "   📋 Переглянути логи:        docker-compose logs -f"
echo "   🔄 Перезапустити:          docker-compose restart"
echo "   ⏹️  Зупинити:               docker-compose down"
echo "   🗑️  Очистити все:          docker-compose down -v --rmi all"
echo "   📊 Моніторинг:             docker-compose top"
echo

print_success "Деплоймент завершено! 🐱👨‍🍳"