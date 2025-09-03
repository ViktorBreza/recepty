@echo off
echo Running KitKuhar tests in development environment...
echo.

echo Testing Backend...
cd backend
python -m pytest --cov=. --cov-report=term-missing
if %errorlevel% neq 0 (
    echo Backend tests FAILED!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Testing Frontend...
cd frontend
call npm test -- --coverage --watchAll=false
if %errorlevel% neq 0 (
    echo Frontend tests FAILED!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo All tests PASSED! ✅
pause