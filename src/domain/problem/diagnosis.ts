import type { ProblemAnalysis } from './schema';

export const stuckReasons = [
  { id: 'start', label: 'Ich weiß nicht, wie ich anfangen soll' },
  { id: 'text', label: 'Ich verstehe den Aufgabentext nicht' },
  { id: 'formula', label: 'Ich weiß nicht, welche Formel passt' },
  { id: 'rearrange', label: 'Ich kann die Formel nicht umstellen' },
  { id: 'calculate', label: 'Ich komme bei der Rechnung nicht weiter' },
  { id: 'check', label: 'Ich habe ein Ergebnis, bin mir aber unsicher' },
] as const;

export type StuckReason = (typeof stuckReasons)[number]['id'];
export type DiagnosticPrompt = { question: string; options: string[]; correctOption: string; feedback: string };

export function diagnosticPrompts(problem: ProblemAnalysis, reason: StuckReason): DiagnosticPrompt[] {
  if (reason === 'formula' && problem.id === 'satellite-orbit') {
    return [
      { question: 'Welche Kraft hält den Satelliten auf seiner Kreisbahn?', options: ['Gewichtskraft', 'Gravitationskraft', 'Reibungskraft'], correctOption: 'Gravitationskraft', feedback: 'Genau: Gravitation wirkt zum Erdmittelpunkt.' },
      { question: 'Welche Kraft beschreibt die notwendige Kraft einer Kreisbewegung?', options: ['Zentripetalkraft', 'Reibungskraft', 'Auftrieb'], correctOption: 'Zentripetalkraft', feedback: 'Damit kannst du F_G = F_Z setzen.' },
    ];
  }
  if (reason === 'text') {
    return [{ question: `Welche Größe ist gesucht: ${problem.unknowns.map((item) => item.meaning).join(' und ')}?`, options: ['Die gesuchte Größe benennen', 'Nur Zahlen abschreiben'], correctOption: 'Die gesuchte Größe benennen', feedback: `Gesucht: ${problem.unknowns.map((item) => item.symbol).join(', ')}. Trenne nun Gegebenes und Gesuchtes.` }];
  }
  if (reason === 'rearrange') {
    return [{ question: 'Welche Regel gilt beim Umstellen einer Gleichung?', options: ['Auf beiden Seiten dieselbe Operation', 'Nur links etwas ändern', 'Zahlen ohne Einheiten einsetzen'], correctOption: 'Auf beiden Seiten dieselbe Operation', feedback: 'Gut. Gehe jetzt die Umformung im Lösungsweg schrittweise durch.' }];
  }
  if (reason === 'calculate') {
    return [{ question: 'Was prüfst du vor dem Einsetzen der Zahlen?', options: ['Einheiten und Größenordnung', 'Nur die Nachkommastellen', 'Nur das Endergebnis'], correctOption: 'Einheiten und Größenordnung', feedback: 'So erkennst du viele Rechenfehler früh.' }];
  }
  if (reason === 'check') {
    return [{ question: 'Wie kannst du dein Ergebnis zuerst selbst prüfen?', options: ['Einheiten und Plausibilität prüfen', 'Direkt die Musterlösung lesen'], correctOption: 'Einheiten und Plausibilität prüfen', feedback: 'Prüfe danach dein Ergebnis im Ergebnis-Check.' }];
  }
  return [{ question: problem.strategySelection.question, options: problem.strategySelection.options, correctOption: problem.strategySelection.correctOption, feedback: problem.strategySelection.explanation }];
}
