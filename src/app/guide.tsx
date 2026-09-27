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
  PathRail,
  ProgressBar,
  SectionTitle,
} from '../components/ui';
import { getNextHint, visibleHints } from '../domain/hints/engine';
import { checkStepAnswer } from '../domain/misconceptions/check';
import { useProblem } from '../features/problems/use-problem';
import { useSession } from '../features/session/store';
import { spacing, useTheme } from '../theme/tokens';

export default function GuideScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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
  const currentHint = shownHints[shownHints.length - 1];

  function move(index: number) {
    setStepIndex(index);
    setAnswer('');
    setChecked(null);
  }

  return (
    <Page
      title={step.title}
      subtitle="Löse immer nur den aktuellen Schritt."
      eyebrow={`Schritt 4 · Teil ${stepIndex + 1}/${problem.reasoningSteps.length}`}
    >
      <PathRail
        current={3}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Profil']}
      />

      <ProgressBar
        value={Math.round(((stepIndex + 1) / problem.reasoningSteps.length) * 100)}
        label={`Lösungsschritt ${stepIndex + 1} von ${problem.reasoningSteps.length}`}
      />

      {error ? <Feedback title="Speichern fehlgeschlagen" message={error} kind="error" /> : null}

      <Card>
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
      </Card>

      {checked === 'correct' ? (
        <Feedback title="Richtig" message={step.explanation} kind="success" />
      ) : checked === 'retry' ? (
        <Feedback
          title="Noch nicht"
          message="Prüfe Bedeutung, Vorzeichen und Einheit. Wenn du festhängst, öffne einen Hinweis."
          kind="error"
        />
      ) : null}

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Hinweis</SectionTitle>
        {currentHint ? (
          <Card style={{ backgroundColor: colors.primarySoft }}>
            <AppText>{currentHint.text}</AppText>
            <AppText variant="caption" muted>
              {shownHints.length} von 6 Hinweisen geöffnet
            </AppText>
          </Card>
        ) : (
          <AppText muted>Versuche den Schritt zuerst selbst.</AppText>
        )}

        <AppButton
          label={canReveal ? 'Einen Hinweis öffnen' : 'Alle Hinweise geöffnet'}
          variant="secondary"
          disabled={!canReveal}
          onPress={nextHint}
        />
      </View>

      {shownHints.length >= 3 ? (
        <View style={{ gap: spacing.md }}>
          <SectionTitle>Formeln</SectionTitle>
          <Card>
            {problem.formulas.map((formula, index) => (
              <View
                key={formula.id}
                style={{
                  paddingBottom: index === problem.formulas.length - 1 ? 0 : spacing.md,
                  marginBottom: index === problem.formulas.length - 1 ? 0 : spacing.md,
                  borderBottomWidth: index === problem.formulas.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                  gap: spacing.xs,
                }}
              >
                <AppText variant="lead">{formula.expression}</AppText>
                <AppText variant="caption" muted>
                  {formula.explanation}
                </AppText>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppButton
            label="Zurück"
            variant="secondary"
            disabled={stepIndex === 0}
            onPress={() => move(stepIndex - 1)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton
            label="Weiter"
            disabled={stepIndex === problem.reasoningSteps.length - 1 || checked !== 'correct'}
            onPress={() => move(stepIndex + 1)}
          />
        </View>
      </View>

      {stepIndex === problem.reasoningSteps.length - 1 && checked === 'correct' ? (
        <AppButton label="Ergebnis prüfen" onPress={() => router.push('/result')} />
      ) : null}
    </Page>
  );
}
