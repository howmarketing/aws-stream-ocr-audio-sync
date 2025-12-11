/**
 * useOcr Hook
 * Handles image upload and OCR processing
 */

'use client';

import { useState } from 'react';

export interface OcrResult {
  clock: string | null;
  score: {
    home: number | null;
    away: number | null;
  };
  confidence: number;
  rawText: string;
  metadata: {
    processingTime: number;
    imageWidth?: number;
    imageHeight?: number;
  };
}

export interface OcrResponse {
  success: boolean;
  result?: OcrResult;
  error?: string;
}

export function useOcr() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<OcrResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate file
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        throw new Error('Only JPEG and PNG images are supported');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Create form data
      const formData = new FormData();
      formData.append('image', file);

      // Upload to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/ocr/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'OCR upload failed');
      }

      const data: OcrResponse = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || 'OCR processing failed');
      }

      setResult(data.result);
      return data.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return {
    upload,
    loading,
    result,
    error,
    reset,
  };
}
