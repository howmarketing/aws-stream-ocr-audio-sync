import { Test, TestingModule } from '@nestjs/testing';
import { ConfidenceCalculatorService, ConfidenceFactors } from './confidence-calculator.service';

describe('ConfidenceCalculatorService', () => {
  let service: ConfidenceCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfidenceCalculatorService],
    }).compile();

    service = module.get<ConfidenceCalculatorService>(
      ConfidenceCalculatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculate', () => {
    it('should calculate high confidence with ideal factors', () => {
      const factors: ConfidenceFactors = {
        ocrConfidence: 0.95,
        clockPlausibility: 1.0,
        timeDrift: 0.5,
        matchType: 'exact',
        segmentContinuity: true,
      };

      const result = service.calculate(factors);

      expect(result.overall).toBeGreaterThan(0.9);
      expect(result.factors.ocr).toBe(0.95);
      expect(result.factors.plausibility).toBe(1.0);
      expect(result.weights).toBeDefined();
    });

    it('should penalize low OCR confidence', () => {
      const goodFactors: ConfidenceFactors = {
        ocrConfidence: 0.9,
        clockPlausibility: 1.0,
        timeDrift: 0.5,
        matchType: 'exact',
        segmentContinuity: true,
      };

      const badFactors: ConfidenceFactors = {
        ...goodFactors,
        ocrConfidence: 0.4,
      };

      const goodResult = service.calculate(goodFactors);
      const badResult = service.calculate(badFactors);

      expect(badResult.overall).toBeLessThan(goodResult.overall);
    });

    it('should penalize high time drift', () => {
      const lowDrift: ConfidenceFactors = {
        ocrConfidence: 0.9,
        clockPlausibility: 1.0,
        timeDrift: 0.5,
        matchType: 'approximate',
        segmentContinuity: true,
      };

      const highDrift: ConfidenceFactors = {
        ...lowDrift,
        timeDrift: 5.0,
      };

      const lowDriftResult = service.calculate(lowDrift);
      const highDriftResult = service.calculate(highDrift);

      expect(highDriftResult.overall).toBeLessThan(lowDriftResult.overall);
    });

    it('should handle nearest match type', () => {
      const exactMatch: ConfidenceFactors = {
        ocrConfidence: 0.9,
        clockPlausibility: 1.0,
        timeDrift: 0.5,
        matchType: 'exact',
        segmentContinuity: true,
      };

      const nearestMatch: ConfidenceFactors = {
        ...exactMatch,
        matchType: 'nearest',
      };

      const exactResult = service.calculate(exactMatch);
      const nearestResult = service.calculate(nearestMatch);

      expect(nearestResult.overall).toBeLessThan(exactResult.overall);
    });

    it('should penalize missing segment continuity', () => {
      const continuous: ConfidenceFactors = {
        ocrConfidence: 0.9,
        clockPlausibility: 1.0,
        timeDrift: 0.5,
        matchType: 'exact',
        segmentContinuity: true,
      };

      const discontinuous: ConfidenceFactors = {
        ...continuous,
        segmentContinuity: false,
      };

      const continuousResult = service.calculate(continuous);
      const discontinuousResult = service.calculate(discontinuous);

      expect(discontinuousResult.overall).toBeLessThan(
        continuousResult.overall,
      );
    });

    it('should clamp overall confidence between 0 and 1', () => {
      const factors: ConfidenceFactors = {
        ocrConfidence: 1.0,
        clockPlausibility: 1.0,
        timeDrift: 0.0,
        matchType: 'exact',
        segmentContinuity: true,
      };

      const result = service.calculate(factors);

      expect(result.overall).toBeGreaterThanOrEqual(0);
      expect(result.overall).toBeLessThanOrEqual(1);
    });

    it('should apply correct weights (40% OCR, 30% plausibility, 20% drift, 10% continuity)', () => {
      const factors: ConfidenceFactors = {
        ocrConfidence: 1.0,
        clockPlausibility: 1.0,
        timeDrift: 0.0,
        matchType: 'exact',
        segmentContinuity: true,
      };

      const result = service.calculate(factors);

      expect(result.weights).toEqual({
        ocr: 0.4,
        plausibility: 0.3,
        drift: 0.2,
        continuity: 0.1,
      });
    });

    it('should provide detailed factors breakdown', () => {
      const factors: ConfidenceFactors = {
        ocrConfidence: 0.8,
        clockPlausibility: 0.9,
        timeDrift: 1.0,
        matchType: 'exact',
        segmentContinuity: true,
      };

      const result = service.calculate(factors);

      expect(result.factors.ocr).toBeDefined();
      expect(result.factors.plausibility).toBeDefined();
      expect(result.factors.drift).toBeDefined();
      expect(result.factors.continuity).toBeDefined();
    });
  });

  describe('isAcceptable', () => {
    it('should accept confidence >= 0.5', () => {
      expect(service.isAcceptable(0.5)).toBe(true);
      expect(service.isAcceptable(0.7)).toBe(true);
      expect(service.isAcceptable(1.0)).toBe(true);
    });

    it('should reject confidence < 0.5', () => {
      expect(service.isAcceptable(0.4)).toBe(false);
      expect(service.isAcceptable(0.0)).toBe(false);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return correct confidence levels', () => {
      expect(service.getConfidenceLevel(0.95)).toBe('excellent');
      expect(service.getConfidenceLevel(0.75)).toBe('good');
      expect(service.getConfidenceLevel(0.55)).toBe('acceptable');
      expect(service.getConfidenceLevel(0.4)).toBe('low');
      expect(service.getConfidenceLevel(0.2)).toBe('very low');
    });
  });
});
