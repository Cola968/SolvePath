import { z } from 'zod';

export const subjectSchema = z.enum(['physics', 'math']);
export const givenValueSchema = z.object({
  symbol: z.string(),
  value: z.string(),
  meaning: z.string(),
});
export const unknownValueSchema = z.object({ symbol: z.string(), meaning: z.string() });
export const formulaSchema = z.object({
  id: z.string(),
  expression: z.string(),
  explanation: z.string(),
});
export const hintSchema = z.object({ level: z.number().int().min(1).max(6), text: z.string() });
export const stepSchema = z.object({
  id: z.string(),
  title: z.string(),
  question: z.string(),
  answer: z.string(),
  explanation: z.string(),
  hint: z.string(),
  choices: z.array(z.string()).optional(),
});
export const commonMistakeSchema = z.object({
  id: z.string(),
  label: z.string(),
  explanation: z.string(),
  correction: z.string(),
  triggers: z.array(z.string()),
});
export const strategySelectionSchema = z.object({
  type: z.literal('strategySelection'),
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctOption: z.string(),
  explanation: z.string(),
});
export const problemAnalysisSchema = z
  .object({
    id: z.string(),
    subject: subjectSchema,
    topic: z.string(),
    title: z.string(),
    originalText: z.string().min(10),
    given: z.array(givenValueSchema).min(1),
    unknowns: z.array(unknownValueSchema).min(1),
    principle: z.object({ id: z.string(), name: z.string(), explanation: z.string() }),
    formulas: z.array(formulaSchema).min(1),
    hints: z.array(hintSchema).length(6),
    reasoningSteps: z.array(stepSchema).min(3),
    commonMistakes: z.array(commonMistakeSchema).min(1),
    strategySelection: strategySelectionSchema,
    correctResult: z.object({
      display: z.string(),
      numericValue: z.number().optional(),
      tolerance: z.number().nonnegative().optional(),
      acceptedAnswers: z.array(z.string()).default([]),
      explanation: z.string(),
    }),
  })
  .superRefine((problem, context) => {
    const levels = problem.hints.map((hint) => hint.level);
    if (levels.some((level, index) => level !== index + 1)) {
      context.addIssue({
        code: 'custom',
        path: ['hints'],
        message: 'Hint levels must be 1–6 in order',
      });
    }
    if (!problem.strategySelection.options.includes(problem.strategySelection.correctOption)) {
      context.addIssue({
        code: 'custom',
        path: ['strategySelection'],
        message: 'Correct option missing',
      });
    }
  });

export type Subject = z.infer<typeof subjectSchema>;
export type ProblemAnalysis = z.infer<typeof problemAnalysisSchema>;
export type ReasoningStep = z.infer<typeof stepSchema>;
export type Hint = z.infer<typeof hintSchema>;
export type CommonMistake = z.infer<typeof commonMistakeSchema>;
export type StrategySelection = z.infer<typeof strategySelectionSchema>;
