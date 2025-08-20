@echo off
cd /d "C:\Users\baktorz\Desktop\recepty\backend"
echo Starting backend server on port 8001...
python -m uvicorn app.main:app --reload --port 8001
pause