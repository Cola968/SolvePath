import { problemById } from '../../data/problems';
import { useSession } from '../session/store';

export function useProblem() {
  return useSession((state) => {
    const id = state.currentProblemId;
    return id ? (state.remoteProblems[id] ?? problemById(id)) : undefined;
  });
}
