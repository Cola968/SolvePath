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
  Pill,
  ProgressBar,
  SectionTitle,
} from '../components/ui';
import { getNextHint, visibleHints } from '../domain/hints/engine';
import { checkStepAnswer } from '../domain/misconceptions/check';
import { useProblem } from '../features/problems/use-problem';
import { useSession } from '../features/session/store';
import { radius, spacing, useTheme } from '../theme/tokens';

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
      title="Ein Schritt. Dann du."
      subtitle="SolvePath zeigt nie mehr Hilfe als nötig. Löse jeden Schritt selbst, bevor du weitergehst."
      eyebrow="04 · Lösen"
    >
      <PathRail
        current={3}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Lernprofil']}
      />

      <ProgressBar
        value={Math.round(((stepIndex + 1) / problem.reasoningSteps.length) * 100)}
        label={`Schritt ${stepIndex + 1} von ${problem.reasoningSteps.length}`}
      />

      {error ? <Feedback title="Speichern fehlgeschlagen" message={error} kind="error" /> : null}

      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Pill label={`SCHRITT ${stepIndex + 1}`} tone="accent" />
            <SectionTitle>{step.title}</SectionTitle>
          </View>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primarySoft,
            }}
          >
            <AppText variant="lead" style={{ color: colors.primary, fontWeight: '800' }}>
              {stepIndex + 1}
            </AppText>
          </View>
        </View>

        <AppText variant="lead">{step.question}</AppText>

        {step.choices ? (
          <View style={{ gap: spacing.sm }}>
            {step.choices.map((choice, index) => (
              <Choice
                key={choice}
                prefix={String.fromCharCode(65 + index)}
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
          <Feedback title="Passt." message={step.explanation} kind="success" />
        ) : checked === 'retry' ? (
          <Feedback
            title="Hier ist noch ein Denkfehler"
            message="Prüfe Größe, Bedeutung und Einheit. Wenn du festhängst, öffne genau einen Hinweis."
            kind="error"
          />
        ) : null}
      </Card>

      <Card
        style={{
          backgroundColor: currentHint ? colors.accentSoft : colors.surface,
          borderColor: currentHint ? colors.accentSoft : colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SectionTitle>Hint Ladder</SectionTitle>
            <AppText muted>
              {shownHints.length === 0
                ? 'Noch kein Hinweis benutzt.'
                : `${shownHints.length} von 6 Hilfestufen geöffnet.`}
            </AppText>
          </View>
          <Pill
            label={shownHints.length ? `LEVEL ${shownHints.length}` : '0 / 6'}
            tone={shownHints.length >= 4 ? 'warning' : 'accent'}
          />
        </View>

        {currentHint ? (
          <View
            style={{
              padding: spacing.lg,
              borderRadius: radius.md,
              backgroundColor: colors.surface,
              gap: spacing.xs,
            }}
          >
            <AppText variant="caption" style={{ color: colors.accent, fontWeight: '800' }}>
              KLEINSTER NÄCHSTER HINWEIS
            </AppText>
            <AppText>{currentHint.text}</AppText>
          </View>
        ) : (
          <AppText muted>
            Versuche den Schritt zuerst selbst. Ein Hint wird erst sichtbar, wenn du ihn anforderst.
          </AppText>
        )}

        <AppButton
          label={canReveal ? 'Genau einen Hinweis öffnen' : 'Alle Hinweise geöffnet'}
          variant="secondary"
          disabled={!canReveal}
          onPress={nextHint}
        />
      </Card>

      {shownHints.length >= 3 ? (
        <Card>
          <SectionTitle>Formelanker</SectionTitle>
          <AppText muted>
            Du hast mehrere Hinweise genutzt. Deshalb zeigt SolvePath jetzt die relevanten Formeln.
          </AppText>
          {problem.formulas.map((formula) => (
            <View
              key={formula.id}
              style={{
                padding: spacing.lg,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceAlt,
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
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppButton
            label="← Zurück"
            variant="ghost"
            disabled={stepIndex === 0}
            onPress={() => move(stepIndex - 1)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton
            label="Weiter →"
            variant="secondary"
            disabled={stepIndex === problem.reasoningSteps.length - 1 || checked !== 'correct'}
            onPress={() => move(stepIndex + 1)}
          />
        </View>
      </View>

      {stepIndex === problem.reasoningSteps.length - 1 && checked === 'correct' ? (
        <AppButton label="Mein Ergebnis prüfen →" onPress={() => router.push('/result')} />
      ) : null}
    </Page>
  );
}
