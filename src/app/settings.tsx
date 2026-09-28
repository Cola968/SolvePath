import { useRouter } from 'expo-router';
import { Alert, Linking, View } from 'react-native';
import { AppButton, AppText, Card, Page, SectionTitle } from '../components/ui';
import { BETA_FEEDBACK_URL, BETA_VERSION_LABEL, PRIVACY_POLICY_URL } from '../config/release';
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
      subtitle="Beta-Informationen, Datenschutz und lokale Daten."
      eyebrow={BETA_VERSION_LABEL}
    >
      <View style={{ gap: spacing.md }}>
        <SectionTitle>Beta</SectionTitle>
        <Card>
          <AppText style={{ fontWeight: '700' }}>Lokale Beta</AppText>
          <AppText muted>
            Cloud-Analyse und Käufe sind deaktiviert. Aufgabenanalyse und OCR laufen auf dem Gerät.
          </AppText>
          <AppButton
            label="Fehler oder Feedback melden"
            variant="secondary"
            onPress={() => {
              void Linking.openURL(BETA_FEEDBACK_URL);
            }}
          />
        </Card>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Datenschutz</SectionTitle>
        <Card>
          <AppText style={{ fontWeight: '700' }}>Local-first</AppText>
          <AppText muted>
            Aufgabenbilder werden lokal verarbeitet. Lernprofil und Verlauf bleiben auf diesem Gerät
            und werden nicht an einen KI-Anbieter geschickt.
          </AppText>
          <AppButton
            label="Datenschutzerklärung öffnen"
            variant="secondary"
            onPress={() => {
              void Linking.openURL(PRIVACY_POLICY_URL);
            }}
          />
        </Card>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>App</SectionTitle>
        <Card>
          <View style={{ gap: spacing.xs }}>
            <AppText style={{ fontWeight: '700' }}>Darstellung</AppText>
            <AppText muted>{isDark ? 'Dunkelmodus' : 'Hellmodus'} · folgt dem System</AppText>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: '#E4E7EC',
              marginVertical: spacing.xs,
            }}
          />

          <View style={{ gap: spacing.xs }}>
            <AppText style={{ fontWeight: '700' }}>Lokale Daten</AppText>
            <AppText muted>
              {profile.solvedProblemIds.length} gelöste Aufgaben · {recent.length} Einträge im
              Verlauf
            </AppText>
          </View>

          <AppButton label="Lernfortschritt löschen" variant="ghost" onPress={confirmReset} />
        </Card>
      </View>

      <AppText variant="caption" muted style={{ textAlign: 'center' }}>
        SolvePath {BETA_VERSION_LABEL}
      </AppText>
    </Page>
  );
}
