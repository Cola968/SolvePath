export type Quantity = { value: number; unit: string | null; variable: string | null };

const superscripts: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁻': '-',
};

function clean(input: string): string {
  return input
    .replace(/([0-9a-zA-Z])([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)/g, '$1^$2')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, (character) => superscripts[character] ?? character)
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseQuantity(input: string): Quantity | null {
  const value = clean(input).replace(/^[≈~]\s*/, '');
  const match = value.match(
    /^(?:([A-Za-z][\w₀-₉]*)\s*=\s*)?([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*(?:\*|·|×)\s*10\s*\^\s*([+-]?\d+)|[eE]([+-]?\d+))?\s*(.*)$/,
  );
  if (!match) return null;
  const numeric = Number(match[2]) * 10 ** Number(match[3] ?? match[4] ?? 0);
  if (!Number.isFinite(numeric)) return null;
  const suffix = (match[5] ?? '').trim();
  if (suffix && !/^(?:km\/s|m\/s(?:\^2)?|n\/kg|n|jahre?|years?|rad|°|grad|km|m|s)$/i.test(suffix))
    return null;
  return { value: numeric, unit: suffix || null, variable: match[1] ?? null };
}

type UnitInfo = { dimension: string; scale: number };
const units: Record<string, UnitInfo> = {
  'm/s': { dimension: 'speed', scale: 1 },
  'km/s': { dimension: 'speed', scale: 1000 },
  'm/s^2': { dimension: 'acceleration', scale: 1 },
  'n/kg': { dimension: 'acceleration', scale: 1 },
  n: { dimension: 'force', scale: 1 },
  jahr: { dimension: 'time', scale: 1 },
  jahre: { dimension: 'time', scale: 1 },
  year: { dimension: 'time', scale: 1 },
  years: { dimension: 'time', scale: 1 },
  rad: { dimension: 'angle', scale: 180 / Math.PI },
  '°': { dimension: 'angle', scale: 1 },
  grad: { dimension: 'angle', scale: 1 },
  km: { dimension: 'length', scale: 1000 },
  m: { dimension: 'length', scale: 1 },
  s: { dimension: 'time_seconds', scale: 1 },
};

export function unitInfo(unit: string | null): UnitInfo | null {
  return unit ? (units[unit.toLowerCase().replace('²', '^2')] ?? null) : null;
}

export function sameQuantity(
  actual: Quantity,
  expectedValue: number,
  expectedUnit: string | null,
  tolerance: number,
): boolean {
  const actualInfo = unitInfo(actual.unit);
  const expectedInfo = unitInfo(expectedUnit);
  if (actual.unit && !actualInfo) return false;
  if (
    expectedUnit &&
    actual.unit &&
    (!expectedInfo || expectedInfo.dimension !== actualInfo?.dimension)
  )
    return false;
  const actualValue = actual.value * (actualInfo?.scale ?? 1);
  const target = expectedValue * (expectedInfo?.scale ?? 1);
  const allowable = tolerance * (expectedInfo?.scale ?? 1);
  return Math.abs(actualValue - target) <= allowable;
}
