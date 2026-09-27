import { z } from 'zod';

const shortText = z.string().trim().min(1).max(240);
const explanationText = z.string().trim().min(1).max(1_500);

export const subjectSchema = z.enum(['physics', 'math']);
export const givenValueSchema = z.object({
  symbol: z.string().trim().min(1).max(40),
  value: z.string().trim().min(1).max(120),
  meaning: explanationText,
});
export const unknownValueSchema = z.object({
  symbol: z.string().trim().min(1).max(40),
  meaning: explanationText,
});
export const formulaSchema = z.object({
  id: z.string().trim().min(1).max(80),
  expression: z.string().trim().min(1).max(500),
  explanation: explanationText,
});
export const hintSchema = z.object({
  level: z.number().int().min(1).max(6),
  text: z.string().trim().min(2).max(2_000),
});
export const stepSchema = z.object({
  id: z.string().trim().min(1).max(80),
  title: shortText,
  question: z.string().trim().min(2).max(1_000),
  answer: z.string().trim().min(1).max(1_000),
  explanation: explanationText,
  hint: z.string().trim().min(1).max(1_000),
  choices: z.array(z.string().trim().min(1).max(300)).min(2).max(8).optional(),
});
export const commonMistakeSchema = z.object({
  id: z.string().trim().min(1).max(80),
  label: shortText,
  explanation: explanationText,
  correction: explanationText,
  triggers: z.array(z.string().trim().min(1).max(300)).min(1).max(8),
  code: z
    .enum([
      'radius_vs_height',
      'wrong_unit_conversion',
      'wrong_formula',
      'sign_error',
      'wrong_trig_function',
      'degrees_vs_radians',
      'average_vs_instantaneous',
      'wrong_exponent',
      'missing_second_solution',
    ])
    .optional(),
});
export const strategySelectionSchema = z.object({
  type: z.literal('strategySelection'),
  question: z.string().trim().min(2).max(1_000),
  options: z.array(z.string().trim().min(1).max(300)).min(2).max(8),
  correctOption: z.string().trim().min(1).max(300),
  explanation: explanationText,
});
export const problemAnalysisSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    subject: subjectSchema,
    topic: shortText,
    title: shortText,
    originalText: z.string().trim().min(10).max(12_000),
    given: z.array(givenValueSchema).min(1).max(16),
    unknowns: z.array(unknownValueSchema).min(1).max(8),
    principle: z.object({
      id: z.string().trim().min(1).max(80),
      name: shortText,
      explanation: explanationText,
    }),
    formulas: z.array(formulaSchema).min(1).max(10),
    hints: z.array(hintSchema).length(6),
    reasoningSteps: z.array(stepSchema).min(3).max(12),
    commonMistakes: z.array(commonMistakeSchema).min(1).max(10),
    strategySelection: strategySelectionSchema,
    correctResult: z.object({
      display: z.string().trim().min(1).max(500),
      numericValue: z.number().finite().optional(),
      unit: z.string().trim().min(1).max(80).optional(),
      tolerance: z.number().finite().nonnegative().optional(),
      acceptedAnswers: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
      explanation: explanationText,
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

    const stepIds = problem.reasoningSteps.map((step) => step.id);
    if (new Set(stepIds).size !== stepIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['reasoningSteps'],
        message: 'Reasoning step IDs must be unique',
      });
    }

    const earlyHints = problem.hints.slice(0, 2).map((hint) => hint.text.toLowerCase());
    const revealed = [
      problem.correctResult.display,
      ...problem.formulas.map((formula) => formula.expression),
    ]
      .filter((value) => value.length >= 8)
      .some((value) => earlyHints.some((hint) => hint.includes(value.toLowerCase())));
    if (revealed) {
      context.addIssue({
        code: 'custom',
        path: ['hints'],
        message: 'Early hints must not reveal the formula or result',
      });
    }

    if (
      problem.correctResult.numericValue !== undefined &&
      problem.correctResult.tolerance !== undefined &&
      problem.correctResult.tolerance > Math.max(1, Math.abs(problem.correctResult.numericValue))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['correctResult', 'tolerance'],
        message: 'Tolerance is implausibly large',
      });
    }
  });

export type Subject = z.infer<typeof subjectSchema>;
export type ProblemAnalysis = z.infer<typeof problemAnalysisSchema>;
export type ReasoningStep = z.infer<typeof stepSchema>;
export type Hint = z.infer<typeof hintSchema>;
export type CommonMistake = z.infer<typeof commonMistakeSchema>;
export type StrategySelection = z.infer<typeof strategySelectionSchema>;
