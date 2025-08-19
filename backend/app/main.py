from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.routers import recipes, categories, tags, media

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Recipe App API")

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

# Статичні файли для медіа
app.mount("/media", StaticFiles(directory="media"), name="media")

# Root endpoint -> redirect to docs
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# Routers
app.include_router(recipes.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(media.router)
# This is the main entry point for the FastAPI application.