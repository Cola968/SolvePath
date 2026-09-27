# Changelog

## 0.5.0 Beta - 2026-09-27

### Added

- zero-cost local problem analysis for supported free-form math and physics tasks
- on-device OCR for camera, gallery, and screenshots
- beta release configuration with cloud analysis and purchases hard-disabled
- Exam Mode unlocked for beta testers
- in-app beta feedback link and GitHub feedback template
- beta test matrix and data-safety worksheet
- EAS beta APK / beta-store AAB profiles
- GitHub Actions workflow for a directly installable Android beta APK

### Changed

- SolvePath now defaults to local-first analysis
- beta UI no longer advertises or requires subscriptions
- store copy and privacy documentation now match the actual beta behavior
- release checks enforce local OCR, beta versioning, disabled cloud analysis, and disabled subscriptions

### Beta status

The closed beta can be tested without an AI provider or API billing. A Google Play closed/internal
test still requires the user's Play/Expo accounts, store signing setup, and store contact metadata.

## 0.4.0 - 2026-09-27

### Added

- SolvePath Free with three remote AI analyses per day
- SolvePath Pro entitlement with RevenueCat purchase, restore, paywall, and customer center flows
- server-side RevenueCat entitlement verification
- adaptive Exam Mode as a Pro feature
- 19 additional structured practice paths
- broader mathematics coverage: arithmetic, fractions, percentages, rule of three, powers, roots, linear functions, systems, quadratics, geometry, statistics, probability, inequalities, and derivatives
- additional physics paths for motion, kinetic energy, Ohm's law, and density
- EAS development client support for real purchase testing

### Improved

- home and analysis screens show current Free/Pro state and remaining daily analyses
- release configuration validates subscription dependencies
- privacy and store listing drafts now include subscriptions and RevenueCat
- remote analysis remains protected by global abuse limits even for Pro users

### Release status

The code is a release candidate. Public store publication still requires a live HTTPS backend,
configured AI and RevenueCat projects, physical-device billing tests, public privacy/support URLs,
store assets, and connected developer accounts.

## 0.3.0 - 2026-09-27

### Added

- free text analysis
- camera and gallery task input
- remote multimodal analysis backend
- second AI verification/repair pass
- structured schema validation and retries
- broader unit-aware result checking
- request quotas and deployment-safe health checks
- EAS build profiles
- Render deployment blueprint
- Play Store and App Store listing drafts
- privacy and release checklists

### Improved

- Stuck Mode and Hint Ladder remain integrated with remote tasks
- stricter early-hint rules
- prompt-injection resistance for photographed task content
- remote analysis persistence limits
- release CI and Android export validation

### Notes

A public store release still requires a live HTTPS backend, configured model provider, device testing,
store assets, privacy/support URLs, and developer-account submission.
