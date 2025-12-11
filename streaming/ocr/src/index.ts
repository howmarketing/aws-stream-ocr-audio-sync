/**
 * OCR Service - HTTP API
 * Provides REST endpoints for image OCR processing
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { preprocessImage, validateImage } from './preprocessing';
import { runOcr, calculateConfidence } from './ocr';
import { OcrResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;
const INPUT_PATH = process.env.OCR_INPUT_PATH || '/ocr/input';
const OUTPUT_PATH = process.env.OCR_OUTPUT_PATH || '/ocr/output';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure directories exist
if (!fs.existsSync(INPUT_PATH)) {
  fs.mkdirSync(INPUT_PATH, { recursive: true });
}
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
}

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ocr',
    timestamp: new Date().toISOString(),
  });
});

/**
 * OCR processing endpoint
 * POST /process
 * Body: { filename: string }
 */
app.post('/process', async (req: Request, res: Response) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).json({
      success: false,
      error: 'Missing filename parameter',
    } as OcrResponse);
  }

  const inputFile = path.join(INPUT_PATH, filename);
  const preprocessedFile = path.join(OUTPUT_PATH, `preprocessed_${filename}`);

  try {
    // Step 1: Validate input file exists
    if (!fs.existsSync(inputFile)) {
      return res.status(404).json({
        success: false,
        error: 'Input file not found',
      } as OcrResponse);
    }

    // Step 2: Validate image format
    const isValid = await validateImage(inputFile);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format or dimensions',
      } as OcrResponse);
    }

    // Step 3: Preprocess image
    const { width, height } = await preprocessImage(inputFile, preprocessedFile);

    // Step 4: Run OCR
    const ocrResult = await runOcr(preprocessedFile);

    // Step 5: Calculate final confidence
    const finalConfidence = calculateConfidence(ocrResult);

    // Update result with metadata
    ocrResult.confidence = finalConfidence;
    ocrResult.metadata.imageWidth = width;
    ocrResult.metadata.imageHeight = height;

    // Step 6: Clean up preprocessed file (optional)
    if (fs.existsSync(preprocessedFile)) {
      fs.unlinkSync(preprocessedFile);
    }

    // Step 7: Return result
    return res.json({
      success: true,
      result: ocrResult,
    } as OcrResponse);
  } catch (error) {
    console.error('OCR processing error:', error);

    // Clean up on error
    if (fs.existsSync(preprocessedFile)) {
      fs.unlinkSync(preprocessedFile);
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'OCR processing failed',
    } as OcrResponse);
  }
});

/**
 * Get OCR service info
 */
app.get('/info', (req: Request, res: Response) => {
  res.json({
    service: 'OCR Service',
    version: '1.0.0',
    tesseract: 'installed',
    supportedFormats: ['JPEG', 'PNG'],
    maxFileSize: '10MB',
    endpoints: {
      health: 'GET /health',
      process: 'POST /process',
      info: 'GET /info',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('OCR Service - Tesseract');
  console.log('========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Input path: ${INPUT_PATH}`);
  console.log(`Output path: ${OUTPUT_PATH}`);
  console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
