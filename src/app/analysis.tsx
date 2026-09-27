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
  SectionTitle,
} from '../components/ui';
import { useProblem } from '../features/problems/use-problem';
import { spacing, useTheme } from '../theme/tokens';

export default function AnalysisScreen() {
  const router = useRouter();
  const problem = useProblem();
  const { colors } = useTheme();
  const [strategy, setStrategy] = useState<string | null>(null);

  if (!problem)
    return (
      <Page title="Keine Aufgabe gewählt">
        <AppButton label="Aufgabe wählen" onPress={() => router.replace('/input')} />
      </Page>
    );

  const strategyCorrect = strategy === problem.strategySelection.correctOption;

  return (
    <Page
      title="Welche Methode passt?"
      subtitle="Sortiere zuerst die Informationen. Danach entscheidest du über den Lösungsweg."
      eyebrow="Schritt 3"
    >
      <PathRail
        current={2}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Profil']}
      />

      <Card>
        <AppText variant="caption" muted>
          AUFGABE
        </AppText>
        <AppText>{problem.originalText}</AppText>
      </Card>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Gegeben und gesucht</SectionTitle>
        <Card>
          {problem.given.map((item, index) => (
            <View
              key={item.symbol}
              style={{
                paddingBottom: index === problem.given.length - 1 ? 0 : spacing.md,
                marginBottom: index === problem.given.length - 1 ? 0 : spacing.md,
                borderBottomWidth: index === problem.given.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                <AppText style={{ fontWeight: '700' }}>
                  {item.symbol} = {item.value}
                </AppText>
                <AppText variant="caption" muted style={{ flex: 1, textAlign: 'right' }}>
                  {item.meaning}
                </AppText>
              </View>
            </View>
          ))}

          <View
            style={{
              paddingTop: spacing.md,
              marginTop: spacing.xs,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
              GESUCHT
            </AppText>
            {problem.unknowns.map((item) => (
              <AppText key={item.symbol} style={{ fontWeight: '700', marginTop: spacing.xs }}>
                {item.symbol} · {item.meaning}
              </AppText>
            ))}
          </View>
        </Card>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>{problem.strategySelection.question}</SectionTitle>
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
      </View>

      {strategy ? (
        <Feedback
          title={strategyCorrect ? 'Richtige Methode' : 'Prüfe die Verbindung der Größen'}
          message={
            strategyCorrect
              ? problem.strategySelection.explanation
              : 'Welche Beziehung enthält genau die gegebenen und gesuchten Größen?'
          }
          kind={strategyCorrect ? 'success' : 'error'}
        />
      ) : null}

      {strategyCorrect ? (
        <Card>
          <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
            GRUNDPRINZIP
          </AppText>
          <AppText variant="lead">{problem.principle.name}</AppText>
          <AppText muted>{problem.principle.explanation}</AppText>
        </Card>
      ) : null}

      <AppButton
        label="Schrittweise lösen"
        disabled={!strategyCorrect}
        onPress={() => router.push('/guide')}
      />
      <AppButton
        label="Ich habe schon ein Ergebnis"
        variant="ghost"
        onPress={() => router.push('/result')}
      />
    </Page>
  );
}
