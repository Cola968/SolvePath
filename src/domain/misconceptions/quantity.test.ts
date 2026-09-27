import { describe, expect, it } from 'vitest';
import { demoProblems } from '../../data/problems';
import { checkResult } from './check';
import { parseQuantity } from './quantity';

const satellite = demoProblems.find((problem) => problem.id === 'satellite-orbit')!;

describe('quantity-aware result checks', () => {
  it('accepts decimal comma, unit conversions, and scientific notation', () => {
    for (const answer of ['7,67 km/s', '7.67 km/s', '7670 m/s', '7.67 * 10^3 m/s'])
      expect(checkResult(satellite, answer).status).toBe('correct');
  });

  it('rejects incompatible units and numbers outside tolerance', () => {
    expect(checkResult(satellite, '7670 N').status).toBe('retry');
    expect(checkResult(satellite, '7.67 m/s').status).toBe('misconception');
    const result = checkResult(satellite, '7.67 m/s');
    if (result.status === 'misconception')
      expect(result.mistake.code).toBe('wrong_unit_conversion');
    expect(checkResult(satellite, '7000 m/s').status).toBe('retry');
  });

  it('parses variable, sign, exponent, and unit separately', () => {
    expect(parseQuantity('v = -7,67 · 10³ m/s')).toEqual({
      variable: 'v',
      value: -7670,
      unit: 'm/s',
    });
  });
});
