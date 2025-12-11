import { Test, TestingModule } from '@nestjs/testing';
import { ClockNormalizerService } from './clock-normalizer.service';

describe('ClockNormalizerService', () => {
  let service: ClockNormalizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClockNormalizerService],
    }).compile();

    service = module.get<ClockNormalizerService>(ClockNormalizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('normalize', () => {
    it('should normalize valid MM:SS format', () => {
      const result = service.normalize('12:34');
      expect(result).toEqual({
        seconds: 34,
        minutes: 12,
        totalSeconds: 754,
        valid: true,
      });
    });

    it('should handle single digit minutes', () => {
      const result = service.normalize('5:23');
      expect(result).toEqual({
        seconds: 23,
        minutes: 5,
        totalSeconds: 323,
        valid: true,
      });
    });

    it('should handle zero values', () => {
      const result = service.normalize('0:00');
      expect(result).toEqual({
        seconds: 0,
        minutes: 0,
        totalSeconds: 0,
        valid: true,
      });
    });

    it('should handle maximum game time', () => {
      const result = service.normalize('45:00');
      expect(result).toEqual({
        seconds: 0,
        minutes: 45,
        totalSeconds: 2700,
        valid: true,
      });
    });

    it('should handle overtime values', () => {
      const result = service.normalize('90:15');
      expect(result).toEqual({
        seconds: 15,
        minutes: 90,
        totalSeconds: 5415,
        valid: true,
      });
    });

    it('should reject invalid format - no colon', () => {
      const result = service.normalize('1234');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid format - too many digits', () => {
      const result = service.normalize('123:45');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid format - letters', () => {
      const result = service.normalize('12:AB');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid seconds - out of range', () => {
      const result = service.normalize('12:99');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Seconds');
    });

    it('should reject empty string', () => {
      const result = service.normalize('');
      expect(result.valid).toBe(false);
    });

    it('should reject null or undefined', () => {
      const result1 = service.normalize(null as any);
      const result2 = service.normalize(undefined as any);
      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });
  });

  describe('getPlausibilityScore', () => {
    it('should return 1.0 for very plausible times (0-60 min)', () => {
      expect(service.getPlausibilityScore(0)).toBe(1.0);
      expect(service.getPlausibilityScore(1800)).toBe(1.0); // 30 minutes
      expect(service.getPlausibilityScore(3600)).toBe(1.0); // 60 minutes
    });

    it('should return 0.8 for somewhat plausible times (60-90 min)', () => {
      expect(service.getPlausibilityScore(4500)).toBe(0.8); // 75 minutes
      expect(service.getPlausibilityScore(5400)).toBe(0.8); // 90 minutes
    });

    it('should return 0.5 for edge case times (90-120 min)', () => {
      expect(service.getPlausibilityScore(6000)).toBe(0.5); // 100 minutes
      expect(service.getPlausibilityScore(7200)).toBe(0.5); // 120 minutes
    });

    it('should return 0.3 for unlikely times (>120 min)', () => {
      expect(service.getPlausibilityScore(8000)).toBe(0.3); // >120 minutes
      expect(service.getPlausibilityScore(10000)).toBe(0.3);
    });
  });
});
