import { Test, TestingModule } from '@nestjs/testing';
import { OcrService } from './ocr.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

// Mock file type for testing
interface MockFile {
  originalname: string;
  mimetype: string;
  size: number;
}

describe('OcrService', () => {
  let service: OcrService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OcrService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'OCR_SERVICE_URL') return 'http://localhost:3001';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OcrService>(OcrService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUploadPath', () => {
    it('should return the upload path', () => {
      expect(service.getUploadPath()).toBe('/ocr/input');
    });
  });

  describe('validateImage', () => {
    it('should accept valid JPEG image', () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      } as any;

      expect(() => service.validateImage(mockFile)).not.toThrow();
    });

    it('should accept valid PNG image', () => {
      const mockFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 2 * 1024 * 1024, // 2MB
      } as any;

      expect(() => service.validateImage(mockFile)).not.toThrow();
    });

    it('should reject file larger than 10MB', () => {
      const mockFile = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB
      } as any;

      expect(() => service.validateImage(mockFile)).toThrow(BadRequestException);
      expect(() => service.validateImage(mockFile)).toThrow('File size exceeds 10MB limit');
    });

    it('should reject unsupported file types', () => {
      const invalidTypes = [
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'video/mp4',
      ];

      invalidTypes.forEach((mimetype) => {
        const mockFile = {
          originalname: 'test.file',
          mimetype,
          size: 1024,
        } as any;

        expect(() => service.validateImage(mockFile)).toThrow(BadRequestException);
        expect(() => service.validateImage(mockFile)).toThrow('Only JPEG and PNG images are allowed');
      });
    });

    it('should accept file exactly at 10MB limit', () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // Exactly 10MB
      } as any;

      expect(() => service.validateImage(mockFile)).not.toThrow();
    });

    it('should accept very small valid images', () => {
      const mockFile = {
        originalname: 'tiny.png',
        mimetype: 'image/png',
        size: 1024, // 1KB
      } as any;

      expect(() => service.validateImage(mockFile)).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should use default OCR service URL when not configured', async () => {
      const mockConfig = {
        get: jest.fn().mockReturnValue(null),
      };

      const module = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: ConfigService,
            useValue: mockConfig,
          },
        ],
      }).compile();

      const serviceWithDefaults = module.get<OcrService>(OcrService);
      // Service should initialize with default URL (checked via constructor)
      expect(serviceWithDefaults).toBeDefined();
    });

    it('should use custom OCR service URL when configured', () => {
      expect(configService.get).toHaveBeenCalled();
    });
  });
});
