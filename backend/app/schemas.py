from pydantic import BaseModel
from typing import List, Optional

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

class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: str
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
