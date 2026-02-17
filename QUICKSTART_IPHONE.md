# 🎹📱 Piano Tuner Pro sur iPhone 12 - Guide Rapide

## ⚡ Démarrage Ultra-Rapide (5 minutes)

### Étape 1: Installer sur votre ordinateur (2 min)

Sur votre **ordinateur** (Windows, macOS ou Linux):

```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python web_server.py
```

**OU utilisez le script automatique:**
- Windows: Double-cliquez sur `launch_web.bat`
- macOS/Linux: `./launch_web.sh`

Le serveur affichera votre adresse IP. **Notez-la !**

### Étape 2: Accéder depuis iPhone (1 min)

Sur votre **iPhone 12**:

1. Ouvrez **Safari** (important: pas Chrome)
2. Tapez dans la barre d'adresse:
   ```
   http://192.168.1.XXX:5000
   ```
   (Remplacez XXX par votre IP affichée à l'étape 1)

3. Appuyez sur **Entrée**

### Étape 3: Premier accordage (2 min)

1. **Cliquez "Démarrer"** sur l'iPhone
2. **Autorisez le microphone** quand demandé
3. **Positionnez l'iPhone** près du piano (30-50 cm)
4. **Jouez une note**
5. **Observez** l'aiguille et ajustez !

## 🎯 C'est tout ! Vous pouvez maintenant accorder votre piano.

---

## 📋 Checklist de vérification

Avant de commencer, assurez-vous que:

- [ ] Ordinateur et iPhone sur le **même WiFi**
- [ ] Serveur lancé sur l'ordinateur (voir adresse IP affichée)
- [ ] Safari ouvert sur iPhone (pas Chrome)
- [ ] Microphone autorisé dans Safari

---

## 🎨 Interface iPhone - Vue d'ensemble

```
┌─────────────────────────────────┐
│  🎹 Piano Tuner Pro             │
│  ● Connecté au serveur          │
├─────────────────────────────────┤
│                                 │
│          A                      │
│        Octave 4                 │
│                                 │
│  ├─────────────●──────────┤    │
│  -50    -25    0    25    50   │
│                                 │
│      +2.3 cents                 │
│                                 │
│  Mesurée: 440.12 Hz            │
│  Cible:   440.02 Hz            │
│                                 │
│  [Spectre audio en temps réel] │
│                                 │
│  [🎤 Démarrer]                  │
│                                 │
│  ⚙️ Calibration                 │
│  🔊 Analyse battements          │
│                                 │
└─────────────────────────────────┘
```

---

## 🟢🟠🔴 Code couleur de l'aiguille

| Couleur | Écart | Signification |
|---------|-------|---------------|
| 🟢 Vert | < 5 cents | **Parfait !** Note accordée |
| 🟠 Orange | 5-15 cents | **Presque bon**, ajustez légèrement |
| 🔴 Rouge | > 15 cents | **Désaccordé**, ajustez la corde |

---

## 🎼 Conseils pour un accordage optimal

### Position de l'iPhone

```
        [iPhone]
          ↓
       30-50 cm
          ↓
    ═══════════════
    ║   PIANO     ║
    ║   CORDES    ║
    ═══════════════
```

- **Distance**: 30-50 cm des cordes
- **Orientation**: Microphone (bas de l'iPhone) vers le piano
- **Stabilité**: Posez l'iPhone sur un support stable

### Environnement

- ✅ Pièce calme (réduire bruits ambiants)
- ✅ Fenêtres fermées (pas de vent)
- ✅ Appareils électroniques éteints (frigo, ventilateur)
- ✅ Personnes silencieuses

### Technique

1. **Jouez UNE SEULE note** à la fois
2. **Maintenez** la note 3-5 secondes
3. **Laissez résonner** (ne pas étouffer)
4. **Attendez** la stabilisation de l'aiguille
5. **Ajustez** la cheville doucement

---

## 🔧 Résolution des problèmes

### ❌ "Impossible de se connecter"

**Solution:**
1. Vérifiez que l'ordinateur et l'iPhone sont sur le **même WiFi**
2. Vérifiez l'adresse IP (elle peut changer)
3. Relancez le serveur: `python web_server.py`

### ❌ "Microphone non autorisé"

**Solution:**
1. **iPhone** → Réglages → Safari → Microphone → **Autoriser**
2. Rechargez la page dans Safari
3. Cliquez "Autoriser" quand demandé

### ❌ "Pas de détection de note"

**Solutions:**
- 🔧 Rapprochez l'iPhone du piano (30 cm)
- 🔧 Jouez la note plus fort
- 🔧 Vérifiez que le microphone n'est pas obstrué
- 🔧 Réduisez les bruits ambiants
- 🔧 Essayez une autre note

### ❌ "Aiguille instable"

**Solutions:**
- 🔧 Maintenez la note plus longtemps
- 🔧 Jouez plus uniformément
- 🔧 Réduisez les vibrations (posez l'iPhone)
- 🔧 Attendez que la note se stabilise

### ❌ "Latence élevée"

**Solutions:**
- 🔧 Utilisez WiFi 5GHz (si disponible)
- 🔧 Rapprochez-vous du routeur
- 🔧 Fermez les autres apps sur iPhone
- 🔧 Mode avion + WiFi activé (coupe 4G/5G)

---

## 💡 Astuces d'expert

### Ajout à l'écran d'accueil

Pour un accès instantané comme une vraie app:

1. Dans Safari: **Partager** (icône ⬆️)
2. **"Sur l'écran d'accueil"**
3. Nommer "Piano Tuner"
4. L'icône apparaît sur votre écran d'accueil ✨

### Mode calibration rapide

1. Cliquez "Démarrer calibration"
2. Jouez **A0, A1, A2, A3, A4, A5, A6, A7** (touches blanches A)
3. Pour chaque note **stable**, cliquez "Sauvegarder note"
4. Cliquez "Arrêter calibration"
5. Votre piano est maintenant optimisé ! 🎯

### Analyse des battements

Utile pour affiner les **octaves**:

1. Jouez deux notes de la même touche (ex: 3 cordes d'un Do)
2. Sélectionnez **Partiel 2** ou **3**
3. Cliquez **"Analyser"**
4. Observez la fréquence de battement
5. Ajustez jusqu'à **0 Hz** (battement nul = octave pure)

---

## 🌟 Fonctionnalités avancées

### Accès depuis l'extérieur (hors WiFi local)

Utilisez **ngrok** pour accéder depuis n'importe où:

```bash
# Installer ngrok: https://ngrok.com/
ngrok http 5000
```

Utilisez l'URL **https** fournie sur votre iPhone, n'importe où dans le monde !

### Enregistrer les sessions

Le profil de calibration est automatiquement sauvegardé dans:
```
calibration_profile.json
```

Partagez ce fichier avec d'autres accordeurs du même modèle de piano !

---

## 📊 Comparaison rapide

| Caractéristique | Version Desktop | Version iPhone |
|-----------------|----------------|----------------|
| Microphone | PC/Externe | **iPhone intégré** ✨ |
| Installation | PyQt6, libraries | **Juste Safari** ✨ |
| Portabilité | PC fixe | **Mobile** ✨ |
| Précision | Excellent | **Identique** ✨ |
| Algorithmes | YIN, FFT, etc. | **Identiques** ✨ |

**Conclusion:** Version iPhone = **mêmes performances, plus de mobilité !**

---

## 🎓 Tutoriel vidéo (suggéré)

1. **Installation serveur** (1 min)
2. **Connexion iPhone** (30 sec)
3. **Premier accordage** (2 min)
4. **Calibration** (3 min)
5. **Astuces pro** (2 min)

---

## 📞 Besoin d'aide ?

1. **Documentation complète**: [README_WEB.md](README_WEB.md)
2. **Version desktop**: [README.md](README.md)
3. **Issues GitHub**: Pour les bugs
4. **Vérifier**:
   - WiFi identique ✓
   - IP correcte ✓
   - Serveur lancé ✓
   - Microphone autorisé ✓

---

## ✅ Vous êtes prêt !

```bash
# Sur ordinateur
python web_server.py

# Sur iPhone Safari
http://VOTRE_IP:5000

# 🎹 Accordez votre piano ! 🎵
```

**Bon accordage ! 🎹📱✨**
