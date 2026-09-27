import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { emptyProfile, type LearningProfile } from '../domain/profile/progress';

const storageKey = 'solvepath:v1:progress';
const storedSchema = z.object({
  recentProblemIds: z.array(z.string()),
  revealedByProblem: z.record(z.string(), z.array(z.number())),
  profile: z.object({
    topics: z.record(z.string(), z.object({ attempts: z.number(), solved: z.number(), hintsUsed: z.number(), mistakes: z.number() })),
    misconceptions: z.array(z.object({ misconceptionId: z.string(), topic: z.string(), count: z.number() })),
    solvedProblemIds: z.array(z.string()),
  }),
});

export type StoredProgress = {
  recentProblemIds: string[];
  revealedByProblem: Record<string, number[]>;
  profile: LearningProfile;
};

export const emptyProgress: StoredProgress = { recentProblemIds: [], revealedByProblem: {}, profile: emptyProfile };

export interface ProgressRepository {
  load(): Promise<StoredProgress>;
  save(progress: StoredProgress): Promise<void>;
  clear(): Promise<void>;
}

export class AsyncProgressRepository implements ProgressRepository {
  private writes: Promise<void> = Promise.resolve();

  async load(): Promise<StoredProgress> {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return emptyProgress;
    try {
      return storedSchema.parse(JSON.parse(raw));
    } catch {
      return emptyProgress;
    }
  }

  save(progress: StoredProgress): Promise<void> {
    const serialized = JSON.stringify(storedSchema.parse(progress));
    this.writes = this.writes.catch(() => undefined).then(() => AsyncStorage.setItem(storageKey, serialized));
    return this.writes;
  }

  async clear(): Promise<void> {
    await this.writes.catch(() => undefined);
    await AsyncStorage.removeItem(storageKey);
  }
}

export const progressRepository: ProgressRepository = new AsyncProgressRepository();
