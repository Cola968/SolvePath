let appUserId: string | null = null;

export function setSubscriptionAppUserId(value: string | null): void {
  appUserId = value?.trim() || null;
}

export function getSubscriptionAppUserId(): string | null {
  return appUserId;
}
