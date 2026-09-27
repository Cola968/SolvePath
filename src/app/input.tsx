import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { Image, View } from 'react-native';
import {
  AppButton,
  AppInput,
  AppText,
  Card,
  Choice,
  Feedback,
  Page,
  PathRail,
  Pill,
  SectionTitle,
} from '../components/ui';
import { demoProblems } from '../data/problems';
import { useSession } from '../features/session/store';
import { type AnalysisImage } from '../services/problem-analyzer';
import { extractTaskTextFromImage } from '../services/on-device-ocr';
import { spacing } from '../theme/tokens';

type Filter = 'all' | 'physics' | 'math';
type BetaAnalysisMode = 'local' | 'demo';

export default function InputScreen() {
  const router = useRouter();
  const { photo } = useLocalSearchParams<{ photo?: string }>();
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [mode, setMode] = useState<BetaAnalysisMode>('local');
  const [image, setImage] = useState<AnalysisImage | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const analyze = useSession((state) => state.analyze);
  const busy = useSession((state) => state.busy);
  const error = useSession((state) => state.error);
  const analysisStage = useSession((state) => state.analysisStage);

  const visibleProblems = useMemo(
    () =>
      filter === 'all'
        ? demoProblems
        : demoProblems.filter((problem) => problem.subject === filter),
    [filter],
  );

  async function selectImage(source: 'camera' | 'gallery') {
    setInputError(null);
    setReady(false);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setInputError('Für ein Foto benötigt SolvePath die Kamera-Berechtigung.');
          return;
        }
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) throw new Error('Das Bild konnte nicht ausgewählt werden.');
      const extension = (asset.fileName ?? asset.uri).split('?')[0]?.toLowerCase();
      const mimeType =
        asset.mimeType ??
        (extension?.endsWith('.png')
          ? 'image/png'
          : extension?.endsWith('.webp')
            ? 'image/webp'
            : 'image/jpeg');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType))
        throw new Error('Bitte wähle ein JPEG-, PNG- oder WebP-Bild.');
      if (asset.fileSize && asset.fileSize > 8 * 1024 * 1024)
        throw new Error('Das Bild ist größer als 8 MB. Bitte wähle ein kleineres Bild.');
      const selectedImage = {
        uri: asset.uri,
        name: asset.fileName ?? `aufgabe.${mimeType.split('/')[1]}`,
        mimeType,
        size: asset.fileSize,
      };
      setImage(selectedImage);
      setOcrBusy(true);
      try {
        const recognized = await extractTaskTextFromImage(asset.uri);
        setText(recognized);
        setMode('local');
      } finally {
        setOcrBusy(false);
      }
    } catch (cause) {
      setInputError(cause instanceof Error ? cause.message : 'Bildauswahl fehlgeschlagen.');
    }
  }

  async function paste() {
    try {
      const value = await Clipboard.getStringAsync();
      if (!value.trim()) throw new Error('Die Zwischenablage enthält keinen Text.');
      setText(value);
      setReady(false);
      setInputError(null);
    } catch (cause) {
      setInputError(cause instanceof Error ? cause.message : 'Einfügen fehlgeschlagen.');
    }
  }

  async function submit() {
    setReady(false);
    setInputError(null);
    if (await analyze(text, undefined, mode)) {
      setImage(null);
      setReady(true);
    }
  }

  const stages = [
    'Aufgabe lesen',
    'Gegebenes und Gesuchtes erkennen',
    'Lösungswege prüfen',
    'Deinen Lernpfad erstellen',
  ];

  return (
    <Page
      title="Bring deine Aufgabe mit."
      subtitle="SolvePath zerlegt sie in Entscheidungen, statt sofort die fertige Lösung auszuspucken."
      eyebrow="01 · Aufgabe"
    >
      <PathRail
        current={0}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Lernprofil']}
      />

      {photo === '1' && !image ? (
        <Feedback
          title="Foto oder Screenshot auswählen"
          message="Nimm ein Foto auf oder wähle ein Bild aus der Galerie. Screenshots findest du ebenfalls dort."
        />
      ) : null}

      <Card elevated>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <AppText variant="lead">Aufgabentext</AppText>
            <AppText muted>
              Kopiere die Aufgabe möglichst vollständig – inklusive Zahlen, Einheiten und Frage.
            </AppText>
          </View>
          <Pill label="TEXT" tone="accent" />
        </View>

        <AppInput
          accessibilityLabel="Aufgabentext"
          placeholder="Zum Beispiel: Ein Satellit befindet sich 400 km über der Erdoberfläche …"
          value={text}
          onChangeText={(value) => {
            setText(value);
            setReady(false);
          }}
          multiline
          style={{ minHeight: 190 }}
        />

        <AppText variant="caption" muted>
          {text.trim().length} Zeichen · Lokale Analyse benötigt keinen Account und keine API-Kosten
        </AppText>

        <AppButton
          label="Aus Zwischenablage einfügen"
          variant="secondary"
          onPress={() => {
            void paste();
          }}
        />
        <View style={{ gap: spacing.sm }}>
          <AppButton
            label="Kamera öffnen"
            variant="secondary"
            onPress={() => {
              void selectImage('camera');
            }}
          />
          <AppButton
            label="Bild / Screenshot auswählen"
            variant="secondary"
            onPress={() => {
              void selectImage('gallery');
            }}
          />
        </View>

        {image ? (
          <View style={{ gap: spacing.sm }}>
            <Image
              source={{ uri: image.uri }}
              accessibilityLabel="Vorschau des Aufgabenbildes"
              style={{ width: '100%', height: 220, borderRadius: 12 }}
              resizeMode="contain"
            />
            <AppText variant="caption" muted>
              {image.name}
            </AppText>
            <AppButton
              label="Bild entfernen"
              variant="ghost"
              onPress={() => {
                setImage(null);
                setReady(false);
              }}
            />
          </View>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          <AppText variant="lead">Analysemodus</AppText>
          <Choice
            label="Lokal · kostenlos, privat, ohne API-Key"
            selected={mode === 'local'}
            onPress={() => {
              setMode('local');
              setReady(false);
            }}
          />
          <Choice
            label={`Beispielbibliothek · ${demoProblems.length} vollständige SolvePaths`}
            selected={mode === 'demo'}
            onPress={() => {
              setMode('demo');
              setReady(false);
            }}
          />
        </View>

        {ocrBusy ? (
          <Feedback
            title="Text wird lokal erkannt"
            message="Die Bilderkennung läuft direkt auf deinem Gerät – ohne Upload und ohne API-Key."
          />
        ) : null}
        {inputError ? <Feedback title="Eingabe prüfen" message={inputError} kind="error" /> : null}

        {error ? <Feedback title="Noch nicht erkannt" message={error} kind="error" /> : null}


        {busy ? (
          <Card>
            {stages.map((stage, index) => (
              <AppText key={stage} muted={index > analysisStage}>
                {index < analysisStage ? '✓' : index === analysisStage ? '●' : '○'} {stage}
              </AppText>
            ))}
          </Card>
        ) : null}

        {ready ? (
          <Feedback
            title="Dein SolvePath ist bereit"
            message="Die Aufgabe wurde analysiert. Starte jetzt mit deiner Diagnose."
            kind="success"
          />
        ) : null}

        {ready ? (
          <AppButton label="Diagnose starten" onPress={() => router.push('/stuck')} />
        ) : null}

        <AppButton
          label={error ? 'Analyse erneut versuchen' : 'Lösungsweg analysieren →'}
          onPress={() => {
            void submit();
          }}
          disabled={ocrBusy || text.trim().length < 3}
          busy={busy || ocrBusy}
        />
      </Card>

      <View style={{ gap: spacing.md }}>
        <SectionTitle aside={<Pill label={`${demoProblems.length} DEMOS`} tone="neutral" />}>
          Sofort ausprobieren
        </SectionTitle>

        <View style={{ gap: spacing.sm }}>
          <Choice label="Alle" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Choice
            label="Physik"
            selected={filter === 'physics'}
            onPress={() => setFilter('physics')}
          />
          <Choice
            label="Mathematik"
            selected={filter === 'math'}
            onPress={() => setFilter('math')}
          />
        </View>

        {visibleProblems.map((problem) => (
          <Card key={problem.id}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}
            >
              <View style={{ flex: 1, gap: spacing.xs }}>
                <AppText style={{ fontWeight: '800' }}>{problem.title}</AppText>
                <AppText variant="caption" muted>
                  {problem.topic}
                </AppText>
              </View>
              <Pill
                label={problem.subject === 'physics' ? 'PHYSIK' : 'MATHE'}
                tone={problem.subject === 'physics' ? 'primary' : 'accent'}
              />
            </View>

            <AppText muted numberOfLines={3}>
              {problem.originalText}
            </AppText>

            <AppButton
              label="Diese Aufgabe testen"
              variant="secondary"
              onPress={() => {
                setText(problem.originalText);
                setImage(null);
                setMode('local');
                setReady(false);
              }}
            />
          </Card>
        ))}
      </View>
    </Page>
  );
}
