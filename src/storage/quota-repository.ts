import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

const storageKey = 'solvepath:v1:free-quota';

const quotaSchema = z.object({
  day: z.string(),
  analyses: z.number().int().nonnegative(),
});

export type FreeQuota = z.infer<typeof quotaSchema>;

export const FREE_REMOTE_ANALYSES_PER_DAY = 3;

export function localDay(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function loadQuota(): Promise<FreeQuota> {
  const today = localDay();
  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) return { day: today, analyses: 0 };
  try {
    const parsed = quotaSchema.parse(JSON.parse(raw));
    return parsed.day === today ? parsed : { day: today, analyses: 0 };
  } catch {
    return { day: today, analyses: 0 };
  }
}

export async function recordFreeAnalysis(): Promise<FreeQuota> {
  const current = await loadQuota();
  const next = { ...current, analyses: current.analyses + 1 };
  await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  return next;
}
