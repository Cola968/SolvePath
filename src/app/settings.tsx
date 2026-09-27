import { useRouter } from 'expo-router';
import { Alert, Linking, View } from 'react-native';
import { AppButton, AppText, Card, Page, Pill, SectionTitle } from '../components/ui';
import { BETA_FEEDBACK_URL, BETA_VERSION_LABEL } from '../config/release';
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
      'Verlauf, gelöste Aufgaben, Hinweise und Fehlerprofil werden nur auf diesem Gerät entfernt.',
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
      subtitle="Die Beta arbeitet local-first und speichert deinen Lernfortschritt auf diesem Gerät."
      eyebrow="Beta"
    >
      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SectionTitle>Beta-Test</SectionTitle>
            <AppText muted>
              Käufe und Cloud-Analyse sind in diesem Build deaktiviert. Alle aktuellen Lernfunktionen
              einschließlich Exam Mode stehen Testern frei zur Verfügung.
            </AppText>
          </View>
          <Pill label="BETA" tone="accent" />
        </View>
        <AppButton
          label="Fehler oder Feedback melden"
          onPress={() => {
            void Linking.openURL(BETA_FEEDBACK_URL);
          }}
        />
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SectionTitle>Local-first</SectionTitle>
            <AppText muted>
              Freie Analyse, Lernprofil und Aufgabenverlauf laufen lokal. Aufgabenbilder werden
              lokal in Text umgewandelt und nicht an einen KI-Anbieter hochgeladen.
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
          <Pill label={BETA_VERSION_LABEL} tone="primary" />
        </View>
        <AppText muted>
          Lokale Text- und Bildanalyse, Stuck Mode, Hint Ladder, Denkfehler-Diagnose, Lernprofil und
          Exam Mode. Dieser Build ist für geschlossene Beta-Tests vorgesehen.
        </AppText>
      </Card>
    </Page>
  );
}
