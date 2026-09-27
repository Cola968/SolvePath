import { Platform } from 'react-native';

export async function extractTaskTextFromImage(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Lokale Bilderkennung ist derzeit nur auf Android und iOS verfügbar.');
  }

  try {
    const module = await import('expo-text-extractor');
    if (!module.isSupported) {
      throw new Error('Die lokale Texterkennung wird auf diesem Gerät nicht unterstützt.');
    }
    const lines = await module.extractTextFromImage(uri);
    const text = lines.join('\n').trim();
    if (text.length < 3) {
      throw new Error(
        'Auf dem Bild wurde zu wenig Text erkannt. Fotografiere die Aufgabe näher und mit gutem Kontrast.',
      );
    }
    return text;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Die lokale Texterkennung ist fehlgeschlagen.');
  }
}
