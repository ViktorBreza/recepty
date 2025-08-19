from fastapi import FastAPI
from app.routers import auth

app = FastAPI()
app.include_router(auth.router)

if __name__ == "__main__":
    print("Auth routes:")
    for route in auth.router.routes:
        print(f"  {route.methods} {auth.router.prefix}{route.path}")
    
    print("\nApp routes:")
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            print(f"  {route.methods} {route.path}")