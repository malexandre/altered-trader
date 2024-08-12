#!/bin/bash
mkdir -p build
rm build/*
npm run build:macarm
zip -9 build/AlteredTrader_mac_arm64.zip dist/AlteredTrader-1.0.0-arm64.dmg
npm run build:mac64
zip -9 build/AlteredTrader_mac_x64.zip dist/AlteredTrader-1.0.0.dmg
npm run build:win64
mv dist/AlteredTrader\ Setup\ 1.0.0.exe build/AlteredTrader\ Setup\ 1.0.0.exe
npm run build:linux64
mv dist/AlteredTrader-1.0.0.AppImage build/AlteredTrader-1.0.0.AppImage