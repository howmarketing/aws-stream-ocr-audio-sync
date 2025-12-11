/**
 * OCR Controller - HTTP endpoints for image OCR processing
 */

import {
  Controller,
  Post,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as pipeline from 'stream/promises';
import { OcrService } from './ocr.service';
import { OcrResponseDto } from './ocr.dto';

@Controller('ocr')
export class OcrController {
  private readonly logger = new Logger(OcrController.name);

  constructor(private readonly ocrService: OcrService) {}

  /**
   * POST /api/ocr/upload
   * Upload and process scoreboard image
   */
  @Post('upload')
  async uploadAndProcess(
    @Req() req: any, // Using any for FastifyRequest with multipart plugin
  ): Promise<OcrResponseDto> {
    try {
      // Get multipart file from Fastify
      const data = await req.file();

      if (!data) {
        throw new BadRequestException('No file uploaded');
      }

      this.logger.log(`Received upload: ${data.filename}`);

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        throw new BadRequestException('Only JPEG and PNG images are allowed');
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(data.filename);
      const savedFilename = `scoreboard-${uniqueSuffix}${ext}`;
      const uploadPath = this.ocrService.getUploadPath();
      const filePath = path.join(uploadPath, savedFilename);

      // Save file to disk
      await pipeline.pipeline(data.file, fs.createWriteStream(filePath));

      // Check file size (max 10MB)
      const stats = fs.statSync(filePath);
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (stats.size > maxSize) {
        fs.unlinkSync(filePath); // Clean up
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      this.logger.log(`File saved: ${savedFilename} (${stats.size} bytes)`);

      // Process with OCR
      const result = await this.ocrService.processImage(savedFilename);

      // Clean up file after processing
      // Note: We keep the file for now, cleanup can be done later or on schedule
      // this.ocrService.cleanupFile(savedFilename);

      return result;
    } catch (error) {
      this.logger.error('Upload failed', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('File upload failed');
    }
  }

  /**
   * GET /api/ocr/health
   * Health check for OCR domain
   */
  @Post('health')
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'ocr-api',
      timestamp: new Date().toISOString(),
    };
  }
}
