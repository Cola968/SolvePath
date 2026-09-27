# SolvePath 0.5.0 Beta Test

## Ziel

Diese Beta prüft den lokalen Kern von SolvePath ohne Cloud-KI, API-Key oder In-App-Käufe.

**Build:** 0.5.0 · Android versionCode 3 · iOS build 3

## Beta-Funktionsumfang

- lokale freie Analyse für unterstützte Aufgaben
- On-Device-OCR für Kamera, Galerie und Screenshots
- 27 kuratierte Offline-SolvePaths
- Stuck Mode
- sechs progressive Hinweise
- Methodenwahl
- Ergebnisprüfung
- Lernprofil und Fehlermuster
- Exam Mode vollständig freigeschaltet
- lokale Speicherung des Lernfortschritts

Cloud Analysis und Store-Abos sind in diesem Build absichtlich deaktiviert.

## Android-Builds

Direkt installierbares APK:

```bash
eas build --platform android --profile beta
```

Google-Play-Test-AAB:

```bash
eas build --platform android --profile beta-store
```

Zusätzlich erzeugt GitHub Actions mit **Beta APK** ein direkt installierbares `SolvePath-0.5.0-beta.apk`, ohne Expo- oder Play-Zugang. Dieses APK ist nur für den geschlossenen Test gedacht und nicht für Google Play.

## Testmatrix

1. App frisch installieren und starten.
2. `Löse 3x + 5 = 20.` eingeben; Ergebnis muss `x = 5` sein.
3. `Wie viel sind 15 % von 240?` testen; Ergebnis muss `36` sein.
4. `Berechne 4 + 3 * 2.` testen; Ergebnis muss `10` sein.
5. Eine gut lesbare Matheaufgabe fotografieren und OCR-Text kontrollieren.
6. Einen Screenshot aus der Galerie laden und OCR-Text kontrollieren.
7. Eine nicht unterstützte Aufgabe eingeben; SolvePath darf kein Ergebnis erfinden.
8. Stuck Mode für mindestens drei verschiedene Engpässe testen.
9. Alle sechs Hint-Stufen einer Aufgabe durchlaufen.
10. Ein korrektes und ein absichtlich falsches Ergebnis prüfen.
11. Lernprofil nach mehreren Versuchen kontrollieren.
12. Exam Mode: Fach, Themen, Datum und Fokus-Training testen.
13. App schließen/öffnen und prüfen, ob Fortschritt erhalten bleibt.
14. Lernfortschritt in Einstellungen löschen.
15. Hell-/Dunkelmodus des Systems wechseln.
16. App im Flugmodus erneut testen; lokale Kernfunktionen müssen weiterlaufen.

## Bekannte Grenzen

- Die freie lokale Analyse deckt noch nicht jeden Mathe-/Physik-Aufgabentyp ab.
- OCR kann bei Handschrift, unscharfen Fotos und komplexer mathematischer Notation Zeichen falsch erkennen.
- Cloud-Analyse ist deaktiviert.
- Käufe und Abos sind deaktiviert.
- Es gibt noch keine SolvePath-Nutzerkonten oder Cloud-Synchronisation.

## Feedback

In der App: **Einstellungen → Fehler oder Feedback melden**.

Bei einem Fehler möglichst angeben:

- Gerät und Android-/iOS-Version
- welche Aufgabe getestet wurde
- Schritte bis zum Fehler
- erwartetes Verhalten
- tatsächliches Verhalten
- Screenshot, sofern keine personenbezogenen Daten darauf sichtbar sind
