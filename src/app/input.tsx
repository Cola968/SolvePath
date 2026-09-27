import { useEffect, useMemo, useRef, useState } from 'react';
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
  SectionTitle,
} from '../components/ui';
import { demoProblems } from '../data/problems';
import { useSession } from '../features/session/store';
import { type AnalysisImage } from '../services/problem-analyzer';
import { extractTaskTextFromImage } from '../services/on-device-ocr';
import { radius, spacing, useTheme } from '../theme/tokens';

type Filter = 'physics' | 'math';

export default function InputScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { photo } = useLocalSearchParams<{ photo?: string }>();
  const autoCameraOpened = useRef(false);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<Filter>('math');
  const [image, setImage] = useState<AnalysisImage | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrComplete, setOcrComplete] = useState(false);
  const analyze = useSession((state) => state.analyze);
  const busy = useSession((state) => state.busy);
  const error = useSession((state) => state.error);
  const analysisStage = useSession((state) => state.analysisStage);

  const visibleProblems = useMemo(
    () => demoProblems.filter((problem) => problem.subject === filter).slice(0, 4),
    [filter],
  );

  useEffect(() => {
    if (photo === '1' && !autoCameraOpened.current) {
      autoCameraOpened.current = true;
      void selectImage('camera');
    }
  }, [photo]);

  async function runOcr(selectedImage: AnalysisImage) {
    setInputError(null);
    setOcrBusy(true);
    setOcrComplete(false);
    try {
      const result = await extractTaskTextFromImage(selectedImage.uri);
      setImage({
        ...selectedImage,
        uri: result.normalizedImageUri,
        mimeType: 'image/jpeg',
        name: 'solvepath-scan.jpg',
      });
      setText(result.text);
      setOcrComplete(true);
    } catch (cause) {
      setInputError(
        cause instanceof Error
          ? cause.message
          : 'Die Texterkennung ist fehlgeschlagen. Du kannst den Text trotzdem manuell eingeben.',
      );
    } finally {
      setOcrBusy(false);
    }
  }

  async function selectImage(source: 'camera' | 'gallery') {
    setInputError(null);
    setReady(false);
    setOcrComplete(false);

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
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 1,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 1,
            });

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

      if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(mimeType)) {
        throw new Error('Dieses Bildformat kann nicht verarbeitet werden.');
      }

      if (asset.fileSize && asset.fileSize > 20 * 1024 * 1024) {
        throw new Error('Das Bild ist größer als 20 MB. Bitte wähle ein kleineres Bild.');
      }

      const selectedImage: AnalysisImage = {
        uri: asset.uri,
        name: asset.fileName ?? 'aufgabe',
        mimeType,
        size: asset.fileSize,
      };

      setImage(selectedImage);
      setText('');
      await runOcr(selectedImage);
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
      setOcrComplete(false);
    } catch (cause) {
      setInputError(cause instanceof Error ? cause.message : 'Einfügen fehlgeschlagen.');
    }
  }

  async function submit() {
    setReady(false);
    setInputError(null);
    if (await analyze(text, undefined, 'local')) {
      setReady(true);
    }
  }

  const stages = [
    'Aufgabe lesen',
    'Gegebenes und Gesuchtes erkennen',
    'Lösungsweg bestimmen',
    'Lernpfad vorbereiten',
  ];

  return (
    <Page
      title="Aufgabe hinzufügen"
      subtitle="Scanne die Aufgabe oder gib sie direkt ein. Du kannst erkannten Text immer korrigieren."
      eyebrow="Schritt 1"
    >
      <PathRail
        current={0}
        steps={['Aufgabe', 'Diagnose', 'Methode', 'Lösen', 'Prüfen', 'Profil']}
      />

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Foto oder Screenshot</SectionTitle>

        {!image ? (
          <Card>
            <View style={{ gap: spacing.xs }}>
              <AppText variant="lead">Aufgabe scannen</AppText>
              <AppText muted>
                Fotografiere nur den relevanten Aufgabentext. Gute Beleuchtung und wenig Rand
                verbessern die Erkennung.
              </AppText>
            </View>
            <AppButton
              label="Kamera öffnen"
              onPress={() => {
                void selectImage('camera');
              }}
            />
            <AppButton
              label="Aus Galerie wählen"
              variant="secondary"
              onPress={() => {
                void selectImage('gallery');
              }}
            />
          </Card>
        ) : (
          <Card>
            <Image
              source={{ uri: image.uri }}
              accessibilityLabel="Vorschau der ausgewählten Aufgabe"
              style={{
                width: '100%',
                height: 230,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceAlt,
              }}
              resizeMode="contain"
            />

            {ocrBusy ? (
              <Feedback
                title="Text wird erkannt …"
                message="Das Bild wird zuerst lokal vereinheitlicht und danach auf deinem Gerät gelesen."
              />
            ) : ocrComplete ? (
              <Feedback
                title="Text erkannt"
                message="Prüfe den Text unten kurz. Zahlen, Brüche und Sonderzeichen kannst du direkt korrigieren."
                kind="success"
              />
            ) : inputError ? (
              <Feedback
                title="Foto konnte nicht sicher gelesen werden"
                message="Versuche die Erkennung erneut oder gib den Aufgabentext unten manuell ein."
                kind="error"
              />
            ) : null}

            {!ocrBusy ? (
              <View style={{ gap: spacing.sm }}>
                <AppButton
                  label="Erkennung erneut versuchen"
                  variant="secondary"
                  onPress={() => {
                    void runOcr(image);
                  }}
                />
                <AppButton
                  label="Anderes Bild wählen"
                  variant="ghost"
                  onPress={() => {
                    setImage(null);
                    setText('');
                    setInputError(null);
                    setOcrComplete(false);
                  }}
                />
              </View>
            ) : null}
          </Card>
        )}
      </View>

      <View style={{ gap: spacing.md }}>
        <SectionTitle>{image ? 'Erkannter Aufgabentext' : 'Oder Text eingeben'}</SectionTitle>
        <AppInput
          accessibilityLabel="Aufgabentext"
          placeholder="z. B. Löse 3x + 5 = 20"
          value={text}
          onChangeText={(value) => {
            setText(value);
            setReady(false);
          }}
          multiline
          style={{ minHeight: image ? 150 : 170 }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <AppText variant="caption" muted>
            {text.trim().length} Zeichen
          </AppText>
          <AppButton
            label="Einfügen"
            variant="ghost"
            onPress={() => {
              void paste();
            }}
          />
        </View>
      </View>

      {inputError ? <Feedback title="Hinweis" message={inputError} kind="error" /> : null}
      {error ? <Feedback title="Noch nicht unterstützt" message={error} kind="error" /> : null}

      {busy ? (
        <Card>
          {stages.map((stage, index) => (
            <View
              key={stage}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                opacity: index > analysisStage ? 0.45 : 1,
              }}
            >
              <AppText style={{ color: index < analysisStage ? colors.success : colors.primary }}>
                {index < analysisStage ? '✓' : index === analysisStage ? '●' : '○'}
              </AppText>
              <AppText>{stage}</AppText>
            </View>
          ))}
        </Card>
      ) : null}

      {ready ? (
        <Feedback
          title="Lernpfad bereit"
          message="Die Aufgabe wurde erkannt. Als Nächstes bestimmst du, wo du festhängst."
          kind="success"
        />
      ) : null}

      {ready ? (
        <AppButton label="Mit Diagnose starten" onPress={() => router.push('/stuck')} />
      ) : (
        <AppButton
          label="Aufgabe analysieren"
          onPress={() => {
            void submit();
          }}
          disabled={ocrBusy || text.trim().length < 3}
          busy={busy || ocrBusy}
        />
      )}

      <View style={{ gap: spacing.md }}>
        <SectionTitle>Beispiele</SectionTitle>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Choice
              label="Mathe"
              selected={filter === 'math'}
              onPress={() => setFilter('math')}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Choice
              label="Physik"
              selected={filter === 'physics'}
              onPress={() => setFilter('physics')}
            />
          </View>
        </View>

        {visibleProblems.map((problem) => (
          <Choice
            key={problem.id}
            label={`${problem.title} · ${problem.topic}`}
            onPress={() => {
              setText(problem.originalText);
              setImage(null);
              setInputError(null);
              setOcrComplete(false);
              setReady(false);
            }}
          />
        ))}
      </View>
    </Page>
  );
}
