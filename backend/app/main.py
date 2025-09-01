from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.routers import recipes, categories, tags, media, auth, ratings, comments
from app.logger import app_logger, log_request
import time
import os

app = FastAPI(title="Recipe App API")

# Create database tables after app creation
Base.metadata.create_all(bind=engine)

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log request start
    log_request(request.method, str(request.url))
    
    response = await call_next(request)
    
    # Log execution time
    process_time = time.time() - start_time
    if process_time > 1.0:  # Log only slow requests
        app_logger.warning(f"Slow request: {request.method} {request.url} took {process_time:.2f}s")
    
    return response

# CORS Middleware - Universal configuration
# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
] + ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Дозволити всі origins для prodакшену
    allow_credentials=False,  # False для wildcard origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Root endpoint -> redirect to docs
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# Routers (IMPORTANT: routers must be BEFORE StaticFiles!)
app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(media.router)
app.include_router(ratings.router)
app.include_router(comments.router)

# Static files for media - using /static to avoid conflict with /media routes
app.mount("/static", StaticFiles(directory="media"), name="media")

# Log application startup
app_logger.info("Recipe App API started successfully")