import type { ProblemAnalysis } from '../../../src/domain/problem/schema';

export interface AnalysisProvider {
  analyzeText(input: string): Promise<ProblemAnalysis>;
  analyzeImage(image: Buffer, mimeType: string, optionalText?: string): Promise<ProblemAnalysis>;
}
