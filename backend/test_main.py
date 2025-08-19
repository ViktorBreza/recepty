from fastapi import FastAPI
from app.routers import auth

app = FastAPI(title="Test Auth API")

print("Including auth router...")
app.include_router(auth.router)

print("App routes after including auth router:")
for route in app.routes:
    if hasattr(route, 'methods') and hasattr(route, 'path'):
        print(f"  {route.methods} {route.path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)