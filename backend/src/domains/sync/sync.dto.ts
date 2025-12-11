/**
 * Sync Domain - Data Transfer Objects
 */

export class SyncRequestDto {
  clock: string; // Format: MM:SS or M:SS
  score?: {
    home: number;
    away: number;
  };
  ocrConfidence?: number; // Optional OCR confidence from previous step
}

export class SyncResultDto {
  success: boolean;
  timestamp?: number; // Seconds into the audio stream
  segmentFilename?: string;
  segmentSequence?: number;
  confidence?: number;
  drift?: number; // Seconds of drift from exact match
  metadata?: {
    clockInput: string;
    clockSeconds: number;
    searchedSegments: number;
    matchType?: 'exact' | 'approximate' | 'nearest';
  };
  error?: string;
}

export class ClockNormalizationResult {
  seconds: number;
  minutes: number;
  totalSeconds: number;
  valid: boolean;
  error?: string;
}
