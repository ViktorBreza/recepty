from pydantic import BaseModel
from typing import List, Optional, Union, Any

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

class Recipe(RecipeBase):
    id: int
    category: Optional[Category] = None
    tags: List[Tag] = []

    class Config:
        from_attributes = True
