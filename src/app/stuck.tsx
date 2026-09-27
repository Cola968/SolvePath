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
  Pill,
  ProgressBar,
  SectionTitle,
} from '../components/ui';
import { diagnosticPrompts, stuckReasons, type StuckReason } from '../domain/problem/diagnosis';
import { useProblem } from '../features/problems/use-problem';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

const reasonSymbols: Record<StuckReason, string> = {
  start: '01',
  understand: '02',
  formula: '03',
  rearrange: '04',
  calculate: '05',
  check: '06',
};

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
      title="Wo stockt dein Weg?"
      subtitle="Wähle nicht das Thema, sondern exakt die Stelle, an der du gerade nicht weiterkommst."
      eyebrow="02 · Diagnose"
    >
      <PathRail
        current={1}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Lernprofil']}
      />

      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="lead">{problem.title}</AppText>
            <AppText muted>{problem.originalText}</AppText>
          </View>
          <Pill
            label={problem.subject === 'physics' ? 'PHYSIK' : 'MATHE'}
            tone={problem.subject === 'physics' ? 'primary' : 'accent'}
          />
        </View>
      </Card>

      <View style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <SectionTitle>Markiere deinen Engpass</SectionTitle>
          <AppText muted>
            SolvePath passt die Hilfe daran an. Du kannst die Auswahl jederzeit ändern.
          </AppText>
        </View>
        {stuckReasons.map((item) => (
          <Choice
            key={item.id}
            prefix={reasonSymbols[item.id]}
            label={item.label}
            selected={reason === item.id}
            onPress={() => chooseReason(item.id)}
          />
        ))}
      </View>

      {reason && !prompt ? (
        <Feedback
          title="Engpass gespeichert"
          message="Für diesen Pfad ist keine zusätzliche Diagnosefrage nötig. Du kannst direkt in die Analyse wechseln."
          kind="success"
        />
      ) : null}

      {prompt ? (
        <Card elevated>
          <View style={{ gap: spacing.sm }}>
            <Pill label="MINI-DIAGNOSE" tone="accent" />
            <ProgressBar
              value={Math.round(((promptIndex + 1) / prompts.length) * 100)}
              label={`Denkfrage ${promptIndex + 1} von ${prompts.length}`}
            />
          </View>

          <AppText variant="lead">{prompt.question}</AppText>

          <View style={{ gap: spacing.sm }}>
            {prompt.options.map((option, index) => (
              <Choice
                key={option}
                prefix={String.fromCharCode(65 + index)}
                label={option}
                selected={selected === option}
                onPress={() => setSelected(option)}
              />
            ))}
          </View>

          {selected ? (
            <Feedback
              title={correct ? 'Genau hier setzen wir an' : 'Noch nicht passend'}
              message={
                correct
                  ? prompt.feedback
                  : 'Prüfe, welche Antwort direkt zur Frage passt. SolvePath zeigt die Formel noch bewusst nicht.'
              }
              kind={correct ? 'success' : 'error'}
            />
          ) : null}

          {correct && promptIndex < prompts.length - 1 ? (
            <AppButton
              label="Nächste Denkfrage →"
              onPress={() => {
                setPromptIndex(promptIndex + 1);
                setSelected(null);
              }}
            />
          ) : null}

          {correct && promptIndex === prompts.length - 1 ? (
            <AppButton
              label={reason === 'check' ? 'Ergebnis prüfen →' : 'Lösungsweg aufbauen →'}
              onPress={() => router.push(reason === 'check' ? '/result' : '/analysis')}
            />
          ) : null}
        </Card>
      ) : reason ? (
        <AppButton
          label={reason === 'check' ? 'Ergebnis prüfen →' : 'Analyse starten →'}
          onPress={() => router.push(reason === 'check' ? '/result' : '/analysis')}
        />
      ) : null}
    </Page>
  );
}
