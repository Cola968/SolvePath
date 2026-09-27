import fs from 'node:fs';

const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const eas = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
const expo = app.expo ?? {};
const errors = [];

if (!expo.name || !expo.slug) errors.push('Expo name/slug missing.');
if (expo.version !== pkg.version) errors.push('app.json and package.json versions differ.');
if (!expo.android?.package) errors.push('Android package is missing.');
if (!Number.isInteger(expo.android?.versionCode) || expo.android.versionCode < 1)
  errors.push('Android versionCode must be a positive integer.');
if (!expo.ios?.bundleIdentifier) errors.push('iOS bundleIdentifier is missing.');
if (!expo.ios?.buildNumber) errors.push('iOS buildNumber is missing.');
if (!eas.build?.production) errors.push('EAS production build profile is missing.');
if (!eas.submit?.production) errors.push('EAS production submit profile is missing.');

const serialized = JSON.stringify(app);
if (/LLM_API_KEY|sk-[A-Za-z0-9_-]{12,}/.test(serialized))
  errors.push('A provider secret appears to be present in mobile app configuration.');

if (errors.length) {
  console.error('Release check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Release config OK: SolvePath ${expo.version}, Android ${expo.android.package} v${expo.android.versionCode}, iOS ${expo.ios.bundleIdentifier} build ${expo.ios.buildNumber}.`,
);
