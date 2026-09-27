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

type UnitInfo = { dimension: string; scale: number; offset?: number };

function normalizeUnitKey(unit: string): string {
  return unit
    .trim()
    .toLowerCase()
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/[·×]/g, '*')
    .replace(/\s+/g, '')
    .replace(/^ohm$/, 'ω');
}

const units: Record<string, UnitInfo> = {
  // length
  mm: { dimension: 'length', scale: 0.001 },
  cm: { dimension: 'length', scale: 0.01 },
  dm: { dimension: 'length', scale: 0.1 },
  m: { dimension: 'length', scale: 1 },
  km: { dimension: 'length', scale: 1000 },

  // area
  'mm^2': { dimension: 'area', scale: 1e-6 },
  'cm^2': { dimension: 'area', scale: 1e-4 },
  'm^2': { dimension: 'area', scale: 1 },
  'km^2': { dimension: 'area', scale: 1e6 },

  // volume
  ml: { dimension: 'volume', scale: 1e-6 },
  l: { dimension: 'volume', scale: 0.001 },
  'cm^3': { dimension: 'volume', scale: 1e-6 },
  'm^3': { dimension: 'volume', scale: 1 },

  // mass
  mg: { dimension: 'mass', scale: 1e-6 },
  g: { dimension: 'mass', scale: 0.001 },
  kg: { dimension: 'mass', scale: 1 },
  t: { dimension: 'mass', scale: 1000 },

  // time
  ms: { dimension: 'time', scale: 0.001 },
  s: { dimension: 'time', scale: 1 },
  min: { dimension: 'time', scale: 60 },
  h: { dimension: 'time', scale: 3600 },
  tag: { dimension: 'time', scale: 86400 },
  tage: { dimension: 'time', scale: 86400 },
  day: { dimension: 'time', scale: 86400 },
  days: { dimension: 'time', scale: 86400 },
  jahr: { dimension: 'time', scale: 31_557_600 },
  jahre: { dimension: 'time', scale: 31_557_600 },
  year: { dimension: 'time', scale: 31_557_600 },
  years: { dimension: 'time', scale: 31_557_600 },

  // motion
  'm/s': { dimension: 'speed', scale: 1 },
  'cm/s': { dimension: 'speed', scale: 0.01 },
  'km/s': { dimension: 'speed', scale: 1000 },
  'km/h': { dimension: 'speed', scale: 1000 / 3600 },
  'm/s^2': { dimension: 'acceleration', scale: 1 },
  'cm/s^2': { dimension: 'acceleration', scale: 0.01 },
  'n/kg': { dimension: 'acceleration', scale: 1 },

  // mechanics
  n: { dimension: 'force', scale: 1 },
  kn: { dimension: 'force', scale: 1000 },
  j: { dimension: 'energy', scale: 1 },
  kj: { dimension: 'energy', scale: 1000 },
  mj: { dimension: 'energy', scale: 1e6 },
  ev: { dimension: 'energy', scale: 1.602176634e-19 },
  wh: { dimension: 'energy', scale: 3600 },
  kwh: { dimension: 'energy', scale: 3.6e6 },
  w: { dimension: 'power', scale: 1 },
  kw: { dimension: 'power', scale: 1000 },
  mw: { dimension: 'power', scale: 1e6 },
  pa: { dimension: 'pressure', scale: 1 },
  kpa: { dimension: 'pressure', scale: 1000 },
  mpa: { dimension: 'pressure', scale: 1e6 },
  bar: { dimension: 'pressure', scale: 100_000 },
  'kg/m^3': { dimension: 'density', scale: 1 },
  'g/cm^3': { dimension: 'density', scale: 1000 },
  'kg*m/s': { dimension: 'momentum', scale: 1 },

  // waves
  hz: { dimension: 'frequency', scale: 1 },
  khz: { dimension: 'frequency', scale: 1000 },
  mhz: { dimension: 'frequency', scale: 1e6 },
  ghz: { dimension: 'frequency', scale: 1e9 },

  // electricity
  a: { dimension: 'current', scale: 1 },
  ma: { dimension: 'current', scale: 0.001 },
  v: { dimension: 'voltage', scale: 1 },
  mv: { dimension: 'voltage', scale: 0.001 },
  kv: { dimension: 'voltage', scale: 1000 },
  ω: { dimension: 'resistance', scale: 1 },
  'kω': { dimension: 'resistance', scale: 1000 },
  c: { dimension: 'charge', scale: 1 },
  'n/c': { dimension: 'electric_field', scale: 1 },
  'v/m': { dimension: 'electric_field', scale: 1 },

  // angles
  rad: { dimension: 'angle', scale: 180 / Math.PI },
  '°': { dimension: 'angle', scale: 1 },
  deg: { dimension: 'angle', scale: 1 },
  grad: { dimension: 'angle', scale: 1 },

  // temperature
  k: { dimension: 'temperature', scale: 1, offset: 0 },
  '°c': { dimension: 'temperature', scale: 1, offset: 273.15 },

  // dimensionless
  '%': { dimension: 'percent', scale: 1 },
};

export function unitInfo(unit: string | null): UnitInfo | null {
  return unit ? (units[normalizeUnitKey(unit)] ?? null) : null;
}

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
  if (suffix && !unitInfo(suffix)) return null;
  return { value: numeric, unit: suffix || null, variable: match[1] ?? null };
}

function canonicalValue(value: number, info: UnitInfo | null): number {
  if (!info) return value;
  return value * info.scale + (info.offset ?? 0);
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
  const actualValue = canonicalValue(actual.value, actualInfo);
  const target = canonicalValue(expectedValue, expectedInfo);
  const allowable = Math.abs(tolerance * (expectedInfo?.scale ?? 1));
  return Math.abs(actualValue - target) <= allowable;
}
