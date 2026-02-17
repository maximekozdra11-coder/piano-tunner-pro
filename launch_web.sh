#!/bin/bash
# Script de lancement pour Piano Tuner Pro - Version Web

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║         Piano Tuner Pro - Version Web/Mobile                     ║"
echo "║         Accessible depuis iPhone 12                              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python n'est pas installé"
    exit 1
fi

PYTHON_CMD=$(command -v python3 || command -v python)
echo "✓ Python trouvé: $($PYTHON_CMD --version)"
echo ""

# Vérifier les dépendances
echo "Vérification des dépendances..."
$PYTHON_CMD -c "import flask, flask_socketio" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Installation des dépendances web..."
    pip install Flask flask-socketio python-socketio
fi

echo "✓ Dépendances OK"
echo ""

# Obtenir l'adresse IP
echo "═══════════════════════════════════════════════════════════════════"
echo "  Configuration réseau:"
echo "═══════════════════════════════════════════════════════════════════"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    IP=$(hostname -I | awk '{print $1}')
else
    IP="<VOTRE_IP>"
fi

echo ""
echo "  📱 Sur votre iPhone, ouvrez Safari et allez à:"
echo ""
echo "     http://${IP}:5000"
echo ""
echo "  ⚠️  Important: iPhone et ordinateur sur le même WiFi!"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Lancer le serveur
echo "Démarrage du serveur..."
echo ""
$PYTHON_CMD web_server.py
