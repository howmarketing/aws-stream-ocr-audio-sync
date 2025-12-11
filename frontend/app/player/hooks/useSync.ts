/**
 * useSync Hook
 * Handles timestamp synchronization
 */

'use client';

import { useState } from 'react';

export interface SyncRequest {
  clock: string;
  score?: {
    home: number;
    away: number;
  };
  ocrConfidence?: number;
}

export interface SyncResult {
  success: boolean;
  timestamp?: number;
  segmentFilename?: string;
  segmentSequence?: number;
  confidence?: number;
  drift?: number;
  metadata?: {
    clockInput: string;
    clockSeconds: number;
    searchedSegments: number;
    matchType?: 'exact' | 'approximate' | 'nearest';
  };
  error?: string;
}

export function useSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = async (request: SyncRequest): Promise<SyncResult | null> => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      // Validate clock format
      if (!request.clock.match(/^\d{1,2}:\d{2}$/)) {
        throw new Error('Invalid clock format. Expected MM:SS or M:SS');
      }

      // Call sync API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Sync request failed');
      }

      const data: SyncResult = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      setSyncResult(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMessage);
      return null;
    } finally {
      setSyncing(false);
    }
  };

  const reset = () => {
    setSyncResult(null);
    setError(null);
    setSyncing(false);
  };

  return {
    sync,
    syncing,
    syncResult,
    error,
    reset,
  };
}
