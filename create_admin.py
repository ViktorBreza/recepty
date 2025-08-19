#!/usr/bin/env python3
import requests
import json

# Дані для створення адміна
admin_data = {
    "username": "viktoradmin",
    "email": "admin@example.com",
    "password": "adminzalupa"
}

try:
    # Спочатку створюємо звичайного користувача
    print("Створюємо користувача...")
    response = requests.post(
        "http://localhost:8000/auth/register",
        json=admin_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        print("✅ Користувач створений успішно")
        user_data = response.json()
        print(f"ID користувача: {user_data['id']}")
        
        # Тепер потрібно оновити його роль на адміна через базу даних
        print("\n⚠️  Тепер потрібно вручну оновити роль користувача на адміна в базі даних")
        print("Виконайте наступну команду SQL:")
        print(f"UPDATE users SET is_admin = 1 WHERE username = 'viktoradmin';")
        
    else:
        print(f"❌ Помилка створення користувача: {response.status_code}")
        try:
            error_data = response.json()
            print(f"Деталі помилки: {error_data}")
        except:
            print(f"Відповідь сервера: {response.text}")

except requests.exceptions.ConnectionError:
    print("❌ Не вдається підключитися до сервера. Переконайтеся, що backend запущений на http://localhost:8000")
except Exception as e:
    print(f"❌ Несподівана помилка: {e}")