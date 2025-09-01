# 🐱👨‍🍳 Кіт Кухар - Universal Deployment Guide

Цей гайд показує як задеплоїти **Кіт Кухар** на будь-якій платформі.

## 🌍 Універсальність

Проект налаштований для роботи на:
- ☁️ **Cloud платформи:** Render, Vercel, Netlify, Railway, Heroku
- 🏠 **Власний сервер:** VPS, домашній комп'ютер, Raspberry Pi
- 🐳 **Docker:** будь-де де працює Docker
- 🔄 **Локально:** для розробки та тестування

## ⚙️ Конфігурація через змінні оточення

### Frontend налаштування:
```bash
REACT_APP_API_URL=https://your-backend-domain.com
```

### Backend налаштування:
```bash
# База даних (SQLite/PostgreSQL/MySQL)
DATABASE_URL=sqlite:///./recipes.db

# Безпека
SECRET_KEY=your-unique-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (дозволені домени)
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com

# Сервер
HOST=0.0.0.0
PORT=8000
```

## 🚀 Деплоймент опції

### 1. 🌐 Render (безкоштовно)

**Backend Web Service:**
```bash
Build: pip install -r requirements.txt
Start: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Frontend Web Service:**
```bash
Build: cd frontend && npm ci && npm run build
Start: cd frontend && npx serve -s build -l $PORT

Environment: 
REACT_APP_API_URL=https://your-backend.onrender.com
```

### 2. 🔷 Vercel (безкоштовно)

**Frontend:**
- Підключити GitHub репозиторій
- Build Command: `cd frontend && npm run build`
- Output Directory: `frontend/build`
- Environment: `REACT_APP_API_URL=https://your-backend.com`

### 3. 🟢 Netlify (безкоштовно)

**Frontend:**
- Підключити GitHub
- Build Command: `cd frontend && npm run build`
- Publish Directory: `frontend/build`

### 4. 🐳 Docker (універсально)

```bash
# Клонувати та запустити
git clone <repo> kitkuhar
cd kitkuhar
docker-compose up -d

# Доступ: http://localhost
```

### 5. 🏠 Власний сервер

```bash
# Backend
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001

# Frontend  
cd frontend
npm install
npm run build
npx serve -s build -l 3000
```

### 6. 🫐 Raspberry Pi

```bash
# Автоматичне встановлення
git clone <repo> kitkuhar
cd kitkuhar
chmod +x deploy-pi.sh
./deploy-pi.sh
```

## 🔐 Безпека для продакшену

### 1. Змінити паролі:
```bash
cp .env.example .env
nano .env  # Встановити унікальні значення
```

### 2. Налаштувати CORS:
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Використовувати HTTPS:
- Налаштувати SSL сертифікати
- Використовувати reverse proxy (Nginx)

## 📊 Вимоги до ресурсів

### Мінімальні:
- **RAM:** 512MB (1GB рекомендовано)
- **CPU:** 1 core  
- **Диск:** 2GB
- **Мережа:** Стабільне з'єднання

### Рекомендовані:
- **RAM:** 2GB+
- **CPU:** 2+ cores
- **Диск:** 5GB+ (SSD)
- **Мережа:** 10+ Mbps

## 🔧 Налаштування для різних платформ

### Cloud платформи:
```bash
# .env для продакшену
DATABASE_URL=postgresql://user:pass@host:5432/db
REACT_APP_API_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
ENVIRONMENT=production
```

### Локальна розробка:
```bash
# .env для розробки  
DATABASE_URL=sqlite:///./recipes.db
REACT_APP_API_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### Docker:
```bash
# Змінні в docker-compose.yml
DATABASE_URL=postgresql://user:pass@database:5432/kitkuhar
REACT_APP_API_URL=http://backend:8000
```

## 🎯 Перевірка деплойменту

### 1. Backend:
- Перейти на `/docs` - має показати API документацію
- Перевірити `/health` - має повернути "healthy"

### 2. Frontend:
- Відкрити головну сторінку
- Перевірити чи завантажується маскот
- Спробувати зареєструватись/увійти

### 3. Integration:
- Створити рецепт
- Додати фото
- Залишити коментар/оцінку

## 🆘 Усунення проблем

### CORS помилки:
```bash
# Додати домен до ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://yourdomain.com,https://your-frontend.com
```

### База даних:
```bash
# Перевірити підключення
python -c "from backend.app.database import engine; print('DB OK' if engine else 'DB Error')"
```

### API недоступне:
```bash
# Перевірити URL
curl https://your-backend.com/health
```

## 🎉 Готово!

Ваш **Кіт Кухар** тепер працює універсально на будь-якій платформі! 🌍

Для специфічної платформи дивіться відповідні секції цього гайду.