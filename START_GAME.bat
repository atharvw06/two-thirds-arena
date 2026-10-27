@echo off
title Two-Thirds Arena - Game Theory Presentation
echo ========================================================
echo   TWO-THIRDS ARENA: GAME SHOW ENGINE
echo   A Live 15-Minute Game Theory Presentation & Activity
echo ========================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on this computer!
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules\" (
    echo [INFO] First-time setup: Installing required packages...
    echo This may take a minute. Please wait...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install packages.
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Starting the Game Server on port 3000...
echo [INFO] Projector Host Screen will open automatically!
echo.

:: Automatically open browser after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000/?host=1"

:: Start the unified server
node server.mjs

pause
