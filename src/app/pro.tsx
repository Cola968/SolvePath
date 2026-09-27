import { View } from 'react-native';
import { AppButton, AppText, Card, HeroCard, Page, Pill, SectionTitle } from '../components/ui';
import { useSubscription } from '../features/subscription/store';
import { FREE_REMOTE_ANALYSES_PER_DAY } from '../storage/quota-repository';
import { spacing } from '../theme/tokens';

const features = [
  ['∞', 'Kein Free-Tageslimit', 'Freie Mathe- und Physikaufgaben ohne das tägliche Free-Limit analysieren.'],
  ['◎', 'Foto & Screenshot', 'Aufgaben direkt mit Kamera oder Galerie in SolvePath übernehmen.'],
  ['↗', 'Exam Mode', 'Fehlermuster priorisieren und gezielt für Prüfungen trainieren.'],
  [
    '◇',
    'Volles Denkprofil',
    'Risiken, Selbstständigkeit und typische Lösungsfehler langfristig verfolgen.',
  ],
];

export default function ProScreen() {
  const pro = useSubscription((state) => state.pro);
  const configured = useSubscription((state) => state.configured);
  const busy = useSubscription((state) => state.busy);
  const error = useSubscription((state) => state.error);
  const showPaywall = useSubscription((state) => state.showPaywall);
  const restore = useSubscription((state) => state.restore);
  const manage = useSubscription((state) => state.manage);
  const remaining = useSubscription((state) => state.remainingFreeAnalyses());

  return (
    <Page
      title={pro ? 'SolvePath Pro ist aktiv.' : 'Mehr lernen. Weniger festhängen.'}
      subtitle={
        pro
          ? 'Dein Pro-Entitlement ist aktiv. Die Store-Verwaltung bleibt jederzeit erreichbar.'
          : `Free enthält ${FREE_REMOTE_ANALYSES_PER_DAY} KI-Analysen pro Tag. Pro entfernt das Tageslimit und schaltet die erweiterten Lernfunktionen frei.`
      }
      eyebrow="SolvePath Pro"
    >
      <HeroCard
        kicker={pro ? 'AKTIV' : 'PRO'}
        title={
          pro ? 'Alle Pro-Funktionen freigeschaltet' : 'Dein persönlicher Lernpfad ohne Tageslimit'
        }
        body={
          pro
            ? 'Danke für deine Unterstützung. Store-Abos werden über Apple bzw. Google verwaltet.'
            : 'Preis, Laufzeit und mögliche Testphase werden direkt aus deinem App Store oder Google Play angezeigt.'
        }
      >
        <Pill label={pro ? 'PRO AKTIV' : `${remaining} FREE-ANALYSEN HEUTE`} tone="primary" />
      </HeroCard>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>In Pro enthalten</SectionTitle>
        {features.map(([symbol, title, detail]) => (
          <Card key={title}>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
              <Pill label={symbol!} tone="accent" />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <AppText style={{ fontWeight: '800' }}>{title}</AppText>
                <AppText muted>{detail}</AppText>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {error ? (
        <Card>
          <AppText style={{ fontWeight: '800' }}>Abo-Hinweis</AppText>
          <AppText muted>{error}</AppText>
        </Card>
      ) : null}

      {!configured && !pro ? (
        <Card>
          <AppText style={{ fontWeight: '800' }}>Store-Konfiguration fehlt noch</AppText>
          <AppText muted>
            Der Release-Build benötigt die öffentlichen RevenueCat SDK-Keys und ein Offering mit dem
            Entitlement „pro“. Ohne diese Werte bleibt die App im Free-Modus.
          </AppText>
        </Card>
      ) : null}

      {pro ? (
        <AppButton
          label="Abo verwalten"
          busy={busy}
          onPress={() => {
            void manage();
          }}
        />
      ) : (
        <AppButton
          label="Pro-Angebote anzeigen"
          busy={busy}
          disabled={!configured}
          onPress={() => {
            void showPaywall();
          }}
        />
      )}

      <AppButton
        label="Käufe wiederherstellen"
        variant="ghost"
        busy={busy}
        disabled={!configured}
        onPress={() => {
          void restore();
        }}
      />

      <AppText variant="caption" muted style={{ textAlign: 'center' }}>
        Abos verlängern sich automatisch, sofern sie nicht rechtzeitig im jeweiligen Store gekündigt
        werden. Preis und Abrechnungszeitraum werden vor dem Kauf im Store angezeigt.
      </AppText>
    </Page>
  );
}
