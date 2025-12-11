/**
 * OCR API Integration Tests
 * Tests the full OCR upload and processing flow
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

describe('OCR API Integration Tests', () => {
  let app: INestApplication;
  const testImagePath = path.join(__dirname, 'fixtures', 'test-scoreboard.jpg');
  const testInvalidImagePath = path.join(__dirname, 'fixtures', 'test-invalid.txt');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create test fixtures directory if it doesn't exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create a simple test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      // Create a minimal valid JPEG file (1x1 pixel)
      const minimalJpeg = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,
        0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08,
        0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0xD2, 0xFF,
        0xD9
      ]);
      fs.writeFileSync(testImagePath, minimalJpeg);
    }

    // Create invalid file
    if (!fs.existsSync(testInvalidImagePath)) {
      fs.writeFileSync(testInvalidImagePath, 'This is not an image');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/ocr/upload', () => {
    it('should successfully upload and process a valid image', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('clock');
      expect(response.body.result).toHaveProperty('confidence');
    }, 10000); // 10 second timeout for OCR processing

    it('should reject request without file', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject file larger than 10MB', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
      const largePath = path.join(__dirname, 'fixtures', 'large.jpg');

      // Write minimal JPEG header
      const minimalJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      largeBuffer.set(minimalJpeg, 0);
      fs.writeFileSync(largePath, largeBuffer);

      const response = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', largePath)
        .expect(400);

      expect(response.body.message).toContain('10MB');

      // Cleanup
      if (fs.existsSync(largePath)) {
        fs.unlinkSync(largePath);
      }
    }, 15000);

    it('should reject unsupported file types', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testInvalidImagePath)
        .expect(400);

      expect(response.body.message).toContain('JPEG and PNG');
    });

    it('should handle OCR service unavailability gracefully', async () => {
      // This test assumes OCR service might be down
      // The actual behavior depends on the service state
      const response = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath);

      // Should either succeed or return 503
      expect([201, 503]).toContain(response.status);
    }, 10000);
  });

  describe('GET /api/ocr/health', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ocr/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Response Performance', () => {
    it('should process OCR within performance target (<3s)', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath);

      const duration = Date.now() - startTime;

      // OCR should complete within 3 seconds
      expect(duration).toBeLessThan(3000);
    }, 10000);
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted OCR response', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      // Validate response structure
      expect(response.body).toMatchObject({
        success: expect.any(Boolean),
        result: {
          clock: expect.any(String),
          score: expect.any(Object),
          confidence: expect.any(Number),
          metadata: expect.any(Object),
        },
      });

      // Validate confidence is between 0 and 1
      expect(response.body.result.confidence).toBeGreaterThanOrEqual(0);
      expect(response.body.result.confidence).toBeLessThanOrEqual(1);
    }, 10000);
  });

  describe('Concurrent Upload Handling', () => {
    it('should handle multiple concurrent uploads', async () => {
      const uploadPromises = Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/api/ocr/upload')
            .attach('image', testImagePath)
        );

      const responses = await Promise.all(uploadPromises);

      // All should succeed or fail gracefully
      responses.forEach((response) => {
        expect([201, 503]).toContain(response.status);
      });
    }, 30000);
  });
});
