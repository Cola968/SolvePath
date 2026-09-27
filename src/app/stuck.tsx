import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  AppButton,
  AppText,
  Card,
  Choice,
  Feedback,
  Page,
  PathRail,
  ProgressBar,
  SectionTitle,
} from '../components/ui';
import { diagnosticPrompts, stuckReasons, type StuckReason } from '../domain/problem/diagnosis';
import { useProblem } from '../features/problems/use-problem';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function StuckScreen() {
  const router = useRouter();
  const problem = useProblem();
  const reason = useSession((state) => state.stuckReason);
  const setReason = useSession((state) => state.setStuckReason);
  const [promptIndex, setPromptIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  if (!problem)
    return (
      <Page title="Keine Aufgabe gewählt">
        <AppButton label="Aufgabe wählen" onPress={() => router.replace('/input')} />
      </Page>
    );

  const prompts = reason ? diagnosticPrompts(problem, reason) : [];
  const prompt = prompts[promptIndex];
  const correct = selected === prompt?.correctOption;

  function chooseReason(id: StuckReason) {
    setReason(id);
    setPromptIndex(0);
    setSelected(null);
  }

  return (
    <Page
      title="Wo hängst du?"
      subtitle="Wähle die Stelle, an der du gerade nicht weiterkommst."
      eyebrow="Schritt 2"
    >
      <PathRail
        current={1}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Profil']}
      />

      <Card>
        <AppText variant="caption" muted>
          DEINE AUFGABE
        </AppText>
        <AppText variant="lead">{problem.title}</AppText>
        <AppText muted>{problem.originalText}</AppText>
      </Card>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Was ist gerade das Problem?</SectionTitle>
        <View style={{ gap: spacing.sm }}>
          {stuckReasons.map((item) => (
            <Choice
              key={item.id}
              label={item.label}
              selected={reason === item.id}
              onPress={() => chooseReason(item.id)}
            />
          ))}
        </View>
      </View>

      {reason && !prompt ? (
        <Feedback
          title="Verstanden"
          message="Für diesen Engpass ist keine weitere Diagnose nötig."
          kind="success"
        />
      ) : null}

      {prompt ? (
        <View style={{ gap: spacing.md }}>
          <ProgressBar
            value={Math.round(((promptIndex + 1) / prompts.length) * 100)}
            label={`Kurze Rückfrage ${promptIndex + 1} von ${prompts.length}`}
          />

          <Card>
            <AppText variant="lead">{prompt.question}</AppText>
            <View style={{ gap: spacing.sm }}>
              {prompt.options.map((option) => (
                <Choice
                  key={option}
                  label={option}
                  selected={selected === option}
                  onPress={() => setSelected(option)}
                />
              ))}
            </View>

            {selected ? (
              <Feedback
                title={correct ? 'Passt' : 'Noch nicht'}
                message={
                  correct
                    ? prompt.feedback
                    : 'Prüfe noch einmal, welche Antwort direkt zur Frage passt.'
                }
                kind={correct ? 'success' : 'error'}
              />
            ) : null}
          </Card>

          {correct && promptIndex < prompts.length - 1 ? (
            <AppButton
              label="Nächste Frage"
              onPress={() => {
                setPromptIndex(promptIndex + 1);
                setSelected(null);
              }}
            />
          ) : null}

          {correct && promptIndex === prompts.length - 1 ? (
            <AppButton
              label={reason === 'check' ? 'Ergebnis prüfen' : 'Methode wählen'}
              onPress={() => router.push(reason === 'check' ? '/result' : '/analysis')}
            />
          ) : null}
        </View>
      ) : reason ? (
        <AppButton
          label={reason === 'check' ? 'Ergebnis prüfen' : 'Weiter zur Methode'}
          onPress={() => router.push(reason === 'check' ? '/result' : '/analysis')}
        />
      ) : null}
    </Page>
  );
}
