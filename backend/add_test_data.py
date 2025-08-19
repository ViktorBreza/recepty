#!/usr/bin/env python3
"""
Додає тестові категорії та теги в базу даних
"""

import sqlite3
from pathlib import Path

DATABASE_PATH = Path("recipes.db")

def add_categories():
    """Додає базові категорії"""
    categories = [
        "Супи",
        "Салати", 
        "М'ясні страви",
        "Рибні страви",
        "Овочеві страви",
        "Десерти",
        "Напої",
        "Закуски",
        "Випічка",
        "Каші та гарніри"
    ]
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        for category in categories:
            cursor.execute(
                "INSERT OR IGNORE INTO categories (name) VALUES (?)",
                (category,)
            )
        
        conn.commit()
        print(f"Додано {len(categories)} категорій")
        
    except Exception as e:
        print(f"Помилка додавання категорій: {e}")
        conn.rollback()
    finally:
        conn.close()

def add_tags():
    """Додає базові теги"""
    tags = [
        "Швидко",
        "Легко",
        "Вегетаріанське", 
        "Веганське",
        "Без глютену",
        "Дієтичне",
        "Святкове",
        "Для дітей",
        "Гостре",
        "Солодке",
        "Українська кухня",
        "Італійська кухня",
        "Азійська кухня",
        "На грилі",
        "Запечене"
    ]
    
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        for tag in tags:
            cursor.execute(
                "INSERT OR IGNORE INTO tags (name) VALUES (?)",
                (tag,)
            )
        
        conn.commit()
        print(f"Додано {len(tags)} тегів")
        
    except Exception as e:
        print(f"Помилка додавання тегів: {e}")
        conn.rollback()
    finally:
        conn.close()

def check_database():
    """Перевіряє стан бази даних"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        # Перевіряємо кількість записів
        cursor.execute("SELECT COUNT(*) FROM categories")
        categories_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM tags") 
        tags_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM recipes")
        recipes_count = cursor.fetchone()[0]
        
        print(f"В базі даних:")
        print(f"  - Категорій: {categories_count}")
        print(f"  - Тегів: {tags_count}")
        print(f"  - Рецептів: {recipes_count}")
        
    except Exception as e:
        print(f"Помилка перевірки БД: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    if not DATABASE_PATH.exists():
        print("База даних не знайдена!")
        exit(1)
    
    print("Додавання тестових даних...")
    
    add_categories()
    add_tags()
    check_database()
    
    print("Готово!")