import { scanContent } from "./content-filter";

export interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  requiresReview: boolean;
}

const HARD_BLOCK_THRESHOLD = 0.7;
const REVIEW_THRESHOLD = 0.4;

export function checkContentForSpam(content: string): SpamCheckResult {
  const scan = scanContent(content);
  const totalScore = scan.signals.reduce((sum, signal) => sum + signal.score, 0);

  const cappedScore = Math.min(1, totalScore);
  const reasons = scan.signals.map((signal) => signal.reason);

  return {
    isSpam: cappedScore >= HARD_BLOCK_THRESHOLD,
    confidence: cappedScore,
    reasons,
    requiresReview: cappedScore >= REVIEW_THRESHOLD && cappedScore < HARD_BLOCK_THRESHOLD,
  };
}
