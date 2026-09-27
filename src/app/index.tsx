import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  ActionTile,
  AppButton,
  AppText,
  Card,
  HeroCard,
  Page,
  Pill,
  SectionTitle,
  StatTile,
} from '../components/ui';
import { problemById } from '../data/problems';
import { topicScore, topRisks } from '../domain/profile/progress';
import { useSession } from '../features/session/store';
import { spacing } from '../theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const recent = useSession((state) => state.recentProblemIds);
  const hydrated = useSession((state) => state.hydrated);
  const profile = useSession((state) => state.profile);
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
  const continueProblem = recent.length ? problemById(recent[0]!) : undefined;

  return (
    <Page
      title="SolvePath"
      subtitle="Dein persönlicher Lösungsweg für Mathe und Physik."
      back={false}
      eyebrow="Lernen mit System"
    >
      <HeroCard
        kicker="Nicht vorsagen. Weiterbringen."
        title="Wo hängt dein Lösungsweg?"
        body="Gib eine Aufgabe ein. SolvePath erkennt den nächsten sinnvollen Schritt und zeigt nur so viel Hilfe, wie du brauchst."
      >
        <AppButton label="Aufgabe analysieren" onPress={() => router.push('/input')} />
        <AppButton
          label="Foto / Screenshot"
          variant="secondary"
          onPress={() => router.push('/input?photo=1')}
        />
      </HeroCard>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        <StatTile
          value={profile.solvedProblemIds.length.toString()}
          label="gelöst"
          detail="ohne fertige Lösung vorab"
        />
        <StatTile
          value={topicProgress.length ? `${mastery}%` : '–'}
          label="Selbstständigkeit"
          detail={topicProgress.length ? 'aus deinen Versuchen' : 'noch keine Daten'}
          tone="accent"
        />
        <StatTile
          value={risks.length.toString()}
          label="aktive Risiken"
          detail={risks.length ? 'gezielt trainierbar' : 'noch keine erkannt'}
          tone="warning"
        />
      </View>

      {continueProblem ? (
        <View style={{ gap: spacing.md }}>
          <SectionTitle aside={<Pill label="WEITERMACHEN" tone="primary" />}>
            Dein letzter Pfad
          </SectionTitle>
          <Card elevated>
            <View style={{ gap: spacing.xs }}>
              <AppText variant="lead">{continueProblem.title}</AppText>
              <AppText muted>
                {continueProblem.subject === 'physics' ? 'Physik' : 'Mathematik'} ·{' '}
                {continueProblem.topic}
              </AppText>
            </View>
            <AppText muted numberOfLines={2}>
              {continueProblem.originalText}
            </AppText>
            <AppButton
              label="Weiterlernen →"
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
        <SectionTitle>Schnellzugriff</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          <ActionTile
            symbol="＋"
            title="Text eingeben"
            subtitle="Aufgabe direkt analysieren"
            onPress={() => router.push('/input')}
            accent
          />
          <ActionTile
            symbol="◎"
            title="Prüfungsmodus"
            subtitle="Risiken gezielt trainieren"
            onPress={() => router.push('/exam')}
          />
          <ActionTile
            symbol="↗"
            title="Lernprofil"
            subtitle="Fehlermuster verstehen"
            onPress={() => router.push('/profile')}
          />
          <ActionTile
            symbol="⚙"
            title="Einstellungen"
            subtitle="Daten und Darstellung"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Letzte Aufgaben</SectionTitle>
        {!hydrated ? (
          <AppText muted>Verlauf wird geladen …</AppText>
        ) : recent.length === 0 ? (
          <Card>
            <Pill label="START" tone="accent" />
            <AppText variant="lead">Noch kein Verlauf.</AppText>
            <AppText muted>
              Starte mit einer Demo-Aufgabe. Schon nach wenigen Versuchen kann SolvePath erste
              Fehlermuster sichtbar machen.
            </AppText>
          </Card>
        ) : (
          recent.slice(0, 4).map((id) => {
            const problem = problemById(id);
            if (!problem) return null;
            return (
              <Card key={id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <AppText style={{ fontWeight: '800' }}>{problem.title}</AppText>
                    <AppText variant="caption" muted>
                      {problem.subject === 'physics' ? 'Physik' : 'Mathematik'} · {problem.topic}
                    </AppText>
                  </View>
                  <Pill
                    label={profile.solvedProblemIds.includes(problem.id) ? 'GELÖST' : 'OFFEN'}
                    tone={profile.solvedProblemIds.includes(problem.id) ? 'primary' : 'neutral'}
                  />
                </View>
                <AppButton
                  label="Öffnen"
                  variant="ghost"
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
