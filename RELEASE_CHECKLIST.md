# SolvePath Release Checklist

## Technisch im Repository
- [x] TypeScript strict
- [x] Mobile- und Backend-Lint
- [x] automatisierte Tests
- [x] Android-Export in CI
- [x] serverseitige Secret-Trennung
- [x] Bildgrößen- und MIME-Prüfung
- [x] Rate-Limit-Grundschutz
- [x] zweite KI-Prüfstufe konfigurierbar und standardmäßig aktiv
- [x] EAS Build-Profile
- [x] Android versionCode und iOS buildNumber
- [x] Store-Listing-Entwurf
- [x] Datenschutzerklärungs-Entwurf

## Muss vor öffentlicher Veröffentlichung extern erledigt werden
- [ ] echten multimodalen KI-Provider auswählen und Server-Secrets setzen
- [ ] Backend öffentlich über HTTPS deployen
- [ ] EXPO_PUBLIC_SOLVEPATH_API_URL auf die produktive HTTPS-URL setzen
- [ ] echten Android-Gerätetest: Kamera, Galerie, Remote Analysis, Stuck Mode, Ergebnisprüfung
- [ ] Betreiber-/Kontaktangaben in Datenschutzerklärung ergänzen
- [ ] Datenschutzerklärung öffentlich hosten
- [ ] Support-E-Mail für Store-Eintrag festlegen
- [ ] finales App-Icon, Screenshots und Feature Graphic erstellen
- [ ] Package IDs vor dem ersten Store-Upload endgültig bestätigen
- [ ] EAS-Projekt mit eas init dem richtigen Expo-Konto zuordnen
- [ ] Google-Play-Developer-Konto bzw. Apple-Developer-Konto verbinden
- [ ] Data-Safety-/App-Privacy-Angaben anhand des tatsächlich verwendeten Hosters und KI-Providers ausfüllen
- [ ] internen Testkanal verwenden, bevor Production freigegeben wird

## Release-Kommandos

pnpm install --frozen-lockfile
pnpm typecheck
pnpm server:typecheck
pnpm lint
pnpm server:lint
pnpm test
pnpm server:test
pnpm format:check
pnpm release:check
pnpm build:export

Danach – nach eas init und Login:

eas build --platform android --profile preview
eas build --platform android --profile production
eas submit --platform android --profile production
