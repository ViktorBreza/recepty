# Кіт Кухар - Керування Середовищами

## Огляд Середовищ

Проект має два середовища:

### 💻 **Local (Тестування)**
- **URL**: `http://localhost:3001`
- **API**: `http://localhost:8001/api`
- **Призначення**: Локальне тестування змін на комп'ютері
- **Запуск**: `docker-compose -f docker-compose.local.yml up`

### 🚀 **Production (Prod)**
- **Гілка**: `main`
- **URL**: `https://kitkuhar.com`
- **API**: `https://kitkuhar.com/api`
- **Призначення**: Живий сайт для користувачів
- **Автодеплой**: При push до `main`
- **Розташування**: `/home/pi/kitkuhar` на Raspberry Pi

## Workflow Розробки

```mermaid
graph LR
    A[Local Test] -->|Все працює| B[git push main]
    B --> C[Auto Deploy to Pi]
```

## Налаштування GitHub Secrets

Додайте наступні secrets в GitHub Repository Settings:

```
PI_HOST=kitkuhar.com
PI_USER=pi
PI_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
[ваш приватний SSH ключ]
-----END OPENSSH PRIVATE KEY-----
```

## Налаштування Raspberry Pi

На вашому Raspberry Pi:

```bash
# Перейди в директорію де зараз сайт
cd /home/pi/kitkuhar  # або твоя поточна директорія

# Додай віддалений репозиторій якщо ще не додано
git remote add origin https://github.com/yourusername/kitkuhar.git

# Налаштуй гілку main для автодеплою
git branch --set-upstream-to=origin/main main
```

## Локальна Розробка

### Тестування змін локально
```bash
# Використовуй локальне середовище для тестів
cp .env.local .env
docker-compose -f docker-compose.local.yml up

# Тестуй на http://localhost:3001
```

### Запуск як на продакшені
```bash
cp .env.production .env  
docker-compose up
```

## Команди Git

### Типовий workflow розробки
```bash
# 1. Розробка на комп'ютері
git pull origin main  # отримуємо останні зміни

# 2. Тестування локально
docker-compose -f docker-compose.local.yml up
# Тестуємо на http://localhost:3001

# 3. Якщо все працює - відправляємо в прод
git add .
git commit -m "feat: нова функціональність"
git push origin main  # ← АВТОДЕПЛОЙ НА RASPBERRY PI!
```

## Моніторинг

- **Local**: Логи на рівні DEBUG для розробки
- **Prod**: Логи на рівні WARNING + health checks + автотести

## Troubleshooting

### Deployment Failed
1. Перевірте GitHub Actions logs
2. Перевірте SSH з'єднання до Raspberry Pi  
3. Перевірте правильність environment variables
4. Перевірте Docker logs на Pi: `docker-compose logs`

### Database Issues
- `kitkuhar_local` для локального тестування
- `kitkuhar` для production на Pi

### Швидкий rollback
```bash
# На Raspberry Pi
cd /home/pi/kitkuhar
git reset --hard HEAD~1  # повертаємося на попередню версію
docker-compose up --build -d
```