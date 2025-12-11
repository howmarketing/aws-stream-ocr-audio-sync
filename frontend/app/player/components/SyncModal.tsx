/**
 * Sync Modal Component
 * Modal for uploading scoreboard and syncing playback
 */

'use client';

import { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { OcrResult } from './OcrResult';
import { useOcr } from '../hooks/useOcr';
import { useSync } from '../hooks/useSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: (timestamp: number) => void;
}

export function SyncModal({ isOpen, onClose, onSyncComplete }: SyncModalProps) {
  const ocr = useOcr();
  const sync = useSync();
  const [step, setStep] = useState<'upload' | 'result' | 'syncing' | 'success'>('upload');

  const handleUpload = async (file: File) => {
    setStep('result');
    await ocr.upload(file);
  };

  const handleRetake = () => {
    ocr.reset();
    setStep('upload');
  };

  const handleSync = async () => {
    if (!ocr.result?.clock) return;

    setStep('syncing');

    const syncResult = await sync.sync({
      clock: ocr.result.clock,
      score:
        ocr.result.score.home !== null && ocr.result.score.away !== null
          ? { home: ocr.result.score.home, away: ocr.result.score.away }
          : undefined,
      ocrConfidence: ocr.result.confidence,
    });

    if (syncResult && syncResult.timestamp !== undefined) {
      setStep('success');
      setTimeout(() => {
        onSyncComplete(syncResult.timestamp!);
        handleClose();
      }, 1500);
    } else {
      // Stay on result step on error
      setStep('result');
    }
  };

  const handleClose = () => {
    ocr.reset();
    sync.reset();
    setStep('upload');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sync with Scoreboard</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Upload a screenshot of the scoreboard to sync your playback with the game clock.
              </p>
              <ImageUploader onUpload={handleUpload} disabled={ocr.loading} />
              {ocr.loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Processing image...</span>
                </div>
              )}
            </div>
          )}

          {step === 'result' && ocr.result && (
            <OcrResult result={ocr.result} onRetake={handleRetake} onSync={handleSync} />
          )}

          {step === 'result' && ocr.error && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-800 font-medium">{ocr.error}</span>
                </div>
              </div>
              <button
                onClick={handleRetake}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {step === 'syncing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-700 font-medium">Finding matching timestamp...</p>
              <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
            </div>
          )}

          {step === 'success' && sync.syncResult && (
            <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <svg
                  className="h-16 w-16 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-2xl text-gray-900 font-bold mb-2">Sync Successful!</p>
              <p className="text-gray-600">
                Jumping to {Math.floor(sync.syncResult.timestamp! / 60)}:
                {Math.floor(sync.syncResult.timestamp! % 60)
                  .toString()
                  .padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Confidence: {Math.round((sync.syncResult.confidence || 0) * 100)}% •
                Drift: {sync.syncResult.drift?.toFixed(1)}s
              </p>
            </div>
          )}

          {step === 'syncing' && sync.error && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-red-800 font-medium">{sync.error}</span>
                </div>
              </div>
              <button
                onClick={() => setStep('result')}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Back to Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
