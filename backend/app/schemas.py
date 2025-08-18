from pydantic import BaseModel
from typing import List, Optional

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
        orm_mode = True

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        orm_mode = True

# -------------------------------
# Структура інгредієнта
# -------------------------------
class Ingredient(BaseModel):
    name: str
    quantity: float
    unit: str  # наприклад: "г", "кг", "ст.л.", "ч.л.", "мл"

# -------------------------------
# Рецепти
# -------------------------------
class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: List[Ingredient]
    steps: str
    servings: int
    category_id: int
    tags: Optional[List[int]] = []

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    category: Category
    tags: List[Tag] = []

    class Config:
        orm_mode = True
