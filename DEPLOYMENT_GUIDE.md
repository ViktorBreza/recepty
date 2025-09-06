# 🚀 Інструкція по налаштуванню автодеплою

## Крок 1: На комп'ютері (зараз)

```bash
# Відправ всі зміни
git add .
git commit -m "Setup dev/test environments"
git push origin main

# Створи test гілку
git checkout -b test
git push -u origin test
git checkout main
```

## Крок 2: GitHub Secrets

Йди в GitHub → Settings → Secrets and Variables → Actions і додай:

```
PI_HOST = kitkuhar.com (або IP твоєї Pi)
PI_USER = pi (або твій користувач на Pi) 
PI_SSH_KEY = [SSH приватний ключ - дивись нижче як створити]
```

### Створення SSH ключа:

На комп'ютері:
```bash
ssh-keygen -t ed25519 -C "github-actions"
# Натисни Enter для збереження в ~/.ssh/id_ed25519
# Не ставити пароль для автоматизації

# Скопіюй публічний ключ
cat ~/.ssh/id_ed25519.pub
```

На Raspberry Pi:
```bash
# Додай публічний ключ в authorized_keys
echo "ssh-ed25519 AAAA... github-actions" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Приватний ключ (`~/.ssh/id_ed25519`) - скопіюй весь вміст в GitHub Secret `PI_SSH_KEY`

## Крок 3: На Raspberry Pi

**ВАЖЛИВО: Не зупиняй поточний сайт!**

```bash
# Створи окремі директорії для середовищ
sudo mkdir -p /home/pi/kitkuhar-deployments/{test,prod}
sudo chown -R pi:pi /home/pi/kitkuhar-deployments

# Клонуй репо для test середовища
cd /home/pi/kitkuhar-deployments/test
git clone https://github.com/[твій-username]/kitkuhar.git .
git checkout test

# Клонуй репо для prod середовища  
cd /home/pi/kitkuhar-deployments/prod
git clone https://github.com/[твій-username]/kitkuhar.git .
git checkout main

# Копіюй .env файли
cd /home/pi/kitkuhar-deployments/test
cp .env.test .env

cd /home/pi/kitkuhar-deployments/prod  
cp .env.production .env
```

## Крок 4: Тестування без зупинки prod

```bash
# Спочатку тестуємо test середовище на інших портах
cd /home/pi/kitkuhar-deployments/test
docker-compose -f docker-compose.test.yml up -d

# Перевір чи працює на тестових портах
curl http://localhost:3002  # frontend test
curl http://localhost:8002  # backend test
```

## Крок 5: Коли готовий до переходу

Коли все протестовано і працює:

```bash
# Зупини старий сайт
cd /home/pi/[твоя-поточна-директорія]  
docker-compose down

# Запусти новий prod через автодеплой
cd /home/pi/kitkuhar-deployments/prod
docker-compose up -d

# Перевір
curl https://kitkuhar.com
```

## Крок 6: Workflow розробки

Тепер для внесення змін:

1. **На комп'ютері розробляємо:**
```bash
git checkout test
# Робимо зміни
git add .
git commit -m "feat: нова функція"
git push origin test  # ← Автодеплой на test!
```

2. **Тестуємо на https://test.kitkuhar.com**

3. **Якщо все OK - переносимо в prod:**
```bash
git checkout main
git merge test
git push origin main  # ← Автодеплой на prod!
```

## Переваги цього підходу:

✅ Сайт не зупиняється  
✅ Автоматичні деплої  
✅ Тестування перед продом  
✅ Rollback через GitHub  
✅ Розробка на комп'ютері  

## Troubleshooting

### Якщо щось пішло не так:
```bash
# Швидкий rollback до попередньої версії
cd /home/pi/kitkuhar-deployments/prod
git reset --hard HEAD~1
docker-compose up --build -d
```

### Перегляд логів:
```bash
cd /home/pi/kitkuhar-deployments/prod
docker-compose logs -f
```

---

# ⚠️ ЧАСТЫЕ ПРОБЛЕМЫ ДЕПЛОЯ И ЯК ЇХ УНИКАТИ

## 🔥 Проблема #1: `/api/docs` возвращает 404

**Причина**: Неправильная конфигурация nginx proxy.

❌ **НЕПРАВИЛЬНО**:
```nginx
location /api/ {
    proxy_pass http://backend/api/;  # ДВОЙНОЙ /api/ !!!
}
```

✅ **ПРАВИЛЬНО**:
```nginx
location /api/ {
    proxy_pass http://backend/;  # БЕЗ /api/ на конце
}
```

**Почему**: FastAPI роутеры уже имеют префикс `/api/`, nginx добавлять НЕ надо!

## 🔧 Автоматическая проверка перед деплоем

Теперь в workflow добавлены скрипты:

### 1. Проверка nginx конфигурации
```bash
./scripts/test-nginx-config.sh
```

### 2. Проверка endpoints после деплоя  
```bash
./scripts/verify-deployment.sh
```

## 🎯 Как навсегда избежать этих проблем

### 1. ВСЕГДА проверяй nginx конфиг:
```bash
# Ищи двойные /api/ префиксы
grep "proxy_pass.*backend/api/" nginx/nginx.nextjs.conf
# Если что-то находит - это ОШИБКА!
```

### 2. ВСЕГДА проверяй endpoints после деплоя:
```bash
curl -f https://kitkuhar.com/api/docs
curl -f https://kitkuhar.com/api/health  
```

### 3. Архитектура маршрутизации:
```
URL: https://kitkuhar.com/api/docs
     ↓
Nginx: location /api/ { proxy_pass http://backend/; }
     ↓  
Backend: FastAPI(docs_url="/api/docs") + роутеры с префиксом /api/
     ↓
Результат: backend:8000/api/docs ✅
```

## 🚨 Экстренные действия при 404

Если после деплоя `/api/docs` не работает:

1. **Быстрая проверка**:
   ```bash
   curl -f https://kitkuhar.com/api/health
   # Если 404 - проблема в nginx routing
   # Если 405 - endpoint есть, но метод неправильный (это OK)
   ```

2. **Исправление**:
   ```bash
   # В nginx/nginx.nextjs.conf найди и исправь:
   proxy_pass http://backend/api/;  # ← убери /api/
   # на:  
   proxy_pass http://backend/;
   ```

3. **Коммит и пуш** - автодеплой исправит проблему.

## 📝 Чек-лист перед каждым деплоем

- [ ] Nginx syntax OK: `nginx -t` 
- [ ] Нет двойных `/api/` префиксов в proxy_pass
- [ ] FastAPI docs_url="/api/docs"
- [ ] Скрипты проверки работают локально
- [ ] После деплоя все endpoints отвечают

**ЗАПОМНИ**: Эти скрипты и проверки сэкономят кучу времени!

---

# 🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА: WEBHOOK НЕ ОБНОВЛЯЕТ ФАЙЛЫ

## Диагностика проблемы

**Симптомы**:
- ✅ Webhook получает запрос (200 OK)
- ❌ Nginx конфигурация не обновляется  
- ❌ Docker контейнеры не перебудовываются
- ❌ Изменения в коде не применяются

**Тест**: `curl https://kitkuhar.com/health` должен показывать версию v1.0.1, но показывает старую.

## Решение

### 1. На сервере создать правильный deployment script

```bash
# На Raspberry Pi создать /home/pi/kitkuhar/deploy.sh
chmod +x deploy.sh
```

### 2. Webhook сервер должен выполнять:

```bash
cd /home/pi/kitkuhar
./deploy.sh
```

### 3. deploy.sh должен:
- Получать последние изменения из Git
- Останавливать контейнеры  
- Очищать Docker кеш
- Перебудовывать с --no-cache
- Запускать новые контейнеры

## Проверка что webhook работает

```bash
# Должно показать обновленную версию:
curl https://kitkuhar.com/health
# Ожидается: "Кіт Кухар is healthy! v1.0.1 - nginx updated"

# Должно работать:
curl https://kitkuhar.com/api/docs
# Ожидается: FastAPI документация
```

## Экстренный фикс

Пока webhook не работает, можно:
1. Подключиться к серверу через SSH
2. Запустить `./deploy.sh` вручную
3. Проверить что все обновилось