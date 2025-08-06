@echo off
echo Cleaning up temporary and unnecessary files...

REM Remove Node.js cache and temporary files
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist web\node_modules\.cache rmdir /s /q web\node_modules\.cache
if exist .next rmdir /s /q .next
if exist web\.next rmdir /s /q web\.next
if exist coverage rmdir /s /q coverage
if exist web\coverage rmdir /s /q web\coverage

REM Remove log files
del /q *.log 2>nul
del /q web\*.log 2>nul

REM Remove environment files (except .env.example)
if exist .env if not exist .env.example copy .env .env.bak
del /q .env 2>nul
if exist web\.env if not exist web\.env.example copy web\.env web\.env.bak
del /q web\.env 2>nul

REM Remove editor-specific files
if exist .idea rmdir /s /q .idea
if exist .vscode rmdir /s /q .vscode
del /q *.sln 2>nul
del /q *.suo 2>nul
del /q *.user 2>nul

echo Cleanup complete!
pause
