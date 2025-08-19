from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Реєстрація нового користувача"""
    
    # Перевіряємо чи користувач з таким email вже існує
    if auth.get_user_by_email(db, user.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Перевіряємо чи користувач з таким username вже існує
    if auth.get_user_by_username(db, user.username):
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    # Створюємо нового користувача
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_admin=False,  # Звичайні користувачі за замовчуванням
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Авторизація користувача"""
    
    user = auth.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive"
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    """Отримує інформацію про поточного користувача"""
    return current_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Оновлює інформацію про поточного користувача"""
    
    # Перевіряємо унікальність email якщо він змінюється
    if user_update.email and user_update.email != current_user.email:
        if auth.get_user_by_email(db, user_update.email):
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    # Перевіряємо унікальність username якщо він змінюється
    if user_update.username and user_update.username != current_user.username:
        if auth.get_user_by_username(db, user_update.username):
            raise HTTPException(
                status_code=400,
                detail="Username already taken"
            )
        current_user.username = user_update.username
    
    db.commit()
    db.refresh(current_user)
    return current_user

# =======================
# Адміністративні методи
# =======================

@router.get("/users", response_model=List[schemas.User])
def get_all_users(
    current_user: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Отримує список всіх користувачів (тільки для адмінів)"""
    return db.query(models.User).all()

@router.post("/users", response_model=schemas.User)
def create_user_by_admin(
    user: schemas.UserCreate,
    is_admin: bool = False,
    current_user: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Створює нового користувача (тільки для адмінів)"""
    
    # Перевіряємо унікальність
    if auth.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if auth.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Створюємо користувача
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        is_admin=is_admin,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.put("/users/{user_id}", response_model=schemas.User)
def update_user_by_admin(
    user_id: int,
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Оновлює користувача (тільки для адмінів)"""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Оновлюємо поля якщо вони надані
    if user_update.email:
        if user_update.email != user.email and auth.get_user_by_email(db, user_update.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = user_update.email
    
    if user_update.username:
        if user_update.username != user.username and auth.get_user_by_username(db, user_update.username):
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = user_update.username
    
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user_by_admin(
    user_id: int,
    current_user: models.User = Depends(auth.get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Видаляє користувача (тільки для адмінів)"""
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Не дозволяємо видаляти самого себе
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user)
    db.commit()
    
    return {"detail": "User deleted successfully"}