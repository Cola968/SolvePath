import { create } from 'zustand';
import { problemById } from '../../data/problems';
import { revealNextHint } from '../../domain/hints/engine';
import { checkResult, type AnswerCheck } from '../../domain/misconceptions/check';
import type { StuckReason } from '../../domain/problem/diagnosis';
import { updateProfile } from '../../domain/profile/progress';
import {
  analyzerForMode,
  type AnalysisImage,
  type AnalysisMode,
} from '../../services/problem-analyzer';
import {
  emptyProgress,
  progressRepository,
  type StoredProgress,
} from '../../storage/progress-repository';

type SessionState = StoredProgress & {
  hydrated: boolean;
  busy: boolean;
  analysisStage: number;
  error: string | null;
  currentProblemId: string | null;
  stuckReason: StuckReason | null;
  stepIndex: number;
  examSubject: 'physics' | 'math';
  examTopics: string[];
  examDate: string;
  hydrate: () => Promise<void>;
  analyze: (text: string, image?: AnalysisImage, mode?: AnalysisMode) => Promise<boolean>;
  selectProblem: (id: string) => void;
  setStuckReason: (reason: StuckReason) => void;
  nextHint: () => void;
  setStepIndex: (index: number) => void;
  checkAnswer: (answer: string) => AnswerCheck | null;
  setExam: (subject: 'physics' | 'math', topics: string[], date: string) => void;
  resetProgress: () => Promise<void>;
};

function snapshot(state: SessionState): StoredProgress {
  return {
    recentProblemIds: state.recentProblemIds,
    remoteProblems: state.remoteProblems,
    revealedByProblem: state.revealedByProblem,
    profile: state.profile,
  };
}

export const useSession = create<SessionState>((set, get) => ({
  ...emptyProgress,
  hydrated: false,
  busy: false,
  analysisStage: 0,
  error: null,
  currentProblemId: null,
  stuckReason: null,
  stepIndex: 0,
  examSubject: 'physics',
  examTopics: [],
  examDate: '',
  hydrate: async () => {
    try {
      const progress = await progressRepository.load();
      set({ ...progress, hydrated: true });
    } catch {
      set({ hydrated: true, error: 'Lokaler Fortschritt konnte nicht geladen werden.' });
    }
  },
  analyze: async (text, image, mode = 'remote') => {
    set({ busy: true, error: null, analysisStage: 0 });
    try {
      const problem = await analyzerForMode(mode).analyze(text, image, (analysisStage) =>
        set({ analysisStage }),
      );
      const recentProblemIds = [
        problem.id,
        ...get().recentProblemIds.filter((id) => id !== problem.id),
      ].slice(0, 12);
      set({
        currentProblemId: problem.id,
        remoteProblems:
          mode === 'remote'
            ? { ...get().remoteProblems, [problem.id]: problem }
            : get().remoteProblems,
        recentProblemIds,
        busy: false,
        stuckReason: null,
        stepIndex: 0,
      });
      await progressRepository.save(snapshot(get()));
      return true;
    } catch (error) {
      set({
        busy: false,
        error: error instanceof Error ? error.message : 'Analyse fehlgeschlagen.',
      });
      return false;
    }
  },
  selectProblem: (id) => {
    if (problemById(id) || get().remoteProblems[id])
      set({ currentProblemId: id, stuckReason: null, stepIndex: 0, error: null });
  },
  setStuckReason: (reason) => set({ stuckReason: reason }),
  nextHint: () => {
    const id = get().currentProblemId;
    const problem = id ? (get().remoteProblems[id] ?? problemById(id)) : undefined;
    if (!id || !problem) return;
    const revealed = revealNextHint(problem, { revealedLevels: get().revealedByProblem[id] ?? [] });
    set({
      revealedByProblem: { ...get().revealedByProblem, [id]: revealed.revealedLevels },
      error: null,
    });
    void progressRepository
      .save(snapshot(get()))
      .catch(() => set({ error: 'Hinweise konnten nicht gespeichert werden.' }));
  },
  setStepIndex: (index) => set({ stepIndex: index }),
  checkAnswer: (answer) => {
    const id = get().currentProblemId;
    const problem = id ? (get().remoteProblems[id] ?? problemById(id)) : undefined;
    if (!problem) return null;
    const result = checkResult(problem, answer);
    if (answer.trim()) {
      const profile = updateProfile(get().profile, {
        problemId: problem.id,
        topic: problem.topic,
        subject: problem.subject,
        correct: result.status === 'correct',
        hintsUsed: get().revealedByProblem[problem.id]?.length ?? 0,
        misconceptionId: result.status === 'misconception' ? result.mistake.id : undefined,
      });
      set({ profile, error: null });
      void progressRepository
        .save(snapshot(get()))
        .catch(() => set({ error: 'Lernfortschritt konnte nicht gespeichert werden.' }));
    }
    return result;
  },
  setExam: (subject, topics, date) =>
    set({ examSubject: subject, examTopics: topics, examDate: date }),
  resetProgress: async () => {
    await progressRepository.clear();
    set({ ...emptyProgress, currentProblemId: null, stepIndex: 0, stuckReason: null });
  },
}));
