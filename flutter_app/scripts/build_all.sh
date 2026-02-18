#!/bin/bash

# Build script for Piano Tuner Pro - All Platforms
# Usage: ./scripts/build_all.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Piano Tuner Pro - Build Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo -e "${RED}❌ Flutter is not installed!${NC}"
    echo "Please install Flutter from: https://flutter.dev/docs/get-started/install"
    exit 1
fi

# Check Flutter version
echo -e "${YELLOW}🔍 Checking Flutter installation...${NC}"
flutter --version
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
flutter clean

# Get dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
flutter pub get

# Run analyzer
echo -e "${YELLOW}🔍 Running Flutter analyzer...${NC}"
flutter analyze
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Analysis failed! Please fix the issues before building.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Analysis passed!${NC}"
echo ""

# Build Android
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}     Building Android Versions         ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Build universal APK
echo -e "${YELLOW}📱 Building universal APK (Release)...${NC}"
flutter build apk --release
if [ $? -eq 0 ]; then
    APK_SIZE=$(du -h build/app/outputs/flutter-apk/app-release.apk | cut -f1)
    echo -e "${GREEN}✅ Universal APK built successfully! (Size: $APK_SIZE)${NC}"
    echo -e "   📂 Location: build/app/outputs/flutter-apk/app-release.apk"
else
    echo -e "${RED}❌ APK build failed!${NC}"
fi
echo ""

# Build split APKs
echo -e "${YELLOW}📱 Building split APKs by ABI (Release)...${NC}"
flutter build apk --release --split-per-abi
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Split APKs built successfully!${NC}"
    echo -e "   📂 Location: build/app/outputs/flutter-apk/"
    ls -lh build/app/outputs/flutter-apk/*.apk 2>/dev/null | awk '{print "      - " $9 " (" $5 ")"}'
else
    echo -e "${RED}❌ Split APK build failed!${NC}"
fi
echo ""

# Build App Bundle
echo -e "${YELLOW}📦 Building Android App Bundle (Release)...${NC}"
flutter build appbundle --release
if [ $? -eq 0 ]; then
    AAB_SIZE=$(du -h build/app/outputs/bundle/release/app-release.aab | cut -f1)
    echo -e "${GREEN}✅ App Bundle built successfully! (Size: $AAB_SIZE)${NC}"
    echo -e "   📂 Location: build/app/outputs/bundle/release/app-release.aab"
else
    echo -e "${RED}❌ App Bundle build failed!${NC}"
fi
echo ""

# Build iOS (only on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}        Building iOS Version           ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    
    # Install/update CocoaPods
    echo -e "${YELLOW}🔧 Updating CocoaPods...${NC}"
    cd ios
    pod install --repo-update
    cd ..
    
    echo -e "${YELLOW}🍎 Building iOS app (Release)...${NC}"
    flutter build ios --release --no-codesign
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ iOS build completed successfully!${NC}"
        echo -e "   📂 Location: build/ios/iphoneos/Runner.app"
        echo -e "   ℹ️  Open ios/Runner.xcworkspace in Xcode to sign and archive"
    else
        echo -e "${RED}❌ iOS build failed!${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}ℹ️  Skipping iOS build (macOS only)${NC}"
    echo ""
fi

# Summary
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}          Build Summary                ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Build process completed!${NC}"
echo ""
echo "📂 Build outputs:"
echo ""
echo "Android:"
if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
    APK_SIZE=$(du -h build/app/outputs/flutter-apk/app-release.apk | cut -f1)
    echo -e "  ${GREEN}✓${NC} Universal APK: build/app/outputs/flutter-apk/app-release.apk ($APK_SIZE)"
fi
if [ -f "build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk" ]; then
    echo -e "  ${GREEN}✓${NC} Split APKs: build/app/outputs/flutter-apk/app-*-release.apk"
fi
if [ -f "build/app/outputs/bundle/release/app-release.aab" ]; then
    AAB_SIZE=$(du -h build/app/outputs/bundle/release/app-release.aab | cut -f1)
    echo -e "  ${GREEN}✓${NC} App Bundle: build/app/outputs/bundle/release/app-release.aab ($AAB_SIZE)"
fi
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "iOS:"
    if [ -d "build/ios/iphoneos/Runner.app" ]; then
        echo -e "  ${GREEN}✓${NC} iOS App: build/ios/iphoneos/Runner.app"
    fi
    echo ""
fi

echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Test the APK on physical devices"
echo "  2. Upload to distribution platform (GitHub, Play Store, etc.)"
echo "  3. For iOS: Open ios/Runner.xcworkspace in Xcode to archive and distribute"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
