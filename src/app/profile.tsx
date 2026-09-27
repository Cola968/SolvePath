import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  AppButton,
  AppText,
  Card,
  Page,
  Pill,
  ProgressBar,
  SectionTitle,
  StatTile,
} from '../components/ui';
import { demoProblems, misconceptionLabel, problemById } from '../data/problems';
import { topicScore, topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
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
      title="Dein Denkprofil"
      subtitle="Nicht nur Noten oder richtige Antworten: Hier siehst du, an welchen Entscheidungen dein Lösungsweg häufig scheitert."
      eyebrow="Lernprofil"
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <StatTile
          value={profile.solvedProblemIds.length.toString()}
          label="Aufgaben gelöst"
          detail={`${totalAttempts} Prüfversuche`}
        />
        <StatTile
          value={topics.length ? `${mastery}%` : '–'}
          label="Selbstständigkeit"
          detail="Trefferquote minus Hint-Bedarf"
          tone="accent"
        />
        <StatTile
          value={totalHints.toString()}
          label="Hinweise genutzt"
          detail={risks.length ? `${risks.length} Fehlermuster aktiv` : 'keine Muster erkannt'}
          tone="warning"
        />
      </View>

      {risks.length ? (
        <Card elevated>
          <Pill label="NÄCHSTER FOKUS" tone="warning" />
          <AppText variant="title">{misconceptionLabel(risks[0]!.misconceptionId)}</AppText>
          <AppText muted>
            Dieser Denkfehler wurde {risks[0]!.count} Mal erkannt. Statt mehr vom gleichen Stoff zu
            machen, solltest du genau diese Entscheidung trainieren.
          </AppText>
          {focusProblem ? (
            <AppButton
              label="Gezielt trainieren →"
              onPress={() => {
                selectProblem(focusProblem.id);
                router.push('/stuck');
              }}
            />
          ) : (
            <AppButton label="Prüfungsmodus öffnen →" onPress={() => router.push('/exam')} />
          )}
        </Card>
      ) : (
        <Card>
          <Pill label="NOCH KEIN MUSTER" tone="accent" />
          <AppText variant="lead">SolvePath braucht ein paar echte Versuche.</AppText>
          <AppText muted>
            Prüfe eigene Ergebnisse. Erst dann kann die App zwischen Rechenfehlern und typischen
            Denkfehlern unterscheiden.
          </AppText>
          <AppButton label="Aufgabe starten" onPress={() => router.push('/input')} />
        </Card>
      )}

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Themenfortschritt</SectionTitle>
        {topics.length === 0 ? (
          <Card>
            <AppText muted>Noch keine Daten. Prüfe zuerst ein eigenes Ergebnis.</AppText>
          </Card>
        ) : (
          topics.map(([key, progress]) => {
            const score = topicScore(progress);
            return (
              <Card key={key}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}
                >
                  <View style={{ flex: 1 }}>
                    <AppText variant="lead">{key.split(':')[1]}</AppText>
                    <AppText variant="caption" muted>
                      {progress.attempts} Versuche · {progress.solved} richtig ·{' '}
                      {progress.hintsUsed} Hinweise
                    </AppText>
                  </View>
                  <Pill
                    label={score >= 80 ? 'SICHER' : score >= 50 ? 'AUFBAU' : 'FOKUS'}
                    tone={score >= 80 ? 'primary' : score >= 50 ? 'accent' : 'warning'}
                  />
                </View>
                <ProgressBar label="Selbstständigkeit" value={score} />
              </Card>
            );
          })
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle aside={<Pill label={`${risks.length}`} tone="warning" />}>
          Erkannte Fehlermuster
        </SectionTitle>
        {risks.length === 0 ? (
          <Card>
            <AppText muted>Noch keine typischen Denkfehler erkannt.</AppText>
          </Card>
        ) : (
          risks.map((risk, index) => (
            <Card key={risk.misconceptionId}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Pill label={`#${index + 1}`} tone="warning" />
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <AppText style={{ fontWeight: '800' }}>
                    {misconceptionLabel(risk.misconceptionId)}
                  </AppText>
                  <AppText variant="caption" muted>
                    {risk.topic} · {risk.count}× erkannt
                  </AppText>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Abgeschlossene Pfade</SectionTitle>
        {profile.solvedProblemIds.length === 0 ? (
          <AppText muted>Noch keine Aufgabe abgeschlossen.</AppText>
        ) : (
          profile.solvedProblemIds.map((id) => (
            <Card key={id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Pill label="✓" tone="primary" />
                <AppText style={{ flex: 1, fontWeight: '700' }}>
                  {problemById(id)?.title ?? id}
                </AppText>
              </View>
            </Card>
          ))
        )}
      </View>

      <AppButton label="Prüfung gezielt vorbereiten →" onPress={() => router.push('/exam')} />
    </Page>
  );
}
