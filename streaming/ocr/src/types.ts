/**
 * OCR Service Type Definitions
 */

export interface OcrResult {
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

export interface PreprocessingOptions {
  grayscale?: boolean;
  threshold?: number;
  denoise?: boolean;
  resize?: boolean;
  targetWidth?: number;
}

export interface TesseractConfig {
  lang: string;
  tessedit_char_whitelist: string;
  psm: number; // Page segmentation mode
}

export interface OcrRequest {
  imagePath: string;
  preprocessingOptions?: PreprocessingOptions;
}

export interface OcrResponse {
  success: boolean;
  result?: OcrResult;
  error?: string;
}
