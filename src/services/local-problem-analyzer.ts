import { demoProblems } from '../data/problems';
import type { ProblemAnalysis } from '../domain/problem/schema';

const clean = (value: string) =>
  value
    .toLowerCase()
    .replace(/−/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/:/g, '/')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

const normalized = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

function hashText(text: string): string {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function fmt(value: number, digits = 6): string {
  if (Number.isInteger(value)) return String(value);
  return Number(value.toFixed(digits)).toString().replace('.', ',');
}

function localId(kind: string, text: string): string {
  return `local-${kind}-${hashText(clean(text))}`;
}

function exactDemo(text: string): ProblemAnalysis | undefined {
  const input = normalized(text);
  return demoProblems.find((problem) => normalized(problem.originalText) === input);
}

type Tokens = { values: string[]; index: number };

function tokenize(expression: string): Tokens | null {
  const values = expression.match(/\d+(?:\.\d+)?|[()+\-*/^]/g) ?? [];
  const joined = values.join('');
  if (!values.length || joined !== expression.replace(/\s+/g, '')) return null;
  return { values, index: 0 };
}

function parseArithmetic(expression: string): number | null {
  const tokens = tokenize(expression);
  if (!tokens) return null;

  const peek = () => tokens.values[tokens.index];
  const take = () => tokens.values[tokens.index++];

  const primary = (): number => {
    const token = take();
    if (token === '(') {
      const value = addSub();
      if (take() !== ')') throw new Error('missing parenthesis');
      return value;
    }
    if (token === '+') return primary();
    if (token === '-') return -primary();
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error('number expected');
    return value;
  };

  const power = (): number => {
    let value = primary();
    if (peek() === '^') {
      take();
      value **= power();
    }
    return value;
  };

  const mulDiv = (): number => {
    let value = power();
    while (peek() === '*' || peek() === '/') {
      const op = take();
      const right = power();
      if (op === '/' && right === 0) throw new Error('division by zero');
      value = op === '*' ? value * right : value / right;
    }
    return value;
  };

  const addSub = (): number => {
    let value = mulDiv();
    while (peek() === '+' || peek() === '-') {
      const op = take();
      const right = mulDiv();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  };

  try {
    const value = addSub();
    if (tokens.index !== tokens.values.length || !Number.isFinite(value)) return null;
    return value;
  } catch {
    return null;
  }
}

function arithmeticAnalysis(text: string): ProblemAnalysis | null {
  const source = clean(text);
  if (!/\b(berechne|rechne|calculate|compute)\b/.test(source)) return null;
  const raw = source
    .replace(/^.*?\b(?:berechne|rechne|calculate|compute)\b\s*/i, '')
    .replace(/[€$!?;.]+$/g, '')
    .trim();
  if (/[a-zäöüß]/i.test(raw) || !/[+\-*/^]/.test(raw)) return null;
  const result = parseArithmetic(raw);
  if (result === null) return null;
  const display = fmt(result);

  return {
    id: localId('arithmetic', text),
    subject: 'math',
    topic: 'Grundrechenarten',
    title: 'Rechenausdruck',
    originalText: text.trim(),
    given: [{ symbol: 'Term', value: raw.replace(/\*/g, '·'), meaning: 'Zu berechnender Ausdruck' }],
    unknowns: [{ symbol: 'Wert', meaning: 'Wert des Rechenausdrucks' }],
    principle: {
      id: 'operator_precedence',
      name: 'Reihenfolge der Rechenoperationen',
      explanation:
        'Klammern und Potenzen werden vor Multiplikation und Division und diese wiederum vor Addition und Subtraktion berechnet.',
    },
    formulas: [
      {
        id: 'precedence',
        expression: 'Klammern → Potenzen → Punktrechnung → Strichrechnung',
        explanation: 'Bei gleichem Rang wird von links nach rechts gerechnet.',
      },
    ],
    hints: [
      { level: 1, text: 'Markiere zuerst die Operationen mit dem höchsten Vorrang.' },
      { level: 2, text: 'Rechne immer nur einen sicheren Teilschritt und setze danach neu an.' },
      { level: 3, text: 'Beachte: Multiplikation und Division kommen vor Addition und Subtraktion.' },
      { level: 4, text: `Der Ausgangsterm lautet ${raw.replace(/\*/g, '·')}.` },
      { level: 5, text: 'Kontrolliere dein Zwischenergebnis mit einer groben Überschlagsrechnung.' },
      { level: 6, text: `Der vollständig berechnete Wert ist ${display}.` },
    ],
    reasoningSteps: [
      {
        id: 'arith-order',
        title: 'Vorrang bestimmen',
        question: 'Welche Rechenoperation hat im aktuellen Term zuerst Vorrang?',
        answer: 'Klammern/Potenzen, danach Punkt- vor Strichrechnung',
        explanation: 'Die Rechenregeln bestimmen die Reihenfolge, nicht die Leserichtung allein.',
        hint: 'Suche zuerst Klammern, Potenzen, Multiplikation oder Division.',
      },
      {
        id: 'arith-calc',
        title: 'Schrittweise rechnen',
        question: 'Was ist jetzt der nächste sichere Teilschritt?',
        answer: 'Die Operation mit dem aktuell höchsten Vorrang ausführen',
        explanation: 'Einzelschritte reduzieren Vorzeichen- und Reihenfolgefehler.',
        hint: 'Verändere pro Zeile möglichst nur einen Teil des Terms.',
      },
      {
        id: 'arith-result',
        title: 'Ergebnis prüfen',
        question: 'Welchen Wert erhältst du am Ende?',
        answer: display,
        explanation: 'Der Term wurde unter Beachtung der Rechenreihenfolge vollständig ausgewertet.',
        hint: 'Vergleiche Vorzeichen und Größenordnung mit deinem Überschlag.',
      },
    ],
    commonMistakes: [
      {
        id: 'arithmetic_order',
        label: 'Reihenfolge vertauscht',
        explanation: 'Punkt- und Strichrechnung wurden in der falschen Reihenfolge ausgeführt.',
        correction: 'Arbeite nach Klammern, Potenzen, Punktrechnung und anschließend Strichrechnung.',
        triggers: ['Punkt vor Strich vergessen', 'von links ohne Vorrang'],
      },
    ],
    strategySelection: {
      type: 'strategySelection',
      question: 'Welche Strategie ist für diesen Term sinnvoll?',
      options: ['Rechenvorrang systematisch anwenden', 'Alle Zahlen zuerst addieren', 'Nur von links nach rechts rechnen'],
      correctOption: 'Rechenvorrang systematisch anwenden',
      explanation: 'Der Rechenvorrang verhindert falsche Zwischenschritte.',
    },
    correctResult: {
      display,
      numericValue: result,
      tolerance: Math.max(1e-9, Math.abs(result) * 1e-9),
      acceptedAnswers: [display, String(result)],
      explanation: `Unter korrekter Rechenreihenfolge ergibt sich ${display}.`,
    },
  };
}

function linearEquationAnalysis(text: string): ProblemAnalysis | null {
  const compact = clean(text).replace(/\s+/g, '');
  if (!compact.includes('=') || !compact.includes('x')) return null;
  const equation = compact.replace(/^.*?(?=[+\-]?\d*\.?\d*x)/, '').replace(/[.;!?].*$/, '');
  const match = equation.match(/^([+\-]?(?:\d+(?:\.\d+)?)?)x([+\-]\d+(?:\.\d+)?)?=([+\-]?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const aRaw = match[1] ?? '';
  const a = aRaw === '' || aRaw === '+' ? 1 : aRaw === '-' ? -1 : Number(aRaw);
  const b = match[2] ? Number(match[2]) : 0;
  const c = Number(match[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || a === 0) return null;
  const x = (c - b) / a;
  const display = `x = ${fmt(x)}`;

  return {
    id: localId('linear', text),
    subject: 'math',
    topic: 'Lineare Gleichungen',
    title: 'Lineare Gleichung lösen',
    originalText: text.trim(),
    given: [{ symbol: 'Gleichung', value: equation.replace(/\*/g, '·'), meaning: 'Ausgangsgleichung' }],
    unknowns: [{ symbol: 'x', meaning: 'Unbekannte der Gleichung' }],
    principle: {
      id: 'equivalence_transformations',
      name: 'Äquivalenzumformungen',
      explanation: 'Auf beiden Seiten der Gleichung wird immer dieselbe Rechenoperation durchgeführt.',
    },
    formulas: [
      {
        id: 'linear_solution',
        expression: 'ax + b = c  ⇒  x = (c − b) / a',
        explanation: 'Zuerst wird der konstante Term entfernt und anschließend durch den x-Faktor geteilt.',
      },
    ],
    hints: [
      { level: 1, text: 'Bringe zuerst den Term ohne x auf die andere Seite.' },
      { level: 2, text: 'Führe jede Umformung auf beiden Seiten der Gleichung aus.' },
      { level: 3, text: b === 0 ? 'Der konstante Term neben x ist bereits 0.' : `Entferne zunächst ${fmt(b)} neben dem x-Term.` },
      { level: 4, text: `Danach steht links nur noch ${fmt(a)}x.` },
      { level: 5, text: `Teile anschließend beide Seiten durch ${fmt(a)}.` },
      { level: 6, text: `Die Lösung lautet ${display}.` },
    ],
    reasoningSteps: [
      {
        id: 'linear-isolate-term',
        title: 'Konstanten entfernen',
        question: 'Welche Operation isoliert zunächst den x-Term?',
        answer: b === 0 ? 'Keine weitere Konstante muss entfernt werden.' : `${fmt(-b)} auf beiden Seiten anwenden`,
        explanation: 'Der konstante Summand neben x wird durch die Gegenoperation beseitigt.',
        hint: 'Nutze die Gegenoperation zum konstanten Summanden.',
      },
      {
        id: 'linear-divide',
        title: 'Nach x auflösen',
        question: 'Was machst du mit dem Faktor vor x?',
        answer: `Beide Seiten durch ${fmt(a)} teilen`,
        explanation: 'Damit bleibt x allein stehen.',
        hint: 'Division ist die Gegenoperation zur Multiplikation.',
      },
      {
        id: 'linear-check',
        title: 'Probe',
        question: 'Welche Lösung erfüllt die Ausgangsgleichung?',
        answer: display,
        explanation: 'Einsetzen der Lösung liefert auf beiden Seiten denselben Wert.',
        hint: 'Setze deinen x-Wert in die ursprüngliche Gleichung ein.',
      },
    ],
    commonMistakes: [
      {
        id: 'linear_sign',
        code: 'sign_error',
        label: 'Vorzeichen beim Umstellen',
        explanation: 'Beim Entfernen eines Summanden wurde die Gegenoperation mit falschem Vorzeichen verwendet.',
        correction: 'Schreibe die gleiche Operation ausdrücklich auf beide Seiten.',
        triggers: [fmt(-x), 'Vorzeichenfehler'],
      },
    ],
    strategySelection: {
      type: 'strategySelection',
      question: 'Welche Methode passt hier?',
      options: ['Äquivalenzumformungen', 'Satz des Pythagoras', 'Prozentrechnung'],
      correctOption: 'Äquivalenzumformungen',
      explanation: 'Die Gleichung ist linear in x.',
    },
    correctResult: {
      display,
      numericValue: x,
      tolerance: Math.max(1e-9, Math.abs(x) * 1e-9),
      acceptedAnswers: [display, fmt(x), String(x)],
      explanation: `Nach dem Isolieren von x ergibt sich ${display}.`,
    },
  };
}

function percentageAnalysis(text: string): ProblemAnalysis | null {
  const source = clean(text);
  const match = source.match(/(\d+(?:\.\d+)?)\s*%\s*(?:von|of)\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const p = Number(match[1]);
  const base = Number(match[2]);
  if (!Number.isFinite(p) || !Number.isFinite(base)) return null;
  const result = (p / 100) * base;
  const display = fmt(result);
  return {
    id: localId('percent', text),
    subject: 'math',
    topic: 'Prozentrechnung',
    title: 'Prozentwert berechnen',
    originalText: text.trim(),
    given: [
      { symbol: 'p', value: `${fmt(p)} %`, meaning: 'Prozentsatz' },
      { symbol: 'G', value: fmt(base), meaning: 'Grundwert' },
    ],
    unknowns: [{ symbol: 'W', meaning: 'Prozentwert' }],
    principle: {
      id: 'percentage_value',
      name: 'Prozentwert',
      explanation: 'Ein Prozentsatz beschreibt einen Anteil von hundert Teilen des Grundwerts.',
    },
    formulas: [
      {
        id: 'percentage_formula',
        expression: 'W = G · p / 100',
        explanation: 'Der Grundwert wird mit dem Prozentfaktor multipliziert.',
      },
    ],
    hints: [
      { level: 1, text: 'Überlege zuerst, was ein Prozent als Bruch von 100 bedeutet.' },
      { level: 2, text: 'Wandle den Prozentsatz in einen Dezimalfaktor um.' },
      { level: 3, text: `${fmt(p)} % entsprechen dem Faktor ${fmt(p / 100)}.` },
      { level: 4, text: `Multipliziere diesen Faktor mit dem Grundwert ${fmt(base)}.` },
      { level: 5, text: 'Kontrolliere, ob dein Ergebnis zur Größe des Prozentsatzes passt.' },
      { level: 6, text: `${fmt(p)} % von ${fmt(base)} sind ${display}.` },
    ],
    reasoningSteps: [
      {
        id: 'percent-factor',
        title: 'Prozentfaktor',
        question: 'Welcher Dezimalfaktor gehört zum Prozentsatz?',
        answer: fmt(p / 100),
        explanation: 'Prozent bedeutet geteilt durch 100.',
        hint: 'Verschiebe das Komma zwei Stellen nach links.',
      },
      {
        id: 'percent-multiply',
        title: 'Anteil bestimmen',
        question: 'Welche Rechnung liefert den gesuchten Anteil?',
        answer: `${fmt(base)} · ${fmt(p / 100)}`,
        explanation: 'Grundwert mal Prozentfaktor ergibt den Prozentwert.',
        hint: 'Multipliziere Grundwert und Prozentfaktor.',
      },
      {
        id: 'percent-result',
        title: 'Ergebnis',
        question: 'Wie groß ist der Prozentwert?',
        answer: display,
        explanation: `${fmt(base)} · ${fmt(p / 100)} = ${display}.`,
        hint: 'Führe die Multiplikation aus.',
      },
    ],
    commonMistakes: [
      {
        id: 'percent_factor',
        label: 'Prozentzahl direkt multipliziert',
        explanation: 'Der Prozentsatz wurde nicht durch 100 geteilt.',
        correction: `Verwende ${fmt(p / 100)} statt ${fmt(p)} als Faktor.`,
        triggers: [fmt(base * p), 'durch 100 vergessen'],
      },
    ],
    strategySelection: {
      type: 'strategySelection',
      question: 'Welche Größe wird bei „Prozent von Grundwert“ gesucht?',
      options: ['Prozentwert', 'Grundwert', 'Steigung'],
      correctOption: 'Prozentwert',
      explanation: 'Gesucht ist der Anteil des Grundwerts.',
    },
    correctResult: {
      display,
      numericValue: result,
      tolerance: Math.max(1e-9, Math.abs(result) * 1e-9),
      acceptedAnswers: [display, String(result)],
      explanation: `${fmt(p)} % von ${fmt(base)} ergeben ${display}.`,
    },
  };
}

function slopeAnalysis(text: string): ProblemAnalysis | null {
  const source = clean(text);
  const match = source.match(/(?:a|p1)?\s*\(?\s*([+\-]?\d+(?:\.\d+)?)\s*[|;,]\s*([+\-]?\d+(?:\.\d+)?)\s*\)?.*?(?:b|p2)?\s*\(?\s*([+\-]?\d+(?:\.\d+)?)\s*[|;,]\s*([+\-]?\d+(?:\.\d+)?)\s*\)?/);
  if (!match || !/(steigung|slope|gerade|linear)/.test(source)) return null;
  const values = match.slice(1, 5).map(Number);
  const x1 = values[0];
  const y1 = values[1];
  const x2 = values[2];
  const y2 = values[3];
  if (
    x1 === undefined ||
    y1 === undefined ||
    x2 === undefined ||
    y2 === undefined ||
    ![x1, y1, x2, y2].every(Number.isFinite) ||
    x2 === x1
  )
    return null;
  const m = (y2 - y1) / (x2 - x1);
  const display = `m = ${fmt(m)}`;
  return {
    id: localId('slope', text),
    subject: 'math',
    topic: 'Lineare Funktionen',
    title: 'Steigung aus zwei Punkten',
    originalText: text.trim(),
    given: [
      { symbol: 'P₁', value: `(${fmt(x1)}|${fmt(y1)})`, meaning: 'Erster Punkt' },
      { symbol: 'P₂', value: `(${fmt(x2)}|${fmt(y2)})`, meaning: 'Zweiter Punkt' },
    ],
    unknowns: [{ symbol: 'm', meaning: 'Steigung der Geraden' }],
    principle: {
      id: 'difference_quotient',
      name: 'Differenzenquotient',
      explanation: 'Die Steigung ist die Änderung in y geteilt durch die Änderung in x.',
    },
    formulas: [
      {
        id: 'slope_formula',
        expression: 'm = (y₂ − y₁) / (x₂ − x₁)',
        explanation: 'Die Punktreihenfolge muss in Zähler und Nenner gleich bleiben.',
      },
    ],
    hints: [
      { level: 1, text: 'Bestimme zuerst die Änderung der y-Werte.' },
      { level: 2, text: 'Bestimme danach die Änderung der x-Werte in derselben Punktreihenfolge.' },
      { level: 3, text: `Die y-Änderung beträgt ${fmt(y2 - y1)}.` },
      { level: 4, text: `Die x-Änderung beträgt ${fmt(x2 - x1)}.` },
      { level: 5, text: 'Teile die y-Änderung durch die x-Änderung.' },
      { level: 6, text: `Die Steigung ist ${display}.` },
    ],
    reasoningSteps: [
      {
        id: 'slope-dy',
        title: 'y-Änderung',
        question: 'Wie groß ist Δy?',
        answer: fmt(y2 - y1),
        explanation: 'Zweiter y-Wert minus erster y-Wert.',
        hint: 'Subtrahiere die y-Koordinaten.',
      },
      {
        id: 'slope-dx',
        title: 'x-Änderung',
        question: 'Wie groß ist Δx?',
        answer: fmt(x2 - x1),
        explanation: 'Zweiter x-Wert minus erster x-Wert.',
        hint: 'Nutze dieselbe Reihenfolge wie bei Δy.',
      },
      {
        id: 'slope-result',
        title: 'Quotient',
        question: 'Wie groß ist die Steigung?',
        answer: display,
        explanation: 'm = Δy / Δx.',
        hint: 'Teile die beiden Änderungen.',
      },
    ],
    commonMistakes: [
      {
        id: 'slope_order',
        label: 'Differenzen vertauscht',
        explanation: 'Die Punktreihenfolge wurde zwischen Zähler und Nenner gewechselt.',
        correction: 'Verwende in beiden Differenzen dieselbe Punktreihenfolge.',
        triggers: [fmt(-m), 'Reihenfolge vertauscht'],
      },
    ],
    strategySelection: {
      type: 'strategySelection',
      question: 'Welche Methode bestimmt die Steigung aus zwei Punkten?',
      options: ['Differenzenquotient', 'Dreisatz', 'pq-Formel'],
      correctOption: 'Differenzenquotient',
      explanation: 'Die Steigung beschreibt Δy pro Δx.',
    },
    correctResult: {
      display,
      numericValue: m,
      tolerance: Math.max(1e-9, Math.abs(m) * 1e-9),
      acceptedAnswers: [display, fmt(m), String(m)],
      explanation: `Aus den beiden Punktdifferenzen folgt ${display}.`,
    },
  };
}

function pythagorasAnalysis(text: string): ProblemAnalysis | null {
  const source = clean(text);
  if (!/(pythagoras|rechtwink|kathete|hypotenuse)/.test(source)) return null;
  const nums = [...source.matchAll(/(?<![\p{L}\d])([0-9]+(?:\.[0-9]+)?)/gu)].map((m) => Number(m[1]));
  if (nums.length < 2) return null;
  const a = nums[0]!;
  const b = nums[1]!;
  if (!(a > 0 && b > 0)) return null;
  const c = Math.hypot(a, b);
  const display = fmt(c);
  return {
    id: localId('pythagoras', text),
    subject: 'math',
    topic: 'Geometrie',
    title: 'Satz des Pythagoras',
    originalText: text.trim(),
    given: [
      { symbol: 'a', value: fmt(a), meaning: 'Erste Kathete' },
      { symbol: 'b', value: fmt(b), meaning: 'Zweite Kathete' },
    ],
    unknowns: [{ symbol: 'c', meaning: 'Hypotenuse' }],
    principle: {
      id: 'pythagorean_theorem',
      name: 'Satz des Pythagoras',
      explanation: 'Im rechtwinkligen Dreieck ist das Quadrat der Hypotenuse die Summe der Kathetenquadrate.',
    },
    formulas: [
      {
        id: 'pythagoras_formula',
        expression: 'c² = a² + b²',
        explanation: 'Für die Hypotenuse wird anschließend die positive Quadratwurzel gezogen.',
      },
    ],
    hints: [
      { level: 1, text: 'Identifiziere zuerst, welche Seite der Hypotenuse entspricht.' },
      { level: 2, text: 'Quadriere die beiden gegebenen Katheten.' },
      { level: 3, text: `Die Kathetenquadrate sind ${fmt(a * a)} und ${fmt(b * b)}.` },
      { level: 4, text: `Ihre Summe beträgt ${fmt(a * a + b * b)}.` },
      { level: 5, text: 'Ziehe aus dieser Summe die positive Quadratwurzel.' },
      { level: 6, text: `Die Hypotenuse beträgt ${display}.` },
    ],
    reasoningSteps: [
      {
        id: 'pyth-square',
        title: 'Katheten quadrieren',
        question: 'Welche beiden Quadrate werden addiert?',
        answer: `${fmt(a * a)} und ${fmt(b * b)}`,
        explanation: 'Die Katheten gehen quadratisch in den Satz des Pythagoras ein.',
        hint: 'Berechne a² und b².',
      },
      {
        id: 'pyth-sum',
        title: 'Quadrate addieren',
        question: 'Wie groß ist c²?',
        answer: fmt(a * a + b * b),
        explanation: 'c² ist die Summe der beiden Kathetenquadrate.',
        hint: 'Addiere die beiden Zwischenergebnisse.',
      },
      {
        id: 'pyth-root',
        title: 'Wurzel ziehen',
        question: 'Wie groß ist c?',
        answer: display,
        explanation: 'Eine Seitenlänge ist positiv, daher wird die positive Wurzel verwendet.',
        hint: 'Ziehe die Quadratwurzel.',
      },
    ],
    commonMistakes: [
      {
        id: 'pyth_no_root',
        code: 'wrong_exponent',
        label: 'Wurzel vergessen',
        explanation: 'Das Ergebnis für c² wurde direkt als Seitenlänge übernommen.',
        correction: 'Nach dem Addieren der Quadrate muss noch die Quadratwurzel gezogen werden.',
        triggers: [fmt(a * a + b * b), 'Wurzel vergessen'],
      },
    ],
    strategySelection: {
      type: 'strategySelection',
      question: 'Welche Methode passt zu zwei Katheten eines rechtwinkligen Dreiecks?',
      options: ['Satz des Pythagoras', 'Prozentrechnung', 'Differenzenquotient'],
      correctOption: 'Satz des Pythagoras',
      explanation: 'Zwei Seiten eines rechtwinkligen Dreiecks sind gegeben.',
    },
    correctResult: {
      display,
      numericValue: c,
      tolerance: Math.max(0.01, Math.abs(c) * 0.005),
      acceptedAnswers: [display, String(c)],
      explanation: `Die positive Wurzel aus ${fmt(a * a + b * b)} ist ${display}.`,
    },
  };
}

function ohmAnalysis(text: string): ProblemAnalysis | null {
  const source = clean(text).replace(/ω/g, 'Ω');
  if (!/(ohm|spannung|strom|widerstand|volt|ampere)/.test(source)) return null;
  const voltage = source.match(/(\d+(?:\.\d+)?)\s*(?:v|volt)\b/)?.[1];
  const current = source.match(/(\d+(?:\.\d+)?)\s*(?:a|ampere)\b/)?.[1];
  const resistance = source.match(/(\d+(?:\.\d+)?)\s*(?:Ω|ohm)\b/i)?.[1];
  const U = voltage === undefined ? undefined : Number(voltage);
  const I = current === undefined ? undefined : Number(current);
  const R = resistance === undefined ? undefined : Number(resistance);
  const count = [U, I, R].filter((v) => v !== undefined && Number.isFinite(v)).length;
  if (count !== 2) return null;

  let symbol: 'U' | 'I' | 'R';
  let result: number;
  let unit: string;
  if (U === undefined && I !== undefined && R !== undefined) {
    symbol = 'U'; result = I * R; unit = 'V';
  } else if (I === undefined && U !== undefined && R !== undefined && R !== 0) {
    symbol = 'I'; result = U / R; unit = 'A';
  } else if (R === undefined && U !== undefined && I !== undefined && I !== 0) {
    symbol = 'R'; result = U / I; unit = 'Ω';
  } else return null;

  const display = `${symbol} = ${fmt(result)} ${unit}`;
  const given = [
    ...(U !== undefined ? [{ symbol: 'U', value: `${fmt(U)} V`, meaning: 'Spannung' }] : []),
    ...(I !== undefined ? [{ symbol: 'I', value: `${fmt(I)} A`, meaning: 'Stromstärke' }] : []),
    ...(R !== undefined ? [{ symbol: 'R', value: `${fmt(R)} Ω`, meaning: 'Widerstand' }] : []),
  ];

  return {
    id: localId('ohm', text),
    subject: 'physics',
    topic: 'Elektrizitätslehre',
    title: 'Ohmsches Gesetz',
    originalText: text.trim(),
    given,
    unknowns: [{ symbol, meaning: symbol === 'U' ? 'Spannung' : symbol === 'I' ? 'Stromstärke' : 'Widerstand' }],
    principle: {
      id: 'ohms_law',
      name: 'Ohmsches Gesetz',
      explanation: 'Spannung, Stromstärke und Widerstand sind über das Ohmsche Gesetz miteinander verknüpft.',
    },
    formulas: [
      {
        id: 'ohm_formula',
        expression: 'U = R · I',
        explanation: 'Die Grundform kann nach der jeweils gesuchten Größe umgestellt werden.',
      },
    ],
    hints: [
      { level: 1, text: 'Ordne zuerst die gegebenen Werte U, R und I den richtigen Einheiten zu.' },
      { level: 2, text: 'Stelle dann die Grundbeziehung nach der gesuchten Größe um.' },
      { level: 3, text: `Gesucht ist ${symbol}.` },
      { level: 4, text: 'Setze die beiden gegebenen Werte mit ihren Einheiten ein.' },
      { level: 5, text: 'Prüfe nach dem Rechnen, ob die Zieleinheit zur gesuchten Größe passt.' },
      { level: 6, text: `Das Ergebnis lautet ${display}.` },
    ],
    reasoningSteps: [
      {
        id: 'ohm-identify',
        title: 'Größen zuordnen',
        question: 'Welche elektrische Größe ist gesucht?',
        answer: symbol,
        explanation: 'Die gesuchte Größe ist diejenige ohne gegebenen Zahlenwert.',
        hint: 'V → U, A → I, Ω → R.',
      },
      {
        id: 'ohm-rearrange',
        title: 'Formel umstellen',
        question: 'Wie muss die Grundbeziehung für die gesuchte Größe umgestellt werden?',
        answer: symbol === 'U' ? 'U = R · I' : symbol === 'I' ? 'I = U / R' : 'R = U / I',
        explanation: 'Die Formel wird algebraisch nach der gesuchten Größe isoliert.',
        hint: 'Nutze die jeweilige Gegenoperation.',
      },
      {
        id: 'ohm-result',
        title: 'Einsetzen und rechnen',
        question: 'Welches Ergebnis erhältst du?',
        answer: display,
        explanation: 'Die gegebenen SI-Einheiten können direkt eingesetzt werden.',
        hint: 'Achte auf die Zieleinheit.',
      },
    ],
    commonMistakes: [
      {
        id: 'ohm_wrong_formula',
        code: 'wrong_formula',
        label: 'Formel falsch umgestellt',
        explanation: 'Multiplikation und Division wurden beim Umstellen vertauscht.',
        correction: 'Prüfe die Umstellung ausgehend von U = R · I.',
        triggers: ['falsch umgestellt', 'mal statt geteilt'],
      },
    ],
    strategySelection: {
      type: 'strategySelection',
      question: 'Welches physikalische Gesetz verknüpft U, R und I?',
      options: ['Ohmsches Gesetz', 'Gravitationsgesetz', 'Satz des Pythagoras'],
      correctOption: 'Ohmsches Gesetz',
      explanation: 'Es beschreibt den Zusammenhang zwischen Spannung, Widerstand und Stromstärke.',
    },
    correctResult: {
      display,
      numericValue: result,
      unit,
      tolerance: Math.max(1e-9, Math.abs(result) * 1e-6),
      acceptedAnswers: [display, `${fmt(result)} ${unit}`, fmt(result)],
      explanation: `Aus dem Ohmschen Gesetz folgt ${display}.`,
    },
  };
}

export class LocalProblemAnalyzer {
  async analyze(text: string): Promise<ProblemAnalysis> {
    const trimmed = text.trim();
    if (trimmed.length < 3) throw new Error('Beschreibe die Aufgabe etwas genauer.');

    const demo = exactDemo(trimmed);
    if (demo) return demo;

    const analyzers = [
      linearEquationAnalysis,
      percentageAnalysis,
      slopeAnalysis,
      pythagorasAnalysis,
      ohmAnalysis,
      arithmeticAnalysis,
    ];

    for (const analyzer of analyzers) {
      const problem = analyzer(trimmed);
      if (problem) return problem;
    }

    const input = normalized(trimmed);
    const demoByKeywords = demoProblems.find((problem) => {
      const words = problem.topic
        .toLowerCase()
        .split(/\s+/)
        .map(normalized)
        .filter((word) => word.length >= 5);
      return words.length > 0 && words.some((word) => input.includes(word));
    });
    if (demoByKeywords) return demoByKeywords;

    throw new Error(
      'Diese freie Aufgabe kann SolvePath lokal noch nicht sicher berechnen. Unterstützt werden bereits Rechenterme, lineare Gleichungen, Prozentrechnung, Steigungen, Pythagoras und das Ohmsche Gesetz. Die Beispielaufgaben funktionieren ebenfalls offline.',
    );
  }
}

export const localProblemAnalyzer = new LocalProblemAnalyzer();
