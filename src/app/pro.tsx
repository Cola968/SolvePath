import { useRouter } from 'expo-router';
import { AppButton, AppText, Card, HeroCard, Page, Pill } from '../components/ui';

export default function ProScreen() {
  const router = useRouter();

  return (
    <Page
      title="Pro ist in der Beta deaktiviert."
      subtitle="Für den Beta-Test sind alle aktuellen Lernfunktionen kostenlos freigeschaltet."
      eyebrow="Beta"
    >
      <HeroCard
        kicker="BETA TEST"
        title="Keine Käufe. Keine Paywall."
        body="Wir testen zuerst, ob SolvePath zuverlässig hilft. Abos und Store-Käufe werden erst nach der Beta separat getestet und aktiviert."
      >
        <Pill label="ALLE BETA-FUNKTIONEN FREI" tone="primary" />
      </HeroCard>

      <Card>
        <AppText variant="lead">Was du jetzt testen kannst</AppText>
        <AppText muted>
          Lokale Aufgabenanalyse, Foto- und Screenshot-Erkennung, Stuck Mode, sechs Hinweisstufen,
          Ergebnisprüfung, Lernprofil und Exam Mode.
        </AppText>
      </Card>

      <AppButton label="Zurück zu SolvePath" onPress={() => router.replace('/')} />
    </Page>
  );
}
