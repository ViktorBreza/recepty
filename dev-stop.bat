@echo off
echo Stopping KitKuhar development environment...
docker-compose -f docker-compose.local.yml down
echo Development environment stopped.
pause