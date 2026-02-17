#!/bin/bash
# Script de lancement simplifié pour Piano Tuner Pro

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           Piano Tuner Pro - Lancement                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Erreur: Python n'est pas installé."
    echo "   Installez Python 3.8+ depuis https://www.python.org/"
    exit 1
fi

# Déterminer la commande Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

echo "✓ Python trouvé: $($PYTHON_CMD --version)"
echo ""

# Vérifier si les dépendances sont installées
echo "Vérification des dépendances..."
$PYTHON_CMD -c "import PyQt6" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Les dépendances ne sont pas installées."
    echo "   Installation en cours..."
    echo ""
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances."
        echo "   Essayez manuellement: pip install -r requirements.txt"
        exit 1
    fi
fi

echo "✓ Dépendances OK"
echo ""

# Lancer l'application
echo "Lancement de Piano Tuner Pro..."
echo ""
$PYTHON_CMD main.py

# Gestion de la sortie
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ L'application s'est terminée avec une erreur (code $EXIT_CODE)"
    echo ""
    echo "Problèmes courants:"
    echo "  - Microphone non autorisé: vérifiez les permissions"
    echo "  - PortAudio manquant (Linux): sudo apt-get install portaudio19-dev"
    echo "  - Consultez QUICKSTART.md pour plus d'aide"
    exit $EXIT_CODE
fi
