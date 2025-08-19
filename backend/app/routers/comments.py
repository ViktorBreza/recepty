from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from app import crud, schemas, database
from app.auth import get_current_user_optional

router = APIRouter(prefix="/comments", tags=["comments"])
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

@router.post("/", response_model=schemas.Comment)
def create_comment(
    comment_data: schemas.CommentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Створити коментар до рецепту. Працює для зареєстрованих та анонімних користувачів.
    """
    # Перевіряємо чи існує рецепт
    recipe = crud.get_recipe_by_id(db, comment_data.recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не знайдено")
    
    # Для зареєстрованих користувачів беремо username як author_name
    if current_user:
        comment_data.author_name = current_user.username
    else:
        # Для анонімних користувачів генеруємо session_id
        comment_data.session_id = get_session_id(request)
    
    user_id = current_user.id if current_user else None
    return crud.create_comment(db, comment_data, user_id)

@router.get("/{recipe_id}", response_model=List[schemas.Comment])
def get_recipe_comments(
    recipe_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Отримати коментарі до рецепту з пагінацією.
    """
    return crud.get_recipe_comments(db, recipe_id, skip, limit)

@router.put("/{comment_id}")
def update_comment(
    comment_id: int,
    content: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Оновити коментар (тільки власник може редагувати).
    """
    user_id = current_user.id if current_user else None
    session_id = get_session_id(request) if not current_user else None
    
    updated_comment = crud.update_comment(db, comment_id, content, user_id, session_id)
    if not updated_comment:
        raise HTTPException(status_code=404, detail="Коментар не знайдено або немає прав на редагування")
    
    return {"detail": "Коментар оновлено"}

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Видалити коментар (тільки власник може видалити).
    """
    user_id = current_user.id if current_user else None
    session_id = get_session_id(request) if not current_user else None
    
    success = crud.delete_comment(db, comment_id, user_id, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Коментар не знайдено або немає прав на видалення")
    
    return {"detail": "Коментар видалено"}