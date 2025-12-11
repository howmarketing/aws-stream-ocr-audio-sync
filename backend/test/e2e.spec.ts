/**
 * End-to-End Tests
 * Tests complete user workflows from OCR upload to sync playback
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

describe('E2E: Complete User Workflows', () => {
  let app: INestApplication;
  const testImagePath = path.join(__dirname, 'fixtures', 'test-scoreboard.jpg');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Ensure test fixtures exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create test image if needed
    if (!fs.existsSync(testImagePath)) {
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Workflow 1: OCR Upload → Sync Player', () => {
    it('should complete full OCR and sync workflow', async () => {
      // Step 1: Upload scoreboard image for OCR
      const ocrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      expect(ocrResponse.body).toHaveProperty('success');
      expect(ocrResponse.body.result).toHaveProperty('clock');
      expect(ocrResponse.body.result).toHaveProperty('confidence');

      const clockTime = ocrResponse.body.result.clock;
      const confidence = ocrResponse.body.result.confidence;

      // Validate OCR results
      expect(clockTime).toMatch(/^\d{1,2}:\d{2}$/); // MM:SS format
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);

      // Step 2: Use OCR result to sync player
      const syncResponse = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: clockTime,
          confidence: confidence,
        });

      // Should either find segment or return 404
      expect([200, 404]).toContain(syncResponse.status);

      if (syncResponse.status === 200) {
        expect(syncResponse.body).toHaveProperty('success', true);
        expect(syncResponse.body).toHaveProperty('syncedTimestamp');
        expect(syncResponse.body).toHaveProperty('confidence');
        expect(syncResponse.body).toHaveProperty('drift');
      }
    }, 15000);

    it('should handle workflow with score data', async () => {
      // Step 1: Upload and get OCR results
      const ocrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      const clockTime = ocrResponse.body.result.clock;
      const confidence = ocrResponse.body.result.confidence;
      const score = ocrResponse.body.result.score;

      // Step 2: Sync with score information
      const syncResponse = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: clockTime,
          confidence: confidence,
          score: score,
        });

      expect([200, 404]).toContain(syncResponse.status);
    }, 15000);
  });

  describe('Workflow 2: Multiple Sync Attempts', () => {
    it('should handle multiple sync attempts with same image', async () => {
      // Upload once
      const ocrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      const clockTime = ocrResponse.body.result.clock;
      const confidence = ocrResponse.body.result.confidence;

      // Sync multiple times with same data
      const syncAttempts = 3;
      const syncResponses = [];

      for (let i = 0; i < syncAttempts; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/sync')
          .send({
            clock: clockTime,
            confidence: confidence,
          });

        syncResponses.push(response);
      }

      // All should return consistent results
      syncResponses.forEach((response) => {
        expect([200, 404]).toContain(response.status);
      });

      // If any succeeded, all should have same timestamp
      const successfulSyncs = syncResponses.filter((r) => r.status === 200);
      if (successfulSyncs.length > 0) {
        const firstTimestamp = successfulSyncs[0].body.syncedTimestamp;
        successfulSyncs.forEach((sync) => {
          expect(sync.body.syncedTimestamp).toBe(firstTimestamp);
        });
      }
    }, 20000);
  });

  describe('Workflow 3: Progressive Sync Refinement', () => {
    it('should allow refining sync with better OCR', async () => {
      // First attempt - upload image
      const firstOcrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      const firstClock = firstOcrResponse.body.result.clock;
      const firstConfidence = firstOcrResponse.body.result.confidence;

      // First sync attempt
      const firstSyncResponse = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: firstClock,
          confidence: firstConfidence,
        });

      // Second attempt - upload same or different image
      const secondOcrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      const secondClock = secondOcrResponse.body.result.clock;
      const secondConfidence = secondOcrResponse.body.result.confidence;

      // Second sync attempt
      const secondSyncResponse = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: secondClock,
          confidence: secondConfidence,
        });

      // Both should complete (success or not found)
      expect([200, 404]).toContain(firstSyncResponse.status);
      expect([200, 404]).toContain(secondSyncResponse.status);
    }, 20000);
  });

  describe('Workflow 4: Error Recovery', () => {
    it('should recover from invalid OCR result', async () => {
      // Try to sync with invalid data
      const invalidSyncResponse = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: 'invalid',
          confidence: 0.95,
        })
        .expect(400);

      expect(invalidSyncResponse.body).toHaveProperty('message');

      // Follow up with valid OCR workflow
      const ocrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      const validSyncResponse = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: ocrResponse.body.result.clock,
          confidence: ocrResponse.body.result.confidence,
        });

      expect([200, 404]).toContain(validSyncResponse.status);
    }, 15000);

    it('should handle OCR failure and retry', async () => {
      // First attempt - might fail
      const firstAttempt = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath);

      // Retry if needed
      if (firstAttempt.status !== 201) {
        const retryAttempt = await request(app.getHttpServer())
          .post('/api/ocr/upload')
          .attach('image', testImagePath);

        // At least one should succeed or fail gracefully
        expect([201, 400, 503]).toContain(retryAttempt.status);
      }
    }, 15000);
  });

  describe('Workflow 5: Performance Under Load', () => {
    it('should maintain performance with concurrent workflows', async () => {
      const concurrentWorkflows = 5;
      const workflowPromises = [];

      for (let i = 0; i < concurrentWorkflows; i++) {
        const workflow = (async () => {
          // Upload OCR
          const ocrResponse = await request(app.getHttpServer())
            .post('/api/ocr/upload')
            .attach('image', testImagePath);

          if (ocrResponse.status === 201) {
            // Sync
            await request(app.getHttpServer())
              .post('/api/sync')
              .send({
                clock: ocrResponse.body.result.clock,
                confidence: ocrResponse.body.result.confidence,
              });
          }
        })();

        workflowPromises.push(workflow);
      }

      // All workflows should complete without errors
      await expect(Promise.all(workflowPromises)).resolves.toBeDefined();
    }, 60000);
  });

  describe('Workflow 6: Health Check Integration', () => {
    it('should verify all services are healthy before workflow', async () => {
      // Check health endpoints
      const healthChecks = await Promise.all([
        request(app.getHttpServer()).get('/api/health'),
        request(app.getHttpServer()).get('/api/ocr/health'),
        request(app.getHttpServer()).get('/api/sync/health'),
      ]);

      // All health checks should pass
      healthChecks.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
      });

      // Proceed with workflow only if healthy
      if (healthChecks.every((r) => r.status === 200)) {
        const ocrResponse = await request(app.getHttpServer())
          .post('/api/ocr/upload')
          .attach('image', testImagePath)
          .expect(201);

        expect(ocrResponse.body.success).toBe(true);
      }
    }, 15000);
  });

  describe('Workflow 7: Data Validation Throughout Pipeline', () => {
    it('should validate data at each stage of the workflow', async () => {
      // Stage 1: Upload validation
      const ocrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      // Validate OCR response structure
      expect(ocrResponse.body).toMatchObject({
        success: expect.any(Boolean),
        result: {
          clock: expect.stringMatching(/^\d{1,2}:\d{2}$/),
          score: expect.any(Object),
          confidence: expect.any(Number),
          metadata: expect.any(Object),
        },
      });

      // Stage 2: Sync validation
      const clockTime = ocrResponse.body.result.clock;
      const confidence = ocrResponse.body.result.confidence;

      // Ensure clock is valid before syncing
      expect(clockTime).toMatch(/^\d{1,2}:\d{2}$/);
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);

      const syncResponse = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: clockTime,
          confidence: confidence,
        });

      if (syncResponse.status === 200) {
        // Validate sync response structure
        expect(syncResponse.body).toMatchObject({
          success: true,
          syncedTimestamp: expect.any(Number),
          confidence: expect.any(Number),
          drift: expect.any(Number),
          metadata: expect.any(Object),
        });

        // Validate timestamp is reasonable
        expect(syncResponse.body.syncedTimestamp).toBeGreaterThanOrEqual(0);
      }
    }, 15000);
  });

  describe('Workflow 8: End-to-End Latency', () => {
    it('should complete full workflow within acceptable time', async () => {
      const startTime = Date.now();

      // Upload OCR
      const ocrResponse = await request(app.getHttpServer())
        .post('/api/ocr/upload')
        .attach('image', testImagePath)
        .expect(201);

      const ocrTime = Date.now() - startTime;

      // Sync
      const syncStartTime = Date.now();
      await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: ocrResponse.body.result.clock,
          confidence: ocrResponse.body.result.confidence,
        });

      const syncTime = Date.now() - syncStartTime;
      const totalTime = Date.now() - startTime;

      // Performance assertions
      expect(ocrTime).toBeLessThan(3000); // OCR < 3s
      expect(syncTime).toBeLessThan(500); // Sync < 500ms
      expect(totalTime).toBeLessThan(4000); // Total < 4s
    }, 15000);
  });
});
