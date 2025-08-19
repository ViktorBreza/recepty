from pydantic import BaseModel, EmailStr
from typing import List, Optional, Union, Any
from datetime import datetime

# -------------------------------
# Категорії та теги
# -------------------------------
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# -------------------------------
# Структура інгредієнта
# -------------------------------
class Ingredient(BaseModel):
    name: str
    quantity: float
    unit: str  # наприклад: "г", "кг", "ст.л.", "ч.л.", "мл"

# -------------------------------
# Медіа для кроків
# -------------------------------
class StepMedia(BaseModel):
    id: Optional[str] = None
    type: str  # 'image' або 'video'
    filename: str
    url: str
    alt: Optional[str] = None

# -------------------------------
# Крок приготування
# -------------------------------
class CookingStep(BaseModel):
    id: Optional[str] = None
    stepNumber: int
    description: str
    media: Optional[List[StepMedia]] = []

# -------------------------------
# Рецепти
# -------------------------------
class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: List[Ingredient]
    steps: Union[str, List[CookingStep]]  # Підтримка старого та нового формату
    servings: int
    category_id: int
    tags: Optional[List[int]] = []

class RecipeCreate(RecipeBase):
    pass

# -------------------------------
# Користувачі та аутентифікація
# -------------------------------
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_admin: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# -------------------------------
# Оновлені схеми рецептів
# -------------------------------
class Recipe(RecipeBase):
    id: int
    category: Optional[Category] = None
    tags: List[Tag] = []
    author: Optional[User] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
