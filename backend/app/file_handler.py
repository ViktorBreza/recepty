import os
import uuid
from fastapi import UploadFile, HTTPException
from pathlib import Path
import shutil
from typing import List, Tuple
from PIL import Image, ImageOps
import io

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

# Image processing settings
MAX_IMAGE_WIDTH = 800
MAX_IMAGE_HEIGHT = 600
IMAGE_QUALITY = 85  # JPEG quality (1-100)

def get_file_type(filename: str) -> str:
    """Determines file type by extension"""
    ext = Path(filename).suffix.lower()
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return "video"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

def resize_image(image_data: bytes, max_width: int = MAX_IMAGE_WIDTH, max_height: int = MAX_IMAGE_HEIGHT) -> bytes:
    """
    Resize image maintaining aspect ratio while ensuring it fits within max dimensions.
    Images smaller than max dimensions are not upscaled.
    """
    try:
        # Open image from bytes
        with Image.open(io.BytesIO(image_data)) as img:
            # Convert to RGB if necessary (for JPEG output)
            if img.mode in ('RGBA', 'P', 'LA'):
                # Create a white background for transparent images
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode in ('RGBA', 'LA'):
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else img.split()[1])
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Get original dimensions
            original_width, original_height = img.size
            
            # Skip resizing if image is already smaller than max dimensions
            if original_width <= max_width and original_height <= max_height:
                # Still optimize the image
                output = io.BytesIO()
                img.save(output, format='JPEG', quality=IMAGE_QUALITY, optimize=True)
                return output.getvalue()
            
            # Calculate new dimensions maintaining aspect ratio
            aspect_ratio = original_width / original_height
            
            if aspect_ratio > (max_width / max_height):
                # Width is the limiting factor
                new_width = max_width
                new_height = int(max_width / aspect_ratio)
            else:
                # Height is the limiting factor
                new_height = max_height
                new_width = int(max_height * aspect_ratio)
            
            # Resize image with high-quality resampling
            img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save to bytes with optimization
            output = io.BytesIO()
            img_resized.save(output, format='JPEG', quality=IMAGE_QUALITY, optimize=True)
            return output.getvalue()
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")

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
    
    # Read file data
    file_data = await file.read()
    file_type = get_file_type(file.filename)
    
    # Generate unique filename - always use .jpg for processed images
    if file_type == "image":
        unique_filename = f"{uuid.uuid4()}.jpg"
    else:
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    file_path = RECIPE_STEPS_DIR / unique_filename
    
    try:
        if file_type == "image":
            # Process and resize image
            processed_image_data = resize_image(file_data)
            
            # Save processed image
            with open(file_path, "wb") as buffer:
                buffer.write(processed_image_data)
        else:
            # Save video as-is (you could add video processing here later)
            with open(file_path, "wb") as buffer:
                buffer.write(file_data)
        
        # Return file information
        return {
            "filename": unique_filename,
            "original_filename": file.filename,
            "type": file_type,
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