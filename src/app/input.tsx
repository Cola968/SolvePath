import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppInput, AppText, Card, Feedback, Page, SectionTitle } from '../components/ui';
import { demoProblems } from '../data/problems';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function InputScreen() {
  const router = useRouter();
  const { photo } = useLocalSearchParams<{ photo?: string }>();
  const [text, setText] = useState('');
  const analyze = useSession((state) => state.analyze);
  const busy = useSession((state) => state.busy);
  const error = useSession((state) => state.error);
  async function submit() {
    if (await analyze(text)) router.push('/stuck');
  }
  return (
    <Page
      title="Aufgabe eingeben"
      subtitle="Schreibe den Aufgabentext ab oder wähle ein Beispiel. Die lokale Demo erkennt acht vorbereitete Aufgaben."
      eyebrow="01 · Aufgabe"
    >
      {photo === '1' ? (
        <Feedback
          title="Fotoauswahl in Vorbereitung"
          message="Der Upload-Platz ist vorbereitet. Für v0.1 gib den Text ein oder nutze eine Demo-Aufgabe."
        />
      ) : null}
      <View style={{ gap: spacing.md }}>
        <AppText variant="lead">Dein Aufgabentext</AppText>
        <AppInput
          accessibilityLabel="Aufgabentext"
          placeholder="Zum Beispiel: Ein Satellit befindet sich 400 km über der Erdoberfläche …"
          value={text}
          onChangeText={setText}
          multiline
          style={{ minHeight: 170 }}
        />
        {error ? <Feedback title="Analyse nicht möglich" message={error} kind="error" /> : null}
        <AppButton
          label="Aufgabe analysieren"
          onPress={() => {
            void submit();
          }}
          disabled={text.trim().length < 10}
          busy={busy}
        />
      </View>
      <View style={{ gap: spacing.md }}>
        <SectionTitle>Beispielaufgaben</SectionTitle>
        {demoProblems.map((problem) => (
          <Card key={problem.id}>
            <AppText variant="lead">{problem.title}</AppText>
            <AppText muted>
              {problem.subject === 'physics' ? 'Physik' : 'Mathematik'} · {problem.topic}
            </AppText>
            <AppButton
              label="Text übernehmen"
              variant="secondary"
              onPress={() => setText(problem.originalText)}
            />
          </Card>
        ))}
      </View>
    </Page>
  );
}
