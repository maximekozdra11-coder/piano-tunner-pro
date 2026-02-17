# Piano Tuner Pro

Application professionnelle de haute précision pour accorder un piano acoustique avec détection avancée de l'inharmonicité, calcul du stretch, analyse des battements et système de calibration persistant.

## Fonctionnalités

### 🎵 Capture et analyse audio temps réel
- Capture audio via **sounddevice** avec fenêtre glissante de 8192 samples
- Sample rate: 44100 Hz
- Détection automatique de la fréquence fondamentale avec l'**algorithme YIN**
- Analyse spectrale en temps réel

### 🎯 Détection de note et calcul d'écart
- Identification de la note MIDI correspondante
- Calcul de la fréquence théorique en tempérament égal (A4 = 440 Hz)
- Estimation du coefficient d'inharmonicité **B** en analysant les partiels
- Ajustement de la fréquence cible avec **stretch réaliste**
- Calcul de l'écart en cents: `cents = 1200 * log2(f_measured / f_target)`

### 🖥️ Interface graphique PyQt6
- **Curseur horizontal ±50 cents** avec aiguille colorée
- Affichage de la fréquence mesurée et cible
- Affichage de l'écart en cents et de la note détectée
- **Graphique temps réel du spectre** (matplotlib intégré)
- Interface réactive et moderne

### 🔊 Analyse des battements
Fenêtre secondaire dédiée permettant:
- Sélection du partiel à analyser
- Filtrage passe-bande autour du partiel
- Extraction de l'enveloppe via **transformée de Hilbert**
- FFT de l'enveloppe
- Affichage de la **fréquence de battement détectée**

### 💾 Système de calibration persistant
- **Phase de calibration**: mesure de plusieurs notes du piano
- Estimation du coefficient **B** pour chaque note
- Construction d'une **courbe de stretch personnalisée** (interpolation cubique)
- **Sauvegarde automatique** dans `calibration_profile.json`
- **Rechargement automatique** au démarrage

## Installation

### Prérequis
- Python 3.8 ou supérieur
- pip (gestionnaire de paquets Python)
- Un microphone fonctionnel

### Installation des dépendances

```bash
pip install -r requirements.txt
```

Les dépendances incluent:
- numpy >= 1.24.0
- scipy >= 1.10.0
- sounddevice >= 0.4.6
- PyQt6 >= 6.5.0
- matplotlib >= 3.7.0

## Utilisation

### Lancement de l'application

```bash
python main.py
```

### Mode accordage normal

1. **Cliquez sur "Démarrer"** pour commencer la capture audio
2. **Jouez une note** sur le piano
3. L'application affiche:
   - La note détectée (ex: A4, C#5)
   - La fréquence mesurée
   - La fréquence cible (avec stretch appliqué)
   - L'écart en cents
   - Un curseur visuel montrant l'écart
4. **Ajustez** la corde du piano jusqu'à ce que l'aiguille soit au centre (0 cents)
5. L'aiguille change de couleur:
   - 🟢 Vert: écart < 5 cents (bien accordé)
   - 🟠 Orange: écart < 15 cents (proche)
   - 🔴 Rouge: écart > 15 cents (nécessite ajustement)

### Analyse des battements

1. Cliquez sur **"Analyse des battements"**
2. Sélectionnez le **rang du partiel** à analyser (1-10)
3. Jouez une note et observez:
   - L'enveloppe du signal filtré
   - Le spectre de l'enveloppe
   - La fréquence de battement détectée

### Calibration du piano

La calibration permet d'adapter l'accordeur à votre piano spécifique:

1. **Cliquez sur "Démarrer calibration"**
2. **Jouez plusieurs notes** espacées sur le clavier (recommandé: A0, A1, A2, A3, A4, A5, A6, A7)
3. Pour chaque note:
   - Laissez la note résonner quelques secondes
   - Cliquez sur **"Sauvegarder profil"** pour enregistrer cette note
4. **Cliquez sur "Arrêter calibration"** quand terminé
5. La courbe de stretch personnalisée est créée automatiquement
6. Au prochain démarrage, le profil sera rechargé automatiquement

## Architecture du code

Le code est structuré en **modules modulaires et extensibles**:

### `audio_processor.py` - AudioProcessor
- Gestion du flux audio avec sounddevice
- Buffer circulaire pour fenêtre glissante
- Callback audio non-bloquant

### `pitch_detector.py` - PitchDetector
- Implémentation de l'**algorithme YIN**
- Détection robuste de la fréquence fondamentale
- Conversion fréquence ↔ note MIDI
- Conversion MIDI ↔ nom de note

### `inharmonicity_estimator.py` - InharmonicityEstimator
- Analyse des partiels via FFT
- Détection automatique des pics harmoniques
- Estimation du coefficient **B** à partir des partiels mesurés
- Génération du spectre pour affichage

### `stretch_model.py` - StretchModel
- Calcul du stretch pour chaque note en fonction de B
- Ajustement de la fréquence cible: `f_target = f_equal_temp * (1 + stretch)`
- Interpolation cubique de la courbe de stretch
- Valeurs par défaut si pas de calibration

### `beat_analyzer.py` - BeatAnalyzer
- Filtrage passe-bande Butterworth autour d'un partiel
- Transformée de Hilbert pour extraire l'enveloppe
- FFT de l'enveloppe pour détecter la fréquence de battement
- Génération des spectres pour affichage

### `calibration_manager.py` - CalibrationManager
- Orchestration de la phase de calibration
- Enregistrement des mesures (note, fréquence, B)
- Sauvegarde/chargement du profil JSON
- Gestion de l'interpolation pour notes non calibrées

### `tuner_ui.py` - TunerUI (PyQt6)
- Fenêtre principale avec curseur de cents personnalisé
- Intégration matplotlib pour graphiques temps réel
- Fenêtre secondaire pour analyse des battements
- Interface de calibration complète
- Mise à jour à 20 FPS

## Formules clés

### Fréquence en tempérament égal
```
f_equal(n) = 440 * 2^((n - 69) / 12)
```
où `n` est le numéro MIDI (A4 = 69)

### Inharmonicité des partiels
```
f_partial(k) = k * f0 * sqrt(1 + B * k^2)
```
où:
- `k` est le rang du partiel
- `f0` est la fréquence fondamentale
- `B` est le coefficient d'inharmonicité

### Calcul d'écart en cents
```
cents = 1200 * log2(f_measured / f_target)
```

### Transformée de Hilbert pour battements
```
envelope = abs(hilbert(filtered_signal))
beat_freq = argmax(FFT(envelope))
```

## Structure des fichiers

```
piano-tuner-pro/
├── main.py                     # Point d'entrée
├── audio_processor.py          # Classe AudioProcessor
├── pitch_detector.py           # Classe PitchDetector (YIN)
├── inharmonicity_estimator.py  # Classe InharmonicityEstimator
├── stretch_model.py            # Classe StretchModel
├── beat_analyzer.py            # Classe BeatAnalyzer
├── calibration_manager.py      # Classe CalibrationManager
├── tuner_ui.py                 # Classe TunerUI (PyQt6)
├── requirements.txt            # Dépendances
├── README.md                   # Documentation
└── calibration_profile.json    # Profil de calibration (généré)
```

## Dépannage

### Erreur: "Microphone non disponible"
- Vérifiez que votre microphone est correctement branché
- Vérifiez les permissions d'accès au microphone
- Sur Linux, installez `portaudio19-dev`: `sudo apt-get install portaudio19-dev`

### Pas de détection de note
- Vérifiez que le volume du microphone est suffisant
- Rapprochez le microphone du piano
- Jouez les notes plus fort
- Vérifiez que le seuil YIN est approprié (ajustable dans le code)

### Interface qui freeze
- L'application utilise des timers et callbacks non-bloquants
- Si le problème persiste, vérifiez que la charge CPU n'est pas trop élevée

## Contribuer

Les contributions sont les bienvenues! L'architecture modulaire facilite l'ajout de nouvelles fonctionnalités:
- Nouveaux algorithmes de détection de hauteur
- Amélioration de l'interface utilisateur
- Support de différents tempéraments
- Export des données de calibration

## Licence

Ce projet est sous licence MIT.

## Auteurs

Développé pour l'accordage professionnel de piano acoustique.
