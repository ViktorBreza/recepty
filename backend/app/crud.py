from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app import models, schemas

# -------------------------------
# GET список рецептів з фільтрацією
# -------------------------------
def get_recipes(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    category_id: Optional[int] = None,
    tag_ids: Optional[List[int]] = None
):
    query = db.query(models.Recipe).options(
        joinedload(models.Recipe.category),
        joinedload(models.Recipe.tags)
    )
    if search:
        query = query.filter(models.Recipe.title.contains(search))
    if category_id:
        query = query.filter(models.Recipe.category_id == category_id)
    if tag_ids:
        query = query.join(models.Recipe.tags).filter(models.Tag.id.in_(tag_ids))
    return query.offset(skip).limit(limit).all()

# -------------------------------
# GET рецепт по id
# -------------------------------
def get_recipe_by_id(db: Session, recipe_id: int):
    return db.query(models.Recipe).options(
        joinedload(models.Recipe.category),
        joinedload(models.Recipe.tags)
    ).filter(models.Recipe.id == recipe_id).first()

# -------------------------------
# CREATE новий рецепт
# -------------------------------
def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    db_recipe = models.Recipe(
        title=recipe.title,
        description=recipe.description,
        ingredients=[ing.model_dump() for ing in recipe.ingredients],  # конвертуємо у список dict
        steps=recipe.steps,
        servings=recipe.servings,
        category_id=recipe.category_id
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)

    if recipe.tags:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(recipe.tags)).all()
        db_recipe.tags.extend(tags)
        db.commit()
        db.refresh(db_recipe)

    return db_recipe

# -------------------------------
# UPDATE рецепт
# -------------------------------
def update_recipe(db: Session, recipe_id: int, recipe: schemas.RecipeCreate):
    db_recipe = get_recipe_by_id(db, recipe_id)
    if not db_recipe:
        return None

    db_recipe.title = recipe.title
    db_recipe.description = recipe.description
    db_recipe.ingredients = [ing.model_dump() for ing in recipe.ingredients]
    db_recipe.steps = recipe.steps
    db_recipe.servings = recipe.servings
    db_recipe.category_id = recipe.category_id

    if recipe.tags is not None:
        db_recipe.tags = db.query(models.Tag).filter(models.Tag.id.in_(recipe.tags)).all()

    db.commit()
    db.refresh(db_recipe)
    return db_recipe

# -------------------------------
# DELETE рецепт
# -------------------------------
def delete_recipe(db: Session, recipe_id: int):
    db_recipe = get_recipe_by_id(db, recipe_id)
    if not db_recipe:
        return False
    db.delete(db_recipe)
    db.commit()
    return True

# -------------------------------
# CREATE нова категорія
# -------------------------------
def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# -------------------------------
# CREATE новий тег
# -------------------------------
def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(name=tag.name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

