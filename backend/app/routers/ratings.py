from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
from app import crud, schemas, database
from app.auth import get_current_user_optional

router = APIRouter(prefix="/ratings", tags=["ratings"])
get_db = database.get_db

def get_session_id(request: Request) -> str:
    """
    Генерує session_id для анонімних користувачів на основі IP та User-Agent.
    """
    import hashlib
    client_ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    session_data = f"{client_ip}:{user_agent}"
    return hashlib.md5(session_data.encode()).hexdigest()

@router.post("/", response_model=schemas.Rating)
def rate_recipe(
    rating_data: schemas.RatingCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Оцінити рецепт (1-5 зірок). Працює для зареєстрованих та анонімних користувачів.
    """
    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(status_code=400, detail="Рейтинг повинен бути від 1 до 5")
    
    # Перевіряємо чи існує рецепт
    recipe = crud.get_recipe_by_id(db, rating_data.recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не знайдено")
    
    # Для анонімних користувачів генеруємо session_id
    if not current_user:
        rating_data.session_id = get_session_id(request)
    
    user_id = current_user.id if current_user else None
    return crud.create_or_update_rating(db, rating_data, user_id)

@router.get("/{recipe_id}/stats", response_model=schemas.RecipeStats)
def get_recipe_rating_stats(recipe_id: int, db: Session = Depends(get_db)):
    """
    Отримати статистику рейтингу рецепту.
    """
    print(f"Searching for recipe with ID: {recipe_id}")
    recipe = crud.get_recipe_by_id(db, recipe_id)
    print(f"Recipe found: {recipe is not None}")
    if not recipe:
        print("Recipe not found, raising 404")
        raise HTTPException(status_code=404, detail="Рецепт не знайдено")
    
    print(f"Getting stats for recipe: {recipe.title}")
    stats = crud.get_recipe_stats(db, recipe_id)
    print(f"Stats: {stats}")
    return stats

@router.get("/{recipe_id}/user-rating")
def get_user_recipe_rating(
    recipe_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Отримати рейтинг поточного користувача для рецепту.
    """
    user_id = current_user.id if current_user else None
    session_id = get_session_id(request) if not current_user else None
    
    rating = crud.get_user_rating(db, recipe_id, user_id, session_id)
    if rating:
        return {"rating": rating.rating}
    return {"rating": None}