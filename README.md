# SolvePath 0.5.1 Beta

SolvePath begleitet Mathematik- und Physikaufgaben über **Aufgabe → Diagnose → Methode → sechs gestufte Hinweise → eigener Lösungsweg → Ergebnisprüfung → Lernprofil**.

Die 0.5.1-Beta ist bewusst **local-first**: Die Kernfunktionen benötigen keinen KI-API-Key, kein Backend und keine laufenden Modellkosten.

## Beta-Funktionsumfang

- lokale freie Analyse für unterstützte Aufgaben
- On-Device-OCR für Kamera, Galerie und Screenshots
- 27 kuratierte Offline-SolvePaths
- Stuck Mode
- sechs progressive Hinweisstufen
- Methodenwahl vor der vollständigen Lösung
- Ergebnisprüfung und Fehlermuster
- lokales Lernprofil
- Exam Mode vollständig für Tester freigeschaltet

Cloud Analysis und Store-Abos sind in diesem Beta-Build deaktiviert.

## Lerninhalte

Die lokale Bibliothek enthält 27 vollständige SolvePaths:

- 19 Mathematik-Aufgaben
- 8 Physik-Aufgaben

Die freie lokale Analyse unterstützt derzeit unter anderem Rechenterme, lineare Gleichungen, Prozentrechnung, Steigungen, den Satz des Pythagoras und das Ohmsche Gesetz. Nicht sicher unterstützte freie Aufgaben werden abgelehnt, statt ein Ergebnis zu erfinden.

## Bilder

Aufgabenbilder werden auf Android/iOS per On-Device-OCR in Text umgewandelt. Der Beta-Build sendet Aufgabenbilder und erkannten Text nicht an einen externen KI-Anbieter.

## Beta-Build

Direkt installierbares Android-APK über EAS:

```bash
eas build --platform android --profile beta
```

Google-Play-Test-AAB:

```bash
eas build --platform android --profile beta-store
```

Zusätzlich baut GitHub Actions über **Beta APK** ein direkt installierbares `SolvePath-0.5.1-beta.apk` ohne Expo- oder Store-Konto. Dieses Artefakt ist nur für geschlossene Tests vorgesehen.

## Lokaler Start

```bash
pnpm install --frozen-lockfile
pnpm start
```

## Qualität

```bash
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

## Beta-Test

Siehe [BETA_TESTING.md](BETA_TESTING.md).

Feedback wird über das GitHub-Issue-Template **Beta feedback** gesammelt.

## Veröffentlichung

Für einen direkten geschlossenen APK-Test ist kein KI-Provider und kein Store-Konto erforderlich.

Für einen späteren Google-Play-internen/geschlossenen Test fehlen extern noch das verbundene Google-Play-/Expo-Konto, ein finaler Store-Upload-Key bzw. Play App Signing sowie die im Store verlangten Kontaktangaben. Diese Zugangsdaten gehören nicht in das Repository.
