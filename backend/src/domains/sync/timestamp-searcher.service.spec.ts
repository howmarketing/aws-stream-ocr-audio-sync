import { Test, TestingModule } from '@nestjs/testing';
import { TimestampSearcherService } from './timestamp-searcher.service';
import { IndexService } from '../index/index.service';

describe('TimestampSearcherService', () => {
  let service: TimestampSearcherService;
  let indexService: any;

  const mockSegments = [
    {
      filename: 'segment0.ts',
      sequence: 0,
      start: 0,
      end: 2,
      duration: 2,
    },
    {
      filename: 'segment1.ts',
      sequence: 1,
      start: 2,
      end: 4,
      duration: 2,
    },
    {
      filename: 'segment2.ts',
      sequence: 2,
      start: 4,
      end: 6,
      duration: 2,
    },
    {
      filename: 'segment3.ts',
      sequence: 3,
      start: 6,
      end: 8,
      duration: 2,
    },
    {
      filename: 'segment4.ts',
      sequence: 4,
      start: 8,
      end: 10,
      duration: 2,
    },
  ];

  beforeEach(async () => {
    const mockIndexService = {
      getAllSegments: jest.fn(),
      getSegmentsByTimeRange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimestampSearcherService,
        {
          provide: IndexService,
          useValue: mockIndexService,
        },
      ],
    }).compile();

    service = module.get<TimestampSearcherService>(TimestampSearcherService);
    indexService = module.get(IndexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    beforeEach(() => {
      indexService.getAllSegments.mockResolvedValue(mockSegments);
    });

    it('should find exact match within segment bounds', async () => {
      const result = await service.search(3.5);

      expect(result).toBeDefined();
      expect(result?.matchType).toBe('exact');
      expect(result?.sequence).toBe(1);
      expect(result?.filename).toBe('segment1.ts');
      expect(result?.offset).toBe(1.5); // 3.5 - 2.0 (segment start)
      expect(result?.drift).toBe(0);
    });

    it('should find exact match at segment start', async () => {
      const result = await service.search(4.0);

      expect(result).toBeDefined();
      expect(result?.matchType).toBe('exact');
      expect(result?.sequence).toBe(2);
      expect(result?.offset).toBe(0);
      expect(result?.drift).toBe(0);
    });

    it('should find exact match at segment end', async () => {
      const result = await service.search(6.0);

      expect(result).toBeDefined();
      expect(result?.matchType).toBe('exact');
      expect(result?.sequence).toBe(2);
      expect(result?.offset).toBe(2.0);
      expect(result?.drift).toBe(0);
    });

    it('should find nearest match for time before all segments', async () => {
      const result = await service.search(-5);

      expect(result).toBeDefined();
      expect(result?.matchType).toBe('approximate'); // Within 5s tolerance
      expect(result?.sequence).toBe(0);
      expect(result?.drift).toBeGreaterThan(0);
    });

    it('should find nearest match for time after all segments', async () => {
      const result = await service.search(100);

      expect(result).toBeDefined();
      expect(result?.matchType).toBe('nearest');
      expect(result?.sequence).toBe(4);
      expect(result?.drift).toBeGreaterThan(0);
    });

    it('should find approximate match within drift tolerance', async () => {
      const result = await service.search(10.5); // 0.5s beyond last segment

      expect(result).toBeDefined();
      expect(result?.matchType).toBe('approximate');
      expect(result?.drift).toBeLessThanOrEqual(5);
    });

    it('should return null when no segments available', async () => {
      indexService.getAllSegments.mockResolvedValue([]);

      const result = await service.search(5);

      expect(result).toBeNull();
    });

    it('should handle single segment', async () => {
      indexService.getAllSegments.mockResolvedValue([mockSegments[0]]);

      const result = await service.search(1);

      expect(result).toBeDefined();
      expect(result?.matchType).toBe('exact');
      expect(result?.sequence).toBe(0);
    });

    it('should handle error gracefully', async () => {
      indexService.getAllSegments.mockRejectedValue(new Error('Database error'));

      const result = await service.search(5);

      expect(result).toBeNull();
    });

    it('should calculate offset correctly', async () => {
      const result = await service.search(7.3);

      expect(result).toBeDefined();
      expect(result?.start).toBe(6);
      expect(result?.offset).toBeCloseTo(1.3, 1);
    });
  });

  describe('searchWindow', () => {
    beforeEach(() => {
      indexService.getSegmentsByTimeRange.mockResolvedValue([
        mockSegments[1],
        mockSegments[2],
      ]);
    });

    it('should return segments within time window', async () => {
      const results = await service.searchWindow(5, 4);

      expect(results).toHaveLength(2);
      expect(results[0].sequence).toBe(1);
      expect(results[1].sequence).toBe(2);
    });

    it('should calculate offset for each segment', async () => {
      const results = await service.searchWindow(5, 4);

      results.forEach((result) => {
        expect(result.offset).toBeGreaterThanOrEqual(0);
        expect(result.offset).toBeLessThanOrEqual(result.duration);
      });
    });

    it('should mark all results as approximate', async () => {
      const results = await service.searchWindow(5, 4);

      results.forEach((result) => {
        expect(result.matchType).toBe('approximate');
      });
    });

    it('should use default window size of 10', async () => {
      await service.searchWindow(5);

      expect(indexService.getSegmentsByTimeRange).toHaveBeenCalledWith(0, 10);
    });

    it('should handle custom window size', async () => {
      await service.searchWindow(10, 20);

      expect(indexService.getSegmentsByTimeRange).toHaveBeenCalledWith(0, 20);
    });

    it('should calculate drift correctly', async () => {
      const results = await service.searchWindow(5, 4);

      results.forEach((result) => {
        expect(result.drift).toBeDefined();
        expect(result.drift).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
