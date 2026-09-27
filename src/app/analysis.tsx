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
  SectionTitle,
} from '../components/ui';
import { useProblem } from '../features/problems/use-problem';
import { radius, spacing, useTheme } from '../theme/tokens';

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
      title="Baue den Lösungsweg."
      subtitle="Erst Größen und Prinzip erkennen. Die Formel kommt danach."
      eyebrow="03 · Methode"
    >
      <PathRail
        current={2}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Lernprofil']}
      />

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <AppText variant="lead" style={{ flex: 1 }}>
            {problem.title}
          </AppText>
          <Pill label={problem.topic.toUpperCase()} tone="neutral" />
        </View>
        <AppText muted>{problem.originalText}</AppText>
      </Card>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>1. Größen sortieren</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {problem.given.map((item) => (
            <View
              key={item.symbol}
              style={{
                flexGrow: 1,
                minWidth: 145,
                padding: spacing.lg,
                borderRadius: radius.lg,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                gap: spacing.xs,
              }}
            >
              <AppText variant="caption" muted>
                GEGEBEN
              </AppText>
              <AppText variant="lead">
                {item.symbol} = {item.value}
              </AppText>
              <AppText variant="caption" muted>
                {item.meaning}
              </AppText>
            </View>
          ))}
        </View>

        <View
          style={{
            padding: spacing.lg,
            borderRadius: radius.lg,
            backgroundColor: colors.accentSoft,
            gap: spacing.xs,
          }}
        >
          <AppText variant="caption" style={{ color: colors.accent, fontWeight: '800' }}>
            GESUCHT
          </AppText>
          {problem.unknowns.map((item) => (
            <AppText key={item.symbol} variant="lead">
              {item.symbol} · {item.meaning}
            </AppText>
          ))}
        </View>
      </View>

      <Card elevated>
        <View style={{ gap: spacing.xs }}>
          <Pill label="ENTSCHEIDUNGS-KOMPETENZ" tone="accent" />
          <SectionTitle>2. Welche Methode passt?</SectionTitle>
          <AppText muted>{problem.strategySelection.question}</AppText>
        </View>

        <View style={{ gap: spacing.sm }}>
          {problem.strategySelection.options.map((option, index) => (
            <Choice
              key={option}
              prefix={String.fromCharCode(65 + index)}
              label={option}
              selected={strategy === option}
              onPress={() => setStrategy(option)}
            />
          ))}
        </View>

        {strategy ? (
          <Feedback
            title={strategyCorrect ? 'Methode erkannt' : 'Der Weg passt noch nicht'}
            message={
              strategyCorrect
                ? problem.strategySelection.explanation
                : 'Vergleiche zuerst die gegebenen Größen mit dem gesuchten Wert. Welche Beziehung verbindet genau diese Größen?'
            }
            kind={strategyCorrect ? 'success' : 'error'}
          />
        ) : null}
      </Card>

      {strategyCorrect ? (
        <Card
          style={{
            backgroundColor: colors.primaryStrong,
            borderColor: colors.primaryStrong,
          }}
        >
          <Pill label="GRUNDPRINZIP" tone="primary" />
          <AppText variant="title" style={{ color: colors.white }}>
            {problem.principle.name}
          </AppText>
          <AppText style={{ color: colors.white, opacity: 0.84 }}>
            {problem.principle.explanation}
          </AppText>
        </Card>
      ) : null}

      <AppButton
        label={strategyCorrect ? 'Schrittweise lösen →' : 'Wähle zuerst die passende Methode'}
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
