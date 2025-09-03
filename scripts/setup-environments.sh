#!/bin/bash

# Кіт Кухар - Setup Development Environments
# Цей скрипт створює необхідні гілки та налаштовує середовища

echo "🏗️  Налаштування середовищ розробки для Кіт Кухар..."

# Перевіряємо чи ми в git репозиторії
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Помилка: Не git репозиторій!"
    exit 1
fi

echo "🔧 Налаштовуємо локальну розробку..."

# Створюємо .env для локального тестування якщо не існує
if [ ! -f ".env" ]; then
    echo "   Копіюю .env.local як .env..."
    cp .env.local .env
else
    echo "   ✅ .env вже існує"
fi

# Створюємо директорії для логів
echo "   Створюю директорії для логів..."
mkdir -p logs backend/logs

echo "🐳 Перевіряємо Docker setup..."

# Перевіряємо чи Docker запущений
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker не запущений. Запустіть Docker Desktop."
else
    echo "   ✅ Docker працює"
fi

echo "📦 Встановлюємо залежності..."

# Backend dependencies
if [ -f "backend/requirements.txt" ]; then
    echo "   Встановлюю Python залежності..."
    cd backend
    python -m venv venv
    source venv/bin/activate 2>/dev/null || source venv/Scripts/activate
    pip install -r requirements.txt
    cd ..
fi

# Frontend dependencies  
if [ -f "frontend/package.json" ]; then
    echo "   Встановлюю Node.js залежності..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Налаштування завершено!"
echo ""
echo "🚀 Для локального тестування:"
echo "   docker-compose -f docker-compose.local.yml up"
echo "   Відкрий http://localhost:3001"
echo ""
echo "🚀 Для запуску production середовища:"
echo "   docker-compose up"
echo ""
echo "📚 Для детальної інформації дивіться README.environments.md"