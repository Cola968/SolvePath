import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  Card,
  Choice,
  Feedback,
  Page,
  ProgressBar,
  SectionTitle,
} from '../components/ui';
import { getNextHint, visibleHints } from '../domain/hints/engine';
import { checkStepAnswer } from '../domain/misconceptions/check';
import { useProblem } from '../features/problems/use-problem';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function GuideScreen() {
  const router = useRouter();
  const problem = useProblem();
  const stepIndex = useSession((state) => state.stepIndex);
  const setStepIndex = useSession((state) => state.setStepIndex);
  const revealedByProblem = useSession((state) => state.revealedByProblem);
  const nextHint = useSession((state) => state.nextHint);
  const error = useSession((state) => state.error);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState<'correct' | 'retry' | null>(null);
  if (!problem)
    return (
      <Page title="Keine Aufgabe gewählt">
        <AppButton label="Aufgabe wählen" onPress={() => router.replace('/input')} />
      </Page>
    );
  const step = problem.reasoningSteps[stepIndex] ?? problem.reasoningSteps[0]!;
  const hintState = { revealedLevels: revealedByProblem[problem.id] ?? [] };
  const shownHints = visibleHints(problem, hintState);
  const canReveal = getNextHint(problem, hintState) !== null;
  function move(index: number) {
    setStepIndex(index);
    setAnswer('');
    setChecked(null);
  }
  return (
    <Page
      title="Dein Lösungsweg"
      subtitle="Ein Schritt nach dem anderen. Antworte selbst oder fordere genau einen Hinweis an."
      eyebrow="04 · Lösungsweg"
    >
      <ProgressBar
        value={((stepIndex + 1) / problem.reasoningSteps.length) * 100}
        label={`Schritt ${stepIndex + 1} von ${problem.reasoningSteps.length}`}
      />
      {error ? <Feedback title="Speichern fehlgeschlagen" message={error} kind="error" /> : null}
      <Card>
        <SectionTitle>{step.title}</SectionTitle>
        <AppText variant="lead">{step.question}</AppText>
        {step.choices ? (
          <View style={{ gap: spacing.sm }}>
            {step.choices.map((choice) => (
              <Choice
                key={choice}
                label={choice}
                selected={answer === choice}
                onPress={() => {
                  setAnswer(choice);
                  setChecked(null);
                }}
              />
            ))}
          </View>
        ) : (
          <AppInput
            accessibilityLabel="Deine Antwort"
            placeholder="Deine Antwort"
            value={answer}
            onChangeText={(value) => {
              setAnswer(value);
              setChecked(null);
            }}
          />
        )}
        <AppButton
          label="Antwort prüfen"
          onPress={() => setChecked(checkStepAnswer(step.answer, answer) ? 'correct' : 'retry')}
          disabled={!answer.trim()}
        />
        {checked === 'correct' ? (
          <Feedback title="Das stimmt" message={step.explanation} kind="success" />
        ) : checked === 'retry' ? (
          <Feedback
            title="Versuch es noch einmal"
            message="Prüfe die Größe und ihre Bedeutung. Ein kleiner Hinweis kann helfen."
            kind="error"
          />
        ) : null}
      </Card>
      <Card>
        <SectionTitle>Hint Ladder</SectionTitle>
        <AppText muted>Jeder Klick zeigt nur die nächste Hilfestufe.</AppText>
        {shownHints.length === 0 ? (
          <AppText muted>Du hast noch keinen Hinweis verwendet.</AppText>
        ) : (
          shownHints.map((hint) => (
            <View key={hint.level} style={{ gap: spacing.xs }}>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Hinweis {hint.level}
              </AppText>
              <AppText>{hint.text}</AppText>
            </View>
          ))
        )}
        <AppButton
          label={canReveal ? 'Nächsten Hinweis zeigen' : 'Alle Hinweise gezeigt'}
          variant="secondary"
          disabled={!canReveal}
          onPress={nextHint}
        />
      </Card>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppButton
            label="Vorheriger Schritt"
            variant="ghost"
            disabled={stepIndex === 0}
            onPress={() => move(stepIndex - 1)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton
            label="Nächster Schritt"
            variant="secondary"
            disabled={stepIndex === problem.reasoningSteps.length - 1}
            onPress={() => move(stepIndex + 1)}
          />
        </View>
      </View>
      <AppButton label="Eigenes Ergebnis prüfen" onPress={() => router.push('/result')} />
    </Page>
  );
}
