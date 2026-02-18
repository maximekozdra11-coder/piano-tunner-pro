# Deployment Guide - Piano Tuner Pro

## 🚀 Technical Deployment Guide

This guide provides detailed instructions for deploying the Piano Tuner Pro Flutter application to production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Building for Android](#building-for-android)
4. [Building for iOS](#building-for-ios)
5. [Release Checklist](#release-checklist)
6. [Distribution](#distribution)
7. [CI/CD Setup](#cicd-setup)

---

## Prerequisites

### Required Tools

```bash
# Flutter SDK
Flutter 3.0.0 or higher
Dart 3.0.0 or higher

# Android
Android Studio Arctic Fox or higher
Android SDK 33
Android SDK Build-Tools 33.0.0
Java JDK 11 or higher

# iOS (Mac only)
Xcode 14.0 or higher
CocoaPods 1.11.0 or higher
iOS Deployment Target: 12.0+

# Version Control
Git 2.0+
```

### Verification

```bash
# Check Flutter installation
flutter doctor -v

# Expected output should show:
# [✓] Flutter (Channel stable, 3.x.x)
# [✓] Android toolchain
# [✓] Xcode (for macOS)
# [✓] Connected device
```

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/maximekozdra11-coder/piano-tunner-pro.git
cd piano-tunner-pro/flutter_app
```

### 2. Install Dependencies

```bash
# Get Flutter packages
flutter pub get

# Check for dependency issues
flutter pub outdated
```

### 3. Configure App Signing (Android)

Create `android/key.properties`:
```properties
storePassword=<your-keystore-password>
keyPassword=<your-key-password>
keyAlias=<your-key-alias>
storeFile=<path-to-keystore-file>
```

Generate keystore if needed:
```bash
keytool -genkey -v -keystore ~/piano-tuner-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias piano-tuner-key
```

### 4. Update Version

Edit `pubspec.yaml`:
```yaml
version: 1.0.0+1  # Format: <version>+<build-number>
```

---

## Building for Android

### Development Build

```bash
# Debug build (for testing)
flutter build apk --debug

# Output: build/app/outputs/flutter-apk/app-debug.apk
```

### Production Build

#### Option 1: APK (Universal)

```bash
# Build release APK (works on all Android devices)
flutter build apk --release

# Output: build/app/outputs/flutter-apk/app-release.apk
# Size: ~40-60 MB
```

#### Option 2: App Bundle (Google Play)

```bash
# Build Android App Bundle (recommended for Play Store)
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
# Size: ~30-45 MB
```

#### Option 3: Split APKs (Optimized)

```bash
# Build split APKs by ABI (smaller size per device)
flutter build apk --release --split-per-abi

# Outputs:
# - app-armeabi-v7a-release.apk (~25 MB)
# - app-arm64-v8a-release.apk (~28 MB)
# - app-x86_64-release.apk (~30 MB)
```

### Android Configuration Files

#### `android/app/build.gradle`

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.pianotuner.pro"
        minSdkVersion 23  // Android 6.0+
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        
        // Enable multidex for large apps
        multiDexEnabled true
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.pianotuner.pro">
    
    <!-- Required permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    
    <!-- Hardware features -->
    <uses-feature android:name="android.hardware.microphone" android:required="true"/>
    
    <application
        android:label="Piano Tuner Pro"
        android:icon="@mipmap/ic_launcher"
        android:requestLegacyExternalStorage="true">
        
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### Testing Android Build

```bash
# Install on connected device
flutter install

# Or use adb directly
adb install build/app/outputs/flutter-apk/app-release.apk

# Check logs
adb logcat | grep flutter
```

---

## Building for iOS

### Prerequisites (macOS only)

```bash
# Install/update CocoaPods
sudo gem install cocoapods

# Install pods
cd ios
pod install
pod update
cd ..
```

### Development Build

```bash
# Debug build for simulator
flutter build ios --debug --simulator

# Debug build for device
flutter build ios --debug
```

### Production Build

```bash
# Build release iOS app
flutter build ios --release

# This creates: build/ios/iphoneos/Runner.app
```

### iOS Configuration

#### `ios/Runner/Info.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- App Information -->
    <key>CFBundleDisplayName</key>
    <string>Piano Tuner Pro</string>
    <key>CFBundleIdentifier</key>
    <string>com.pianotuner.pro</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    
    <!-- Permissions -->
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs microphone access to detect piano notes and measure inharmonicity for accurate tuning.</string>
    
    <!-- Minimum iOS Version -->
    <key>MinimumOSVersion</key>
    <string>12.0</string>
    
    <!-- Device Capabilities -->
    <key>UIRequiredDeviceCapabilities</key>
    <array>
        <string>arm64</string>
        <string>microphone</string>
    </array>
    
    <!-- Supported Orientations -->
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
    </array>
</dict>
</plist>
```

### Creating iOS Archive for App Store

#### Step 1: Open in Xcode

```bash
open ios/Runner.xcworkspace
```

#### Step 2: Configure in Xcode

1. Select **Runner** project in navigator
2. Select **Runner** target
3. Go to **Signing & Capabilities**
4. Select your **Team**
5. Ensure **Automatically manage signing** is checked

#### Step 3: Archive

1. Select **Product** > **Archive**
2. Wait for build to complete
3. In the Archives window, select your archive
4. Click **Distribute App**
5. Choose distribution method:
   - **App Store Connect** (for TestFlight/App Store)
   - **Ad Hoc** (for internal testing)
   - **Development** (for testing on registered devices)

#### Step 4: Upload to App Store Connect

1. Select **Upload**
2. Choose options:
   - ✓ Include bitcode
   - ✓ Upload your app's symbols
3. Click **Next**
4. Click **Upload**

### TestFlight Distribution

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Go to **TestFlight** tab
4. Wait for processing (15-30 minutes)
5. Add internal/external testers
6. Distribute build to testers

---

## Release Checklist

### Pre-Build Checklist

- [ ] Update version number in `pubspec.yaml`
- [ ] Update version in `android/app/build.gradle`
- [ ] Update version in `ios/Runner/Info.plist`
- [ ] Run linter: `flutter analyze`
- [ ] Format code: `flutter format .`
- [ ] Update CHANGELOG.md
- [ ] Update README.md if needed
- [ ] Test on physical devices (Android and iOS)
- [ ] Verify all permissions work correctly
- [ ] Test audio capture and processing
- [ ] Verify database operations
- [ ] Test app on different screen sizes

### Build Checklist

- [ ] Clean build: `flutter clean && flutter pub get`
- [ ] Build Android APK: `flutter build apk --release`
- [ ] Build Android App Bundle: `flutter build appbundle --release`
- [ ] Build iOS: `flutter build ios --release`
- [ ] Test installed APK on multiple devices
- [ ] Test iOS build on multiple devices/simulators
- [ ] Verify app size is reasonable (<100 MB)
- [ ] Check for any runtime errors or crashes

### Post-Build Checklist

- [ ] Create Git tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Create GitHub Release
- [ ] Upload APK to release
- [ ] Update documentation
- [ ] Notify testers/users
- [ ] Monitor crash reports
- [ ] Monitor user feedback

---

## Distribution

### Direct Distribution (APK)

#### GitHub Releases

1. Go to repository on GitHub
2. Click **Releases** > **Create a new release**
3. Tag: `v1.0.0`
4. Title: `Piano Tuner Pro v1.0.0`
5. Description: Release notes
6. Upload: `app-release.apk`
7. Click **Publish release**

Users can download from:
```
https://github.com/maximekozdra11-coder/piano-tunner-pro/releases/latest
```

#### Self-Hosting

```bash
# Upload to web server
scp build/app/outputs/flutter-apk/app-release.apk \
    user@server:/var/www/downloads/

# Share download link
https://yourserver.com/downloads/app-release.apk
```

### Google Play Store

#### Preparation

1. Create developer account ($25 one-time fee)
2. Create app listing
3. Add screenshots (phone, tablet, TV if supported)
4. Add app description and details
5. Content rating questionnaire
6. Pricing & distribution

#### Upload

1. Go to **Release** > **Production**
2. Click **Create new release**
3. Upload `app-release.aab`
4. Add release notes
5. Review and rollout

### Apple App Store

#### Preparation

1. Enroll in Apple Developer Program ($99/year)
2. Create App ID in developer portal
3. Create App Store listing in App Store Connect
4. Add screenshots (required sizes: 6.5", 5.5")
5. Add app description and details
6. Content rating

#### Upload

1. Upload via Xcode Archive
2. Process in App Store Connect (15-30 min)
3. Add to App Store listing
4. Submit for review
5. Review process (24-48 hours typical)

---

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-java@v3
        with:
          distribution: 'zulu'
          java-version: '11'
      
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'
      
      - name: Install dependencies
        run: |
          cd flutter_app
          flutter pub get
      
      - name: Build APK
        run: |
          cd flutter_app
          flutter build apk --release
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: flutter_app/build/app/outputs/flutter-apk/app-release.apk
  
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'
      
      - name: Install dependencies
        run: |
          cd flutter_app
          flutter pub get
          cd ios
          pod install
      
      - name: Build iOS
        run: |
          cd flutter_app
          flutter build ios --release --no-codesign
```

### Fastlane (Advanced)

#### Install Fastlane

```bash
# macOS
brew install fastlane

# Other platforms
gem install fastlane
```

#### Configure Fastlane

Create `android/fastlane/Fastfile`:

```ruby
default_platform(:android)

platform :android do
  desc "Build and upload to Play Store"
  lane :deploy do
    gradle(
      task: "bundle",
      build_type: "Release"
    )
    upload_to_play_store(
      track: 'internal',
      aab: '../build/app/outputs/bundle/release/app-release.aab'
    )
  end
end
```

Create `ios/fastlane/Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    build_app(
      scheme: "Runner",
      export_method: "app-store"
    )
    upload_to_testflight
  end
end
```

---

## Build Scripts

### `scripts/build_all.sh`

```bash
#!/bin/bash

echo "🚀 Building Piano Tuner Pro for all platforms..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean
flutter pub get

# Build Android
echo "📱 Building Android APK..."
flutter build apk --release

echo "📦 Building Android App Bundle..."
flutter build appbundle --release

# Build iOS (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Building iOS..."
    flutter build ios --release
fi

echo "✅ Build complete!"
echo ""
echo "📂 Outputs:"
echo "  Android APK: build/app/outputs/flutter-apk/app-release.apk"
echo "  Android AAB: build/app/outputs/bundle/release/app-release.aab"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  iOS: build/ios/iphoneos/Runner.app"
fi
```

Make executable:
```bash
chmod +x scripts/build_all.sh
```

---

## Troubleshooting

### Android Issues

**Problem**: Build fails with "SDK location not found"
**Solution**:
```bash
# Create local.properties
echo "sdk.dir=/path/to/Android/sdk" > android/local.properties
```

**Problem**: "Execution failed for task ':app:lintVitalRelease'"
**Solution**: Disable lint in `android/app/build.gradle`:
```gradle
lintOptions {
    checkReleaseBuilds false
}
```

### iOS Issues

**Problem**: "No profiles for 'com.pianotuner.pro' were found"
**Solution**:
1. Open Xcode
2. Select project > Signing & Capabilities
3. Select your Team
4. Xcode will automatically create provisioning profile

**Problem**: CocoaPods installation fails
**Solution**:
```bash
cd ios
pod deintegrate
pod cache clean --all
pod install
```

---

## Performance Optimization

### Reduce APK Size

```bash
# Use split APKs
flutter build apk --release --split-per-abi

# Enable code shrinking
# In android/app/build.gradle:
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

### Optimize iOS Build

```bash
# Build with bitcode
flutter build ios --release --dart-define=FLUTTER_BUILD_MODE=release
```

---

## Security Considerations

1. **Never commit sensitive files**:
   - `android/key.properties`
   - `*.jks` keystore files
   - API keys or secrets

2. **Use environment variables**:
```dart
const apiKey = String.fromEnvironment('API_KEY');
```

3. **Code obfuscation**:
```bash
flutter build apk --release --obfuscate --split-debug-info=./debug-info
```

---

## Monitoring and Analytics

### Crash Reporting

Consider integrating:
- Firebase Crashlytics
- Sentry
- Bugsnag

### Usage Analytics

Consider integrating:
- Firebase Analytics
- Google Analytics
- Mixpanel

---

## Version Management

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH+BUILD`

Example: `1.2.3+45`
- `1`: Major version (breaking changes)
- `2`: Minor version (new features)
- `3`: Patch version (bug fixes)
- `45`: Build number (incremental)

### Update Process

1. Update `pubspec.yaml`: `version: 1.1.0+2`
2. Update `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.1.0"
   ```
3. Update `ios/Runner/Info.plist`:
   ```xml
   <key>CFBundleVersion</key>
   <string>2</string>
   <key>CFBundleShortVersionString</key>
   <string>1.1.0</string>
   ```

---

## Support

For deployment issues:
- Check Flutter documentation: https://docs.flutter.dev/deployment
- Open an issue on GitHub
- Contact the development team

---

**Last Updated**: February 2024  
**Flutter Version**: 3.16.0+  
**Application**: Piano Tuner Pro v1.0.0
