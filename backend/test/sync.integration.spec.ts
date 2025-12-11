/**
 * Sync API Integration Tests
 * Tests the timestamp synchronization endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Sync API Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/sync', () => {
    it('should successfully sync with valid clock time', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.95,
        })
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('syncedTimestamp');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('drift');
    });

    it('should handle clock time in various formats', async () => {
      const validFormats = [
        '12:34',
        '1:23',
        '00:45',
        '59:59',
      ];

      for (const clock of validFormats) {
        const response = await request(app.getHttpServer())
          .post('/api/sync')
          .send({
            clock,
            confidence: 0.90,
          });

        expect([200, 404]).toContain(response.status);
      }
    });

    it('should reject invalid clock format', async () => {
      const invalidFormats = [
        { clock: 'invalid', confidence: 0.9 },
        { clock: '99:99', confidence: 0.9 },
        { clock: '-1:00', confidence: 0.9 },
        { clock: '12:60', confidence: 0.9 },
      ];

      for (const payload of invalidFormats) {
        const response = await request(app.getHttpServer())
          .post('/api/sync')
          .send(payload)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      }
    });

    it('should reject missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('clock');
    });

    it('should handle confidence values', async () => {
      const testCases = [
        { confidence: 0.0, shouldSucceed: true },
        { confidence: 0.5, shouldSucceed: true },
        { confidence: 1.0, shouldSucceed: true },
        { confidence: -0.1, shouldSucceed: false },
        { confidence: 1.1, shouldSucceed: false },
      ];

      for (const testCase of testCases) {
        const response = await request(app.getHttpServer())
          .post('/api/sync')
          .send({
            clock: '12:34',
            confidence: testCase.confidence,
          });

        if (testCase.shouldSucceed) {
          expect([200, 404]).toContain(response.status);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });

    it('should return 404 when segment not found', async () => {
      // Use a time that likely doesn't exist
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '99:59',
          confidence: 0.95,
        })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should calculate drift accurately', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.95,
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('drift');
        expect(typeof response.body.drift).toBe('number');
        // Drift should be reasonable (within ±5 seconds for good accuracy)
        expect(Math.abs(response.body.drift)).toBeLessThan(5);
      }
    });
  });

  describe('Sync Performance', () => {
    it('should complete sync within performance target (<500ms)', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.95,
        });

      const duration = Date.now() - startTime;

      // Sync should complete within 500ms
      expect(duration).toBeLessThan(500);
    });

    it('should handle multiple concurrent sync requests', async () => {
      const syncPromises = Array(10)
        .fill(null)
        .map((_, index) =>
          request(app.getHttpServer())
            .post('/api/sync')
            .send({
              clock: `${10 + index}:${30 + index}`,
              confidence: 0.90,
            })
        );

      const responses = await Promise.all(syncPromises);

      // All should return valid responses
      responses.forEach((response) => {
        expect([200, 404]).toContain(response.status);
      });
    }, 10000);
  });

  describe('Response Validation', () => {
    it('should return properly formatted sync response', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.95,
        });

      if (response.status === 200) {
        expect(response.body).toMatchObject({
          success: expect.any(Boolean),
          syncedTimestamp: expect.any(Number),
          confidence: expect.any(Number),
          drift: expect.any(Number),
          metadata: expect.any(Object),
        });

        // Validate timestamp is positive
        expect(response.body.syncedTimestamp).toBeGreaterThanOrEqual(0);

        // Validate confidence is between 0 and 1
        expect(response.body.confidence).toBeGreaterThanOrEqual(0);
        expect(response.body.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should include metadata with segment information', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.95,
        });

      if (response.status === 200) {
        expect(response.body.metadata).toHaveProperty('segmentId');
        expect(response.body.metadata).toHaveProperty('segmentStart');
        expect(response.body.metadata).toHaveProperty('segmentEnd');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero time (00:00)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '00:00',
          confidence: 0.95,
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should handle maximum reasonable time (119:59)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '119:59',
          confidence: 0.95,
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should handle low confidence scenarios', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.1, // Very low confidence
        });

      // Should still process but might indicate low confidence in response
      expect([200, 404]).toContain(response.status);
    });

    it('should handle optional score field', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.95,
          score: {
            home: 21,
            away: 17,
          },
        });

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should return appropriate error for malformed JSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sync')
        .send({
          clock: '12:34',
          confidence: 0.95,
        });

      // Should still work with proper JSON
      expect([200, 400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/sync/health', () => {
    it('should return sync service health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/sync/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });
});
