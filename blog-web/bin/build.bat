@echo off
cd /d "%~dp0"

cd ..
pnpm run build
pause