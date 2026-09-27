import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppText, Card, Page, SectionTitle } from '../components/ui';
import { problemById } from '../data/problems';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const recent = useSession((state) => state.recentProblemIds);
  const hydrated = useSession((state) => state.hydrated);
  const selectProblem = useSession((state) => state.selectProblem);
  return (
    <Page
      title="SolvePath"
      subtitle="Verstehe den Lösungsweg – nicht nur die Antwort."
      back={false}
      eyebrow="Lernen mit System"
    >
      <Card>
        <AppText variant="lead">Finde den nächsten Schritt.</AppText>
        <AppText muted>
          Beschreibe deine Aufgabe und sage uns, wo du hängst. Du löst selbst weiter.
        </AppText>
        <AppButton label="Aufgabe analysieren" onPress={() => router.push('/input')} />
      </Card>
      <View style={{ gap: spacing.md }}>
        <SectionTitle>Schnellzugriff</SectionTitle>
        <AppButton
          label="Aufgabe eingeben"
          variant="secondary"
          onPress={() => router.push('/input')}
        />
        <AppButton
          label="Foto auswählen"
          variant="ghost"
          onPress={() => router.push('/input?photo=1')}
        />
        <AppButton label="Lernprofil" variant="ghost" onPress={() => router.push('/profile')} />
        <AppButton
          label="Prüfung vorbereiten"
          variant="ghost"
          onPress={() => router.push('/exam')}
        />
        <AppButton label="Einstellungen" variant="ghost" onPress={() => router.push('/settings')} />
      </View>
      <View style={{ gap: spacing.md }}>
        <SectionTitle>Letzte Aufgaben</SectionTitle>
        {!hydrated ? (
          <AppText muted>Verlauf wird geladen …</AppText>
        ) : recent.length === 0 ? (
          <Card>
            <AppText muted>
              Noch keine Aufgaben analysiert. Starte mit einer der acht Demo-Aufgaben.
            </AppText>
          </Card>
        ) : (
          recent.map((id) => {
            const problem = problemById(id);
            if (!problem) return null;
            return (
              <Card key={id}>
                <AppText variant="lead">{problem.title}</AppText>
                <AppText muted>
                  {problem.subject === 'physics' ? 'Physik' : 'Mathematik'} · {problem.topic}
                </AppText>
                <AppButton
                  label="Weiterlernen"
                  variant="secondary"
                  onPress={() => {
                    selectProblem(id);
                    router.push('/analysis');
                  }}
                />
              </Card>
            );
          })
        )}
      </View>
    </Page>
  );
}
