# SolvePath v0.3 Beta

SolvePath begleitet Mathematik- und Physikaufgaben über **Aufgabe → Diagnose → Methode → sechs gestufte Hinweise → eigener Lösungsweg → Ergebnisprüfung → Lernprofil**.

v0.3 ergänzt freie Textaufgaben, Zwischenablage, Kamera, Galerie und Screenshots über eine serverseitige Analyse. Die acht lokalen Demo-Aufgaben bleiben als Offline-Fallback erhalten.

## KI-Pipeline

Remote Analysis arbeitet zweistufig:

1. **Analysepass**: Der multimodale Provider erzeugt eine strukturierte `ProblemAnalysis`.
2. **Verifikationspass**: Ein zweiter Modellaufruf prüft Prinzip, Formeln, Einheiten, Größenordnung, Ergebnis und Hint-Progression und kann die Analyse reparieren.

Wenn eine Modellantwort das Schema verletzt, erhält das Modell bis zu zwei gezielte Reparaturversuche mit einer kompakten Validierungsbeschreibung. Danach wird die Analyse abgelehnt statt unsichere Daten an die App weiterzugeben.

Der Verifikationspass ist standardmäßig aktiv und kann serverseitig mit `LLM_VERIFY_ANALYSIS=false` abgeschaltet werden.

Wichtig: Auch eine zweistufig geprüfte KI kann fachliche Fehler machen. SolvePath ist ein Lernbegleiter und kein Ersatz für Lehrkräfte oder verbindliche Musterlösungen.

## Starten

Voraussetzungen: Node.js 22.13+ und pnpm 11.19.0+.

```bash
pnpm install
pnpm start
```

Ohne Server-URL startet die App im lokalen Demo-Modus.

Für Remote Analysis:

1. `.env.example` als Vorlage verwenden.
2. Serverseitig `LLM_API_KEY`, `LLM_MODEL` und `LLM_BASE_URL` setzen.
3. Das Modell muss Bilder verarbeiten und JSON ausgeben können.
4. Backend mit `pnpm server:start` starten.
5. In der App ausschließlich `EXPO_PUBLIC_SOLVEPATH_API_URL` auf die HTTPS-Adresse des Backends setzen.

**Nie einen Provider-Key als `EXPO_PUBLIC_*` Variable setzen.**

## Eingaben

- freie Textaufgabe
- Text aus Zwischenablage
- Kamera
- Bild aus Galerie
- Screenshot über Galerie

Bilder sind auf JPEG, PNG und WebP sowie 8 MB begrenzt. Auf dem Server werden Dateisignatur und MIME-Type geprüft. Bilddateien werden nicht in AsyncStorage gespeichert.

## Ergebnisprüfung

SolvePath berücksichtigt unter anderem:

- Dezimalkomma und Dezimalpunkt
- wissenschaftliche Schreibweise
- Toleranzen
- kompatible Einheiten wie `7,67 km/s` und `7670 m/s`
- strukturierte Fehlermuster wie Einheitenfehler, Vorzeichenfehler und Exponentenfehler

## API-Schutz

`POST /api/analyze` akzeptiert JSON oder Multipart.

Der Server verwendet:

- Zod-Validierung für jede Analyse
- Request IDs
- Provider-Timeout
- Secret-Trennung zwischen App und Backend
- MIME- und Dateisignaturprüfung
- einfache IP-basierte Rate-Limits
- `Cache-Control: no-store` für Analyseantworten
- `X-Content-Type-Options: nosniff`
- optionales `TRUST_PROXY=true` hinter einem vertrauenswürdigen Reverse Proxy

Für großen öffentlichen Betrieb sollte zusätzlich ein dauerhaftes Rate-Limit am Gateway oder Hosting-Anbieter genutzt werden.

## Datenschutz

Die aktuelle Beta hat keine Nutzerkonten.

Lokal gespeichert werden Verlauf, Hinweise, Lernfortschritt, Fehlermuster und validierte Textanalysen. Bei Remote Analysis werden Aufgabentext und gegebenenfalls Aufgabenbild an den SolvePath-Server und den konfigurierten KI-Provider übertragen.

Ein Veröffentlichungsentwurf der Datenschutzerklärung liegt unter `store/privacy-policy.de.md`.

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

GitHub Actions führt diese Prüfungen aus.

## Release

`eas.json` enthält Development-, Preview- und Production-Profile. Android `versionCode` und iOS `buildNumber` sind gesetzt.

Die vollständige Veröffentlichungsliste steht in `RELEASE_CHECKLIST.md`.

Vor einem öffentlichen Store-Release müssen außerhalb des Codes noch erledigt werden:

- produktives HTTPS-Backend
- echter KI-Provider und Secrets
- realer Android-Gerätetest
- finales App-Icon und Store-Screenshots
- öffentliche Datenschutzerklärungs-URL
- Support-Kontakt
- endgültige Bestätigung der Package IDs
- EAS/Google-Play- bzw. Apple-Developer-Verbindung
- Data-Safety-/App-Privacy-Angaben passend zu Hoster und KI-Provider
