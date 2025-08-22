from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from app import crud, schemas, database
from app.auth import get_current_user_optional

router = APIRouter(prefix="/comments", tags=["comments"])
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

@router.post("/", response_model=schemas.Comment)
def create_comment(
    comment_data: schemas.CommentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Create comment for recipe. Works for registered and anonymous users.
    """
    # Check if recipe exists
    recipe = crud.get_recipe_by_id(db, comment_data.recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # For registered users use username as author_name
    if current_user:
        comment_data.author_name = current_user.username
    else:
        # Generate session_id for anonymous users
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
    Get recipe comments with pagination.
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
    Update comment (only owner can edit).
    """
    user_id = current_user.id if current_user else None
    session_id = get_session_id(request) if not current_user else None
    
    updated_comment = crud.update_comment(db, comment_id, content, user_id, session_id)
    if not updated_comment:
        raise HTTPException(status_code=404, detail="Comment not found or no permission to edit")
    
    return {"detail": "Comment updated"}

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    """
    Delete comment (only owner can delete).
    """
    user_id = current_user.id if current_user else None
    session_id = get_session_id(request) if not current_user else None
    
    success = crud.delete_comment(db, comment_id, user_id, session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found or no permission to delete")
    
    return {"detail": "Comment deleted"}