@echo off
REM Script de lancement simplifié pour Piano Tuner Pro (Windows)

echo ╔═══════════════════════════════════════════════════════════╗
echo ║           Piano Tuner Pro - Lancement                    ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erreur: Python n'est pas installé.
    echo    Installez Python 3.8+ depuis https://www.python.org/
    echo.
    pause
    exit /b 1
)

echo ✓ Python trouvé:
python --version
echo.

REM Vérifier si les dépendances sont installées
echo Vérification des dépendances...
python -c "import PyQt6" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Les dépendances ne sont pas installées.
    echo    Installation en cours...
    echo.
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Erreur lors de l'installation des dépendances.
        echo    Essayez manuellement: pip install -r requirements.txt
        echo.
        pause
        exit /b 1
    )
)

echo ✓ Dépendances OK
echo.

REM Lancer l'application
echo Lancement de Piano Tuner Pro...
echo.
python main.py

REM Gestion de la sortie
if %errorlevel% neq 0 (
    echo.
    echo ❌ L'application s'est terminée avec une erreur
    echo.
    echo Problèmes courants:
    echo   - Microphone non autorisé: vérifiez les permissions Windows
    echo   - Module manquant: réinstallez avec pip install -r requirements.txt
    echo   - Consultez QUICKSTART.md pour plus d'aide
    echo.
    pause
    exit /b %errorlevel%
)
