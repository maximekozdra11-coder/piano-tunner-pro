# Guide d'Installation - Piano Tuner Pro

## 📱 Guide d'Installation Complet - Étape par Étape

Ce guide explique comment installer l'application Piano Tuner Pro sur votre appareil Android ou iOS.

---

## 🎯 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation sur Android](#installation-sur-android)
3. [Installation sur iOS](#installation-sur-ios)
4. [Première Utilisation](#première-utilisation)
5. [Dépannage](#dépannage)

---

## 📋 Prérequis

### Pour Tous les Utilisateurs

- **Espace de stockage** : Au moins 100 MB d'espace libre
- **Permissions requises** :
  - Accès au microphone (obligatoire pour l'accord)
  - Accès au stockage (pour sauvegarder les profils de piano)
- **Système d'exploitation** :
  - Android : Version 6.0 (API 23) ou supérieure
  - iOS : Version 12.0 ou supérieure

### Pour les Développeurs (Construction depuis le code source)

- **Flutter SDK** : Version 3.0.0 ou supérieure
- **Android Studio** ou **Xcode** (selon la plateforme)
- **Dart SDK** : Version 3.0.0 ou supérieure

---

## 📱 Installation sur Android

### Méthode 1 : Installation depuis un fichier APK (Recommandée pour les utilisateurs)

#### Étape 1 : Télécharger l'APK
1. Téléchargez le fichier `piano_tuner_pro.apk` depuis :
   - La page des releases GitHub
   - Le lien fourni par le développeur
   
2. Enregistrez le fichier dans le dossier **Téléchargements** de votre appareil

#### Étape 2 : Autoriser l'installation depuis des sources inconnues
1. Ouvrez **Paramètres** sur votre appareil Android
2. Allez dans **Sécurité** ou **Confidentialité**
3. Activez l'option **Sources inconnues** ou **Installer des applications inconnues**
4. Sélectionnez votre gestionnaire de fichiers et autorisez-le

#### Étape 3 : Installer l'application
1. Ouvrez votre **Gestionnaire de fichiers**
2. Naviguez vers le dossier **Téléchargements**
3. Appuyez sur le fichier `piano_tuner_pro.apk`
4. Appuyez sur **Installer**
5. Attendez la fin de l'installation (quelques secondes)
6. Appuyez sur **Ouvrir** pour lancer l'application

#### Étape 4 : Autoriser les permissions
Au premier lancement, l'application demandera :
1. **Permission Microphone** : Appuyez sur **Autoriser** (obligatoire)
2. **Permission Stockage** : Appuyez sur **Autoriser** (recommandé)

### Méthode 2 : Construction depuis le code source (Pour développeurs)

#### Étape 1 : Installer Flutter
```bash
# Télécharger Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Vérifier l'installation
flutter doctor
```

#### Étape 2 : Configurer Android Studio
```bash
# Installer Android Studio depuis https://developer.android.com/studio
# Installer les composants SDK nécessaires via SDK Manager:
# - Android SDK Platform 33
# - Android SDK Build-Tools
# - Android SDK Platform-Tools
```

#### Étape 3 : Cloner et préparer le projet
```bash
# Cloner le dépôt
git clone https://github.com/maximekozdra11-coder/piano-tunner-pro.git
cd piano-tunner-pro/flutter_app

# Installer les dépendances
flutter pub get
```

#### Étape 4 : Construire l'APK
```bash
# Mode Release (optimisé, taille réduite)
flutter build apk --release

# L'APK sera dans : build/app/outputs/flutter-apk/app-release.apk
```

#### Étape 5 : Installer sur votre appareil
```bash
# Connecter votre appareil Android via USB
# Activer le mode développeur et le débogage USB

# Installer l'APK
flutter install

# Ou utiliser adb directement
adb install build/app/outputs/flutter-apk/app-release.apk
```

---

## 🍎 Installation sur iOS

### Méthode 1 : Via TestFlight (Recommandée pour les utilisateurs)

#### Étape 1 : Installer TestFlight
1. Ouvrez l'**App Store**
2. Recherchez **TestFlight**
3. Téléchargez et installez l'application TestFlight (gratuite)

#### Étape 2 : Rejoindre le test
1. Ouvrez le **lien d'invitation** fourni par le développeur
2. Appuyez sur **Afficher dans TestFlight**
3. Appuyez sur **Installer**
4. Attendez le téléchargement et l'installation

#### Étape 3 : Lancer l'application
1. Ouvrez TestFlight
2. Appuyez sur **Piano Tuner Pro**
3. Appuyez sur **Ouvrir**
4. Autorisez les permissions du microphone

### Méthode 2 : Construction depuis le code source (Pour développeurs avec Mac)

#### Étape 1 : Installer Xcode
```bash
# Télécharger Xcode depuis l'App Store (gratuit)
# Installer les outils en ligne de commande
xcode-select --install
```

#### Étape 2 : Installer Flutter
```bash
# Télécharger Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Vérifier l'installation
flutter doctor
```

#### Étape 3 : Configurer le projet
```bash
# Cloner le dépôt
git clone https://github.com/maximekozdra11-coder/piano-tunner-pro.git
cd piano-tunner-pro/flutter_app

# Installer les dépendances
flutter pub get

# Configurer les pods iOS
cd ios
pod install
cd ..
```

#### Étape 4 : Construire pour iOS
```bash
# Ouvrir dans Xcode
open ios/Runner.xcworkspace

# Dans Xcode:
# 1. Sélectionnez votre équipe de développement (Team)
# 2. Sélectionnez votre appareil ou simulateur
# 3. Appuyez sur Run (⌘+R)
```

#### Étape 5 : Construire l'IPA (Pour distribution)
```bash
# Construire en mode Release
flutter build ios --release

# Créer une archive dans Xcode pour distribution
# File > Archive > Distribute App
```

---

## 🚀 Première Utilisation

### Étape 1 : Lancer l'application
1. Appuyez sur l'icône **Piano Tuner Pro** sur votre écran d'accueil
2. L'application se lance et affiche l'écran d'accueil

### Étape 2 : Autoriser les permissions
- **Microphone** : Appuyez sur "Autoriser" lorsque demandé
  - Sans cette permission, l'accordage ne fonctionnera pas
- **Stockage** : Appuyez sur "Autoriser" pour sauvegarder vos profils

### Étape 3 : Créer votre premier profil de piano

#### 3.1 Mesurer l'inharmonicité
1. Sur l'écran d'accueil, appuyez sur **"Nouveau Piano"**
2. Vous allez mesurer 8 notes de référence (A0 à A7)
3. Pour chaque note :
   - **Jouez la note demandée** sur le piano
   - **Attendez** que l'application analyse les harmoniques
   - Une **coche verte** apparaît quand la mesure est validée
   - L'application passe automatiquement à la note suivante

#### 3.2 Sauvegarder le profil
1. Après les 8 mesures, entrez un **nom pour votre piano**
   - Exemple : "Steinway Model D - Salle de concert"
2. Appuyez sur **"Sauvegarder"**
3. Votre profil est créé !

### Étape 4 : Accorder votre piano

#### 4.1 Sélectionner le piano
1. Sur l'écran d'accueil, appuyez sur la **carte du piano**
2. Ou appuyez sur **"Commencer l'accordage"**

#### 4.2 Accorder les notes
1. L'application suggère l'ordre optimal d'accordage
2. Pour chaque note :
   - **Jouez la note** indiquée
   - **Regardez le curseur de cents** (±50¢)
   - **Ajustez** la tension de la corde
   - Le curseur doit être dans la **zone verte** (±2¢)
   - **Maintenez stable** pendant 2 secondes
   - Une **validation automatique** apparaît
   - Passez à la note suivante

#### 4.3 Comprendre le curseur de cents
- **Zone verte** (±5¢) : Très proche de l'accord parfait
- **Zone orange** (±15¢) : Proche, continue l'ajustement
- **Zone rouge** (>15¢) : Trop éloigné, ajustement nécessaire
- **Chiffre affiché** : Déviation exacte en centièmes de ton

### Étape 5 : Consulter l'historique
1. Appuyez sur l'**icône d'information** (ⓘ) sur la carte du piano
2. Vous verrez :
   - Les notes mesurées pour l'inharmonicité
   - L'historique des séances d'accordage
   - Les métadonnées du piano

---

## 🔧 Dépannage

### Problème : L'application ne détecte pas le son

**Solutions** :
1. Vérifiez que la permission microphone est activée :
   - Android : Paramètres > Applications > Piano Tuner Pro > Permissions
   - iOS : Réglages > Piano Tuner Pro > Microphone
2. Fermez et relancez l'application
3. Assurez-vous qu'aucune autre application n'utilise le microphone
4. Testez avec un son fort (claquement de mains)

### Problème : Le curseur de cents est instable

**Solutions** :
1. Éloignez l'appareil des sources de bruit :
   - Ventilateurs, climatisation
   - Autres instruments
   - Bruits de fond
2. Placez l'appareil plus près du piano (30-50 cm)
3. Jouez la note plus fort (forte)
4. Attendez que la qualité du signal soit "Bonne" ou "Excellente"

### Problème : La mesure d'inharmonicité échoue

**Solutions** :
1. Jouez la note plus longtemps (maintenir 3-5 secondes)
2. Jouez plus fort (mezzo-forte à forte)
3. Assurez-vous de jouer la bonne note
4. Vérifiez la qualité du signal (indicateur en haut)
5. Si plusieurs échecs, passez à la note suivante et revenez plus tard

### Problème : L'application se ferme inopinément

**Solutions** :
1. Vérifiez l'espace de stockage disponible (besoin de 100 MB minimum)
2. Fermez les autres applications en arrière-plan
3. Redémarrez votre appareil
4. Réinstallez l'application
5. Mettez à jour votre système d'exploitation

### Problème : Impossible d'installer l'APK (Android)

**Solutions** :
1. Vérifiez que "Sources inconnues" est activé
2. Supprimez l'ancienne version si installée
3. Téléchargez à nouveau le fichier APK
4. Vérifiez que le fichier n'est pas corrompu (taille ~50-80 MB)
5. Essayez un autre gestionnaire de fichiers

### Problème : L'application ne s'installe pas (iOS)

**Solutions** :
1. Vérifiez votre version iOS (minimum iOS 12.0)
2. Assurez-vous que TestFlight est à jour
3. Vérifiez votre connexion Internet
4. Libérez de l'espace de stockage
5. Redémarrez votre iPhone/iPad

---

## 📊 Configuration Recommandée

### Environnement Optimal

**Conditions acoustiques** :
- Pièce calme, sans écho excessif
- Minimiser les bruits de fond
- Éviter les réverbérations excessives

**Placement de l'appareil** :
- Distance : 30-50 cm du piano
- Position : À hauteur des cordes
- Orientation : Microphone vers les cordes

**Qualité du signal** :
- Attendez l'indicateur "Bonne" ou "Excellente"
- Évitez les mesures avec "Faible" ou "Médiocre"

### Paramètres Avancés (Mode Expert)

Pour accéder au mode expert :
1. Appuyez sur l'icône **Paramètres** (⚙️)
2. Activez le **Mode Expert**
3. Vous pouvez maintenant ajuster :
   - Le tempérament (Égal, Pythagoricien, etc.)
   - L'offset global de stretch
   - La fréquence A4 de référence (défaut : 440 Hz)
   - Visualiser les battements d'intervalles

---

## 🎵 Conseils d'Utilisation

### Pour une Mesure d'Inharmonicité Optimale

1. **Accordez grossièrement le piano d'abord** : L'inharmonicité est plus stable sur un piano déjà relativement accordé
2. **Jouez avec une force constante** : Mezzo-forte recommandé
3. **Laissez la note résonner** : Au moins 3-5 secondes
4. **Évitez les notes avec des cordes cassées** : Elles fausseront les mesures

### Pour un Accordage Précis

1. **Suivez l'ordre suggéré** : L'application optimise l'ordre (A4 → octave tempérament → expansion)
2. **Accordez par petits ajustements** : Tournez la cheville progressivement
3. **Laissez stabiliser** : Attendez 1-2 secondes entre les ajustements
4. **Vérifiez la stabilité** : Le curseur doit rester stable dans la zone verte

### Maintenance des Profils

1. **Mesurez à nouveau après un accordage majeur** : L'inharmonicité peut légèrement changer
2. **Créez des profils séparés pour différents pianos** : Chaque piano est unique
3. **Exportez vos profils régulièrement** : Sauvegarde de sécurité

---

## 📞 Support et Aide

### Ressources

- **Documentation complète** : Consultez le fichier `README.md`
- **Guide technique** : Voir `IMPLEMENTATION_SUMMARY.md`
- **Code source** : https://github.com/maximekozdra11-coder/piano-tunner-pro

### Contact

Pour toute question ou problème :
1. Vérifiez d'abord la section [Dépannage](#dépannage)
2. Consultez les issues GitHub
3. Ouvrez une nouvelle issue avec :
   - Votre modèle d'appareil
   - Votre version de système d'exploitation
   - Une description détaillée du problème
   - Des captures d'écran si possible

---

## 🔄 Mise à Jour de l'Application

### Android

1. Téléchargez la nouvelle version APK
2. Installez par-dessus l'ancienne version
3. Vos profils et données seront conservés

### iOS (TestFlight)

1. Ouvrez TestFlight
2. Les mises à jour apparaissent automatiquement
3. Appuyez sur **Mettre à jour**

---

## ✅ Checklist de Vérification

Avant de commencer à utiliser l'application :

- [ ] Application installée avec succès
- [ ] Permission microphone accordée
- [ ] Permission stockage accordée
- [ ] Test de détection audio réussi (claquement de mains détecté)
- [ ] Environnement calme préparé
- [ ] Appareil chargé (batterie >50%)
- [ ] Piano accessible et prêt

---

## 🎓 Glossaire

**Inharmonicité (B)** : Coefficient qui mesure l'écart entre les harmoniques réelles et les harmoniques théoriques parfaites

**Stretch tuning** : Courbe d'accordage qui compense l'inharmonicité en étirant légèrement les octaves

**Cents (¢)** : Unité de mesure musicale. 100 cents = 1 demi-ton

**Partial** : Harmonique ou composante fréquentielle d'une note

**Tempérament** : Système de division de l'octave (égal, pythagoricien, etc.)

**MIDI** : Standard de numérotation des notes (A0=21, A4=69, C8=108)

---

**Version du guide** : 1.0.0  
**Dernière mise à jour** : Février 2024  
**Application** : Piano Tuner Pro v1.0.0

---

Bon accordage ! 🎹✨
