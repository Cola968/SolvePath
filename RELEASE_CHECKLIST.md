# SolvePath 0.5.0 Beta Release Checklist

## Repository / App

- [x] Version 0.5.0
- [x] Android versionCode 3
- [x] iOS buildNumber 3
- [x] TypeScript strict
- [x] Mobile- und Backend-Lint
- [x] automatisierte Tests
- [x] Android-Export in CI
- [x] On-Device-OCR integriert
- [x] lokale Analyse ist Standard
- [x] Cloud Analysis im Beta-Build hart deaktiviert
- [x] In-App-Käufe im Beta-Build hart deaktiviert
- [x] Exam Mode für Beta-Tester freigeschaltet
- [x] Beta-Feedback-Link in der App
- [x] EAS-Profil `beta` für internes APK
- [x] EAS-Profil `beta-store` für Store-AAB
- [x] GitHub-Workflow für direkt installierbares Beta-APK
- [x] Beta-Testmatrix
- [x] Beta-Data-Safety-Arbeitsblatt
- [x] Beta-Datenschutzhinweise

## Geschlossener APK-Test

- [ ] finales GitHub-Actions-Beta-APK erfolgreich gebaut
- [ ] APK auf mindestens einem physischen Android-Gerät installieren
- [ ] Kamera-Test
- [ ] Galerie-/Screenshot-Test
- [ ] OCR mit gedruckter Aufgabe
- [ ] lokaler Solver mit mehreren Aufgabentypen
- [ ] nicht unterstützte Aufgabe muss sicher abgelehnt werden
- [ ] Stuck Mode + alle Hint-Stufen
- [ ] Ergebnisprüfung
- [ ] Lernprofil-Persistenz nach App-Neustart
- [ ] Exam Mode
- [ ] Offline-/Flugmodus
- [ ] Daten-Löschen in Einstellungen

## Google Play interner/geschlossener Test

Extern erforderlich:

- [ ] Google-Play-Developer-Konto
- [ ] App `app.solvepath.mobile` in Play Console anlegen
- [ ] Play App Signing / Upload-Key einrichten
- [ ] EAS-Projekt einmalig dem richtigen Expo-Konto zuordnen
- [ ] Data-Safety-Formular anhand `store/beta-data-safety.de.md` prüfen und ausfüllen
- [ ] öffentliche Datenschutzerklärungs-URL hinterlegen
- [ ] Support-E-Mail im Play-Store-Eintrag hinterlegen
- [ ] Tester-Liste oder Google Group einrichten
- [ ] `eas build --platform android --profile beta-store`
- [ ] AAB in den internen/geschlossenen Testkanal hochladen
- [ ] Installationslink mit Testern prüfen

## Bewusst nicht Teil dieser Beta

- Cloud-KI
- RevenueCat / Abos
- Nutzerkonten
- Cloud-Synchronisation

Diese Funktionen werden erst separat aktiviert, wenn ihr eigener Testpfad vollständig eingerichtet ist.

## Release-Kommandos

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm server:typecheck
pnpm lint
pnpm server:lint
pnpm test
pnpm server:test
pnpm format:check
pnpm release:check
pnpm build:export
```
