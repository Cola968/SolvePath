# SolvePath v0.2

SolvePath ist eine mobile Lern-App für Mathematik und Physik. Sie führt Lernende vom Aufgabentext zur eigenen Lösung: **Aufgabe → Diagnose → Methode → kleinster sinnvoller Hinweis → eigener Lösungsweg → Ergebnisdiagnose → Lernprofil**.

Der Produktgedanke ist bewusst enger als bei klassischen Homework-Solvern: SolvePath soll nicht möglichst schnell die komplette Lösung ausgeben, sondern erkennen, **an welcher Entscheidung der Lösungsweg des Nutzers scheitert**.

## Was v0.2 kann

- Acht vollständige lokale Demo-Aufgaben aus Physik und Mathematik.
- Neu gestaltete Home-Seite mit Lernstatus, Risiken, Verlauf und Schnellzugriff.
- Visueller SolvePath über sechs Stationen: Aufgabe, Diagnose, Methode, Lösen, Prüfen und Lernprofil.
- Stuck Mode mit sechs Engpass-Kategorien und gezielten Diagnosefragen.
- Strategieauswahl vor der Formelausgabe, um Methodenwahl statt bloßes Nachrechnen zu trainieren.
- Hint Ladder mit sechs Hilfestufen. Standardmäßig wird immer nur der nächste Hinweis geöffnet.
- Schrittweiser Lösungsweg mit eigener Antwort und kontrolliertem Fortschritt.
- Formelanker werden erst eingeblendet, wenn bereits mehrere Hinweise benötigt wurden.
- Ergebnisdiagnose mit typischen Fehlermustern und konkreten Korrekturen.
- Lokales Denkprofil mit Themenfortschritt, Selbstständigkeitswert und priorisierten Fehlermustern.
- Exam Mode mit Readiness, Prüfungstermin und risikobasiertem Fokus-Training.
- Lokaler Verlauf, gespeicherte Hinweise und gelöste Aufgaben.
- Automatischer Hell-/Dunkelmodus.
- GitHub Actions CI für TypeScript, Lint, Tests, Formatierung und Android-Export.

## Wichtige Grenze des MVP

Die Texteingabe erkennt derzeit nur die acht vorbereiteten Demo-Aufgaben. Die Foto-Schaltfläche ist als Produktpfad sichtbar, aber eine echte Kamera-/OCR-/KI-Analyse ist **noch nicht implementiert**.

Das ist Absicht: Ein produktiver Remote-Analyzer benötigt einen sicheren Backend-Service. API-Schlüssel dürfen nicht in der mobilen App ausgeliefert werden.

## Tech Stack

- React Native
- Expo SDK 57
- Expo Router
- TypeScript strict
- Zustand
- AsyncStorage
- Zod
- Vitest
- ESLint
- Prettier

Der aktuelle Kernflow benötigt keinen Server und keinen API-Schlüssel.

## Installation

Voraussetzungen: Node.js 22.13+ und pnpm 11.19.0+.

```bash
pnpm install
pnpm start
```

Für Android:

```bash
pnpm android
```

Danach kann die App mit Expo Go oder einem Android-Emulator geöffnet werden.

## Qualitätsprüfung

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build:export
```

Diese Befehle laufen zusätzlich in GitHub Actions.

## Projektstruktur

```text
src/
  app/           Expo-Router-Screens
  components/    Design-System und wiederverwendbare UI
  data/          validierte Demo-Aufgaben
  domain/        Hint-, Diagnose-, Fehler- und Profil-Logik
  features/      Session und aktueller Aufgabenstatus
  services/      austauschbare ProblemAnalyzer-Schnittstelle
  storage/       lokale Persistenz
  theme/         Design Tokens
```

`ProblemAnalyzer.analyze(text)` trennt die UI von der Analysequelle. Der lokale `MockProblemAnalyzer` kann später durch einen `RemoteProblemAnalyzer` ersetzt werden, ohne die Screens neu zu bauen.

## Nächste produktive Ausbaustufe

Für einen echten öffentlichen Beta-Test fehlen vor allem vier Dinge:

1. sicherer Remote-Analyzer für freie Aufgaben,
2. Foto-/Screenshot-Upload mit OCR bzw. multimodaler Analyse,
3. robustere mathematische Äquivalenzprüfung,
4. Gerätetests auf mehreren Android- und iOS-Geräten.

Payments, Accounts und Gamification sollten erst danach kommen.
