import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { extractTextFromImage, isSupported } from 'expo-text-extractor';
import { Platform } from 'react-native';

export type OcrResult = {
  text: string;
  normalizedImageUri: string;
};

function cleanRecognizedText(lines: string[]): string {
  return lines
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function normalizeForOcr(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1800 } }],
    {
      compress: 0.94,
      format: SaveFormat.JPEG,
    },
  );
  return result.uri;
}

async function recognize(uri: string): Promise<string> {
  const lines = await extractTextFromImage(uri);
  return cleanRecognizedText(lines);
}

export async function extractTaskTextFromImage(uri: string): Promise<OcrResult> {
  if (Platform.OS === 'web') {
    throw new Error('Lokale Bilderkennung ist derzeit nur auf Android und iOS verfügbar.');
  }
  if (!isSupported) {
    throw new Error('Die lokale Texterkennung wird auf diesem Gerät nicht unterstützt.');
  }

  let normalizedImageUri = uri;
  let normalizedError: unknown;

  try {
    normalizedImageUri = await normalizeForOcr(uri);
    const text = await recognize(normalizedImageUri);
    if (text.length >= 3) return { text, normalizedImageUri };
  } catch (error) {
    normalizedError = error;
  }

  // Fallback for devices/providers whose picker URI works better directly than after conversion.
  try {
    const text = await recognize(uri);
    if (text.length >= 3) return { text, normalizedImageUri: uri };
  } catch (directError) {
    const message =
      directError instanceof Error
        ? directError.message
        : normalizedError instanceof Error
          ? normalizedError.message
          : '';
    throw new Error(
      message
        ? `Das Foto konnte lokal nicht gelesen werden. ${message}`
        : 'Das Foto konnte lokal nicht gelesen werden. Wähle das Bild erneut oder gib den Text manuell ein.',
    );
  }

  throw new Error(
    'Auf dem Bild wurde kein ausreichend lesbarer Text erkannt. Schneide die Aufgabe enger zu, nutze gutes Licht oder korrigiere den Text manuell.',
  );
}
