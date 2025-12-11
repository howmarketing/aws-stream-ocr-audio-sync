/**
 * Clock Normalizer Service
 * Converts game clock formats (MM:SS) to total seconds
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ClockNormalizationResult } from './sync.dto';

@Injectable()
export class ClockNormalizerService {
  private readonly logger = new Logger(ClockNormalizerService.name);

  /**
   * Normalize clock string to total seconds
   * Supports formats: MM:SS, M:SS (e.g., "12:34", "2:45", "0:59")
   */
  normalize(clock: string): ClockNormalizationResult {
    try {
      // Trim whitespace
      clock = clock.trim();

      // Regex for MM:SS or M:SS format
      const clockRegex = /^(\d{1,2}):(\d{2})$/;
      const match = clock.match(clockRegex);

      if (!match) {
        return {
          seconds: 0,
          minutes: 0,
          totalSeconds: 0,
          valid: false,
          error: 'Invalid clock format. Expected MM:SS or M:SS',
        };
      }

      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);

      // Validate ranges
      if (seconds < 0 || seconds >= 60) {
        return {
          seconds,
          minutes,
          totalSeconds: 0,
          valid: false,
          error: 'Seconds must be between 0 and 59',
        };
      }

      if (minutes < 0) {
        return {
          seconds,
          minutes,
          totalSeconds: 0,
          valid: false,
          error: 'Minutes cannot be negative',
        };
      }

      // For sports: typical max is 90 minutes (soccer with injury time)
      // We'll be lenient and allow up to 120 minutes (2 hours)
      if (minutes > 120) {
        return {
          seconds,
          minutes,
          totalSeconds: 0,
          valid: false,
          error: 'Minutes exceeds reasonable range (max 120)',
        };
      }

      const totalSeconds = minutes * 60 + seconds;

      this.logger.log(`Clock normalized: ${clock} -> ${totalSeconds}s (${minutes}m ${seconds}s)`);

      return {
        seconds,
        minutes,
        totalSeconds,
        valid: true,
      };
    } catch (error) {
      this.logger.error('Clock normalization failed', error);
      return {
        seconds: 0,
        minutes: 0,
        totalSeconds: 0,
        valid: false,
        error: 'Clock normalization error',
      };
    }
  }

  /**
   * Validate clock plausibility for confidence scoring
   * Returns 0.0 to 1.0 based on how "normal" the clock value is
   */
  getPlausibilityScore(totalSeconds: number): number {
    // Most common game lengths:
    // - Soccer: 45 min halves (0-45, 45-90, plus injury time)
    // - Basketball: 12 min quarters (0-48 total)
    // - American Football: 15 min quarters (0-60 total)

    // Very plausible: 0-60 minutes
    if (totalSeconds >= 0 && totalSeconds <= 3600) {
      return 1.0;
    }

    // Somewhat plausible: 60-90 minutes (soccer with extra time)
    if (totalSeconds <= 5400) {
      return 0.8;
    }

    // Edge case: 90-120 minutes (very long game or multiple periods)
    if (totalSeconds <= 7200) {
      return 0.5;
    }

    // Unlikely but technically valid
    return 0.3;
  }
}
