import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText, Card, Page, SectionTitle } from '../components/ui';
import { useSession } from '../features/session/store';
import { useTheme } from '../theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
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
      subtitle="SolvePath v0.1 speichert deinen Lernfortschritt ausschließlich auf diesem Gerät."
      eyebrow="App"
    >
      <Card>
        <SectionTitle>Darstellung</SectionTitle>
        <AppText>Systemmodus · derzeit {isDark ? 'Dunkel' : 'Hell'}</AppText>
        <AppText muted>Die Oberfläche folgt den Android- oder iOS-Einstellungen.</AppText>
      </Card>
      <Card>
        <SectionTitle>Lokale Daten</SectionTitle>
        <AppText muted>
          Verlauf, verwendete Hinweise, gelöste Aufgaben und Fehlerkategorien bleiben auf diesem
          Gerät.
        </AppText>
        <AppButton label="Lernfortschritt löschen" variant="ghost" onPress={confirmReset} />
      </Card>
      <Card>
        <SectionTitle>Über diese Version</SectionTitle>
        <AppText muted>
          Die Analyse verwendet acht lokale Demo-Aufgaben. Fotoerkennung und Remote-KI sind für
          spätere Versionen vorbereitet.
        </AppText>
      </Card>
    </Page>
  );
}
