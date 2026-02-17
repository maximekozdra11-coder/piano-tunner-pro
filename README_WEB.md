# Piano Tuner Pro - Version Web/Mobile

## 🎹 Application accessible directement sur iPhone 12

Cette version web permet d'utiliser Piano Tuner Pro **directement depuis votre iPhone 12** (ou tout autre smartphone). Le téléphone sert de **capteur audio** via son microphone intégré.

## ✨ Fonctionnalités identiques à la version desktop

- ✅ Capture audio en temps réel via microphone iPhone
- ✅ Détection de hauteur avec algorithme YIN
- ✅ Calcul d'inharmonicité et stretch
- ✅ Curseur visuel ±50 cents avec code couleur
- ✅ Affichage spectre audio temps réel
- ✅ Analyse des battements
- ✅ Système de calibration persistant
- ✅ Interface tactile optimisée pour mobile

## 🚀 Installation et lancement

### 1. Installer les dépendances

```bash
pip install -r requirements.txt
```

Les nouvelles dépendances incluent:
- Flask (serveur web)
- flask-socketio (communication temps réel)
- python-socketio

### 2. Lancer le serveur web

```bash
python web_server.py
```

Le serveur démarre sur le port 5000.

### 3. Trouver votre adresse IP

**Sur Windows:**
```bash
ipconfig
```
Cherchez "Adresse IPv4" (ex: 192.168.1.100)

**Sur macOS/Linux:**
```bash
ifconfig
# ou
ip addr
```
Cherchez l'adresse inet (ex: 192.168.1.100)

### 4. Accéder depuis votre iPhone

Sur votre iPhone 12, ouvrez Safari et allez à:
```
http://VOTRE_IP:5000
```

Par exemple: `http://192.168.1.100:5000`

**Important:** Votre iPhone et votre ordinateur doivent être sur le **même réseau WiFi**.

## 📱 Utilisation sur iPhone

### Premier lancement

1. Ouvrez l'URL dans Safari
2. Cliquez sur **"Démarrer"**
3. **Autorisez l'accès au microphone** quand demandé
4. Jouez une note sur votre piano
5. Observez l'analyse en temps réel !

### Ajouter à l'écran d'accueil (optionnel)

Pour un accès rapide comme une vraie app:

1. Dans Safari, cliquez sur le bouton **Partager** (carré avec flèche)
2. Sélectionnez **"Sur l'écran d'accueil"**
3. Nommez-la "Piano Tuner Pro"
4. L'icône apparaît sur votre écran d'accueil

### Accorder votre piano

1. **Cliquez "Démarrer"** pour activer le microphone
2. **Positionnez l'iPhone** près des cordes du piano (30-50 cm)
3. **Jouez une note** et maintenez-la
4. Observez:
   - La note détectée en grand
   - L'aiguille sur le curseur de cents
   - Les fréquences mesurée et cible
5. **Ajustez** la corde jusqu'à obtenir:
   - 🟢 **Vert** (< 5 cents) = Parfait !
   - 🟠 **Orange** (< 15 cents) = Presque bon
   - 🔴 **Rouge** (> 15 cents) = Continuer l'ajustement

### Calibration

1. Cliquez **"Démarrer calibration"**
2. Jouez plusieurs notes espacées (A0, A1, A2, A3, A4, A5, A6, A7)
3. Pour chaque note **stable**, cliquez **"Sauvegarder note"**
4. Cliquez **"Arrêter calibration"**
5. Le profil est sauvegardé et rechargé automatiquement

### Analyse des battements

1. Sélectionnez le **partiel** à analyser (1-10)
2. Jouez une note
3. Cliquez **"Analyser"**
4. La fréquence de battement s'affiche

## 🔧 Architecture technique

### Backend (Python/Flask)

- **web_server.py** - Serveur Flask avec WebSocket
- Réutilise tous les modules existants:
  - `pitch_detector.py` - Algorithme YIN
  - `inharmonicity_estimator.py` - Calcul B
  - `stretch_model.py` - Stretch
  - `beat_analyzer.py` - Battements
  - `calibration_manager.py` - Calibration

### Frontend (HTML/CSS/JavaScript)

- **templates/index.html** - Interface responsive
- **static/css/style.css** - Design mobile-first
- **static/js/audio-processor.js** - Capture audio Web Audio API
- **static/js/ui-controller.js** - Visualisations Canvas
- **static/js/app.js** - Orchestration WebSocket

### Communication

- **WebSocket (Socket.IO)** pour le temps réel
- Audio capturé sur iPhone → envoyé au serveur → analysé → résultats renvoyés
- Latence: ~50-100ms (négligeable pour l'accordage)

## 🌐 Accès depuis l'extérieur (avancé)

Pour accéder depuis Internet (pas seulement WiFi local):

### Option 1: ngrok (simple)

```bash
# Installer ngrok: https://ngrok.com/
ngrok http 5000
```

Utiliser l'URL https fournie sur votre iPhone.

### Option 2: Configuration routeur

1. Ouvrir le port 5000 sur votre routeur
2. Configurer une redirection de port
3. Utiliser votre IP publique

## ⚡ Optimisations performances

### Pour réduire la latence:

1. **Utilisez une connexion WiFi stable** (pas 4G/5G)
2. **Rapprochez-vous du routeur**
3. **Fermez les autres apps** sur l'iPhone
4. **Mode avion + WiFi activé** (désactive les interférences cellulaires)

### Pour améliorer la capture audio:

1. **Positionnement**: iPhone à 30-50cm des cordes
2. **Orientation**: Microphone (bas de l'iPhone) vers le piano
3. **Volume**: Jouez les notes normalement (pas trop fort/faible)
4. **Environnement**: Réduisez les bruits ambiants

## 🆚 Comparaison avec version desktop

| Fonctionnalité | Desktop (PyQt6) | Web/Mobile (Flask) |
|----------------|-----------------|-------------------|
| Capture audio | Microphone PC | Microphone iPhone ✨ |
| Algorithme YIN | ✅ | ✅ |
| Inharmonicité | ✅ | ✅ |
| Stretch | ✅ | ✅ |
| Curseur cents | ✅ | ✅ (Canvas) |
| Spectre | ✅ (matplotlib) | ✅ (Canvas) |
| Battements | ✅ | ✅ |
| Calibration | ✅ | ✅ |
| Installation | PyQt6 | Navigateur ✨ |
| Mobilité | PC fixe | iPhone portable ✨ |

## 🐛 Dépannage

### "Impossible d'accéder à l'URL"

- Vérifiez que serveur et iPhone sont sur le même WiFi
- Vérifiez l'adresse IP avec `ipconfig` ou `ifconfig`
- Essayez de désactiver le pare-feu temporairement

### "Microphone non autorisé"

- Dans Safari iOS: Réglages → Safari → Microphone → Autoriser
- Rechargez la page et autorisez quand demandé

### "Pas de détection de note"

- Rapprochez l'iPhone du piano
- Jouez la note plus fort
- Vérifiez que le microphone n'est pas obstrué
- Essayez de redémarrer l'application

### "Latence trop élevée"

- Utilisez WiFi 5GHz si disponible
- Rapprochez-vous du routeur
- Fermez les autres apps sur iPhone
- Vérifiez la charge du serveur (CPU)

## 📋 Configuration avancée

### Changer le port

Éditez `web_server.py` ligne finale:
```python
socketio.run(app, host='0.0.0.0', port=8080, debug=True)
```

### Ajuster la taille du buffer

Éditez `web_server.py`:
```python
BUFFER_SIZE = 4096  # ou 8192, 16384
```

Plus petit = moins de latence, mais moins précis
Plus grand = plus précis, mais plus de latence

### Mode production

Pour un déploiement production:
```bash
pip install gunicorn
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 -b 0.0.0.0:5000 web_server:app
```

## 🎯 Prochaines améliorations possibles

- [ ] Mode hors ligne (PWA avec Service Worker)
- [ ] Enregistrement des sessions d'accordage
- [ ] Export PDF des résultats
- [ ] Multi-utilisateurs simultanés
- [ ] Analyse spectrale avancée
- [ ] Support MIDI

## 💡 Astuce pro

Pour les accordeurs professionnels en déplacement:

1. Installez le serveur sur un **Raspberry Pi**
2. Configurez un **point d'accès WiFi** sur le Pi
3. Connectez votre iPhone au Pi
4. Accordez n'importe où sans dépendre d'un réseau WiFi existant !

## 📞 Support

Pour les bugs ou suggestions concernant la version web:
- Ouvrez une issue sur GitHub avec le tag `web-version`
- Incluez les infos: Modèle iPhone, version iOS, navigateur

---

**Profitez de Piano Tuner Pro directement sur votre iPhone ! 🎹📱**
