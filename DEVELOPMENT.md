# KitKuhar - Локальна Розробка

## 🚀 Швидкий старт

### Запуск локального середовища:
```bash
# Windows
dev-start.bat

# Linux/Mac
docker-compose -f docker-compose.local.yml up --build -d
```

### Після запуску доступні:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001/api  
- **API Documentation**: http://localhost:8001/docs
- **Database**: localhost:5435

## 🛠 Команди для розробки

### Windows (.bat файли):
- `dev-start.bat` - запустити локальне середовище
- `dev-stop.bat` - зупинити середовище
- `dev-logs.bat` - переглянути логи
- `dev-test.bat` - запустити всі тести

### Linux/Mac:
```bash
# Запуск
docker-compose -f docker-compose.local.yml up --build -d

# Зупинка  
docker-compose -f docker-compose.local.yml down

# Логи
docker-compose -f docker-compose.local.yml logs -f

# Тести
cd backend && python -m pytest --cov=. --cov-report=term-missing
cd frontend && npm test -- --coverage --watchAll=false
```

## 📋 Workflow розробки

### 1. Локальна розробка:
```bash
# Запустити локальне середовище
dev-start.bat

# Змінити код в backend/ або frontend/

# Протестувати зміни
dev-test.bat

# Перевірити в браузері http://localhost:3001
```

### 2. Деплой на продакшн:
```bash
git add .
git commit -m "Опис змін"
git push origin main

# Автоматично запуститься:
# - GitHub Actions
# - Тести  
# - Build
# - Webhook деплой на Pi
# - Оновлення https://kitkuhar.com
```

## 🔧 Налаштування середовищ

### Локальне (розробка):
- Порти: Frontend 3001, Backend 8001, DB 5435
- Database: `kitkuhar_local`
- API URL: `http://localhost:8001/api`
- Логування: DEBUG
- Автоперезавантаження: увімкнено

### Продакшн (Pi):
- Порти: Frontend 3000, Backend 8000, DB 5432
- Database: `kitkuhar_production`
- API URL: `https://kitkuhar.com/api`
- Логування: INFO
- HTTPS: увімкнено через Cloudflare

## 🐛 Налагодження

### Переглянути логи контейнерів:
```bash
docker-compose -f docker-compose.local.yml logs backend-local
docker-compose -f docker-compose.local.yml logs frontend-local
docker-compose -f docker-compose.local.yml logs database-local
```

### Зайти в контейнер:
```bash
docker exec -it kitkuhar-backend-local bash
docker exec -it kitkuhar-db-local psql -U kitkuhar_user -d kitkuhar_local
```

### Перебудувати без кешу:
```bash
docker-compose -f docker-compose.local.yml build --no-cache
docker-compose -f docker-compose.local.yml up -d
```

## 📁 Структура проекту

```
kitkuhar/
├── backend/          # FastAPI додаток
├── frontend/         # React додаток  
├── database/         # SQL схеми
├── .github/          # GitHub Actions
├── docker-compose.yml          # Продакшн
├── docker-compose.local.yml    # Локальна розробка
├── dev-*.bat         # Windows скрипти
└── webhook-*.py      # Деплой система
```

## ⚠️ Важливо

- **Не коміть в main** недотестований код
- **Завжди запускай тести** перед push
- **Перевіряй локально** перед деплоєм  
- **main branch = автодеплой** на продакшн