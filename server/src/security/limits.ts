export const MAX_TEXT_LENGTH = 12_000;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export function validateText(value: unknown, imagePresent: boolean): string {
  if (typeof value !== 'string')
    throw new ApiError(400, 'invalid_text', 'Text muss eine Zeichenkette sein.');
  const text = value.trim();
  if (text.length > MAX_TEXT_LENGTH)
    throw new ApiError(413, 'text_too_large', 'Der Aufgabentext ist zu lang.');
  if (!imagePresent && text.length < 10)
    throw new ApiError(
      400,
      'text_too_short',
      'Beschreibe die Aufgabe mit mindestens zehn Zeichen.',
    );
  return text;
}

export function validateImage(image: Buffer, mimeType: string): void {
  if (!IMAGE_MIME_TYPES.includes(mimeType as (typeof IMAGE_MIME_TYPES)[number]))
    throw new ApiError(415, 'unsupported_image', 'Nur JPEG, PNG und WebP werden unterstützt.');
  if (image.length === 0 || image.length > MAX_IMAGE_BYTES)
    throw new ApiError(413, 'image_too_large', 'Das Bild muss kleiner als 8 MB sein.');
  const valid =
    (mimeType === 'image/jpeg' && image[0] === 0xff && image[1] === 0xd8) ||
    (mimeType === 'image/png' &&
      image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (mimeType === 'image/webp' &&
      image.toString('ascii', 0, 4) === 'RIFF' &&
      image.toString('ascii', 8, 12) === 'WEBP');
  if (!valid) throw new ApiError(415, 'invalid_image', 'Die Bilddatei ist ungültig.');
}
