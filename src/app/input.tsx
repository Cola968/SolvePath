import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  SectionTitle,
} from '../components/ui';
import { demoProblems } from '../data/problems';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

type Filter = 'all' | 'physics' | 'math';

export default function InputScreen() {
  const router = useRouter();
  const { photo } = useLocalSearchParams<{ photo?: string }>();
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const analyze = useSession((state) => state.analyze);
  const busy = useSession((state) => state.busy);
  const error = useSession((state) => state.error);

  const visibleProblems = useMemo(
    () =>
      filter === 'all'
        ? demoProblems
        : demoProblems.filter((problem) => problem.subject === filter),
    [filter],
  );

  async function submit() {
    if (await analyze(text)) router.push('/stuck');
  }

  return (
    <Page
      title="Bring deine Aufgabe mit."
      subtitle="SolvePath zerlegt sie in Entscheidungen, statt sofort die fertige Lösung auszuspucken."
      eyebrow="01 · Aufgabe"
    >
      <PathRail
        current={0}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Lernprofil']}
      />

      {photo === '1' ? (
        <Feedback
          title="Fotoanalyse ist vorbereitet, aber noch nicht aktiv"
          message="Für diesen MVP gib den erkannten Aufgabentext ein oder nutze eine Demo. Eine echte Bildanalyse braucht später einen sicheren Remote-Dienst."
        />
      ) : null}

      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="lead">Aufgabentext</AppText>
            <AppText muted>
              Kopiere die Aufgabe möglichst vollständig – inklusive Zahlen, Einheiten und Frage.
            </AppText>
          </View>
          <Pill label="TEXT" tone="accent" />
        </View>

        <AppInput
          accessibilityLabel="Aufgabentext"
          placeholder="Zum Beispiel: Ein Satellit befindet sich 400 km über der Erdoberfläche …"
          value={text}
          onChangeText={setText}
          multiline
          style={{ minHeight: 190 }}
        />

        <AppText variant="caption" muted>
          {text.trim().length} Zeichen · lokale Demo erkennt derzeit acht vorbereitete Aufgaben
        </AppText>

        {error ? <Feedback title="Noch nicht erkannt" message={error} kind="error" /> : null}

        <AppButton
          label="Lösungsweg analysieren →"
          onPress={() => {
            void submit();
          }}
          disabled={text.trim().length < 10}
          busy={busy}
        />
      </Card>

      <View style={{ gap: spacing.md }}>
        <SectionTitle aside={<Pill label="8 DEMOS" tone="neutral" />}>
          Sofort ausprobieren
        </SectionTitle>

        <View style={{ gap: spacing.sm }}>
          <Choice label="Alle" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Choice
            label="Physik"
            selected={filter === 'physics'}
            onPress={() => setFilter('physics')}
          />
          <Choice
            label="Mathematik"
            selected={filter === 'math'}
            onPress={() => setFilter('math')}
          />
        </View>

        {visibleProblems.map((problem) => (
          <Card key={problem.id}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}
            >
              <View style={{ flex: 1, gap: spacing.xs }}>
                <AppText style={{ fontWeight: '800' }}>{problem.title}</AppText>
                <AppText variant="caption" muted>
                  {problem.topic}
                </AppText>
              </View>
              <Pill
                label={problem.subject === 'physics' ? 'PHYSIK' : 'MATHE'}
                tone={problem.subject === 'physics' ? 'primary' : 'accent'}
              />
            </View>

            <AppText muted numberOfLines={3}>
              {problem.originalText}
            </AppText>

            <AppButton
              label="Diese Aufgabe testen"
              variant="secondary"
              onPress={() => setText(problem.originalText)}
            />
          </Card>
        ))}
      </View>
    </Page>
  );
}
