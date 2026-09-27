# Security Policy

## Reporting a vulnerability

Please do not open a public issue for vulnerabilities involving secrets, authentication, remote analysis, file uploads, rate limiting, or provider access.

Report security issues privately to the repository owner through GitHub's private vulnerability reporting feature when available.

Do not include real API keys, personal data, or private student material in reports.

## Supported version

The current maintained beta is SolvePath 0.3.x.

## Secret handling

Provider API keys belong only in the backend environment. Never commit them, expose them through `EXPO_PUBLIC_*`, include them in screenshots, or place them in client bundles.

## Uploaded content

Treat task images and task text as potentially sensitive user content. Production infrastructure should minimize retention and logs, and provider/hosting retention settings must match the published privacy policy.
