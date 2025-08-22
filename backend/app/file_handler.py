import os
import uuid
from fastapi import UploadFile, HTTPException
from pathlib import Path
import shutil
from typing import List

# Base path for media files
MEDIA_ROOT = Path("media")
RECIPE_STEPS_DIR = MEDIA_ROOT / "recipe_steps"

# Create directories if they don't exist
MEDIA_ROOT.mkdir(exist_ok=True)
RECIPE_STEPS_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg", ".mov"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

def get_file_type(filename: str) -> str:
    """Determines file type by extension"""
    ext = Path(filename).suffix.lower()
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return "video"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

def validate_file(file: UploadFile) -> None:
    """Validates uploaded file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="File must have a name")
    
    # Check extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    if hasattr(file.file, 'seek') and hasattr(file.file, 'tell'):
        file.file.seek(0, 2)  # Go to end of file
        size = file.file.tell()
        file.file.seek(0)  # Return to beginning
        
        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024:.1f}MB"
            )

async def save_recipe_step_file(file: UploadFile) -> dict:
    """Saves file for recipe step and returns information about it"""
    validate_file(file)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = RECIPE_STEPS_DIR / unique_filename
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return file information
        return {
            "filename": unique_filename,
            "original_filename": file.filename,
            "type": get_file_type(file.filename),
            "url": f"/static/recipe_steps/{unique_filename}",
            "size": file_path.stat().st_size
        }
    
    except Exception as e:
        # Delete file if something went wrong
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"File save error: {str(e)}")

async def save_multiple_step_files(files: List[UploadFile]) -> List[dict]:
    """Saves multiple files for recipe step"""
    if len(files) > 5:  # Limit number of files per step
        raise HTTPException(status_code=400, detail="Maximum 5 files per step")
    
    saved_files = []
    try:
        for file in files:
            if file.filename:  # Ignore empty files
                file_info = await save_recipe_step_file(file)
                saved_files.append(file_info)
        
        return saved_files
    
    except Exception as e:
        # Delete all saved files in case of error
        for file_info in saved_files:
            file_path = RECIPE_STEPS_DIR / file_info["filename"]
            if file_path.exists():
                file_path.unlink()
        raise e

def delete_recipe_step_file(filename: str) -> bool:
    """Deletes recipe step file"""
    try:
        file_path = RECIPE_STEPS_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False

def get_file_url(filename: str) -> str:
    """Returns URL for file access"""
    return f"/static/recipe_steps/{filename}"