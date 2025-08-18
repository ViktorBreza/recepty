from sqlalchemy.orm import Session
from . import models, schemas

# Recipes
def get_recipe(db: Session, recipe_id: int):
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()

def get_recipes(db: Session, skip: int = 0, limit: int = 10, search: str = ""):
    query = db.query(models.Recipe)
    if search:
        query = query.filter(models.Recipe.title.contains(search))
    return query.offset(skip).limit(limit).all()

def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    db_recipe = models.Recipe(**recipe.dict())
    if recipe.tags:
        db_recipe.tags = db.query(models.Tag).filter(models.Tag.id.in_(recipe.tags)).all()
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe

# Categories
def get_categories(db: Session):
    return db.query(models.Category).all()

def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# Tags
def get_tags(db: Session):
    return db.query(models.Tag).all()

def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag
