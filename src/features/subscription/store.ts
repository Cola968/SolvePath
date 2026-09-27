import { create } from 'zustand';
import {
  configureSubscriptions,
  openSubscriptionManagement,
  presentProPaywall,
  refreshSubscription,
  restoreSubscription,
} from '../../services/subscription';
import {
  FREE_REMOTE_ANALYSES_PER_DAY,
  loadQuota,
  recordFreeAnalysis,
} from '../../storage/quota-repository';

type SubscriptionState = {
  initialized: boolean;
  configured: boolean;
  pro: boolean;
  busy: boolean;
  error: string | null;
  appUserId: string | null;
  freeAnalysesUsed: number;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  showPaywall: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  manage: () => Promise<void>;
  canAnalyzeRemote: () => boolean;
  remainingFreeAnalyses: () => number;
  recordRemoteAnalysis: () => Promise<void>;
};

export const useSubscription = create<SubscriptionState>((set, get) => ({
  initialized: false,
  configured: false,
  pro: false,
  busy: false,
  error: null,
  appUserId: null,
  freeAnalysesUsed: 0,

  initialize: async () => {
    if (get().initialized) return;
    try {
      const [subscription, quota] = await Promise.all([configureSubscriptions(), loadQuota()]);
      set({
        initialized: true,
        configured: subscription.configured,
        pro: subscription.pro,
        appUserId: subscription.appUserId,
        freeAnalysesUsed: quota.analyses,
        error: null,
      });
    } catch {
      const quota = await loadQuota();
      set({
        initialized: true,
        configured: false,
        pro: false,
        freeAnalysesUsed: quota.analyses,
        error: 'Abo-Status konnte nicht geladen werden.',
      });
    }
  },

  refresh: async () => {
    try {
      const subscription = await refreshSubscription();
      set({
        configured: subscription.configured,
        pro: subscription.pro,
        appUserId: subscription.appUserId,
        error: null,
      });
    } catch {
      set({ error: 'Abo-Status konnte nicht aktualisiert werden.' });
    }
  },

  showPaywall: async () => {
    set({ busy: true, error: null });
    try {
      const pro = await presentProPaywall();
      const snapshot = await refreshSubscription();
      set({
        busy: false,
        configured: snapshot.configured,
        pro: snapshot.pro || pro,
        appUserId: snapshot.appUserId,
      });
      return snapshot.pro || pro;
    } catch (error) {
      set({
        busy: false,
        error: error instanceof Error ? error.message : 'Abo konnte nicht geöffnet werden.',
      });
      return false;
    }
  },

  restore: async () => {
    set({ busy: true, error: null });
    try {
      const pro = await restoreSubscription();
      set({ busy: false, pro });
      return pro;
    } catch (error) {
      set({
        busy: false,
        error:
          error instanceof Error ? error.message : 'Käufe konnten nicht wiederhergestellt werden.',
      });
      return false;
    }
  },

  manage: async () => {
    set({ busy: true, error: null });
    try {
      await openSubscriptionManagement();
      set({ busy: false });
    } catch (error) {
      set({
        busy: false,
        error: error instanceof Error ? error.message : 'Abo-Verwaltung konnte nicht geöffnet werden.',
      });
    }
  },

  canAnalyzeRemote: () =>
    get().pro || get().freeAnalysesUsed < FREE_REMOTE_ANALYSES_PER_DAY,

  remainingFreeAnalyses: () =>
    get().pro
      ? Number.POSITIVE_INFINITY
      : Math.max(0, FREE_REMOTE_ANALYSES_PER_DAY - get().freeAnalysesUsed),

  recordRemoteAnalysis: async () => {
    if (get().pro) return;
    const quota = await recordFreeAnalysis();
    set({ freeAnalysesUsed: quota.analyses });
  },
}));
