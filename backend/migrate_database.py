#!/usr/bin/env python3
"""
Script for migrating old database to new schema with ratings and comments.
"""

import sqlite3
import os
from pathlib import Path

# Database paths
OLD_DB = "recipes_backup.db"
NEW_DB = "recipes.db"

def create_new_database():
    """Creates new database with correct schema."""
    print("Creating new database...")
    
    # Remove old database if exists
    if os.path.exists(NEW_DB):
        os.remove(NEW_DB)
    
    # Import models and create tables
    import sys
    sys.path.append('.')
    
    # Import all models before creating tables
    from app import models
    from app.database import Base, engine
    Base.metadata.create_all(bind=engine)
    print("New database created")

def migrate_data():
    """Transfers data from old database to new."""
    print("Transferring data...")
    
    old_conn = sqlite3.connect(OLD_DB)
    new_conn = sqlite3.connect(NEW_DB)
    
    try:
        old_cursor = old_conn.cursor()
        new_cursor = new_conn.cursor()
        
        # Migrate categories
        print("  - Migrating categories...")
        old_cursor.execute("SELECT id, name FROM categories")
        categories = old_cursor.fetchall()
        
        for cat_id, name in categories:
            new_cursor.execute(
                "INSERT OR REPLACE INTO categories (id, name) VALUES (?, ?)",
                (cat_id, name)
            )
        print(f"    Migrated {len(categories)} categories")
        
        # Migrate tags
        print("  - Migrating tags...")
        old_cursor.execute("SELECT id, name FROM tags")
        tags = old_cursor.fetchall()
        
        for tag_id, name in tags:
            new_cursor.execute(
                "INSERT OR REPLACE INTO tags (id, name) VALUES (?, ?)",
                (tag_id, name)
            )
        print(f"    Migrated {len(tags)} tags")
        
        # Create default user for recipes
        print("  - Creating default user...")
        new_cursor.execute("""
            INSERT OR REPLACE INTO users 
            (id, email, username, hashed_password, is_admin, is_active, created_at, updated_at) 
            VALUES (1, 'system@example.com', 'system', 'hashed', 0, 1, datetime('now'), datetime('now'))
        """)
        
        # Migrate recipes
        print("  - Migrating recipes...")
        old_cursor.execute("SELECT id, title, description, ingredients, steps, servings, category_id FROM recipes")
        recipes = old_cursor.fetchall()
        
        for recipe_id, title, description, ingredients, steps, servings, category_id in recipes:
            new_cursor.execute("""
                INSERT OR REPLACE INTO recipes 
                (id, title, description, ingredients, steps, servings, category_id, author_id, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
            """, (recipe_id, title, description, ingredients, steps, servings, category_id))
        print(f"    Migrated {len(recipes)} recipes")
        
        # Migrate recipe-tag relationships
        print("  - Migrating recipe-tag relationships...")
        try:
            old_cursor.execute("SELECT recipe_id, tag_id FROM recipe_tag")
            recipe_tags = old_cursor.fetchall()
            
            for recipe_id, tag_id in recipe_tags:
                new_cursor.execute(
                    "INSERT OR REPLACE INTO recipe_tag (recipe_id, tag_id) VALUES (?, ?)",
                    (recipe_id, tag_id)
                )
            print(f"    Migrated {len(recipe_tags)} relationships")
        except sqlite3.Error as e:
            print(f"    Error migrating relationships (probably none exist): {e}")
        
        # Commit changes
        new_conn.commit()
        print("Data successfully migrated")
        
        # Check result
        new_cursor.execute("SELECT COUNT(*) FROM recipes")
        recipes_count = new_cursor.fetchone()[0]
        
        new_cursor.execute("SELECT COUNT(*) FROM categories")
        categories_count = new_cursor.fetchone()[0]
        
        new_cursor.execute("SELECT COUNT(*) FROM tags")
        tags_count = new_cursor.fetchone()[0]
        
        print(f"\nMigration result:")
        print(f"  - Recipes: {recipes_count}")
        print(f"  - Categories: {categories_count}")
        print(f"  - Tags: {tags_count}")
        
    except Exception as e:
        print(f"Migration error: {e}")
        new_conn.rollback()
        raise
    finally:
        old_conn.close()
        new_conn.close()

def main():
    if not os.path.exists(OLD_DB):
        print(f"Old database {OLD_DB} not found!")
        return
    
    print("Starting database migration...")
    
    # Create new database
    create_new_database()
    
    # Transfer data
    migrate_data()
    
    print("Migration completed successfully!")
    print(f"Old database saved as {OLD_DB}")
    print(f"New database created as {NEW_DB}")

if __name__ == "__main__":
    main()