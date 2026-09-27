import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppText, Card, Page, ProgressBar, SectionTitle } from '../components/ui';
import { misconceptionLabel, problemById } from '../data/problems';
import { topicScore, topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useSession((state) => state.profile);
  const topics = Object.entries(profile.topics);
  const risks = topRisks(profile);
  return (
    <Page
      title="Dein Lernprofil"
      subtitle="Deine Versuche zeigen, welche Entscheidungen schon sicher sind und wo du noch üben kannst."
      eyebrow="Fortschritt"
    >
      <Card>
        <AppText variant="lead">{profile.solvedProblemIds.length} Aufgaben gelöst</AppText>
        <AppText muted>
          Die Werte entstehen aus deinen lokalen Versuchen, Hinweisen und erkannten Denkfehlern.
        </AppText>
      </Card>
      <View style={{ gap: spacing.md }}>
        <SectionTitle>Themenfortschritt</SectionTitle>
        {topics.length === 0 ? (
          <Card>
            <AppText muted>Noch keine Daten. Prüfe zuerst ein eigenes Ergebnis.</AppText>
          </Card>
        ) : (
          topics.map(([key, progress]) => (
            <Card key={key}>
              <AppText variant="lead">{key.split(':')[1]}</AppText>
              <AppText muted>
                {progress.attempts} Versuche · {progress.solved} richtige Ergebnisse ·{' '}
                {progress.hintsUsed} Hinweise
              </AppText>
              <ProgressBar
                label="Selbstständigkeit und Trefferquote"
                value={topicScore(progress)}
              />
            </Card>
          ))
        )}
      </View>
      <View style={{ gap: spacing.md }}>
        <SectionTitle>Fehlerprofil</SectionTitle>
        {risks.length === 0 ? (
          <Card>
            <AppText muted>Noch keine typischen Denkfehler erkannt.</AppText>
          </Card>
        ) : (
          risks.map((risk) => (
            <Card key={risk.misconceptionId}>
              <AppText variant="lead">{misconceptionLabel(risk.misconceptionId)}</AppText>
              <AppText muted>
                {risk.topic} · {risk.count} Mal erkannt
              </AppText>
            </Card>
          ))
        )}
      </View>
      <View style={{ gap: spacing.md }}>
        <SectionTitle>Gelöste Aufgaben</SectionTitle>
        {profile.solvedProblemIds.length === 0 ? (
          <AppText muted>Noch keine Aufgabe abgeschlossen.</AppText>
        ) : (
          profile.solvedProblemIds.map((id) => (
            <AppText key={id}>✓ {problemById(id)?.title ?? id}</AppText>
          ))
        )}
      </View>
      <AppButton label="Prüfung vorbereiten" onPress={() => router.push('/exam')} />
    </Page>
  );
}
