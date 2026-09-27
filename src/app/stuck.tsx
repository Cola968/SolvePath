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
      title="Wo genau hängst du?"
      subtitle="Eine kurze Diagnose hilft uns, den kleinsten nützlichen Hinweis zu finden."
      eyebrow="02 · Diagnose"
    >
      <Card>
        <AppText variant="lead">{problem.title}</AppText>
        <AppText muted>{problem.originalText}</AppText>
      </Card>
      <View style={{ gap: spacing.sm }}>
        <SectionTitle>Wähle die Stelle, an der es stockt</SectionTitle>
        {stuckReasons.map((item) => (
          <Choice
            key={item.id}
            label={item.label}
            selected={reason === item.id}
            onPress={() => chooseReason(item.id)}
          />
        ))}
      </View>
      {prompt ? (
        <Card>
          <ProgressBar
            value={((promptIndex + 1) / prompts.length) * 100}
            label={`Denkfrage ${promptIndex + 1} von ${prompts.length}`}
          />
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
              title={correct ? 'Guter Ansatz' : 'Denk noch einmal nach'}
              message={
                correct
                  ? prompt.feedback
                  : 'Prüfe, welche Antwort direkt zur Frage passt. Du kannst erneut wählen.'
              }
              kind={correct ? 'success' : 'error'}
            />
          ) : null}
          {correct && promptIndex < prompts.length - 1 ? (
            <AppButton
              label="Nächste Denkfrage"
              onPress={() => {
                setPromptIndex(promptIndex + 1);
                setSelected(null);
              }}
            />
          ) : null}
          {correct && promptIndex === prompts.length - 1 ? (
            <AppButton
              label={reason === 'check' ? 'Ergebnis prüfen' : 'Zum Lösungsweg'}
              onPress={() => router.push(reason === 'check' ? '/result' : '/analysis')}
            />
          ) : null}
        </Card>
      ) : null}
    </Page>
  );
}
