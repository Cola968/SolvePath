import { describe, expect, it, vi } from 'vitest';
import { RevenueCatEntitlementVerifier } from './revenuecat';

function response(entitlement?: {
  expires_date?: string | null;
  grace_period_expires_date?: string | null;
}) {
  return new Response(
    JSON.stringify({
      subscriber: {
        entitlements: entitlement ? { pro: entitlement } : {},
      },
    }),
    { status: 200 },
  );
}

describe('RevenueCatEntitlementVerifier', () => {
  it('returns true for an active Pro entitlement', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ expires_date: '2099-01-01T00:00:00Z' }));
    const verifier = new RevenueCatEntitlementVerifier(
      { apiKey: 'secret', entitlementId: 'pro' },
      fetcher,
    );
    await expect(verifier.isPro('user-1')).resolves.toBe(true);
  });

  it('returns false for an expired entitlement', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ expires_date: '2020-01-01T00:00:00Z' }));
    const verifier = new RevenueCatEntitlementVerifier(
      { apiKey: 'secret', entitlementId: 'pro' },
      fetcher,
    );
    await expect(verifier.isPro('user-2')).resolves.toBe(false);
  });

  it('returns false when Pro is absent', async () => {
    const verifier = new RevenueCatEntitlementVerifier(
      { apiKey: 'secret', entitlementId: 'pro' },
      vi.fn<typeof fetch>().mockResolvedValue(response()),
    );
    await expect(verifier.isPro('user-3')).resolves.toBe(false);
  });

  it('fails open with unknown status when RevenueCat is unavailable', async () => {
    const verifier = new RevenueCatEntitlementVerifier(
      { apiKey: 'secret', entitlementId: 'pro' },
      vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')),
    );
    await expect(verifier.isPro('user-4')).resolves.toBeNull();
  });

  it('uses its short cache for repeated checks', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ expires_date: '2099-01-01T00:00:00Z' }));
    const verifier = new RevenueCatEntitlementVerifier(
      { apiKey: 'secret', entitlementId: 'pro', cacheMs: 60_000 },
      fetcher,
    );
    await verifier.isPro('cached-user');
    await verifier.isPro('cached-user');
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
