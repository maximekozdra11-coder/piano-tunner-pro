# 📚 Index de la Documentation Piano Tuner Pro

## 🚀 Pour commencer rapidement

**Nouveau utilisateur ?** Commencez ici :
- **[QUICKSTART.md](QUICKSTART.md)** - Installation et première utilisation (5 min)

**Installation rapide :**
```bash
pip install -r requirements.txt
python main.py
```

Ou utilisez les scripts de lancement :
- **Linux/macOS** : `./launch.sh`
- **Windows** : Double-cliquez sur `launch.bat`

## 📱 Accès depuis mobile

**Vous voulez utiliser l'application depuis votre téléphone ?**
- **[MOBILE_ACCESS.md](MOBILE_ACCESS.md)** - Guide complet d'accès à distance
  - Pourquoi ça ne fonctionne pas directement sur mobile
  - Solutions de bureau à distance (TeamViewer, Chrome RD, etc.)
  - Tableau comparatif et recommandations

## 📖 Documentation principale

### Guide utilisateur
- **[README.md](README.md)** - Documentation complète de l'application
  - Fonctionnalités détaillées
  - Installation pas à pas
  - Mode d'emploi complet
  - Calibration du piano
  - Dépannage

### Interface utilisateur
- **[UI_DESCRIPTION.md](UI_DESCRIPTION.md)** - Description de l'interface graphique
  - Schémas de la fenêtre principale
  - Fenêtre d'analyse des battements
  - Codes couleur et indicateurs
  - Flux d'interaction

### Documentation technique
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Détails techniques
  - Architecture du code (~1400 lignes)
  - Modules et leurs responsabilités
  - Algorithmes implémentés (YIN, FFT, Hilbert)
  - Formules mathématiques
  - Performances

## 🎯 Selon votre besoin

### Je veux...

#### ...accorder mon piano maintenant
1. Lisez [QUICKSTART.md](QUICKSTART.md)
2. Installez : `pip install -r requirements.txt`
3. Lancez : `python main.py`
4. Suivez les instructions à l'écran

#### ...utiliser l'app depuis mon téléphone
1. Lisez [MOBILE_ACCESS.md](MOBILE_ACCESS.md)
2. Installez l'app sur votre ordinateur
3. Configurez TeamViewer ou Chrome Remote Desktop
4. Connectez-vous depuis votre téléphone

#### ...comprendre comment fonctionne l'app
1. Lisez [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
2. Examinez le code source dans les fichiers `.py`
3. Consultez les commentaires dans le code

#### ...calibrer mon piano spécifique
1. Lancez l'application
2. Section "Calibration" dans [README.md](README.md) lignes 95-107
3. Cliquez sur "Démarrer calibration"
4. Suivez le processus étape par étape

#### ...analyser les battements
1. Section "Analyse des battements" dans [README.md](README.md) lignes 86-93
2. Cliquez sur "Analyse des battements" dans l'app
3. Sélectionnez le partiel à analyser
4. Observez les graphiques

#### ...contribuer au projet
1. Lisez [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) pour comprendre l'architecture
2. Fork le repository sur GitHub
3. Créez une branche pour votre fonctionnalité
4. Soumettez une Pull Request

#### ...résoudre un problème
1. Section "Dépannage" dans [README.md](README.md) lignes 145-156
2. Section "Problèmes courants" dans [QUICKSTART.md](QUICKSTART.md)
3. Ouvrez une issue sur GitHub avec les détails

## 📁 Structure des fichiers

### Code source (Python)
```
main.py                        # Point d'entrée
audio_processor.py             # Capture audio
pitch_detector.py              # Algorithme YIN
inharmonicity_estimator.py     # Estimation B
stretch_model.py               # Calcul du stretch
beat_analyzer.py               # Analyse battements
calibration_manager.py         # Gestion profils
tuner_ui.py                    # Interface PyQt6
requirements.txt               # Dépendances
```

### Documentation
```
INDEX.md                       # Ce fichier
QUICKSTART.md                  # Démarrage rapide
MOBILE_ACCESS.md              # Accès mobile
README.md                      # Documentation principale
UI_DESCRIPTION.md             # Interface utilisateur
IMPLEMENTATION_SUMMARY.md     # Documentation technique
```

### Scripts de lancement
```
launch.sh                      # Linux/macOS
launch.bat                     # Windows
```

## 🔍 Recherche rapide

### Mots-clés et où les trouver

| Sujet | Document | Section |
|-------|----------|---------|
| Installation | [QUICKSTART.md](QUICKSTART.md) | Étape 2 |
| Premier lancement | [QUICKSTART.md](QUICKSTART.md) | Étape 3 |
| Téléphone/Mobile | [MOBILE_ACCESS.md](MOBILE_ACCESS.md) | Tout |
| TeamViewer | [MOBILE_ACCESS.md](MOBILE_ACCESS.md) | Option 1 |
| Bureau à distance | [MOBILE_ACCESS.md](MOBILE_ACCESS.md) | Solutions |
| Calibration | [README.md](README.md) | Lignes 95-107 |
| Microphone | [QUICKSTART.md](QUICKSTART.md) | Problèmes |
| Algorithme YIN | [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Technical Highlights |
| Interface graphique | [UI_DESCRIPTION.md](UI_DESCRIPTION.md) | Main Window |
| Battements | [README.md](README.md) | Lignes 86-93 |
| Erreurs | [QUICKSTART.md](QUICKSTART.md) | Problèmes courants |

## 💡 Conseils de lecture

### Parcours débutant (15 min)
1. [QUICKSTART.md](QUICKSTART.md) - 5 min
2. Lancer l'application
3. [UI_DESCRIPTION.md](UI_DESCRIPTION.md) - 5 min
4. Essayer d'accorder une note - 5 min

### Parcours utilisateur mobile (10 min)
1. [MOBILE_ACCESS.md](MOBILE_ACCESS.md) - 10 min
2. Choisir et installer une solution
3. Tester la connexion

### Parcours technique (30 min)
1. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - 15 min
2. Lire le code source principal - 15 min

### Parcours complet (1h)
1. Lire tous les documents dans l'ordre
2. Expérimenter avec l'application
3. Tester les fonctionnalités avancées

## 🆘 Support

### Avant de demander de l'aide
- [ ] J'ai lu [QUICKSTART.md](QUICKSTART.md)
- [ ] J'ai vérifié la section "Problèmes courants"
- [ ] J'ai regardé si mon problème est lié au mobile ([MOBILE_ACCESS.md](MOBILE_ACCESS.md))
- [ ] J'ai vérifié mes prérequis (Python, microphone)

### Où obtenir de l'aide
- **Issues GitHub** : Pour les bugs et problèmes techniques
- **Discussions GitHub** : Pour les questions générales
- **README.md** : Pour la documentation de base

## 🌟 Points clés à retenir

1. **Application desktop** : Fonctionne sur Windows/macOS/Linux, pas directement sur mobile
2. **Accès mobile** : Via bureau à distance uniquement (TeamViewer, etc.)
3. **Installation** : `pip install -r requirements.txt` puis `python main.py`
4. **Calibration** : Recommandée pour un accordage optimal
5. **Microphone** : Doit être sur l'ordinateur, pas le téléphone

---

**Prêt à commencer ?** → [QUICKSTART.md](QUICKSTART.md)

**Questions sur mobile ?** → [MOBILE_ACCESS.md](MOBILE_ACCESS.md)

**Documentation complète ?** → [README.md](README.md)
