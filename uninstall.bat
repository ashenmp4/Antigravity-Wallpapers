@echo off
setlocal
title Antigravity Customizer Uninstaller
echo ============================================================
echo   Antigravity Customizer - Restore Original Clean App
echo ============================================================
echo.
echo Checking if Antigravity is running...
tasklist /fi "imagename eq Antigravity.exe" 2>nul | find /i "Antigravity.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo [!] Antigravity is currently running.
    echo Please close Antigravity completely before restoring,
    echo then press any key to continue.
    echo.
    pause
)

echo.
echo Restoring original Antigravity archive from backup...
call "%~dp0manage-wallpapers.cmd" restore

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   [SUCCESS] Clean restore completed!
    echo ============================================================
    echo Antigravity has been restored to its original factory state.
    echo.
) else (
    echo.
    echo ============================================================
    echo   [FAILED] Restore failed.
    echo ============================================================
    echo If you encountered a permission error, please right-click
    echo 'uninstall.bat' and choose 'Run as administrator'.
    echo.
)

pause
