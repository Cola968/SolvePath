import { useRouter } from 'expo-router';
import { Linking, View } from 'react-native';
import {
  ActionTile,
  AppButton,
  AppText,
  Card,
  Page,
  SectionTitle,
  StatTile,
} from '../components/ui';
import { BETA_FEEDBACK_URL } from '../config/release';
import { problemById } from '../data/problems';
import { topicScore, topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const recent = useSession((state) => state.recentProblemIds);
  const hydrated = useSession((state) => state.hydrated);
  const profile = useSession((state) => state.profile);
  const remoteProblems = useSession((state) => state.remoteProblems);
  const selectProblem = useSession((state) => state.selectProblem);

  const topicProgress = Object.values(profile.topics);
  const mastery =
    topicProgress.length === 0
      ? 0
      : Math.round(
          topicProgress.reduce((sum, progress) => sum + topicScore(progress), 0) /
            topicProgress.length,
        );
  const risks = topRisks(profile);
  const continueProblem = recent.length
    ? (remoteProblems[recent[0]!] ?? problemById(recent[0]!))
    : undefined;

  return (
    <Page
      title="Was möchtest du lösen?"
      subtitle="Foto aufnehmen oder Aufgabe eingeben. SolvePath führt dich Schritt für Schritt weiter."
      back={false}
      eyebrow="SolvePath Beta"
    >
      <View style={{ gap: spacing.sm }}>
        <AppButton label="Aufgabe fotografieren" onPress={() => router.push('/input?photo=1')} />
        <AppButton
          label="Aufgabe eintippen"
          variant="secondary"
          onPress={() => router.push('/input')}
        />
      </View>

      {continueProblem ? (
        <View style={{ gap: spacing.md }}>
          <SectionTitle>Weitermachen</SectionTitle>
          <Card>
            <AppText variant="lead">{continueProblem.title}</AppText>
            <AppText muted numberOfLines={2}>
              {continueProblem.originalText}
            </AppText>
            <AppButton
              label="Fortsetzen"
              variant="secondary"
              onPress={() => {
                selectProblem(continueProblem.id);
                router.push('/analysis');
              }}
            />
          </Card>
        </View>
      ) : null}

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Dein Fortschritt</SectionTitle>
        <Card>
          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <StatTile value={profile.solvedProblemIds.length.toString()} label="Gelöst" />
            <StatTile
              value={topicProgress.length ? `${mastery}%` : '–'}
              label="Sicherheit"
              tone="accent"
            />
            <StatTile value={risks.length.toString()} label="Fokuspunkte" tone="warning" />
          </View>
        </Card>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionTitle>Lernen</SectionTitle>
        <ActionTile
          symbol="◎"
          title="Prüfungsmodus"
          subtitle="Themen auswählen und gezielt trainieren"
          onPress={() => router.push('/exam')}
        />
        <ActionTile
          symbol="↗"
          title="Lernprofil"
          subtitle={
            risks.length ? `${risks.length} wiederkehrende Fehlermuster` : 'Fortschritt ansehen'
          }
          onPress={() => router.push('/profile')}
        />
        <ActionTile
          symbol="⚙"
          title="Einstellungen"
          subtitle="Beta, Datenschutz und lokale Daten"
          onPress={() => router.push('/settings')}
        />
      </View>

      {!hydrated ? (
        <AppText variant="caption" muted>
          Fortschritt wird geladen …
        </AppText>
      ) : recent.length === 0 ? (
        <AppText variant="caption" muted>
          Dein Verlauf erscheint hier, sobald du die erste Aufgabe bearbeitet hast.
        </AppText>
      ) : null}

      <View
        style={{
          gap: spacing.xs,
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: '#E4E7EC',
        }}
      >
        <AppText variant="caption" muted>
          Beta 0.5.1 · lokale Analyse · keine Cloud-KI
        </AppText>
        <AppButton
          label="Problem melden"
          variant="ghost"
          onPress={() => {
            void Linking.openURL(BETA_FEEDBACK_URL);
          }}
        />
      </View>
    </Page>
  );
}
