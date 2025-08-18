from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON
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

class Recipe(Base):
    __tablename__ = "recipes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    ingredients = Column(JSON, nullable=False)  # список {name, quantity, unit}
    steps = Column(String)
    servings = Column(Integer)
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category")
    tags = relationship("Tag", secondary=recipe_tag_table)
