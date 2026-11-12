@echo off
setlocal
title Antigravity Liquid Glass & Customizer Installer
echo ============================================================
echo   Antigravity Liquid Glass & Wallpaper Customizer Installer
echo ============================================================
echo.
echo Checking if Antigravity is running...
tasklist /fi "imagename eq Antigravity.exe" 2>nul | find /i "Antigravity.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo [!] Antigravity is currently running.
    echo Please close Antigravity completely before installing,
    echo then press any key to continue.
    echo.
    pause
)

echo.
echo Installing mod into Antigravity...
call "%~dp0manage-wallpapers.cmd" install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   [SUCCESS] Installation Completed!
    echo ============================================================
    echo.
    echo You can now launch Antigravity!
    echo Shortcuts inside the app:
    echo   - Press Ctrl+Alt+G to open Appearance Studio
    echo   - Click [Studio] or [Themes] in the top bar
    echo   - Type /studio or /theme in the chatbox
    echo.
) else (
    echo.
    echo ============================================================
    echo   [FAILED] Installation did not finish.
    echo ============================================================
    echo If you encountered a permission error, please right-click
    echo 'install.bat' and choose 'Run as administrator'.
    echo.
)

pause
