from pydantic import BaseModel, EmailStr
from typing import List, Optional, Union, Any
from datetime import datetime

# -------------------------------
# Categories and tags
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
# Ingredient structure
# -------------------------------
class Ingredient(BaseModel):
    name: str
    quantity: float
    unit: str  # for example: "g", "kg", "tbsp", "tsp", "ml"

# -------------------------------
# Media for steps
# -------------------------------
class StepMedia(BaseModel):
    id: Optional[str] = None
    type: str  # 'image' or 'video'
    filename: str
    url: str
    alt: Optional[str] = None

# -------------------------------
# Cooking step
# -------------------------------
class CookingStep(BaseModel):
    id: Optional[str] = None
    stepNumber: int
    description: str
    media: Optional[List[StepMedia]] = []

# -------------------------------
# Recipes
# -------------------------------
class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None
    ingredients: List[Ingredient]
    steps: Union[str, List[CookingStep]]  # Support for old and new format
    servings: int
    category_id: int
    tags: Optional[List[int]] = []

class RecipeCreate(RecipeBase):
    pass

# -------------------------------
# Users and authentication
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
# Ratings and comments
# -------------------------------
class RatingBase(BaseModel):
    rating: int  # from 1 to 5

class RatingCreate(BaseModel):
    recipe_id: int
    rating: int  # from 1 to 5
    session_id: Optional[str] = None  # for anonymous users

class Rating(RatingBase):
    id: int
    recipe_id: int
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[User] = None

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str
    author_name: str

class CommentCreate(CommentBase):
    recipe_id: int
    session_id: Optional[str] = None  # for anonymous users

class Comment(CommentBase):
    id: int
    recipe_id: int
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[User] = None

    class Config:
        from_attributes = True

class RecipeStats(BaseModel):
    average_rating: Optional[float] = None
    total_ratings: int = 0
    total_comments: int = 0

# -------------------------------
# Updated recipe schemas
# -------------------------------
class Recipe(RecipeBase):
    id: int
    category: Optional[Category] = None
    tags: List[Tag] = []
    author: Optional[User] = None
    ratings: List[Rating] = []
    comments: List[Comment] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
