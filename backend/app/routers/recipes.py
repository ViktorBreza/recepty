from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, database

router = APIRouter(prefix="/recipes", tags=["recipes"])
get_db = database.get_db

# -------------------------------
# READ: список рецептів з фільтрацією
# -------------------------------
@router.get("/", response_model=List[schemas.Recipe])
def read_recipes(
    skip: int = 0,
    limit: int = 10,
    search: str = "",
    category_id: Optional[int] = None,
    tag_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Повертає список рецептів.
    Можна фільтрувати по назві, категорії та тегах.
    """
    return crud.get_recipes(db, skip, limit, search, category_id, tag_ids)

# -------------------------------
# CREATE: додати новий рецепт
# -------------------------------
@router.post("/", response_model=schemas.Recipe)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    """
    Створює новий рецепт з категорією та тегами.
    """
    # Можна додати перевірку на існування category_id та tag_ids
    db_recipe = crud.create_recipe(db, recipe)
    return db_recipe

# -------------------------------
# READ: отримати рецепт по id
# -------------------------------
@router.get("/{recipe_id}", response_model=schemas.Recipe)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = crud.get_recipe_by_id(db, recipe_id)
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db_recipe

# -------------------------------
# UPDATE: оновити рецепт
# -------------------------------
@router.put("/{recipe_id}", response_model=schemas.Recipe)
def update_recipe(recipe_id: int, recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = crud.update_recipe(db, recipe_id, recipe)
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db_recipe

# -------------------------------
# DELETE: видалити рецепт
# -------------------------------
@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    success = crud.delete_recipe(db, recipe_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return {"detail": "Recipe deleted"}
