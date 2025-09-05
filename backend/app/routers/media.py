from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from app.file_handler import save_recipe_step_file, save_multiple_step_files, delete_recipe_step_file

router = APIRouter(prefix="/api/media", tags=["media"])

@router.post("/upload-step-file")
async def upload_step_file(file: UploadFile = File(...)):
    """Uploads one file for recipe step"""
    try:
        file_info = await save_recipe_step_file(file)
        return {
            "success": True,
            "message": "File uploaded successfully",
            "file": file_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload error: {str(e)}")

@router.post("/upload-step-files")
async def upload_step_files(files: List[UploadFile] = File(...)):
    """Uploads multiple files for recipe step"""
    try:
        files_info = await save_multiple_step_files(files)
        return {
            "success": True,
            "message": f"Successfully uploaded {len(files_info)} files",
            "files": files_info
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Files upload error: {str(e)}")

@router.delete("/delete-step-file/{filename}")
async def delete_step_file(filename: str):
    """Deletes recipe step file"""
    try:
        success = delete_recipe_step_file(filename)
        if success:
            return {
                "success": True,
                "message": "File deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File deletion error: {str(e)}")