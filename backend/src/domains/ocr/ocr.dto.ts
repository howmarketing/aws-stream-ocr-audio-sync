/**
 * OCR Domain - Data Transfer Objects
 */

export class OcrResultDto {
  clock: string | null;
  score: {
    home: number | null;
    away: number | null;
  };
  confidence: number;
  rawText: string;
  metadata: {
    processingTime: number;
    imageWidth?: number;
    imageHeight?: number;
    tesseractConfidence?: number;
  };
}

export class OcrResponseDto {
  success: boolean;
  result?: OcrResultDto;
  error?: string;
}

export class UploadResponseDto {
  success: boolean;
  message: string;
  filename?: string;
}
