/**
 * OCR Execution Module
 * Uses Tesseract to extract text from preprocessed images
 */

import tesseract from 'node-tesseract-ocr';
import { OcrResult, TesseractConfig } from './types';

// Tesseract configuration
// Whitelist: Only recognize digits and colon for clock/score extraction
const TESSERACT_CONFIG: TesseractConfig = {
  lang: 'eng',
  tessedit_char_whitelist: ':0123456789-',
  psm: 6, // Assume uniform block of text
};

/**
 * Execute Tesseract OCR on preprocessed image
 */
export async function runOcr(imagePath: string): Promise<OcrResult> {
  const startTime = Date.now();

  try {
    // Run Tesseract OCR
    const rawText = await tesseract.recognize(imagePath, {
      lang: TESSERACT_CONFIG.lang,
      oem: 3, // Default OCR Engine mode (LSTM)
      psm: TESSERACT_CONFIG.psm,
      tessedit_char_whitelist: TESSERACT_CONFIG.tessedit_char_whitelist,
    });

    const processingTime = Date.now() - startTime;

    // Parse OCR results
    const result = parseOcrText(rawText.trim(), processingTime);

    return result;
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      clock: null,
      score: { home: null, away: null },
      confidence: 0,
      rawText: '',
      metadata: {
        processingTime,
      },
    };
  }
}

/**
 * Parse raw OCR text to extract clock and score
 */
function parseOcrText(rawText: string, processingTime: number): OcrResult {
  // Clock patterns: MM:SS or M:SS (e.g., "12:34", "2:45")
  const clockRegex = /(\d{1,2}):(\d{2})/;

  // Score patterns: ##-## (e.g., "21-17", "7-0")
  const scoreRegex = /(\d{1,2})-(\d{1,2})/;

  let clock: string | null = null;
  let home: number | null = null;
  let away: number | null = null;
  let confidence = 0;

  // Extract clock
  const clockMatch = rawText.match(clockRegex);
  if (clockMatch) {
    const minutes = parseInt(clockMatch[1], 10);
    const seconds = parseInt(clockMatch[2], 10);

    // Validate clock plausibility
    if (minutes >= 0 && minutes <= 90 && seconds >= 0 && seconds < 60) {
      clock = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      confidence += 0.5; // Clock found adds 50% confidence
    }
  }

  // Extract score
  const scoreMatch = rawText.match(scoreRegex);
  if (scoreMatch) {
    const homeScore = parseInt(scoreMatch[1], 10);
    const awayScore = parseInt(scoreMatch[2], 10);

    // Validate score plausibility (0-99)
    if (homeScore >= 0 && homeScore <= 99 && awayScore >= 0 && awayScore <= 99) {
      home = homeScore;
      away = awayScore;
      confidence += 0.3; // Score found adds 30% confidence
    }
  }

  // Additional confidence boost if both found
  if (clock && home !== null && away !== null) {
    confidence += 0.2;
  }

  return {
    clock,
    score: { home, away },
    confidence: Math.min(confidence, 1.0), // Cap at 1.0
    rawText,
    metadata: {
      processingTime,
    },
  };
}

/**
 * Calculate confidence score based on OCR results
 */
export function calculateConfidence(result: OcrResult): number {
  let confidence = 0;

  // Factor 1: Clock extraction (40% weight)
  if (result.clock) {
    confidence += 0.4;
  }

  // Factor 2: Score extraction (30% weight)
  if (result.score.home !== null && result.score.away !== null) {
    confidence += 0.3;
  }

  // Factor 3: Clock plausibility (20% weight)
  if (result.clock) {
    const [minutes] = result.clock.split(':').map(Number);
    if (minutes >= 0 && minutes <= 60) {
      confidence += 0.2;
    }
  }

  // Factor 4: Raw text length (10% weight)
  // Reasonable text length suggests good OCR quality
  if (result.rawText.length > 3 && result.rawText.length < 50) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}
