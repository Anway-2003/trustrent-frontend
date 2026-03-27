@echo off
echo Building TrustRent Android Release APK...
echo.

echo Cleaning previous builds...
flutter clean

echo Getting dependencies...
flutter pub get

echo Building release APK...
flutter build apk --release

echo.
echo Build complete!
echo APK location: build\app\outputs\flutter-apk\app-release.apk
echo.
pause
