# SnapStudy – Play Store release sheet

Status: Beta-Test vorbereitet  
Package: `app.snapstudy.mobile`  
Version: `0.9.0`  
Android versionCode: `1`  
Target/compile SDK: API 36 via Expo SDK 57  
App service: https://snapstudy-beta-v2.onrender.com  
Privacy policy: https://snapstudy-beta-v2.onrender.com/privacy/snapstudy

## Store title
SnapStudy

## Short description
Notizen in Lernrunden verwandeln und Fehler automatisch wiederholen.

## Full description
SnapStudy verbindet Notizen mit aktivem Lernen.

Schreibe oder zeichne deine Lerninhalte, füge Text oder ein Foto hinzu und verwandle den Stoff direkt in kurze Lernrunden. Falsche oder unsichere Antworten verschwinden nicht: Sie werden für spätere Wiederholungen eingeplant.

Mit SnapStudy kannst du:
- Notizseiten erstellen und lokal speichern
- mit Stift, Marker und Radierer arbeiten
- liniertes, kariertes oder blankes Papier verwenden
- Text oder ausgewählte Bereiche als Lernstoff verwenden
- kurze Lernrunden aus eigenen Notizen erstellen
- Fehler und unsichere Antworten gezielt wiederholen
- Lernrunden speichern und erneut spielen
- Challenges mit demselben Fragenset teilen
- im Fokusmodus ohne unnötige UI schreiben

Textbasierte Lernrunden besitzen einen lokalen Fallback, wenn der externe Analysedienst nicht erreichbar ist. Für Bildanalyse ist eine Online-Verbindung erforderlich.

## Category
Education

## Data safety draft
- Notes, drawings and review state are stored locally in the current beta.
- Text/images submitted for automatic analysis can be sent to the SnapStudy service.
- If external AI analysis is configured and available, submitted content can be forwarded for processing.
- Camera/file access is initiated by the user.
- The current beta contains no advertising SDK.

Before submission, verify the Play Console Data safety form against the exact production backend and every dependency.

## Release checklist
- [x] Separate Android package ID from SolvePath
- [x] Target API 36
- [x] Privacy policy URL
- [x] Privacy policy linked from the web app
- [x] Installable Android beta workflow
- [x] Native loading/offline/back-navigation shell
- [x] Web app deployed in Frankfurt
- [ ] Move from beta Render subdomain to final custom domain
- [ ] Final 512×512 store icon
- [ ] Feature graphic 1024×500
- [ ] Phone/tablet screenshots
- [ ] Developer support email
- [ ] Play Console app created
- [ ] Play App Signing / upload key configured
- [ ] Data safety questionnaire completed
- [ ] Content rating completed
- [ ] Closed-test requirement completed if the account is subject to it

## Testing
Web beta:
https://snapstudy-beta-v2.onrender.com

Latest Android beta release:
https://github.com/Cola968/SolvePath/releases/tag/snapstudy-beta-latest

Direct APK asset:
https://github.com/Cola968/SolvePath/releases/download/snapstudy-beta-latest/SnapStudy-0.9.0-beta.apk


## Naming risk

There is already an education app named **SnapStudy.ai** on Google Play. Keep "SnapStudy" as the internal beta name only. Before the public Play listing, choose and verify a distinctive public product name to avoid brand confusion and potential trademark/store-listing problems. The Android package ID `app.snapstudy.mobile` can remain independent of the public display name if it has not already been registered in Play Console.
