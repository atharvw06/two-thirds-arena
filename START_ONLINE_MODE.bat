@echo off
title Two-Thirds Arena - Public Online Mode (Any Network / 5G / 4G)
echo ========================================================
echo   TWO-THIRDS ARENA: PUBLIC ONLINE MODE
echo   Works across ANY classroom Wi-Fi and mobile data!
echo ========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on this computer!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] First-time setup: Installing required packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install packages.
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Starting the Game Server on port 3000...
echo [INFO] Establishing secure public internet link...
echo [INFO] Host Screen will open automatically!
echo.

:: Automatically open browser after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000/?host=1"

:: Start server with online public tunnel
node server.mjs --online

pause
