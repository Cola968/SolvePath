# SolvePath 0.5.0 Beta – Data-Safety-Arbeitsblatt

Stand: September 2026. Vor der Einreichung im jeweiligen Store anhand des tatsächlich erzeugten Builds prüfen.

## Beta-Konfiguration

- Cloud Analysis: deaktiviert
- In-App-Käufe / RevenueCat: deaktiviert
- SolvePath-Konto: nicht vorhanden
- Aufgabenanalyse: lokal
- OCR: lokal auf dem Gerät
- Lernfortschritt: lokal auf dem Gerät

## Durch SolvePath selbst erhobene Daten

Für den Beta-Kern ist derzeit keine serverseitige Erhebung von Aufgabeninhalten vorgesehen.

Lokal gespeichert werden:

- bearbeitete Aufgaben / generierte lokale SolvePaths
- freigeschaltete Hinweise
- Lernfortschritt
- erkannte Fehlermuster
- Prüfungsmodus-Einstellungen

Diese Daten verlassen im vorgesehenen Beta-Build nicht das Gerät.

## Berechtigungen

**Kamera:** nur wenn Nutzer eine Aufgabe fotografieren.

**Fotos / Galerie:** nur zur Auswahl eines Aufgabenbildes oder Screenshots.

## Google-Play-Data-Safety

Für die Beta ist als Ausgangspunkt vorgesehen:

- Datenerhebung durch SolvePath: nein
- Datenweitergabe durch SolvePath: nein
- Datenverschlüsselung bei Übertragung: nicht anwendbar für den lokalen Kern
- Löschmöglichkeit: lokale Daten können in den Einstellungen gelöscht werden

Vor Absenden müssen Google-Play-Dienste, Betriebssystem-Telemetrie und alle tatsächlich im finalen Artefakt aktiven SDKs erneut geprüft werden.
