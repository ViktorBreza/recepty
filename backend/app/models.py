from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON
from sqlalchemy.sql import func
from app.database import Base

# Зв'язок рецепти ↔ теги
recipe_tag_table = Table(
    'recipe_tag',
    Base.metadata,
    Column('recipe_id', Integer, ForeignKey('recipes.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Зв'язок з рецептами
    recipes = relationship("Recipe", back_populates="author")

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    ingredients = Column(JSON, nullable=False)  # список {name, quantity, unit}
    steps = Column(JSON, nullable=False)  # або string або список CookingStep
    servings = Column(Integer)
    category_id = Column(Integer, ForeignKey("categories.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Зв'язки
    category = relationship("Category")
    tags = relationship("Tag", secondary=recipe_tag_table)
    author = relationship("User", back_populates="recipes")
