@echo off
setlocal
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 goto :run_node
if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" goto :run_electron
echo Error: Neither Node.js nor Antigravity.exe was found.
exit /b 1

:run_node
node "%~dp0manage-wallpapers.cjs" %*
exit /b %ERRORLEVEL%

:run_electron
set ELECTRON_RUN_AS_NODE=1
"%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" "%~dp0manage-wallpapers.cjs" %*
exit /b %ERRORLEVEL%
