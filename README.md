# SolvePath v0.4 Release Candidate

SolvePath begleitet Mathematik- und Physikaufgaben über **Aufgabe → Diagnose → Methode → sechs gestufte Hinweise → eigener Lösungsweg → Ergebnisprüfung → Lernprofil**.

v0.4 ergänzt ein Store-konformes Free/Pro-Abo-Modell, serverseitige Entitlement-Prüfung und eine deutlich größere lokale Übungsbibliothek.

## Lerninhalte

Die lokale Bibliothek enthält 27 vollständige SolvePaths:

- 19 Mathematik-Aufgaben
- 8 Physik-Aufgaben

Mathematik deckt unter anderem Grundrechenarten, Dezimalzahlen, Bruchrechnung, Prozentrechnung, Dreisatz, Potenzen, Wurzeln, lineare Funktionen, Gleichungssysteme, quadratische Gleichungen, Geometrie, Statistik, Wahrscheinlichkeit, Ungleichungen und Ableitungen ab.

Physik enthält unter anderem Gravitation, Kepler, Kreisbewegung, Gravitationsfeld, gleichförmige Bewegung, kinetische Energie, Ohmsches Gesetz und Dichte.

## Free & Pro

Free:
- lokale Übungsbibliothek
- drei Remote-KI-Analysen pro Tag
- kompletter SolvePath mit Stuck Mode und Hint Ladder

Pro:
- kein Free-Tageslimit für KI-Analysen; serverseitiges Fair-Use-/Missbrauchslimit bleibt bestehen
- adaptiver Exam Mode
- Store-basierte Kaufwiederherstellung und Abo-Verwaltung

Apple- und Google-Abos werden über RevenueCat zusammengeführt. Die App verwendet nur öffentliche RevenueCat SDK-Schlüssel. Der Server kann das Entitlement `pro` mit einem geheimen RevenueCat-Key verifizieren.

## KI-Pipeline

Remote Analysis arbeitet zweistufig:

1. **Analysepass**: Der multimodale Provider erzeugt eine strukturierte `ProblemAnalysis`.
2. **Verifikationspass**: Ein zweiter Modellaufruf prüft Prinzip, Formeln, Einheiten, Größenordnung, Ergebnis und Hint-Progression und kann die Analyse reparieren.

Wenn eine Modellantwort das Schema verletzt, erhält das Modell bis zu zwei gezielte Reparaturversuche. Danach wird die Analyse abgelehnt statt unsichere Daten an die App weiterzugeben.

## Lokaler Start

```bash
pnpm install
pnpm start
```

Für echte In-App-Käufe ist ein EAS Development Build oder Store-Testbuild erforderlich. Expo Go kann den Flow nur im Preview-Modus darstellen.

## Remote Analysis

Serverseitig erforderlich:

```text
LLM_API_KEY
LLM_MODEL
LLM_BASE_URL
REVENUECAT_SECRET_KEY
REVENUECAT_ENTITLEMENT_ID=pro
```

Mobil:

```text
EXPO_PUBLIC_SOLVEPATH_API_URL
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
EXPO_PUBLIC_REVENUECAT_IOS_KEY
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=pro
```

`EXPO_PUBLIC_*` darf ausschließlich öffentliche SDK-/Konfigurationswerte enthalten.

## Eingaben

- freie Textaufgabe
- Zwischenablage
- Kamera
- Galerie / Screenshot

Bilder sind auf JPEG, PNG und WebP sowie 8 MB begrenzt. Aufgabenbilder werden nicht dauerhaft in AsyncStorage gespeichert.

## API-Schutz

Der Server verwendet unter anderem:
- Zod-Validierung
- Request IDs
- Provider-Timeout
- Secret-Trennung
- MIME- und Dateisignaturprüfung
- Minuten-/Tageslimits
- serverseitige RevenueCat-Prüfung für Pro
- Free-Limit pro RevenueCat App User ID
- `Cache-Control: no-store`
- `X-Content-Type-Options: nosniff`

Wenn RevenueCat vorübergehend nicht erreichbar ist, wird der Entitlement-Status als unbekannt behandelt, damit zahlende Nutzer nicht durch einen externen Ausfall ausgesperrt werden. Das globale Fair-Use-Limit bleibt aktiv.

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

## Veröffentlichung

Siehe `RELEASE_CHECKLIST.md`. Vor einem öffentlichen Store-Release sind weiterhin echte Store-/RevenueCat-Produkte, ein HTTPS-Backend, physische Gerätetests, Store-Assets, Support-/Privacy-URLs und verbundene Developer-Konten nötig.
