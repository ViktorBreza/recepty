from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.database import Base, engine
from app.routers import recipes, categories, tags

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Recipe App API")

# Root endpoint -> redirect to docs
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# Routers
app.include_router(recipes.router)
app.include_router(categories.router)
app.include_router(tags.router)
# This is the main entry point for the FastAPI application.