/**
 * Sync Service
 * Main orchestration service for timestamp synchronization
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ClockNormalizerService } from './clock-normalizer.service';
import { TimestampSearcherService } from './timestamp-searcher.service';
import { ConfidenceCalculatorService } from './confidence-calculator.service';
import { SyncRequestDto, SyncResultDto } from './sync.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly clockNormalizer: ClockNormalizerService,
    private readonly timestampSearcher: TimestampSearcherService,
    private readonly confidenceCalculator: ConfidenceCalculatorService,
  ) {}

  /**
   * Perform timestamp synchronization
   * Main entry point for sync flow
   */
  async sync(request: SyncRequestDto): Promise<SyncResultDto> {
    const startTime = Date.now();

    try {
      this.logger.log(`Sync request: clock=${request.clock}, ocrConfidence=${request.ocrConfidence}`);

      // Step 1: Normalize clock to total seconds
      const normalization = this.clockNormalizer.normalize(request.clock);

      if (!normalization.valid) {
        throw new BadRequestException(normalization.error || 'Invalid clock format');
      }

      const targetSeconds = normalization.totalSeconds;
      this.logger.log(`Target timestamp: ${targetSeconds}s`);

      // Step 2: Search for matching segment
      const match = await this.timestampSearcher.search(targetSeconds);

      if (!match) {
        return {
          success: false,
          error: 'No matching segment found. Stream may not have reached this timestamp yet.',
        };
      }

      // Step 3: Calculate exact timestamp (segment start + offset)
      const timestamp = match.start + match.offset;

      // Step 4: Calculate confidence
      const clockPlausibility = this.clockNormalizer.getPlausibilityScore(targetSeconds);
      const ocrConfidence = request.ocrConfidence || 0.8; // Default if not provided

      const confidence = this.confidenceCalculator.calculate({
        ocrConfidence,
        clockPlausibility,
        timeDrift: match.drift,
        segmentContinuity: true, // Assume true for now
        matchType: match.matchType,
      });

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Sync complete in ${processingTime}ms: ` +
        `timestamp=${timestamp.toFixed(2)}s, ` +
        `confidence=${(confidence.overall * 100).toFixed(1)}%, ` +
        `drift=${match.drift.toFixed(2)}s`
      );

      // Step 5: Return result
      return {
        success: true,
        timestamp,
        segmentFilename: match.filename,
        segmentSequence: match.sequence,
        confidence: confidence.overall,
        drift: match.drift,
        metadata: {
          clockInput: request.clock,
          clockSeconds: targetSeconds,
          searchedSegments: 1, // Binary search is O(log n), only "visits" log(n) segments
          matchType: match.matchType,
        },
      };
    } catch (error) {
      this.logger.error('Sync failed', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      return {
        success: false,
        error: 'Sync processing failed',
      };
    }
  }

  /**
   * Get current live edge timestamp
   * Useful for fallback when sync confidence is low
   */
  async getLiveEdge(): Promise<number | null> {
    try {
      const segments = await this.timestampSearcher.searchWindow(999999, 0);

      if (segments.length === 0) {
        return null;
      }

      // Return the end time of the latest segment
      const latest = segments[segments.length - 1];
      return latest.end;
    } catch (error) {
      this.logger.error('Failed to get live edge', error);
      return null;
    }
  }
}
