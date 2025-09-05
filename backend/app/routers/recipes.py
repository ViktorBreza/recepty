from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas, database
from app.logger import log_database_event, log_error

router = APIRouter(prefix="/api/recipes", tags=["recipes"])
get_db = database.get_db

# -------------------------------
# READ: recipes list with filtering
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
    Returns list of recipes.
    Can be filtered by name, category and tags.
    """
    return crud.get_recipes(db, skip, limit, search, category_id, tag_ids)

# -------------------------------
# CREATE: add new recipe
# -------------------------------
@router.post("/", response_model=schemas.Recipe)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    """
    Creates new recipe with category and tags.
    """
    try:
        # Could add check for existence of category_id and tag_ids
        db_recipe = crud.create_recipe(db, recipe)
        log_database_event("create", "recipe", db_recipe.id)
        return db_recipe
    except Exception as e:
        log_error(e, "create_recipe")
        raise HTTPException(status_code=500, detail="Failed to create recipe")

# -------------------------------
# READ: get recipe by id
# -------------------------------
@router.get("/{recipe_id}", response_model=schemas.Recipe)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = crud.get_recipe_by_id(db, recipe_id)
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db_recipe

# -------------------------------
# UPDATE: update recipe
# -------------------------------
@router.put("/{recipe_id}", response_model=schemas.Recipe)
def update_recipe(recipe_id: int, recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    try:
        db_recipe = crud.update_recipe(db, recipe_id, recipe)
        if not db_recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        log_database_event("update", "recipe", recipe_id)
        return db_recipe
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "update_recipe")
        raise HTTPException(status_code=500, detail="Failed to update recipe")

# -------------------------------
# DELETE: delete recipe
# -------------------------------
@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    try:
        success = crud.delete_recipe(db, recipe_id)
        if not success:
            raise HTTPException(status_code=404, detail="Recipe not found")
        log_database_event("delete", "recipe", recipe_id)
        return {"detail": "Recipe deleted"}
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "delete_recipe")
        raise HTTPException(status_code=500, detail="Failed to delete recipe")
