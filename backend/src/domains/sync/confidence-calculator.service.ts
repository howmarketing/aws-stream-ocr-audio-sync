/**
 * Confidence Calculator Service
 * Calculates overall sync confidence based on multiple factors
 */

import { Injectable, Logger } from '@nestjs/common';
import { SegmentMatch } from './timestamp-searcher.service';

export interface ConfidenceFactors {
  ocrConfidence: number; // 0.0-1.0
  clockPlausibility: number; // 0.0-1.0
  timeDrift: number; // seconds
  segmentContinuity: boolean;
  matchType: 'exact' | 'approximate' | 'nearest';
}

export interface ConfidenceResult {
  overall: number; // 0.0-1.0
  factors: {
    ocr: number;
    plausibility: number;
    drift: number;
    continuity: number;
  };
  weights: {
    ocr: number;
    plausibility: number;
    drift: number;
    continuity: number;
  };
}

@Injectable()
export class ConfidenceCalculatorService {
  private readonly logger = new Logger(ConfidenceCalculatorService.name);

  // Confidence weights (must sum to 1.0)
  private readonly WEIGHTS = {
    ocr: 0.4, // OCR confidence (40%)
    plausibility: 0.3, // Clock plausibility (30%)
    drift: 0.2, // Time drift (20%)
    continuity: 0.1, // Segment continuity (10%)
  };

  /**
   * Calculate overall sync confidence
   */
  calculate(factors: ConfidenceFactors): ConfidenceResult {
    // Factor 1: OCR Confidence (0.0-1.0)
    const ocrScore = factors.ocrConfidence;

    // Factor 2: Clock Plausibility (0.0-1.0)
    const plausibilityScore = factors.clockPlausibility;

    // Factor 3: Time Drift Score
    // Lower drift = higher confidence
    // 0s drift = 1.0, 2s drift = 0.7, 5s drift = 0.3, >10s = 0.0
    const driftScore = this.calculateDriftScore(factors.timeDrift, factors.matchType);

    // Factor 4: Segment Continuity Score
    const continuityScore = factors.segmentContinuity ? 1.0 : 0.5;

    // Weighted average
    const overall = Math.min(
      1.0,
      Math.max(
        0.0,
        ocrScore * this.WEIGHTS.ocr +
        plausibilityScore * this.WEIGHTS.plausibility +
        driftScore * this.WEIGHTS.drift +
        continuityScore * this.WEIGHTS.continuity,
      ),
    );

    this.logger.log(
      `Confidence: ${(overall * 100).toFixed(1)}% ` +
      `(OCR: ${(ocrScore * 100).toFixed(0)}%, ` +
      `Plausibility: ${(plausibilityScore * 100).toFixed(0)}%, ` +
      `Drift: ${(driftScore * 100).toFixed(0)}%, ` +
      `Continuity: ${(continuityScore * 100).toFixed(0)}%)`
    );

    return {
      overall,
      factors: {
        ocr: ocrScore,
        plausibility: plausibilityScore,
        drift: driftScore,
        continuity: continuityScore,
      },
      weights: this.WEIGHTS,
    };
  }

  /**
   * Calculate drift score based on time difference and match type
   */
  private calculateDriftScore(drift: number, matchType: string): number {
    // Exact match bonus
    if (matchType === 'exact') {
      return 1.0;
    }

    // Drift scoring curve
    if (drift === 0) return 1.0;
    if (drift <= 1) return 0.9;
    if (drift <= 2) return 0.7;
    if (drift <= 5) return 0.4;
    if (drift <= 10) return 0.2;
    return 0.1; // Very high drift
  }

  /**
   * Determine if confidence is acceptable for sync
   */
  isAcceptable(confidence: number): boolean {
    return confidence >= 0.5; // 50% minimum threshold
  }

  /**
   * Get confidence level description
   */
  getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.9) return 'excellent';
    if (confidence >= 0.7) return 'good';
    if (confidence >= 0.5) return 'acceptable';
    if (confidence >= 0.3) return 'low';
    return 'very low';
  }
}
