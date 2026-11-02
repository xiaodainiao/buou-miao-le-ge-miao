@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node tools\preview-server.js
  goto finished
)
set "PREVIEW_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%PREVIEW_NODE%" (
  "%PREVIEW_NODE%" tools\preview-server.js
  goto finished
)
echo Node.js was not found. Install Node.js LTS from https://nodejs.org/
echo Then reopen this launcher.
:finished
pause
