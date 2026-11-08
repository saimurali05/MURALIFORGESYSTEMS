@echo off
rem Starts the MFS site at http://127.0.0.1:5173 and opens it in your default browser.
rem Needs Node.js (https://nodejs.org). No npm install is required.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install it from https://nodejs.org
  echo or simply double-click OPEN-SITE.html instead - that needs no Node at all.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:5173"
node scripts\serve.mjs
pause
