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
- lokale freie Analyse für unterstützte Mathe-/Physikaufgaben
- On-Device-Texterkennung für Aufgabenfotos
- kompletter SolvePath mit Stuck Mode und Hint Ladder

Pro:

- adaptiver Exam Mode
- Store-basierte Kaufwiederherstellung und Abo-Verwaltung

Die Kernanalyse funktioniert ohne externen KI-Provider, ohne API-Key und ohne laufende Modellkosten. Eine optionale Cloud-Analyse kann später separat aktiviert werden.

Apple- und Google-Abos werden über RevenueCat zusammengeführt. Die App verwendet nur öffentliche RevenueCat SDK-Schlüssel. Der Server kann das Entitlement `pro` mit einem geheimen RevenueCat-Key verifizieren.

## Lokale Analyse

SolvePath verwendet standardmäßig eine lokale, deterministische Analyse. Unterstützt werden derzeit unter anderem Rechenterme, lineare Gleichungen, Prozentrechnung, Steigungen, Satz des Pythagoras und das Ohmsche Gesetz. Zusätzlich stehen 27 vollständig kuratierte SolvePaths offline zur Verfügung.

Aufgabenbilder werden auf Android/iOS mit On-Device-OCR in Text umgewandelt. Die lokale Analyse erfindet bei nicht unterstützten freien Aufgaben kein Ergebnis, sondern weist darauf hin, dass der Aufgabentyp noch nicht sicher unterstützt wird.

## Lokaler Start

```bash
pnpm install
pnpm start
```

Für echte In-App-Käufe ist ein EAS Development Build oder Store-Testbuild erforderlich. Expo Go kann den Flow nur im Preview-Modus darstellen.

## Optionale Cloud Analysis

Cloud Analysis ist im Release-Build standardmäßig deaktiviert. Sie wird nur angezeigt, wenn `EXPO_PUBLIC_SOLVEPATH_API_URL` gesetzt ist. Ein späterer OpenAI-kompatibler Provider kann über `LLM_API_KEY`, `LLM_MODEL` und `LLM_BASE_URL` serverseitig angeschlossen werden.

RevenueCat bleibt davon unabhängig und verwendet ausschließlich seine öffentlichen mobilen SDK-Schlüssel sowie optional einen serverseitigen Secret Key.

## Eingaben

- freie Textaufgabe
- Zwischenablage
- Kamera
- Galerie / Screenshot

Bilder sind auf JPEG, PNG und WebP sowie 8 MB begrenzt. Bei lokaler Analyse wird der Aufgabentext direkt auf dem Gerät erkannt; Aufgabenbilder werden nicht an einen KI-Dienst hochgeladen und nicht dauerhaft in AsyncStorage gespeichert.

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

Siehe `RELEASE_CHECKLIST.md`. Vor einem öffentlichen Store-Release sind weiterhin echte Store-/RevenueCat-Produkte, physische Gerätetests, Store-Assets, Support-/Privacy-URLs und verbundene Developer-Konten nötig. Ein KI-Backend ist für die lokale Kernfunktion nicht erforderlich.
