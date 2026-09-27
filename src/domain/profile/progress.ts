import type { Subject } from '../problem/schema';

export type TopicProgress = { attempts: number; solved: number; hintsUsed: number; mistakes: number };
export type MistakeCount = { misconceptionId: string; topic: string; count: number };
export type LearningProfile = {
  topics: Record<string, TopicProgress>;
  misconceptions: MistakeCount[];
  solvedProblemIds: string[];
};

export const emptyProfile: LearningProfile = { topics: {}, misconceptions: [], solvedProblemIds: [] };

export function updateProfile(
  profile: LearningProfile,
  event: { problemId: string; topic: string; subject: Subject; correct: boolean; hintsUsed: number; misconceptionId?: string },
): LearningProfile {
  const key = `${event.subject}:${event.topic}`;
  const previous = profile.topics[key] ?? { attempts: 0, solved: 0, hintsUsed: 0, mistakes: 0 };
  const topics = {
    ...profile.topics,
    [key]: {
      attempts: previous.attempts + 1,
      solved: previous.solved + (event.correct ? 1 : 0),
      hintsUsed: previous.hintsUsed + event.hintsUsed,
      mistakes: previous.mistakes + (event.misconceptionId ? 1 : 0),
    },
  };
  const misconceptions = [...profile.misconceptions];
  if (event.misconceptionId) {
    const index = misconceptions.findIndex((item) => item.misconceptionId === event.misconceptionId);
    if (index >= 0 && misconceptions[index]) {
      misconceptions[index] = { ...misconceptions[index], count: misconceptions[index].count + 1 };
    } else {
      misconceptions.push({ misconceptionId: event.misconceptionId, topic: event.topic, count: 1 });
    }
  }
  return {
    topics,
    misconceptions,
    solvedProblemIds: event.correct && !profile.solvedProblemIds.includes(event.problemId)
      ? [...profile.solvedProblemIds, event.problemId]
      : profile.solvedProblemIds,
  };
}

export function topicScore(progress: TopicProgress): number {
  if (!progress.attempts) return 0;
  const accuracy = progress.solved / progress.attempts;
  const hintPenalty = Math.min(progress.hintsUsed / progress.attempts, 6) / 12;
  return Math.max(0, Math.round((accuracy - hintPenalty) * 100));
}

export function topRisks(profile: LearningProfile, limit = 3): MistakeCount[] {
  return [...profile.misconceptions].sort((a, b) => b.count - a.count).slice(0, limit);
}
