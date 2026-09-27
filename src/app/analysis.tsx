import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppText, Card, Choice, Feedback, Page, SectionTitle } from '../components/ui';
import { useProblem } from '../features/problems/use-problem';
import { spacing } from '../theme/tokens';

export default function AnalysisScreen() {
  const router = useRouter();
  const problem = useProblem();
  const [strategy, setStrategy] = useState<string | null>(null);
  if (!problem)
    return (
      <Page title="Keine Aufgabe gewählt">
        <AppButton label="Aufgabe wählen" onPress={() => router.replace('/input')} />
      </Page>
    );
  return (
    <Page
      title="Aufgabe verstehen"
      subtitle="Ordne zuerst die Angaben und entscheide, welches Prinzip passt."
      eyebrow="03 · Analyse"
    >
      <Card>
        <AppText variant="lead">{problem.title}</AppText>
        <AppText muted>{problem.originalText}</AppText>
      </Card>
      <Card>
        <SectionTitle>Gegeben</SectionTitle>
        {problem.given.map((item) => (
          <View key={item.symbol} style={{ gap: spacing.xs }}>
            <AppText>
              {item.symbol} = {item.value}
            </AppText>
            <AppText muted>{item.meaning}</AppText>
          </View>
        ))}
        <SectionTitle>Gesucht</SectionTitle>
        {problem.unknowns.map((item) => (
          <AppText key={item.symbol}>
            {item.symbol} · {item.meaning}
          </AppText>
        ))}
      </Card>
      <Card>
        <SectionTitle>Welche Methode würdest du verwenden?</SectionTitle>
        <AppText muted>{problem.strategySelection.question}</AppText>
        <View style={{ gap: spacing.sm }}>
          {problem.strategySelection.options.map((option) => (
            <Choice
              key={option}
              label={option}
              selected={strategy === option}
              onPress={() => setStrategy(option)}
            />
          ))}
        </View>
        {strategy ? (
          <Feedback
            title={
              strategy === problem.strategySelection.correctOption
                ? 'Passende Methode'
                : 'Noch nicht passend'
            }
            message={
              strategy === problem.strategySelection.correctOption
                ? problem.strategySelection.explanation
                : 'Vergleiche die gegebenen Größen mit dem gesuchten Wert.'
            }
            kind={strategy === problem.strategySelection.correctOption ? 'success' : 'error'}
          />
        ) : null}
      </Card>
      {strategy === problem.strategySelection.correctOption ? (
        <Card>
          <SectionTitle>Grundprinzip</SectionTitle>
          <AppText>{problem.principle.name}</AppText>
          <AppText muted>{problem.principle.explanation}</AppText>
        </Card>
      ) : null}
      <AppButton label="Schrittweise lösen" onPress={() => router.push('/guide')} />
      <AppButton
        label="Eigenes Ergebnis prüfen"
        variant="secondary"
        onPress={() => router.push('/result')}
      />
    </Page>
  );
}
