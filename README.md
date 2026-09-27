# SolvePath v0.1

SolvePath ist eine mobile Lern-App für Mathematik und Physik. Sie führt Lernende vom Aufgabentext zur eigenen Lösung: **Aufgabe → Diagnose → kleinster sinnvoller Hinweis → Lösungsweg → eigenes Ergebnis prüfen → Fehlerprofil**. Die App zeigt standardmäßig nur den nächsten Hinweis und fragt nach der passenden Methode, bevor sie Formeln offenlegt.

## Funktionsumfang

- Acht vollständige lokale Demo-Aufgaben: Gravitationskraft, Satellitenbahn, Gravitationsfeldstärke, Keplers drittes Gesetz, lineare und quadratische Gleichung, Trigonometrie und momentane Änderungsrate.
- Freitext-Eingabe für diese bekannten Aufgaben, mit klarer Fehlermeldung für noch nicht unterstützte Texte. Die Beispielliste übernimmt den vollständigen Text per Tipp.
- Stuck Mode mit sechs Diagnoseoptionen. Bei der Satellitenaufgabe führen zwei Denkfragen zur Formelauswahl, bevor ein Lösungsweg erscheint.
- Hint Ladder mit sechs Stufen, geführte Schritte mit eigener Antwort und Strategiefragen.
- Ergebnisprüfung mit numerischer Toleranz oder akzeptierten Schreibweisen; typische Fehler werden mit einem konkreten Fehlercode gespeichert.
- Lokaler Verlauf, verwendete Hinweise, gelöste Aufgaben, Themenfortschritt und Fehlerprofil.
- Exam Mode als lokale Vorschau mit Fach, Themen, Termin, Risiken und passender Übungsaufgabe.
- Systemgesteuerter Hell- und Dunkelmodus.

Die Foto-Schaltfläche führt zur Texteingabe und kennzeichnet die Auswahl als Vorschau. Eine Kamera- oder Bildanalyse ist noch nicht eingebaut.

## Tech Stack

React Native, Expo SDK 57, Expo Router, TypeScript im Strict Mode, Zustand, AsyncStorage, Zod, Vitest, ESLint und Prettier. Die App benötigt für den Kernflow keinen Server und keinen API-Schlüssel.

## Installation und Start

Voraussetzungen: Node.js 22.13 oder neuer und pnpm 11.19.0 oder neuer. Für einen Android-Test: Expo Go auf einem Android-Gerät oder ein eingerichteter Android-Emulator.

```bash
pnpm install
pnpm start
```

Danach den QR-Code mit Expo Go öffnen oder im Expo-Terminal `a` für den Android-Emulator drücken. Alternativ:

```bash
pnpm android
```

Unter Windows kann OneDrive Files On-Demand Metros Dateiwächter bei Dateien in `node_modules` stören. Wenn ein Import trotz vorhandener Datei als fehlend gemeldet wird, das Repository in einen normalen lokalen Ordner außerhalb von OneDrive auschecken und dort `pnpm install` ausführen. Der Android-Export wurde in einer solchen lokalen Kopie erfolgreich geprüft.

## Prüfen

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build:export
```

`build:export` erstellt ein Android-JavaScript-Bundle in `dist/`. Es ersetzt keinen Test auf einem physischen Gerät oder Emulator.

## Projektstruktur

```text
src/
  app/           Expo-Router-Screens und Navigation
  components/    Wiederverwendbare UI-Bausteine
  data/          Acht validierte Demo-Aufgaben
  domain/        Aufgabenmodell, Hint Ladder, Diagnose, Fehler- und Profil-Logik
  features/      Sitzung und aktuelles Aufgabenmodell
  services/      Austauschbare ProblemAnalyzer-Schnittstelle und Mock-Implementierung
  storage/       AsyncStorage-Repository mit Datenvalidierung
  theme/         Farben, Abstände, Typografie und Radien
```

`ProblemAnalyzer.analyze(text)` trennt die Screens von der Analysequelle. `MockProblemAnalyzer` erkennt die vorbereiteten Aufgaben lokal; ein späterer `RemoteProblemAnalyzer` kann dieselbe Schnittstelle verwenden. Zod prüft die Demo-Daten und gespeicherte Zustände. Die Domain-Funktionen sind unabhängig von React Native testbar. Das Storage-Repository bündelt alle AsyncStorage-Zugriffe.

## Grenzen und nächste Schritte

Die lokale Analyse erkennt nur die acht Demo-Aufgaben und löst keine freien neuen Aufgaben. Schrittantworten werden zunächst als Text verglichen. Für eine spätere Version sind OCR/Foto-Eingabe, eine sichere Remote-Analyse, flexiblere mathematische Äquivalenzprüfung und ein Gerätetest für Android und iOS sinnvoll. Es gibt bewusst keine Anmeldung, Payments, Werbung oder Chat-Funktion.
