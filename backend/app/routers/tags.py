from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import crud, schemas, database, auth, models

router = APIRouter(prefix="/tags", tags=["tags"])
get_db = database.get_db

@router.get("/", response_model=List[schemas.Tag])
def read_tags(db: Session = Depends(get_db)):
    """Gets list of all tags (available to all)"""
    return crud.get_tags(db)

@router.get("/{tag_id}", response_model=schemas.Tag)
def read_tag(tag_id: int, db: Session = Depends(get_db)):
    """Gets tag by ID (available to all)"""
    db_tag = crud.get_tag_by_id(db, tag_id)
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag

@router.post("/", response_model=schemas.Tag)
def create_tag(
    tag: schemas.TagCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Creates new tag (admin only)"""
    return crud.create_tag(db, tag)

@router.put("/{tag_id}", response_model=schemas.Tag)
def update_tag(
    tag_id: int, 
    tag: schemas.TagCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Updates tag (admin only)"""
    db_tag = crud.update_tag(db, tag_id, tag)
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag

@router.delete("/{tag_id}")
def delete_tag(
    tag_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_admin_user)
):
    """Deletes tag (admin only)"""
    success = crud.delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"detail": "Tag deleted"}
