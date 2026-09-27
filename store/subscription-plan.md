# SolvePath Subscription Plan

## Free

- 27 structured local practice paths
- full Stuck Mode and six-level Hint Ladder
- local learning profile
- 3 successful remote AI analyses per local day
- no account required

## SolvePath Pro

Pro removes the Free daily AI-analysis limit. Global fair-use and abuse-protection limits still apply.

Pro also unlocks adaptive Exam Mode.

### Recommended launch products

| Store product ID | Billing period | Recommended Germany launch price |
| --- | --- | --- |
| `solvepath_pro_monthly` | 1 month | €3.99 |
| `solvepath_pro_yearly` | 1 year | €24.99 |

Store prices must be configured in Google Play Console and App Store Connect. The mobile app must display the localized price returned by the store through RevenueCat rather than hard-coding these values.

### RevenueCat

- Entitlement: `pro`
- Offering: `default`
- Monthly package: `$rc_monthly` → `solvepath_pro_monthly`
- Annual package: `$rc_annual` → `solvepath_pro_yearly`

Optional launch experiment: a 7-day free trial on the annual product only. Trial eligibility and exact terms must be shown by the store/paywall.

## Upgrade messaging

Use:
- “Kein Free-Tageslimit”
- “Exam Mode”
- “Käufe wiederherstellen”
- “Abo verwalten”

Do not claim technically unlimited usage because server-side fair-use and abuse limits remain active.

## Purchase ownership

Digital subscriptions are purchased through Apple App Store or Google Play. RevenueCat normalizes entitlement state across the two mobile implementations. Stripe is not used for unlocking digital features inside the mobile app.

## Test matrix before Production

- new monthly purchase
- new annual purchase
- trial start if enabled
- trial conversion
- user cancellation while access remains active until expiration
- expiration removes Pro
- billing grace period keeps expected entitlement
- restore purchase
- reinstall and restore
- RevenueCat temporary outage
- store purchase cancellation
- switching monthly → annual
