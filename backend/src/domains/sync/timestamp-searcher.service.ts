/**
 * Timestamp Searcher Service
 * Searches segment index for matching timestamps using binary search
 */

import { Injectable, Logger } from '@nestjs/common';
import { IndexService } from '../index/index.service';

export interface SegmentMatch {
  filename: string;
  sequence: number;
  start: number;
  end: number;
  duration: number;
  offset: number; // Exact position within segment
  drift: number; // How far off from target
  matchType: 'exact' | 'approximate' | 'nearest';
}

@Injectable()
export class TimestampSearcherService {
  private readonly logger = new Logger(TimestampSearcherService.name);
  private readonly DRIFT_TOLERANCE = 5; // seconds

  constructor(private readonly indexService: IndexService) {}

  /**
   * Search for segment containing the target timestamp
   * Uses binary search for O(log n) performance
   */
  async search(targetSeconds: number): Promise<SegmentMatch | null> {
    try {
      const startTime = Date.now();

      // Get all segments sorted by start time
      const segments = await this.indexService.getAllSegments();

      if (!segments || segments.length === 0) {
        this.logger.warn('No segments available for search');
        return null;
      }

      this.logger.log(`Searching ${segments.length} segments for timestamp: ${targetSeconds}s`);

      // Binary search for segment containing target time
      let left = 0;
      let right = segments.length - 1;
      let bestMatch: SegmentMatch | null = null;
      let minDrift = Infinity;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const segment = segments[mid];

        // Check if target is within this segment
        if (targetSeconds >= segment.start && targetSeconds <= segment.end) {
          // Exact match found
          const offset = targetSeconds - segment.start;

          bestMatch = {
            filename: segment.filename,
            sequence: segment.sequence,
            start: segment.start,
            end: segment.end,
            duration: segment.duration,
            offset,
            drift: 0,
            matchType: 'exact',
          };

          this.logger.log(`Exact match: segment ${segment.sequence} at offset ${offset.toFixed(2)}s`);
          break;
        }

        // Track nearest segment for approximate matching
        const driftFromStart = Math.abs(targetSeconds - segment.start);
        const driftFromEnd = Math.abs(targetSeconds - segment.end);
        const drift = Math.min(driftFromStart, driftFromEnd);

        if (drift < minDrift) {
          minDrift = drift;
          const offset = targetSeconds <= segment.start ? 0 : segment.duration;

          bestMatch = {
            filename: segment.filename,
            sequence: segment.sequence,
            start: segment.start,
            end: segment.end,
            duration: segment.duration,
            offset,
            drift,
            matchType: drift <= this.DRIFT_TOLERANCE ? 'approximate' : 'nearest',
          };
        }

        // Binary search logic
        if (targetSeconds < segment.start) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }

      const searchTime = Date.now() - startTime;

      if (bestMatch) {
        this.logger.log(
          `Found ${bestMatch.matchType} match in ${searchTime}ms: ` +
          `segment ${bestMatch.sequence}, drift ${bestMatch.drift.toFixed(2)}s`
        );
      } else {
        this.logger.warn(`No match found for timestamp ${targetSeconds}s`);
      }

      return bestMatch;
    } catch (error) {
      this.logger.error('Timestamp search failed', error);
      return null;
    }
  }

  /**
   * Search within a time window (for handling uncertainty)
   */
  async searchWindow(
    centerSeconds: number,
    windowSize: number = 10,
  ): Promise<SegmentMatch[]> {
    const startTime = centerSeconds - windowSize / 2;
    const endTime = centerSeconds + windowSize / 2;

    const segments = await this.indexService.getSegmentsByTimeRange(startTime, endTime);

    return segments.map((seg: any) => ({
      filename: seg.filename,
      sequence: seg.sequence,
      start: seg.start,
      end: seg.end,
      duration: seg.duration,
      offset: Math.max(0, Math.min(seg.duration, centerSeconds - seg.start)),
      drift: Math.min(
        Math.abs(centerSeconds - seg.start),
        Math.abs(centerSeconds - seg.end),
      ),
      matchType: 'approximate' as const,
    }));
  }
}
