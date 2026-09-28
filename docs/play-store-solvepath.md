# SolvePath – Play Store release sheet

Status: Beta-Test vorbereitet  
Package: `app.solvepath.mobile`  
Version: `0.5.1`  
Android versionCode: `4`  
Target/compile SDK: API 36 via Expo SDK 57  
Privacy policy: https://snapstudy-beta-v2.onrender.com/privacy/solvepath

## Store title
SolvePath

## Short description
Mathe und Physik Schritt für Schritt verstehen statt Lösungen nur abzuschreiben.

## Full description
SolvePath begleitet dich durch Mathematik- und Physikaufgaben, ohne dir sofort nur das Endergebnis hinzulegen.

Fotografiere eine Aufgabe oder gib sie ein. SolvePath erkennt unterstützte Aufgabentypen, hilft dir bei der Methodenwahl und führt dich mit gestuften Hinweisen durch den eigenen Lösungsweg. Im Lernprofil siehst du wiederkehrende Fehler und Themen, die du noch trainieren solltest.

Die aktuelle Beta ist local-first: unterstützte Analysen, OCR und Lernfortschritt laufen auf dem Gerät. Für die Beta-Kernfunktionen ist kein Cloud-KI-Zugang erforderlich.

Funktionen:
- Aufgaben per Kamera, Galerie oder Text
- On-Device-OCR
- schrittweise Hinweise statt sofortiger Komplettlösung
- Mathe- und Physik-SolvePaths
- Prüfungsmodus
- lokales Lernprofil und Fehlermuster
- lokale Datenlöschung in den Einstellungen

## Category
Education

## Data safety draft
- No advertising SDKs in the current beta.
- Core beta learning profile is stored locally on device.
- OCR for the beta flow runs on device.
- Camera/photo access is user-initiated for task capture.
- External feedback links leave the app and are governed by the destination service.

Before submission, verify the Play Console Data safety form against the exact shipped build and every dependency.

## Release checklist
- [x] Unique Android package ID
- [x] Target API 36
- [x] Privacy policy URL
- [x] In-app privacy policy link
- [x] Installable beta APK workflow
- [x] Play-store AAB profile exists in `eas.json`
- [ ] Final 512×512 store icon
- [ ] Feature graphic 1024×500
- [ ] Phone screenshots
- [ ] Developer support email
- [ ] Play Console app created
- [ ] Play App Signing / upload key configured
- [ ] Data safety questionnaire completed
- [ ] Content rating completed
- [ ] Closed-test requirement completed if the account is subject to it

## Testing
Latest beta release:
https://github.com/Cola968/SolvePath/releases/tag/solvepath-beta-latest

Direct APK asset:
https://github.com/Cola968/SolvePath/releases/download/solvepath-beta-latest/SolvePath-0.5.1-beta.apk
