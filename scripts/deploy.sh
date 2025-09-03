#!/bin/bash

# Кіт Кухар - Deployment Script for Raspberry Pi
# Використання: ./deploy.sh [local|prod]

set -e

ENVIRONMENT=${1:-prod}
PI_HOST="kitkuhar.com"
PI_USER="pi"  # змініть на ваш user
DEPLOY_PATH="/home/pi/kitkuhar"

echo "🚀 Деплой - середовище: $ENVIRONMENT"

# Функція для локального деплою
deploy_local() {
    echo "📦 Локальне тестування..."
    cp .env.local .env
    docker-compose -f docker-compose.local.yml down || true
    docker-compose -f docker-compose.local.yml up --build -d
    echo "✅ Локальне середовище запущено на http://localhost:3001"
}

# Функція для деплою на Pi
deploy_to_pi() {
    local compose_file="docker-compose.yml"
    local env_file=".env.production"
    
    echo "📦 Копіюємо файли на сервер..."
    
    # Створюємо директорію якщо не існує
    ssh ${PI_USER}@${PI_HOST} "mkdir -p ${DEPLOY_PATH}/${env}"
    
    # Копіюємо необхідні файли
    rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '__pycache__' \
        --exclude '*.pyc' \
        --exclude 'logs/*' \
        --exclude '.env' \
        ./ ${PI_USER}@${PI_HOST}:${DEPLOY_PATH}/${env}/
    
    # Копіюємо правильний .env файл
    scp ${env_file} ${PI_USER}@${PI_HOST}:${DEPLOY_PATH}/${env}/.env
    
    echo "🐳 Запускаємо Docker контейнери..."
    
    # Виконуємо деплой на Pi
    ssh ${PI_USER}@${PI_HOST} "
        cd ${DEPLOY_PATH}/${env}
        
        # Зупиняємо старі контейнери
        docker-compose -f ${compose_file} down || true
        
        # Видаляємо старі образи
        docker system prune -f
        
        # Збираємо та запускаємо нові контейнери  
        docker-compose -f ${compose_file} up --build -d
        
        # Перевіряємо статус
        docker-compose -f ${compose_file} ps
    "
    
    echo "✅ Деплой завершено для середовища: $env"
    
    echo "🔍 Health check: https://kitkuhar.com"
}

# Основна логіка
case $ENVIRONMENT in
    "local")
        deploy_local
        ;;
    "prod")
        deploy_to_pi
        ;;
    *)
        echo "❌ Невірне середовище. Використовуйте: local або prod"
        exit 1
        ;;
esac