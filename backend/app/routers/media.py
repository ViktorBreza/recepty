from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.file_handler import save_recipe_step_file, save_multiple_step_files, delete_recipe_step_file

router = APIRouter(prefix="/media", tags=["media"])

@router.post("/upload-step-file")
async def upload_step_file(file: UploadFile = File(...)):
    """Завантажує один файл для кроку рецепта"""
    try:
        file_info = await save_recipe_step_file(file)
        return {
            "success": True,
            "message": "Файл успішно завантажено",
            "file": file_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка завантаження файлу: {str(e)}")

@router.post("/upload-step-files")
async def upload_step_files(files: List[UploadFile] = File(...)):
    """Завантажує декілька файлів для кроку рецепта"""
    try:
        files_info = await save_multiple_step_files(files)
        return {
            "success": True,
            "message": f"Успішно завантажено {len(files_info)} файлів",
            "files": files_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка завантаження файлів: {str(e)}")

@router.delete("/delete-step-file/{filename}")
async def delete_step_file(filename: str):
    """Видаляє файл кроку рецепта"""
    try:
        success = delete_recipe_step_file(filename)
        if success:
            return {
                "success": True,
                "message": "Файл успішно видалено"
            }
        else:
            raise HTTPException(status_code=404, detail="Файл не знайдено")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Помилка видалення файлу: {str(e)}")