/**
 * Sync Domain - Data Transfer Objects
 */

import { IsString, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ScoreDto {
  @IsNumber()
  home: number;

  @IsNumber()
  away: number;
}

export class SyncRequestDto {
  @IsString()
  clock: string; // Format: MM:SS or M:SS

  @IsOptional()
  @ValidateNested()
  @Type(() => ScoreDto)
  score?: ScoreDto;

  @IsOptional()
  @IsNumber()
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
