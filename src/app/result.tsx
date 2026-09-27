import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppInput, AppText, Card, Feedback, Page, SectionTitle } from '../components/ui';
import { getNextHint, visibleHints } from '../domain/hints/engine';
import type { AnswerCheck } from '../domain/misconceptions/check';
import { useProblem } from '../features/problems/use-problem';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function ResultScreen() {
  const router = useRouter();
  const problem = useProblem();
  const checkAnswer = useSession((state) => state.checkAnswer);
  const nextHint = useSession((state) => state.nextHint);
  const revealedByProblem = useSession((state) => state.revealedByProblem);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<AnswerCheck | null>(null);
  if (!problem)
    return (
      <Page title="Keine Aufgabe gewählt">
        <AppButton label="Aufgabe wählen" onPress={() => router.replace('/input')} />
      </Page>
    );
  const hintState = { revealedLevels: revealedByProblem[problem.id] ?? [] };
  const shownHints = visibleHints(problem, hintState);
  return (
    <Page
      title="Ergebnis prüfen"
      subtitle="Gib zuerst dein eigenes Ergebnis ein. SolvePath prüft dann den Ansatz und typische Denkfehler."
      eyebrow="05 · Prüfen"
    >
      <Card>
        <SectionTitle>
          {problem.unknowns.map((item) => item.symbol).join(', ')} gesucht
        </SectionTitle>
        <AppInput
          accessibilityLabel="Eigenes Ergebnis"
          placeholder="Dein Ergebnis mit Einheit"
          value={answer}
          onChangeText={(value) => {
            setAnswer(value);
            setResult(null);
          }}
        />
        <AppButton
          label="Ergebnis prüfen"
          disabled={!answer.trim()}
          onPress={() => setResult(checkAnswer(answer))}
        />
      </Card>
      {result ? (
        <Card>
          <Feedback
            title={
              result.status === 'correct'
                ? 'Richtig gelöst'
                : result.status === 'misconception'
                  ? 'Denkfehler erkannt'
                  : 'Noch nicht ganz'
            }
            message={result.message}
            kind={result.status === 'correct' ? 'success' : 'error'}
          />
          {result.status === 'misconception' ? (
            <View style={{ gap: spacing.sm }}>
              <AppText variant="lead">{result.mistake.label}</AppText>
              <AppText>{result.mistake.correction}</AppText>
            </View>
          ) : null}
          {result.status === 'correct' ? (
            <>
              <AppText variant="lead">{problem.correctResult.display}</AppText>
              <AppButton label="Lernprofil ansehen" onPress={() => router.push('/profile')} />
            </>
          ) : (
            <AppButton
              label="Lösungsweg erneut ansehen"
              variant="secondary"
              onPress={() => router.push('/guide')}
            />
          )}
        </Card>
      ) : null}
      {result?.status !== 'correct' ? (
        <Card>
          <SectionTitle>Brauchst du einen kleinen Hinweis?</SectionTitle>
          {shownHints.length ? (
            <AppText>{shownHints[shownHints.length - 1]?.text}</AppText>
          ) : (
            <AppText muted>Du kannst erst selbst prüfen und dann einen Hinweis anfordern.</AppText>
          )}
          <AppButton
            label={getNextHint(problem, hintState) ? 'Nächsten Hinweis' : 'Alle Hinweise gezeigt'}
            variant="secondary"
            disabled={!getNextHint(problem, hintState)}
            onPress={nextHint}
          />
        </Card>
      ) : null}
    </Page>
  );
}
