import fs from 'node:fs';

const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
const releaseConfig = fs.readFileSync('src/config/release.ts', 'utf8');
const envExample = fs.readFileSync('.env.example', 'utf8');
const expo = app.expo ?? {};
const errors = [];

if (!expo.name || !expo.slug) errors.push('Expo name/slug missing.');
if (expo.version !== pkg.version) errors.push('app.json and package.json versions differ.');
if (pkg.version !== '0.5.1') errors.push('Beta release must use version 0.5.1.');
if (!expo.android?.package) errors.push('Android package is missing.');
if (!Number.isInteger(expo.android?.versionCode) || expo.android.versionCode < 4)
  errors.push('Android beta versionCode must be at least 4.');
if (!expo.ios?.bundleIdentifier) errors.push('iOS bundleIdentifier is missing.');
if (!expo.ios?.buildNumber || Number(expo.ios.buildNumber) < 4)
  errors.push('iOS beta buildNumber must be at least 4.');

if (eas.build?.beta?.distribution !== 'internal' || eas.build?.beta?.android?.buildType !== 'apk')
  errors.push('EAS beta profile must create an internal Android APK.');
if (
  eas.build?.['beta-store']?.distribution !== 'store' ||
  eas.build?.['beta-store']?.android?.buildType !== 'app-bundle'
)
  errors.push('EAS beta-store profile must create an Android app bundle.');
if (!eas.submit?.['beta-store']) errors.push('EAS beta-store submit profile is missing.');

if (!pkg.dependencies?.['expo-text-extractor'])
  errors.push('On-device OCR dependency expo-text-extractor is missing.');
if (!pkg.dependencies?.['expo-image-manipulator'])
  errors.push('OCR image normalization dependency expo-image-manipulator is missing.');

if (!/BETA_MODE\s*=\s*true/.test(releaseConfig))
  errors.push('BETA_MODE must be true for the beta release.');
if (!/SUBSCRIPTIONS_ENABLED\s*=\s*false/.test(releaseConfig))
  errors.push('Subscriptions must be disabled in the beta release.');
if (!/CLOUD_ANALYSIS_ENABLED\s*=\s*false/.test(releaseConfig))
  errors.push('Cloud analysis must be disabled in the beta release.');
if (/EXPO_PUBLIC_SOLVEPATH_API_URL=\S+/.test(envExample))
  errors.push('Beta .env.example must not enable a cloud analysis URL.');

const serialized = JSON.stringify(app);
if (/LLM_API_KEY|REVENUECAT_SECRET_KEY|sk-[A-Za-z0-9_-]{12,}/.test(serialized))
  errors.push('A server secret appears to be present in mobile app configuration.');

if (errors.length) {
  console.error('Release check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Beta config OK: SolvePath ${expo.version}, Android ${expo.android.package} v${expo.android.versionCode}, iOS ${expo.ios.bundleIdentifier} build ${expo.ios.buildNumber}, local OCR enabled, cloud/purchases disabled.`,
);
