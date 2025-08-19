#!/usr/bin/env python3
from app.database import SessionLocal
from app import models, auth
from sqlalchemy.exc import IntegrityError

def create_admin():
    db = SessionLocal()
    try:
        # Перевіряємо, чи користувач вже існує
        existing_user = db.query(models.User).filter(models.User.username == "viktoradmin").first()
        if existing_user:
            print("ОШИБКА: Пользователь 'viktoradmin' уже существует")
            return False
        
        # Створюємо нового адміна
        hashed_password = auth.get_password_hash("adminzalupa")
        admin_user = models.User(
            username="viktoradmin",
            email="admin@example.com",
            hashed_password=hashed_password,
            is_admin=True,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("УСПЕХ: Админа создано успешно!")
        print(f"ID: {admin_user.id}")
        print(f"Username: {admin_user.username}")
        print(f"Email: {admin_user.email}")
        print(f"Is Admin: {admin_user.is_admin}")
        print(f"Is Active: {admin_user.is_active}")
        
        return True
        
    except IntegrityError as e:
        db.rollback()
        print(f"ОШИБКА целостности: {e}")
        return False
    except Exception as e:
        db.rollback()
        print(f"ОШИБКА: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()