from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
from app import crud, schemas, database
from app.auth import get_current_user_optional

router = APIRouter(prefix="/ratings", tags=["ratings"])
get_db = database.get_db

def get_session_id(request: Request) -> str:
    """
    Generates session_id for anonymous users based on IP and User-Agent.
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
    Rate recipe (1-5 stars). Works for registered and anonymous users.
    """
    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if recipe exists
    recipe = crud.get_recipe_by_id(db, rating_data.recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Generate session_id for anonymous users
    if not current_user:
        rating_data.session_id = get_session_id(request)
    
    user_id = current_user.id if current_user else None
    return crud.create_or_update_rating(db, rating_data, user_id)

@router.get("/{recipe_id}/stats", response_model=schemas.RecipeStats)
def get_recipe_rating_stats(recipe_id: int, db: Session = Depends(get_db)):
    """
    Get recipe rating statistics.
    """
    recipe = crud.get_recipe_by_id(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return crud.get_recipe_stats(db, recipe_id)

@router.get("/{recipe_id}/user-rating")
def get_user_recipe_rating(
    recipe_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Get current user's rating for recipe.
    """
    user_id = current_user.id if current_user else None
    session_id = get_session_id(request) if not current_user else None
    
    rating = crud.get_user_rating(db, recipe_id, user_id, session_id)
    if rating:
        return {"rating": rating.rating}
    return {"rating": None}