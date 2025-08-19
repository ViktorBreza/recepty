from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, database, auth, models

router = APIRouter(prefix="/categories", tags=["categories"])
get_db = database.get_db

@router.get("/", response_model=List[schemas.Category])
def read_categories(db: Session = Depends(get_db)):
    """Отримує список всіх категорій (доступно всім)"""
    return crud.get_categories(db)

@router.get("/{category_id}", response_model=schemas.Category)
def read_category(category_id: int, db: Session = Depends(get_db)):
    """Отримує категорію за ID (доступно всім)"""
    db_category = crud.get_category_by_id(db, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.post("/", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Створює нову категорію (тільки для адмінів)"""
    return crud.create_category(db, category)

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int, 
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Оновлює категорію (тільки для адмінів)"""
    db_category = crud.update_category(db, category_id, category)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/{category_id}")
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Видаляє категорію (тільки для адмінів)"""
    success = crud.delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted"}
