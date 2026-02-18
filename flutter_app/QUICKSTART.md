# 🚀 Quick Start Guide - Piano Tuner Pro

## Installation Rapide (5 minutes)

### Option 1: Installation depuis APK (Android) - Le plus simple

1. **Télécharger l'APK**
   - Rendez-vous sur : https://github.com/maximekozdra11-coder/piano-tunner-pro/releases
   - Téléchargez `piano_tuner_pro.apk`

2. **Installer**
   - Ouvrez le fichier APK téléchargé
   - Autorisez "Sources inconnues" si demandé
   - Appuyez sur "Installer"
   - Lancez l'application

3. **Première utilisation**
   - Autorisez l'accès au microphone
   - Appuyez sur "Nouveau Piano"
   - Suivez les instructions à l'écran

### Option 2: Construction depuis le code source (Développeurs)

```bash
# 1. Cloner le projet
git clone https://github.com/maximekozdra11-coder/piano-tunner-pro.git
cd piano-tunner-pro/flutter_app

# 2. Installer les dépendances
flutter pub get

# 3. Construire l'APK
./scripts/build_android.sh

# 4. Installer sur votre appareil
adb install build/app/outputs/flutter-apk/app-release.apk
```

---

## 📱 Utilisation de Base

### 1. Mesurer un piano (5-10 minutes)

1. Appuyez sur **"Nouveau Piano"**
2. Jouez les notes demandées (A0 à A7)
3. Sauvegardez avec un nom
4. ✅ Profil créé !

### 2. Accorder une note (30 secondes par note)

1. Sélectionnez votre piano
2. Jouez la note indiquée
3. Regardez le curseur de cents
4. Ajustez jusqu'à la zone verte (±2¢)
5. Attendez la validation automatique
6. Passez à la note suivante

### 3. Comprendre le curseur

- **Vert** (±5¢): Parfait ! 🎯
- **Orange** (±15¢): Proche, continue
- **Rouge** (>15¢): Ajustement nécessaire

---

## 🔧 Construction du Projet

### Prérequis

- Flutter 3.0+ ([installer](https://flutter.dev/docs/get-started/install))
- Android Studio ou Xcode
- Git

### Commandes de Build

```bash
# Build rapide Android
./scripts/build_android.sh

# Build toutes les plateformes
./scripts/build_all.sh

# Build manuel
flutter build apk --release
```

### Sortie des builds

- **APK Android**: `build/app/outputs/flutter-apk/app-release.apk`
- **App Bundle**: `build/app/outputs/bundle/release/app-release.aab`
- **iOS**: `build/ios/iphoneos/Runner.app`

---

## 📚 Documentation Complète

- **Guide d'Installation Détaillé**: [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) 🇫🇷
- **Guide de Déploiement**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Résumé d'Implémentation**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **README Principal**: [README.md](README.md)

---

## ❓ Problèmes Fréquents

### Le micro ne fonctionne pas
- ✅ Vérifiez les permissions dans Paramètres > Applications
- ✅ Redémarrez l'application

### Le curseur est instable
- ✅ Éloignez-vous des sources de bruit
- ✅ Rapprochez l'appareil du piano (30-50 cm)
- ✅ Jouez plus fort

### L'application se ferme
- ✅ Libérez de l'espace (>100 MB nécessaire)
- ✅ Fermez les autres applications
- ✅ Redémarrez votre appareil

---

## 🎯 Workflow Recommandé

### Pour un accordage complet (2-3 heures)

1. **Mesure initiale** (10 min)
   - Mesurer l'inharmonicité (8 notes de référence)

2. **Octave de tempérament** (30 min)
   - Accorder A3 à A4 (12 notes)

3. **Expansion** (1.5-2 heures)
   - Accorder les autres octaves
   - Suivre l'ordre suggéré

4. **Vérification** (15 min)
   - Vérifier les octaves
   - Ajuster si nécessaire

---

## 🌟 Conseils Pro

1. **Environnement calme**: Minimisez les bruits de fond
2. **Force constante**: Jouez mezzo-forte
3. **Patience**: Attendez la stabilisation (2 secondes)
4. **Ordre optimal**: Suivez les suggestions de l'application
5. **Sauvegardes**: Mesurez après chaque accordage majeur

---

## 📞 Support

- **Issues GitHub**: https://github.com/maximekozdra11-coder/piano-tunner-pro/issues
- **Documentation**: Consultez les fichiers MD dans le dossier flutter_app/

---

## 🔄 Mises à Jour

### Android
Téléchargez la nouvelle version APK et installez par-dessus

### iOS (TestFlight)
Les mises à jour apparaissent automatiquement dans TestFlight

---

**Version**: 1.0.0  
**Mise à jour**: Février 2024

Bon accordage ! 🎹✨
