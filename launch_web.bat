@echo off
REM Script de lancement pour Piano Tuner Pro - Version Web

echo ╔══════════════════════════════════════════════════════════════════╗
echo ║         Piano Tuner Pro - Version Web/Mobile                     ║
echo ║         Accessible depuis iPhone 12                              ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

REM Vérifier Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python n'est pas installé
    pause
    exit /b 1
)

echo ✓ Python trouvé:
python --version
echo.

REM Vérifier les dépendances
echo Vérification des dépendances...
python -c "import flask, flask_socketio" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Installation des dépendances web...
    pip install Flask flask-socketio python-socketio
)

echo ✓ Dépendances OK
echo.

REM Obtenir l'adresse IP
echo ═══════════════════════════════════════════════════════════════════
echo   Configuration réseau:
echo ═══════════════════════════════════════════════════════════════════

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo.
echo   📱 Sur votre iPhone, ouvrez Safari et allez à:
echo.
echo      http://%IP%:5000
echo.
echo   ⚠️  Important: iPhone et ordinateur sur le même WiFi!
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

REM Lancer le serveur
echo Démarrage du serveur...
echo.
python web_server.py

pause
