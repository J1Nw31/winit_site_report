@echo off
setlocal
title WINIT Site QR Generator

echo ========================================
echo        WINIT Site QR Generator
echo ========================================
echo.
echo One site:      LS02
echo Multiple:      LS02,LS03,LS04
echo.

set /p "SITES=Enter site code(s): "
if not defined SITES (
    echo.
    echo No site code entered. Cancelled.
    pause
    exit /b 1
)

echo.
echo Generating QR code...

powershell.exe -NoProfile -ExecutionPolicy Bypass ^
  -File "%~dp0Generate-Site-QR.ps1" ^
  -SiteText "%SITES%" ^
  -OpenFolder

if errorlevel 1 (
    echo.
    echo Generation failed. Check the site format and network.
    pause
    exit /b 1
)

echo.
echo QR code generation complete.
pause
exit /b 0
