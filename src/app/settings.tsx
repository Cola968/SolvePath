import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText, Card, Page, Pill, SectionTitle } from '../components/ui';
import { useSession } from '../features/session/store';
import { spacing, useTheme } from '../theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const profile = useSession((state) => state.profile);
  const recent = useSession((state) => state.recentProblemIds);
  const reset = useSession((state) => state.resetProgress);

  function confirmReset() {
    Alert.alert(
      'Lernfortschritt löschen?',
      'Verlauf, gelöste Aufgaben, Hinweise und Fehlerprofil werden lokal entfernt.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            void reset()
              .then(() => router.replace('/'))
              .catch(() =>
                Alert.alert('Fehler', 'Die lokalen Daten konnten nicht gelöscht werden.'),
              );
          },
        },
      ],
    );
  }

  return (
    <Page
      title="Einstellungen"
      subtitle="Der aktuelle MVP arbeitet local-first und benötigt für den Kernflow kein Konto."
      eyebrow="App"
    >
      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SectionTitle>Local-first</SectionTitle>
            <AppText muted>
              Lernfortschritt, Hint-Nutzung und Fehlerprofil bleiben in dieser Version auf deinem
              Gerät.
            </AppText>
          </View>
          <Pill label="PRIVAT" tone="primary" />
        </View>
      </Card>

      <Card>
        <SectionTitle>Darstellung</SectionTitle>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <AppText>Systemmodus</AppText>
          <Pill label={isDark ? 'DUNKEL' : 'HELL'} tone="accent" />
        </View>
        <AppText muted>Die Oberfläche folgt automatisch Android oder iOS.</AppText>
      </Card>

      <Card>
        <SectionTitle>Lokale Daten</SectionTitle>
        <AppText>
          {profile.solvedProblemIds.length} gelöste Aufgaben · {recent.length} Einträge im Verlauf
        </AppText>
        <AppText muted>
          Beim Löschen werden Verlauf, verwendete Hinweise, gelöste Aufgaben und erkannte
          Fehlerkategorien entfernt.
        </AppText>
        <AppButton label="Lernfortschritt löschen" variant="ghost" onPress={confirmReset} />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <SectionTitle>SolvePath</SectionTitle>
          <Pill label="v0.2 MVP" tone="primary" />
        </View>
        <AppText muted>
          Acht lokale Demo-Aufgaben, Stuck Mode, Hint Ladder, Denkfehler-Diagnose, Lernprofil und
          Exam Mode. Eine echte Foto-/Freitext-KI benötigt als nächstes einen sicheren
          Backend-Service.
        </AppText>
      </Card>
    </Page>
  );
}
