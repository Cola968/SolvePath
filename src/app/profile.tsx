import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  AppButton,
  AppText,
  Card,
  Page,
  ProgressBar,
  SectionTitle,
  StatTile,
} from '../components/ui';
import { demoProblems, misconceptionLabel, problemById } from '../data/problems';
import { topicScore, topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing, useTheme } from '../theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const profile = useSession((state) => state.profile);
  const selectProblem = useSession((state) => state.selectProblem);

  const topics = Object.entries(profile.topics);
  const risks = topRisks(profile);
  const allScores = topics.map(([, progress]) => topicScore(progress));
  const mastery =
    allScores.length === 0
      ? 0
      : Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
  const totalAttempts = topics.reduce((sum, [, progress]) => sum + progress.attempts, 0);
  const totalHints = topics.reduce((sum, [, progress]) => sum + progress.hintsUsed, 0);

  const focusProblem = risks.length
    ? demoProblems.find((problem) => problem.topic === risks[0]?.topic)
    : undefined;

  return (
    <Page
      title="Lernprofil"
      subtitle="Hier siehst du, wo dein Lösungsweg wiederholt unsicher wird."
      eyebrow="Fortschritt"
    >
      <Card>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <StatTile value={profile.solvedProblemIds.length.toString()} label="Gelöst" />
          <StatTile value={topics.length ? `${mastery}%` : '–'} label="Sicherheit" tone="accent" />
          <StatTile value={totalHints.toString()} label="Hinweise" tone="warning" />
        </View>
        <AppText variant="caption" muted>
          {totalAttempts} Ergebnisprüfungen insgesamt
        </AppText>
      </Card>

      {risks.length ? (
        <View style={{ gap: spacing.md }}>
          <SectionTitle>Nächster Fokus</SectionTitle>
          <Card style={{ backgroundColor: colors.warningSoft }}>
            <AppText variant="lead">{misconceptionLabel(risks[0]!.misconceptionId)}</AppText>
            <AppText muted>
              {risks[0]!.topic} · {risks[0]!.count}× erkannt
            </AppText>
            {focusProblem ? (
              <AppButton
                label="Gezielt trainieren"
                onPress={() => {
                  selectProblem(focusProblem.id);
                  router.push('/stuck');
                }}
              />
            ) : (
              <AppButton label="Prüfungsmodus öffnen" onPress={() => router.push('/exam')} />
            )}
          </Card>
        </View>
      ) : (
        <Card>
          <AppText variant="lead">Noch kein wiederkehrendes Fehlermuster</AppText>
          <AppText muted>
            Bearbeite ein paar Aufgaben und prüfe deine eigenen Ergebnisse. Danach kann SolvePath
            gezielter priorisieren.
          </AppText>
        </Card>
      )}

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Themen</SectionTitle>
        {topics.length === 0 ? (
          <AppText muted>Noch keine Daten vorhanden.</AppText>
        ) : (
          <Card>
            {topics.map(([key, progress], index) => {
              const score = topicScore(progress);
              return (
                <View
                  key={key}
                  style={{
                    gap: spacing.sm,
                    paddingBottom: index === topics.length - 1 ? 0 : spacing.lg,
                    marginBottom: index === topics.length - 1 ? 0 : spacing.lg,
                    borderBottomWidth: index === topics.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      gap: spacing.md,
                    }}
                  >
                    <AppText style={{ fontWeight: '700', flex: 1 }}>{key.split(':')[1]}</AppText>
                    <AppText variant="caption" muted>
                      {progress.solved}/{progress.attempts} richtig
                    </AppText>
                  </View>
                  <ProgressBar value={score} />
                </View>
              );
            })}
          </Card>
        )}
      </View>

      {risks.length ? (
        <View style={{ gap: spacing.md }}>
          <SectionTitle>Fehlermuster</SectionTitle>
          <Card>
            {risks.map((risk, index) => (
              <View
                key={risk.misconceptionId}
                style={{
                  paddingBottom: index === risks.length - 1 ? 0 : spacing.md,
                  marginBottom: index === risks.length - 1 ? 0 : spacing.md,
                  borderBottomWidth: index === risks.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                  gap: spacing.xs,
                }}
              >
                <AppText style={{ fontWeight: '700' }}>
                  {misconceptionLabel(risk.misconceptionId)}
                </AppText>
                <AppText variant="caption" muted>
                  {risk.topic} · {risk.count}× erkannt
                </AppText>
              </View>
            ))}
          </Card>
        </View>
      ) : null}

      {profile.solvedProblemIds.length ? (
        <View style={{ gap: spacing.md }}>
          <SectionTitle>Zuletzt abgeschlossen</SectionTitle>
          <Card>
            {profile.solvedProblemIds
              .slice(-5)
              .reverse()
              .map((id, index, arr) => (
                <View
                  key={id}
                  style={{
                    paddingBottom: index === arr.length - 1 ? 0 : spacing.md,
                    marginBottom: index === arr.length - 1 ? 0 : spacing.md,
                    borderBottomWidth: index === arr.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <AppText style={{ fontWeight: '600' }}>{problemById(id)?.title ?? id}</AppText>
                </View>
              ))}
          </Card>
        </View>
      ) : null}

      <AppButton label="Prüfung vorbereiten" onPress={() => router.push('/exam')} />
    </Page>
  );
}
