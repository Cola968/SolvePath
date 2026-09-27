import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  Card,
  Feedback,
  HeroCard,
  Page,
  PathRail,
  Pill,
  SectionTitle,
} from '../components/ui';
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
      title="Prüfe deinen Weg."
      subtitle="Nicht nur richtig oder falsch: SolvePath versucht zu erkennen, welche Entscheidung hinter einem Fehler steckt."
      eyebrow="05 · Prüfen"
    >
      <PathRail
        current={4}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Lernprofil']}
      />

      {error ? <Feedback title="Speichern fehlgeschlagen" message={error} kind="error" /> : null}

      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Pill label="DEIN ERGEBNIS" tone="accent" />
            <SectionTitle>
              {problem.unknowns.map((item) => item.symbol).join(', ')} gesucht
            </SectionTitle>
          </View>
        </View>

        <AppInput
          accessibilityLabel="Eigenes Ergebnis"
          placeholder="Ergebnis mit Einheit, z. B. 7,67 km/s"
          value={answer}
          onChangeText={(value) => {
            setAnswer(value);
            setResult(null);
          }}
        />

        <AppButton
          label="Ergebnis diagnostizieren"
          disabled={!answer.trim()}
          onPress={() => setResult(checkAnswer(answer))}
        />
      </Card>

      {result?.status === 'correct' ? (
        <HeroCard
          kicker="Pfad abgeschlossen"
          title="Richtig – und der Lösungsweg zählt."
          body={problem.correctResult.explanation}
        >
          <AppText variant="title" style={{ color: '#FFFFFF' }}>
            {problem.correctResult.display}
          </AppText>
          <AppButton label="Lernprofil aktualisieren →" onPress={() => router.push('/profile')} />
        </HeroCard>
      ) : null}

      {result?.status === 'misconception' ? (
        <Card elevated>
          <Pill label="DENKFEHLER ERKANNT" tone="warning" />
          <AppText variant="title">{result.mistake.label}</AppText>
          <AppText>{result.message}</AppText>
          <Feedback title="Korrektur" message={result.mistake.correction} kind="error" />
          <AppText muted>
            Dieser Fehlertyp wird lokal deinem Lernprofil hinzugefügt, damit der Exam Mode ihn
            später gezielt trainieren kann.
          </AppText>
          <AppButton
            label="An dieser Stelle weiterlernen →"
            variant="secondary"
            onPress={() => router.push('/guide')}
          />
        </Card>
      ) : null}

      {result && result.status !== 'correct' && result.status !== 'misconception' ? (
        <Card>
          <Feedback title="Noch nicht ganz" message={result.message} kind="error" />
          <AppButton
            label="Lösungsweg wieder öffnen"
            variant="secondary"
            onPress={() => router.push('/guide')}
          />
        </Card>
      ) : null}

      {result?.status !== 'correct' ? (
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
            <SectionTitle>Kleiner Hinweis</SectionTitle>
            <Pill label={`${shownHints.length} / 6`} tone="accent" />
          </View>
          {lastHint ? (
            <AppText>{lastHint.text}</AppText>
          ) : (
            <AppText muted>
              Du kannst erst selbst prüfen und dann genau eine weitere Hilfestufe öffnen.
            </AppText>
          )}
          <AppButton
            label={
              getNextHint(problem, hintState) ? 'Nächsten Hinweis öffnen' : 'Alle Hinweise offen'
            }
            variant="secondary"
            disabled={!getNextHint(problem, hintState)}
            onPress={nextHint}
          />
        </Card>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <AppButton label="Neue Aufgabe" variant="ghost" onPress={() => router.replace('/input')} />
      </View>
    </Page>
  );
}
