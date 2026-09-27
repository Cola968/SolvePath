import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText, Card, Page, Pill, SectionTitle } from '../components/ui';
import { useSession } from '../features/session/store';
import { useSubscription } from '../features/subscription/store';
import { spacing, useTheme } from '../theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const profile = useSession((state) => state.profile);
  const recent = useSession((state) => state.recentProblemIds);
  const reset = useSession((state) => state.resetProgress);
  const pro = useSubscription((state) => state.pro);
  const configured = useSubscription((state) => state.configured);
  const appUserId = useSubscription((state) => state.appUserId);
  const busy = useSubscription((state) => state.busy);
  const restore = useSubscription((state) => state.restore);
  const manage = useSubscription((state) => state.manage);

  function confirmReset() {
    Alert.alert(
      'Lernfortschritt löschen?',
      'Verlauf, gelöste Aufgaben, Hinweise und Fehlerprofil werden lokal entfernt. Dein Store-Abo bleibt unverändert.',
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
      subtitle="SolvePath speichert Lernfortschritt lokal; Abos werden über deinen App Store verwaltet."
      eyebrow="App"
    >
      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SectionTitle>SolvePath Pro</SectionTitle>
            <AppText muted>
              {pro
                ? 'Pro ist aktiv. Dein Abo wird über Apple oder Google abgerechnet und verwaltet.'
                : 'Free enthält drei KI-Analysen pro Tag. Pro entfernt das Tageslimit.'}
            </AppText>
          </View>
          <Pill label={pro ? 'PRO' : 'FREE'} tone={pro ? 'primary' : 'neutral'} />
        </View>

        <AppButton
          label={pro ? 'Abo verwalten' : 'Pro ansehen'}
          onPress={() => {
            if (pro) void manage();
            else router.push('/pro');
          }}
          busy={busy}
        />
        <AppButton
          label="Käufe wiederherstellen"
          variant="ghost"
          disabled={!configured}
          busy={busy}
          onPress={() => {
            void restore();
          }}
        />
        {appUserId ? (
          <AppText variant="caption" muted>
            Support-ID: {appUserId}
          </AppText>
        ) : null}
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SectionTitle>Local-first</SectionTitle>
            <AppText muted>
              Verlauf, Hint-Nutzung und Lernprofil bleiben lokal auf deinem Gerät. Aufgabenbilder
              werden nicht dauerhaft gespeichert.
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
          <Pill label="v0.4 RC" tone="primary" />
        </View>
        <AppText muted>
          Freie Text- und Bildanalyse, Stuck Mode, Hint Ladder, Denkfehler-Diagnose, Lernprofil,
          Exam Mode und Store-Abos über RevenueCat.
        </AppText>
      </Card>
    </Page>
  );
}
