import os
import uuid
from fastapi import UploadFile, HTTPException
from pathlib import Path
import shutil
from typing import List

# Базовий шлях для медіа файлів
MEDIA_ROOT = Path("media")
RECIPE_STEPS_DIR = MEDIA_ROOT / "recipe_steps"

# Створюємо директорії якщо не існують
MEDIA_ROOT.mkdir(exist_ok=True)
RECIPE_STEPS_DIR.mkdir(exist_ok=True)

# Дозволені типи файлів
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg", ".mov"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

# Максимальний розмір файлу (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

def get_file_type(filename: str) -> str:
    """Визначає тип файлу за розширенням"""
    ext = Path(filename).suffix.lower()
    if ext in ALLOWED_IMAGE_EXTENSIONS:
        return "image"
    elif ext in ALLOWED_VIDEO_EXTENSIONS:
        return "video"
    else:
        raise HTTPException(status_code=400, detail=f"Непідтримуваний тип файлу: {ext}")

def validate_file(file: UploadFile) -> None:
    """Валідація завантаженого файлу"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Файл повинен мати назву")
    
    # Перевіряємо розширення
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Непідтримуваний тип файлу. Дозволені: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Перевіряємо розмір файлу
    if hasattr(file.file, 'seek') and hasattr(file.file, 'tell'):
        file.file.seek(0, 2)  # Переходимо в кінець файлу
        size = file.file.tell()
        file.file.seek(0)  # Повертаємося на початок
        
        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"Файл занадто великий. Максимальний розмір: {MAX_FILE_SIZE / 1024 / 1024:.1f}MB"
            )

async def save_recipe_step_file(file: UploadFile) -> dict:
    """Зберігає файл для кроку рецепта та повертає інформацію про нього"""
    validate_file(file)
    
    # Генеруємо унікальну назву файлу
    file_extension = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = RECIPE_STEPS_DIR / unique_filename
    
    try:
        # Зберігаємо файл
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Повертаємо інформацію про файл
        return {
            "filename": unique_filename,
            "original_filename": file.filename,
            "type": get_file_type(file.filename),
            "url": f"/static/recipe_steps/{unique_filename}",
            "size": file_path.stat().st_size
        }
    
    except Exception as e:
        # Видаляємо файл якщо щось пішло не так
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Помилка збереження файлу: {str(e)}")

async def save_multiple_step_files(files: List[UploadFile]) -> List[dict]:
    """Зберігає декілька файлів для кроку рецепта"""
    if len(files) > 5:  # Обмежуємо кількість файлів на крок
        raise HTTPException(status_code=400, detail="Максимум 5 файлів на крок")
    
    saved_files = []
    try:
        for file in files:
            if file.filename:  # Ігноруємо порожні файли
                file_info = await save_recipe_step_file(file)
                saved_files.append(file_info)
        
        return saved_files
    
    except Exception as e:
        # Видаляємо всі збережені файли у випадку помилки
        for file_info in saved_files:
            file_path = RECIPE_STEPS_DIR / file_info["filename"]
            if file_path.exists():
                file_path.unlink()
        raise e

def delete_recipe_step_file(filename: str) -> bool:
    """Видаляє файл кроку рецепта"""
    try:
        file_path = RECIPE_STEPS_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    except Exception:
        return False

def get_file_url(filename: str) -> str:
    """Повертає URL для доступу до файлу"""
    return f"/static/recipe_steps/{filename}"