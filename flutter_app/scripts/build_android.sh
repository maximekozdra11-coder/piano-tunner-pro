#!/bin/bash

# Quick build script for Android APK only
# Usage: ./scripts/build_android.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Android APK Build - Quick Script    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

cd "$(dirname "$0")/.."

# Clean and get dependencies
echo -e "${YELLOW}🧹 Preparing...${NC}"
flutter clean
flutter pub get

# Build APK
echo -e "${YELLOW}📱 Building Android APK...${NC}"
flutter build apk --release

if [ $? -eq 0 ]; then
    APK_SIZE=$(du -h build/app/outputs/flutter-apk/app-release.apk | cut -f1)
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
    echo ""
    echo "📂 APK Location:"
    echo "   build/app/outputs/flutter-apk/app-release.apk"
    echo "   Size: $APK_SIZE"
    echo ""
    echo "📝 To install on device:"
    echo "   adb install build/app/outputs/flutter-apk/app-release.apk"
    echo ""
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
