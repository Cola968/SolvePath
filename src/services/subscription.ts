import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, type CustomerInfo } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { setSubscriptionAppUserId } from './subscription-identity';

export const PRO_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || 'pro';

let configured = false;

function platformKey(): string | null {
  if (Platform.OS === 'android')
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY?.trim() || null;
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY?.trim() || null;
  return null;
}

function hasPro(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[PRO_ENTITLEMENT_ID] !== 'undefined';
}

export type SubscriptionSnapshot = {
  configured: boolean;
  pro: boolean;
  appUserId: string | null;
};

export async function configureSubscriptions(): Promise<SubscriptionSnapshot> {
  const key = platformKey();
  if (!key) return { configured: false, pro: false, appUserId: null };

  if (!configured) {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: key });
    configured = true;
  }

  const [info, appUserId] = await Promise.all([
    Purchases.getCustomerInfo(),
    Purchases.getAppUserID(),
  ]);
  setSubscriptionAppUserId(appUserId);
  return { configured: true, pro: hasPro(info), appUserId };
}

export async function refreshSubscription(): Promise<SubscriptionSnapshot> {
  if (!configured) return configureSubscriptions();
  const [info, appUserId] = await Promise.all([
    Purchases.getCustomerInfo(),
    Purchases.getAppUserID(),
  ]);
  setSubscriptionAppUserId(appUserId);
  return { configured: true, pro: hasPro(info), appUserId };
}

export async function presentProPaywall(): Promise<boolean> {
  const snapshot = await configureSubscriptions();
  if (!snapshot.configured) throw new Error('Abo-System ist noch nicht konfiguriert.');

  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID,
  });
  if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) return true;
  return (await refreshSubscription()).pro;
}

export async function restoreSubscription(): Promise<boolean> {
  const snapshot = await configureSubscriptions();
  if (!snapshot.configured) throw new Error('Abo-System ist noch nicht konfiguriert.');
  return hasPro(await Purchases.restorePurchases());
}

export async function openSubscriptionManagement(): Promise<void> {
  const snapshot = await configureSubscriptions();
  if (!snapshot.configured) throw new Error('Abo-System ist noch nicht konfiguriert.');
  await RevenueCatUI.presentCustomerCenter();
}
