type CachedEntitlement = { pro: boolean; expiresAt: number };

export interface EntitlementVerifier {
  isPro(appUserId: string): Promise<boolean | null>;
}

type RevenueCatConfig = {
  apiKey: string;
  entitlementId: string;
  timeoutMs?: number;
  cacheMs?: number;
};

export class RevenueCatEntitlementVerifier implements EntitlementVerifier {
  private readonly cache = new Map<string, CachedEntitlement>();

  constructor(
    private readonly config: RevenueCatConfig,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async isPro(appUserId: string): Promise<boolean | null> {
    if (!this.config.apiKey || !appUserId) return null;

    const cached = this.cache.get(appUserId);
    const now = Date.now();
    if (cached && cached.expiresAt > now) return cached.pro;

    try {
      const response = await this.fetcher(
        `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
        {
          headers: {
            authorization: `Bearer ${this.config.apiKey}`,
            accept: 'application/json',
          },
          signal: AbortSignal.timeout(this.config.timeoutMs ?? 5_000),
        },
      );
      if (!response.ok) return null;

      const payload = (await response.json()) as {
        subscriber?: {
          entitlements?: Record<
            string,
            { expires_date?: string | null; grace_period_expires_date?: string | null }
          >;
        };
      };
      const entitlement = payload.subscriber?.entitlements?.[this.config.entitlementId];
      const expiration = entitlement?.grace_period_expires_date ?? entitlement?.expires_date;
      const pro =
        !!entitlement &&
        (expiration === null ||
          expiration === undefined ||
          Number.isNaN(Date.parse(expiration)) ||
          Date.parse(expiration) > now);

      this.cache.set(appUserId, {
        pro,
        expiresAt: now + (this.config.cacheMs ?? 5 * 60_000),
      });
      return pro;
    } catch {
      return null;
    }
  }
}
