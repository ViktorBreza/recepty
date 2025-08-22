from fastapi import FastAPI, UploadFile, File
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import recipes, categories, tags, auth, ratings, comments

app = FastAPI(title="Recipe App API")

# Create tables after app creation
Base.metadata.create_all(bind=engine)

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Root endpoint -> redirect to docs
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# Include routers
app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(ratings.router)
app.include_router(comments.router)

# Simple media upload endpoint for testing
@app.post("/media/upload-step-files")
async def upload_step_files():
    """Test endpoint for file uploading"""
    return {"success": True, "message": "Upload endpoint is working!"}