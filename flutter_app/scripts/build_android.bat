@echo off
REM Build script for Piano Tuner Pro - Windows
REM Usage: scripts\build_android.bat

echo ╔════════════════════════════════════════╗
echo ║   Piano Tuner Pro - Windows Build     ║
echo ╚════════════════════════════════════════╝
echo.

REM Check Flutter installation
where flutter >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Flutter is not installed or not in PATH!
    echo Please install Flutter from: https://flutter.dev/docs/get-started/install
    pause
    exit /b 1
)

cd /d "%~dp0\.."

REM Clean and prepare
echo 🧹 Cleaning previous builds...
call flutter clean

echo 📦 Installing dependencies...
call flutter pub get

REM Build APK
echo.
echo 📱 Building Android APK (Release)...
call flutter build apk --release

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Build successful!
    echo.
    echo 📂 APK Location:
    echo    build\app\outputs\flutter-apk\app-release.apk
    echo.
    for %%I in (build\app\outputs\flutter-apk\app-release.apk) do echo Size: %%~zI bytes
    echo.
    echo 📝 To install on device:
    echo    adb install build\app\outputs\flutter-apk\app-release.apk
) else (
    echo.
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
pause
