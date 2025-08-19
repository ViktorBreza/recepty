#!/usr/bin/env python3
"""
Скрипт для міграції старого формату steps (текст) в новий формат (JSON).
Запускайте тільки один раз!
"""

import sqlite3
import json
from pathlib import Path

DATABASE_PATH = Path("recipes.db")

def migrate_steps():
    """Мігрує steps з TEXT в JSON формат"""
    if not DATABASE_PATH.exists():
        print("База даних не знайдена!")
        return
    
    # Підключаємося до БД
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        # Перевіряємо чи є колонка steps
        cursor.execute("PRAGMA table_info(recipes)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'steps' not in columns:
            print("Колонка steps не знайдена!")
            return
        
        # Отримуємо всі рецепти з текстовими кроками
        cursor.execute("SELECT id, steps FROM recipes WHERE steps IS NOT NULL")
        recipes = cursor.fetchall()
        
        print(f"Знайдено {len(recipes)} рецептів для міграції")
        
        # Мігруємо кожен рецепт
        migrated_count = 0
        for recipe_id, steps_text in recipes:
            if isinstance(steps_text, str) and steps_text.strip():
                print(f"Мігруємо рецепт ID: {recipe_id}")
                
                # Зберігаємо як JSON (просто string)
                steps_json = json.dumps(steps_text)
                
                # Оновлюємо запис
                cursor.execute(
                    "UPDATE recipes SET steps = ? WHERE id = ?",
                    (steps_json, recipe_id)
                )
                migrated_count += 1
            else:
                # Якщо steps порожній, ставимо порожній список
                steps_json = json.dumps([])
                cursor.execute(
                    "UPDATE recipes SET steps = ? WHERE id = ?",
                    (steps_json, recipe_id)
                )
        
        # Зберігаємо зміни
        conn.commit()
        print(f"Успішно мігровано {migrated_count} рецептів!")
        
        # Перевіряємо результат
        cursor.execute("SELECT COUNT(*) FROM recipes")
        total_recipes = cursor.fetchone()[0]
        print(f"Загальна кількість рецептів: {total_recipes}")
        
    except Exception as e:
        print(f"Помилка міграції: {e}")
        conn.rollback()
    finally:
        conn.close()

def backup_database():
    """Створює резервну копію БД перед міграцією"""
    if DATABASE_PATH.exists():
        backup_path = DATABASE_PATH.with_suffix('.backup')
        import shutil
        shutil.copy2(DATABASE_PATH, backup_path)
        print(f"Створено резервну копію: {backup_path}")

if __name__ == "__main__":
    print("Початок міграції БД...")
    
    # Створюємо бекап
    backup_database()
    
    # Виконуємо міграцію
    migrate_steps()
    
    print("Міграція завершена!")