@echo off
echo Building TrustRent Android Debug APK with debugging...
echo.

echo Cleaning previous builds...
flutter clean

echo Getting dependencies...
flutter pub get

echo Running Flutter analyze...
flutter analyze

echo Building debug APK...
flutter build apk --debug

echo.
echo Build complete!
echo APK location: build\app\outputs\flutter-apk\app-debug.apk
echo.
echo Debug features added:
echo - Extensive logging in console
echo - Debug API screen accessible from login
echo - Better error dialogs
echo - Null safety improvements
echo.
pause
