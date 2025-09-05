@echo off
echo Starting KitKuhar development environment...
echo.

echo Stopping any running containers...
docker-compose -f docker-compose.local.yml down

echo.
echo Building and starting development environment...
docker-compose -f docker-compose.local.yml up --build -d

echo.
echo Waiting for services to start...
timeout /t 10 > nul

echo.
echo Development environment started!
echo.
echo Frontend: http://localhost:3333
echo Backend API: http://localhost:8001/api
echo Backend Docs: http://localhost:8001/docs
echo Database: localhost:5435
echo.
echo To view logs: dev-logs.bat
echo To stop: dev-stop.bat
echo.
pause