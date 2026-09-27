import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  Card,
  Feedback,
  Page,
  PathRail,
  SectionTitle,
} from '../components/ui';
import { getNextHint, visibleHints } from '../domain/hints/engine';
import type { AnswerCheck } from '../domain/misconceptions/check';
import { useProblem } from '../features/problems/use-problem';
import { useSession } from '../features/session/store';
import { spacing, useTheme } from '../theme/tokens';

export default function ResultScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const problem = useProblem();
  const checkAnswer = useSession((state) => state.checkAnswer);
  const nextHint = useSession((state) => state.nextHint);
  const revealedByProblem = useSession((state) => state.revealedByProblem);
  const error = useSession((state) => state.error);
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
  const lastHint = shownHints[shownHints.length - 1];

  return (
    <Page
      title="Ergebnis prüfen"
      subtitle="Gib dein Ergebnis ein. SolvePath prüft nicht nur den Wert, sondern auch typische Fehler."
      eyebrow="Schritt 5"
    >
      <PathRail
        current={4}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Profil']}
      />

      {error ? <Feedback title="Speichern fehlgeschlagen" message={error} kind="error" /> : null}

      <Card>
        <AppText variant="caption" muted>
          GESUCHT
        </AppText>
        <AppText variant="lead">{problem.unknowns.map((item) => item.symbol).join(', ')}</AppText>

        <AppInput
          accessibilityLabel="Eigenes Ergebnis"
          placeholder="z. B. 7,67 km/s"
          value={answer}
          onChangeText={(value) => {
            setAnswer(value);
            setResult(null);
          }}
        />

        <AppButton
          label="Prüfen"
          disabled={!answer.trim()}
          onPress={() => setResult(checkAnswer(answer))}
        />
      </Card>

      {result?.status === 'correct' ? (
        <View style={{ gap: spacing.md }}>
          <Feedback title="Richtig" message={problem.correctResult.explanation} kind="success" />
          <Card style={{ backgroundColor: colors.successSoft }}>
            <AppText variant="caption" style={{ color: colors.success, fontWeight: '700' }}>
              ERGEBNIS
            </AppText>
            <AppText variant="title">{problem.correctResult.display}</AppText>
          </Card>
          <AppButton label="Zum Lernprofil" onPress={() => router.push('/profile')} />
        </View>
      ) : null}

      {result?.status === 'misconception' ? (
        <View style={{ gap: spacing.md }}>
          <Feedback title={result.mistake.label} message={result.message} kind="error" />
          <Card>
            <SectionTitle>So korrigierst du es</SectionTitle>
            <AppText>{result.mistake.correction}</AppText>
          </Card>
          <AppButton
            label="An der Stelle weiterlernen"
            variant="secondary"
            onPress={() => router.push('/guide')}
          />
        </View>
      ) : null}

      {result && result.status !== 'correct' && result.status !== 'misconception' ? (
        <View style={{ gap: spacing.md }}>
          <Feedback title="Noch nicht ganz" message={result.message} kind="error" />
          <AppButton
            label="Lösungsweg öffnen"
            variant="secondary"
            onPress={() => router.push('/guide')}
          />
        </View>
      ) : null}

      {result?.status !== 'correct' ? (
        <View style={{ gap: spacing.md }}>
          <SectionTitle>Hinweis</SectionTitle>
          {lastHint ? (
            <Card style={{ backgroundColor: colors.primarySoft }}>
              <AppText>{lastHint.text}</AppText>
              <AppText variant="caption" muted>
                {shownHints.length} von 6 Hinweisen geöffnet
              </AppText>
            </Card>
          ) : (
            <AppText muted>
              Öffne einen Hinweis, wenn du deinen Fehler nicht selbst findest.
            </AppText>
          )}
          <AppButton
            label={
              getNextHint(problem, hintState) ? 'Einen Hinweis öffnen' : 'Alle Hinweise geöffnet'
            }
            variant="secondary"
            disabled={!getNextHint(problem, hintState)}
            onPress={nextHint}
          />
        </View>
      ) : null}

      <AppButton label="Neue Aufgabe" variant="ghost" onPress={() => router.replace('/input')} />
    </Page>
  );
}
