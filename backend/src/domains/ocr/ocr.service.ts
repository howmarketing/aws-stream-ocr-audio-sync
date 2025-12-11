/**
 * OCR Service - Communicates with OCR container
 */

import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { OcrResponseDto } from './ocr.dto';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly ocrServiceUrl: string;
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    this.ocrServiceUrl = this.configService.get<string>('OCR_SERVICE_URL') || 'http://ocr:3001';
    this.uploadPath = '/ocr/input'; // Shared volume with OCR container
  }

  /**
   * Get upload directory path
   */
  getUploadPath(): string {
    return this.uploadPath;
  }

  /**
   * Process uploaded image with OCR
   */
  async processImage(filename: string): Promise<OcrResponseDto> {
    const startTime = Date.now();

    try {
      // Verify file exists
      const filePath = path.join(this.uploadPath, filename);
      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('Uploaded file not found');
      }

      this.logger.log(`Processing OCR for file: ${filename}`);

      // Call OCR service
      const response = await fetch(`${this.ocrServiceUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new ServiceUnavailableException('OCR service request failed');
      }

      const result: OcrResponseDto = await response.json();

      const processingTime = Date.now() - startTime;
      this.logger.log(`OCR completed in ${processingTime}ms, confidence: ${result.result?.confidence}`);

      return result;
    } catch (error) {
      this.logger.error('OCR processing failed', error);

      if (error instanceof BadRequestException || error instanceof ServiceUnavailableException) {
        throw error;
      }

      throw new ServiceUnavailableException('OCR service unavailable');
    }
  }

  /**
   * Validate uploaded file
   */
  validateImage(file: Express.Multer.File): void {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }

    this.logger.log(`File validated: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
  }

  /**
   * Clean up uploaded file
   */
  cleanupFile(filename: string): void {
    try {
      const filePath = path.join(this.uploadPath, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Cleaned up file: ${filename}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup file: ${filename}`, error);
    }
  }
}
