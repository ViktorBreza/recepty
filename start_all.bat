@echo off
echo Starting Recipe App...
echo.
echo Starting backend server...
start cmd /k "cd /d \"C:\Users\baktorz\Desktop\recepty\backend\" && python -m uvicorn app.main:app --reload --port 8001"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start cmd /k "cd /d \"C:\Users\baktorz\Desktop\recepty\frontend\" && npm start"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:8001
echo Frontend: http://localhost:3000
echo.
pause