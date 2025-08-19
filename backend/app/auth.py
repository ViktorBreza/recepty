from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

# Конфігурація
SECRET_KEY = "your-super-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24  # 30 днів

# Контекст для хешування паролів
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer для отримання токену з заголовків
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Перевіряє пароль"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Хешує пароль"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Створює JWT токен"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[schemas.TokenData]:
    """Перевіряє JWT токен"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return schemas.TokenData(username=username)
    except JWTError:
        return None

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """Отримує користувача за ім'ям"""
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Отримує користувача за email"""
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """Аутентифікує користувача"""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """Отримує поточного користувача з токену"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
    
    user = get_user_by_username(db, token_data.username)
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Перевіряє чи активний поточний користувач"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    """Перевіряє чи поточний користувач є адміном"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# Optional dependency - не викидає помилку якщо користувач не авторизований
def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[models.User]:
    """Отримує поточного користувача або None якщо не авторизований"""
    if not credentials:
        return None
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        return None
    
    user = get_user_by_username(db, token_data.username)
    return user if user and user.is_active else None