# SolvePath v0.3 Beta

SolvePath begleitet Mathematik- und Physikaufgaben über **Aufgabe → Diagnose → Methode → sechs gestufte Hinweise → eigenen Lösungsweg → Ergebnisprüfung → Lernprofil**. Die bestehende v0.2-Oberfläche und acht lokalen Demo-Aufgaben bleiben erhalten. v0.3 ergänzt freie Textaufgaben, Zwischenablage, Kamera, Galerie und Screenshots über eine serverseitige Analyse.

## Ausgangszustand

Der Branch basiert auf `main` mit Merge-Commit `c547fc6c7e34e41ca0d8842ffb97f92ffda2bdba`. Vor den Änderungen liefen `pnpm install`, `typecheck`, `lint` und die elf vorhandenen Tests erfolgreich. `format:check` meldete 14 vorhandene Dateien; `pnpm format` normalisierte deren Zeilenenden, danach war die Prüfung grün. Der Android-Export scheiterte im OneDrive-Checkout an einem unvollständig bereitgestellten `nanoid/non-secure`-Paket, lief aber aus einem frischen temporären Checkout desselben Commits erfolgreich. Diese Besonderheit betrifft die lokale OneDrive-Bereitstellung, nicht den Quellcode.

## Starten

Voraussetzungen: Node.js 22.13+ und pnpm 11.19.0+.

```bash
pnpm install
pnpm start
```

Ohne Server-URL startet die App im lokalen Demo-Modus. Die acht Beispiele sind weiterhin vollständig offline nutzbar. Für freie Aufgaben und Bilder benötigst du einen multimodalen, OpenAI-kompatiblen `chat/completions`-Provider und einen laufenden SolvePath-Server.

1. Kopiere `.env.example` in eine nicht versionierte `.env` oder setze die Variablen in der Server-Umgebung.
2. Setze **serverseitig** `LLM_API_KEY`, `LLM_MODEL` und `LLM_BASE_URL` (Basis-URL bis einschließlich `/v1`, ohne `/chat/completions`). Das Modell muss Bilder verarbeiten und JSON ausgeben können.
3. Starte den Server mit `pnpm server:start` oder lokal mit `pnpm server:dev`. Standardmäßig lauscht er auf `127.0.0.1:3000`; `HOST` und `PORT` sind konfigurierbar.
4. Setze für die App ausschließlich `EXPO_PUBLIC_SOLVEPATH_API_URL` auf die von ihrem Gerät erreichbare Backend-Adresse. Für den Android-Emulator kann lokal `http://10.0.2.2:3000` verwendet werden, wenn der Server auf einer erreichbaren Schnittstelle läuft. Auf einem echten Gerät ist eine erreichbare HTTPS-Adresse nötig.

**Nie `LLM_API_KEY` als `EXPO_PUBLIC_*` setzen.** Der Mobile Client sendet nur Text bzw. ein ausgewähltes Bild an `POST /api/analyze`. Der Server ruft den Provider auf, prüft die Antwort mit demselben Zod-Schema wie die App und gibt nur valide `ProblemAnalysis`-Daten zurück. Ohne Provider-Zugangsdaten liefern die automatisierten Tests einen Mock Provider; ein echter Modellaufruf ist dann nicht möglich.

## Bedienung

- Im Modus **Remote Analysis** können beliebige Aufgaben eingegeben oder aus der Zwischenablage eingefügt werden. Kamera und Galerie verwenden `expo-image-picker`; Screenshots werden über die Galerie gewählt. Android fragt die Kamera-Berechtigung erst beim Fotografieren an. Der Bilddialog kann abgebrochen werden, danach gibt es Vorschau und Entfernen.
- Der Modus **Lokale Demo** erkennt die acht vorbereiteten Aufgaben ohne Netzwerk. Bei einem Serverfehler zeigt die App einen verständlichen Fehler; die Demo bleibt auswählbar. Ein erneuter Analyseversuch nutzt dieselbe Eingabe.
- Die Analyse zeigt diskrete Arbeitsschritte statt eines Prozentbalkens. Nach Erfolg erscheint **„Dein SolvePath ist bereit“** mit **„Diagnose starten“**. Remote-Aufgaben gehen durch Diagnose, Methode, Hint Ladder, Ergebnisprüfung und Lernprofil.
- Die Ergebnisprüfung berücksichtigt Dezimalkomma, wissenschaftliche Schreibweise, Toleranz und kompatible Einheiten wie `7,67 km/s` und `7670 m/s`. Ein Denkfehler wird erst dann dem Profil hinzugefügt, wenn die tatsächliche Nutzereingabe zu einem konkreten Trigger oder strukturierten Fehlercode passt.

## API und Grenzen

`POST /api/analyze` akzeptiert JSON `{ "text": "..." }` oder `multipart/form-data` mit Datei `image` und optionalem Feld `text`. Antwort: `ProblemAnalysis`. Bilder sind auf 8 MB und JPEG, PNG oder WebP begrenzt; Text auf 12.000 Zeichen. Der Server prüft MIME und Dateisignatur, setzt 25 Sekunden Provider-Timeout, versucht strukturell ungültige KI-Ausgaben einmal erneut, versieht Antworten mit einer Request-ID und hat eine einfache In-Memory-Schranke von 30 Anfragen pro IP und Minute. Für öffentlichen Betrieb sollte davor ein dauerhaftes, geteiltes Rate Limit am Gateway stehen.

Der Provider-Prompt erzeugt sechs progressive Hinweise; Hinweise 1 und 2 dürfen die fertige Rechnung nicht verraten. Zod sichert die Struktur, **nicht** die fachliche Korrektheit jeder generierten Rechnung. Vor öffentlichem Einsatz sollten Aufgabenstichproben fachlich geprüft werden. Ein reales Gerät und ein echter Provider können ohne Zugangsdaten bzw. Gerät hier nicht end-to-end verifiziert werden.

## Datenschutz

Die App hat in dieser Beta **keine Nutzerkonten**. Lokal in AsyncStorage liegen der Aufgabenverlauf, freigegebene Hinweise, Lernprofil und validierte Textanalysen von Remote-Aufgaben, damit ein Lösungsweg fortgesetzt werden kann. **Bilddateien und Base64-Bilder werden nicht in AsyncStorage gespeichert.** Nach erfolgreicher Analyse entfernt die Eingabeseite die Bildauswahl. Bei Remote Analysis werden Aufgabentext und ausgewähltes Bild an den eingestellten SolvePath-Server und von dort an den konfigurierten KI-Provider gesendet. Server und App protokollieren weder Aufgabenbilder noch API-Schlüssel oder vollständige Provider-Antworten. Vor öffentlichem Betrieb sind Hosting, Provider-Vertrag und Löschfristen passend zu konfigurieren.

## Entwicklung und CI

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
pnpm build:export
pnpm server:typecheck
pnpm server:lint
pnpm server:test
```

GitHub Actions führt alle Prüfungen einschließlich Android-Export aus. `server/src` enthält API, Provider-Abstraktion, Prompt, Eingabegrenzen und Tests. `src/services/problem-analyzer.ts` trennt die Mobile UI vom Remote-Dienst und vom lokalen Mock. Das gemeinsame `ProblemAnalysis`-Schema liegt in `src/domain/problem/schema.ts`.
