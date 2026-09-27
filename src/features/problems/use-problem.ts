import { problemById } from '../../data/problems';
import { useSession } from '../session/store';

export function useProblem() {
  const id = useSession((state) => state.currentProblemId);
  return id ? problemById(id) : undefined;
}
