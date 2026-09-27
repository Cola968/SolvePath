import { describe, expect, it } from 'vitest';
import { emptyProfile, topicScore, topRisks, updateProfile } from './progress';

describe('learning profile', () => {
  it('aggregates attempts, hints and coded misconceptions', () => {
    const first = updateProfile(emptyProfile, { problemId: 'satellite-orbit', topic: 'Gravitation', subject: 'physics', correct: false, hintsUsed: 2, misconceptionId: 'radius_vs_height' });
    const second = updateProfile(first, { problemId: 'satellite-orbit', topic: 'Gravitation', subject: 'physics', correct: true, hintsUsed: 3 });
    expect(second.topics['physics:Gravitation']).toEqual({ attempts: 2, solved: 1, hintsUsed: 5, mistakes: 1 });
    expect(second.misconceptions).toEqual([{ misconceptionId: 'radius_vs_height', topic: 'Gravitation', count: 1 }]);
    expect(second.solvedProblemIds).toEqual(['satellite-orbit']);
    expect(topRisks(second)[0]?.misconceptionId).toBe('radius_vs_height');
  });

  it('keeps the score within 0–100', () => {
    expect(topicScore({ attempts: 0, solved: 0, hintsUsed: 0, mistakes: 0 })).toBe(0);
    expect(topicScore({ attempts: 2, solved: 2, hintsUsed: 0, mistakes: 0 })).toBe(100);
    expect(topicScore({ attempts: 1, solved: 0, hintsUsed: 6, mistakes: 1 })).toBe(0);
  });
});
