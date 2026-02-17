# 🚀 Guide de Démarrage Rapide

## Installation en 3 étapes

### Étape 1 : Vérifier les prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ **Python 3.8 ou supérieur** installé sur votre ordinateur
- ✅ **Un microphone** fonctionnel (intégré ou externe)
- ✅ **Une connexion Internet** pour télécharger les dépendances

**Vérifier votre version de Python :**
```bash
python --version
# ou
python3 --version
```

Si Python n'est pas installé :
- **Windows** : [python.org/downloads](https://www.python.org/downloads/)
- **macOS** : `brew install python3` (avec [Homebrew](https://brew.sh/))
- **Linux** : `sudo apt install python3 python3-pip` (Ubuntu/Debian)

### Étape 2 : Installer les dépendances

Ouvrez un terminal (ou invite de commandes) dans le dossier du projet et exécutez :

```bash
pip install -r requirements.txt
```

**Note Linux** : Si vous obtenez une erreur avec PortAudio :
```bash
sudo apt-get install portaudio19-dev  # Debian/Ubuntu
# ou
sudo dnf install portaudio-devel      # Fedora
```

### Étape 3 : Lancer l'application

```bash
python main.py
```

L'application démarre et affiche la fenêtre principale ! 🎉

## 🎹 Première utilisation

### Pour accorder votre piano :

1. **Démarrer la capture audio**
   - Cliquez sur le bouton **"Démarrer"**
   - Autorisez l'accès au microphone si demandé

2. **Jouer une note**
   - Jouez une seule note sur votre piano
   - Laissez la note résonner

3. **Observer l'affichage**
   - La note détectée apparaît (ex: "A4")
   - L'écart en cents est affiché
   - L'aiguille montre visuellement l'écart

4. **Accorder**
   - 🟢 **Vert** (< 5 cents) : Parfait !
   - 🟠 **Orange** (< 15 cents) : Presque bon
   - 🔴 **Rouge** (> 15 cents) : Ajustez la corde

5. **Répéter**
   - Jouez la note suivante
   - Continuez jusqu'à accorder tout le piano

## 📱 Accès depuis un téléphone

**Piano Tuner Pro ne fonctionne pas directement sur smartphone.**

Pour utiliser l'application depuis votre téléphone :
1. Installez l'application sur votre **ordinateur**
2. Utilisez une solution de **bureau à distance** (TeamViewer, Chrome Remote Desktop, etc.)

➡️ **Guide complet** : [MOBILE_ACCESS.md](MOBILE_ACCESS.md)

## ⚙️ Calibration (Optionnel mais recommandé)

La calibration permet d'adapter l'accordeur à votre piano spécifique :

1. Cliquez sur **"Démarrer calibration"**
2. Jouez plusieurs notes espacées (A0, A1, A2, A3, A4, A5, A6, A7)
3. Pour chaque note stable, cliquez sur **"Sauvegarder profil"**
4. Cliquez sur **"Arrêter calibration"**
5. Le profil est automatiquement rechargé au prochain démarrage

## 🆘 Problèmes courants

### "Microphone non disponible"
- Vérifiez que votre microphone est branché
- Autorisez l'accès au microphone dans les paramètres système
- Sous Linux : `sudo apt-get install portaudio19-dev`

### "Module 'PyQt6' not found"
```bash
pip install PyQt6
```

### "PortAudio library not found"
**Windows** : Réinstallez sounddevice : `pip install --upgrade sounddevice`
**Linux** : Installez PortAudio : `sudo apt-get install portaudio19-dev`
**macOS** : `brew install portaudio`

### L'application ne détecte pas les notes
- Rapprochez le microphone du piano
- Jouez les notes plus fort
- Vérifiez le volume du microphone dans les paramètres système
- Essayez un autre microphone

### Interface qui freeze
- Vérifiez que votre CPU n'est pas surchargé
- Fermez d'autres applications gourmandes
- Redémarrez l'application

## 📖 Documentation complète

- **[README.md](README.md)** - Documentation principale
- **[MOBILE_ACCESS.md](MOBILE_ACCESS.md)** - Accès depuis téléphone
- **[UI_DESCRIPTION.md](UI_DESCRIPTION.md)** - Description de l'interface
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Détails techniques

## 🎓 Ressources supplémentaires

### Tutoriels vidéo suggérés (à créer)
1. Installation et premier lancement
2. Accorder sa première note
3. Utiliser la calibration
4. Analyse des battements

### Communauté
- Rapportez les bugs sur GitHub Issues
- Proposez des améliorations via Pull Requests
- Partagez vos expériences

## 💡 Conseils pour un accordage optimal

1. **Environnement silencieux** : Réduisez les bruits ambiants
2. **Microphone de qualité** : Un bon microphone améliore la précision
3. **Position du micro** : Placez-le près des cordes (30-50 cm)
4. **Une note à la fois** : Ne jouez qu'une seule note
5. **Laissez résonner** : Maintenez la note quelques secondes
6. **Calibration** : Calibrez pour votre piano spécifique
7. **Patience** : Prenez votre temps, l'accordage est un art !

## 🌟 Fonctionnalités avancées

### Analyse des battements
Cliquez sur **"Analyse des battements"** pour :
- Observer les battements entre deux cordes
- Analyser l'inharmonicité
- Affiner l'accordage des octaves

### Profil de calibration
Le fichier `calibration_profile.json` contient :
- Les coefficients d'inharmonicité pour chaque note
- La courbe de stretch personnalisée
- Partageable entre utilisateurs (même modèle de piano)

### Export des données (futur)
Fonctionnalités prévues :
- Export du profil de calibration
- Historique des accordages
- Rapport d'accordage PDF

---

**Besoin d'aide ?** Consultez la documentation complète ou ouvrez une issue sur GitHub.

**Prêt à accorder votre piano ?** 🎹🎵
```bash
python main.py
```
