#!/usr/bin/env python3
"""
Скрипт для міграції старої бази даних до нової схеми з рейтингами та коментарями.
"""

import sqlite3
import os
from pathlib import Path

# Шляхи до баз даних
OLD_DB = "recipes_backup.db"
NEW_DB = "recipes.db"

def create_new_database():
    """Створює нову базу даних з правильною схемою."""
    print("Створюємо нову базу даних...")
    
    # Видаляємо стару базу якщо існує
    if os.path.exists(NEW_DB):
        os.remove(NEW_DB)
    
    # Імпортуємо моделі та створюємо таблиці
    import sys
    sys.path.append('.')
    
    # Імпортуємо всі моделі перед створенням таблиць
    from app import models
    from app.database import Base, engine
    Base.metadata.create_all(bind=engine)
    print("Нова база даних створена")

def migrate_data():
    """Переносить дані зі старої бази в нову."""
    print("Переносимо дані...")
    
    old_conn = sqlite3.connect(OLD_DB)
    new_conn = sqlite3.connect(NEW_DB)
    
    try:
        old_cursor = old_conn.cursor()
        new_cursor = new_conn.cursor()
        
        # Мігруємо категорії
        print("  - Мігруємо категорії...")
        old_cursor.execute("SELECT id, name FROM categories")
        categories = old_cursor.fetchall()
        
        for cat_id, name in categories:
            new_cursor.execute(
                "INSERT OR REPLACE INTO categories (id, name) VALUES (?, ?)",
                (cat_id, name)
            )
        print(f"    Мігровано {len(categories)} категорій")
        
        # Мігруємо теги
        print("  - Мігруємо теги...")
        old_cursor.execute("SELECT id, name FROM tags")
        tags = old_cursor.fetchall()
        
        for tag_id, name in tags:
            new_cursor.execute(
                "INSERT OR REPLACE INTO tags (id, name) VALUES (?, ?)",
                (tag_id, name)
            )
        print(f"    Мігровано {len(tags)} тегів")
        
        # Створюємо базового користувача для рецептів
        print("  - Створюємо базового користувача...")
        new_cursor.execute("""
            INSERT OR REPLACE INTO users 
            (id, email, username, hashed_password, is_admin, is_active, created_at, updated_at) 
            VALUES (1, 'system@example.com', 'system', 'hashed', 0, 1, datetime('now'), datetime('now'))
        """)
        
        # Мігруємо рецепти
        print("  - Мігруємо рецепти...")
        old_cursor.execute("SELECT id, title, description, ingredients, steps, servings, category_id FROM recipes")
        recipes = old_cursor.fetchall()
        
        for recipe_id, title, description, ingredients, steps, servings, category_id in recipes:
            new_cursor.execute("""
                INSERT OR REPLACE INTO recipes 
                (id, title, description, ingredients, steps, servings, category_id, author_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
            """, (recipe_id, title, description, ingredients, steps, servings, category_id))
        print(f"    Мігровано {len(recipes)} рецептів")
        
        # Мігруємо зв'язки рецепт-тег
        print("  - Мігруємо зв'язки рецепт-тег...")
        try:
            old_cursor.execute("SELECT recipe_id, tag_id FROM recipe_tag")
            recipe_tags = old_cursor.fetchall()
            
            for recipe_id, tag_id in recipe_tags:
                new_cursor.execute(
                    "INSERT OR REPLACE INTO recipe_tag (recipe_id, tag_id) VALUES (?, ?)",
                    (recipe_id, tag_id)
                )
            print(f"    Мігровано {len(recipe_tags)} зв'язків")
        except sqlite3.Error as e:
            print(f"    Помилка при міграції зв'язків (ймовірно їх немає): {e}")
        
        # Підтверджуємо зміни
        new_conn.commit()
        print("Дані успішно мігровані")
        
        # Перевіряємо результат
        new_cursor.execute("SELECT COUNT(*) FROM recipes")
        recipes_count = new_cursor.fetchone()[0]
        
        new_cursor.execute("SELECT COUNT(*) FROM categories")
        categories_count = new_cursor.fetchone()[0]
        
        new_cursor.execute("SELECT COUNT(*) FROM tags")
        tags_count = new_cursor.fetchone()[0]
        
        print(f"\nРезультат міграції:")
        print(f"  - Рецептів: {recipes_count}")
        print(f"  - Категорій: {categories_count}")
        print(f"  - Тегів: {tags_count}")
        
    except Exception as e:
        print(f"Помилка міграції: {e}")
        new_conn.rollback()
        raise
    finally:
        old_conn.close()
        new_conn.close()

def main():
    if not os.path.exists(OLD_DB):
        print(f"Стара база даних {OLD_DB} не знайдена!")
        return
    
    print("Початок міграції бази даних...")
    
    # Створюємо нову базу
    create_new_database()
    
    # Переносимо дані
    migrate_data()
    
    print("Міграція завершена успішно!")
    print(f"Стара база збережена як {OLD_DB}")
    print(f"Нова база створена як {NEW_DB}")

if __name__ == "__main__":
    main()