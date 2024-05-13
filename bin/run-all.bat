@echo off
cd /d "%~dp0"

cd ..
pnpm -r run dev
pause