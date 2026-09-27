# SolvePath v0.4 Release Checklist

## Technisch im Repository
- [x] TypeScript strict
- [x] Mobile- und Backend-Lint
- [x] automatisierte Tests
- [x] Android-Export in CI
- [x] serverseitige Secret-Trennung
- [x] Bildgrößen- und MIME-Prüfung
- [x] Rate-Limit-Grundschutz
- [x] zweite KI-Prüfstufe
- [x] EAS Build-Profile
- [x] Android versionCode und iOS buildNumber
- [x] Store-Listing-Entwürfe
- [x] Datenschutzerklärungs-Entwurf
- [x] RevenueCat SDK für Apple/Google Store-Abos
- [x] Restore Purchases und Abo-Verwaltung
- [x] Free-Tier mit drei KI-Analysen pro Tag
- [x] Pro-Entitlement `pro`
- [x] Exam Mode als Pro-Funktion

## RevenueCat / Stores
- [ ] RevenueCat-Projekt anlegen
- [ ] Android-App mit Package `app.solvepath.mobile` verbinden
- [ ] iOS-App mit Bundle-ID `app.solvepath.mobile` verbinden
- [ ] Entitlement mit Identifier `pro` anlegen
- [ ] mindestens Monats- und Jahresabo in Google Play und App Store Connect anlegen
- [ ] Produkte an das Entitlement `pro` hängen
- [ ] RevenueCat Offering `default` mit Paywall konfigurieren
- [ ] öffentliche Android/iOS SDK-Keys als EAS Environment Variables setzen
- [ ] Sandbox-/Lizenztester für beide Stores einrichten
- [ ] Kauf, Kündigung, Restore und abgelaufenes Abo testen

## Backend / KI
- [ ] echten multimodalen KI-Provider auswählen und Server-Secrets setzen
- [ ] Backend öffentlich über HTTPS deployen
- [ ] `EXPO_PUBLIC_SOLVEPATH_API_URL` auf die produktive HTTPS-URL setzen
- [ ] echten Android-Gerätetest: Kamera, Galerie, Remote Analysis, Stuck Mode, Ergebnisprüfung

## Recht / Store
- [ ] Betreiber-/Kontaktangaben in Datenschutzerklärung ergänzen
- [ ] Datenschutzerklärung öffentlich hosten
- [ ] Support-E-Mail für Store-Eintrag festlegen
- [ ] finales App-Icon, Screenshots und Feature Graphic erstellen
- [ ] Package IDs vor dem ersten Store-Upload endgültig bestätigen
- [ ] EAS-Projekt mit `eas init` dem richtigen Expo-Konto zuordnen
- [ ] Google-Play-Developer-Konto bzw. Apple-Developer-Konto verbinden
- [ ] Data-Safety-/App-Privacy-Angaben ausfüllen
- [ ] internen Testkanal vor Production verwenden

## Release-Kommandos

```bash
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
```

Danach:

```bash
eas build --platform android --profile preview
eas build --platform android --profile production
eas submit --platform android --profile production
```

Für echte In-App-Käufe reicht Expo Go nicht; nutze einen EAS Development Build oder Store-Testbuild.
